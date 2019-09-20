import { Injector } from 'reduct'
import Config from './Config'
import { SelfTestConfig } from '../schemas/SelfTestConfig'
import { SelfTestStats } from '../schemas/SelfTestStats'
import { create as createLogger } from '../common/log'
const log = createLogger('SelfTest')
const manifestJson = require('../util/self-test-manifest.json')
import axios from 'axios'
import { randomBytes } from 'crypto'
export default class SelfTest {
  public selfTestSuccess: boolean
  private uploadSuccess: boolean
  private httpSuccess: boolean
  private running: boolean
  private config: Config
  private testConfig: SelfTestConfig

  constructor (deps: Injector) {
    this.config = deps(Config)
    this.selfTestSuccess = false
    this.uploadSuccess = false
    this.httpSuccess = false
    this.running = true
    this.testConfig = this.config.selfTestConfig
  }

  start () {
    if (!this.config.devMode) {
      this.run()
      .catch(err => {
        this.running = false
        log.error(err)
      })
    } else {
      this.running = false
      log.debug('Skipping self test')
    }
  }

  async retryFetch (count: number, manifestJson: object): Promise<any> {
    try {
      const host = this.config.publicUri
      const token = this.config.bearerToken
      let response = await axios.post(`${host}/containers`, JSON.stringify(manifestJson), {
        headers: {
          Accept: `application/codius-v1+json`,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        timeout: 70000 // 1m10s
      })
      return response
    } catch (err) {
      if (count > 1) {
        await new Promise(resolve => {
          setTimeout(() => {
            resolve()
          }, this.testConfig.retryInterval)
        })
        return this.retryFetch(count - 1, manifestJson)
      } else {
        return err.response
      }
    }
  }

  async run () {
    try {
      const randomName = randomBytes(20).toString('hex')
      manifestJson['manifest']['name'] = randomName
      log.debug('manifestJson', manifestJson)
      let response = await this.retryFetch(this.testConfig.retryCount, manifestJson)
      log.trace('Post Resp', response)
      if (this.checkStatus(response)) {
        log.info('Container upload successful')
        // Maybe check status in 30 seconds interval twice.
        const url = new URL(response.data.url)
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve()
          }, this.testConfig.retryInterval)
        })

        // Wrap these in functions so we can resolve them later on.
        const serverPromise = () => {
          return new Promise(async (resolve, reject) => {
            try {
              const serverRes = await axios.get(`${url.href}`)
              const serverCheck = serverRes.data
              log.debug('Pod HTTP request succeeded', serverCheck)
              if (serverCheck.imageUploaded) {
                this.httpSuccess = true
                resolve()
              }
            } catch (err) {
              log.error('Test pod not reachable', err)
              this.selfTestSuccess = false
              this.httpSuccess = false
              reject(new Error('could not connect to pod over HTTP'))
            }
          })
        }

        const serverTimeoutPromise = () => {
          return new Promise((resolve, reject) => {
            let timeout = setTimeout(function () {
              clearTimeout(timeout)
              reject(new Error('could not connect to pod due to timeout'))
            }, 10000)
          })
        }

        log.info('Starting Pod HTTP Test...')
        for (let i = 0; i < this.testConfig.retryCount; i++) {
          try {
            await Promise.race([
              serverPromise(),
              serverTimeoutPromise()
            ])
            this.httpSuccess = true
            log.info('Codius Host Self Test successfully deployed container')
          } catch (err) {
            log.error('Error occurred while testing HTTP err=', err)
            await new Promise(resolve => {
              setTimeout(() => {
                resolve()
              }, this.testConfig.retryInterval)
            })
          }
          if (this.httpSuccess) {
            break
          }
        }

        this.selfTestSuccess = this.uploadSuccess && this.httpSuccess
        this.running = false
        if (this.selfTestSuccess) {
          log.info('Self test successful:', this.selfTestSuccess, ' Upload success=', this.uploadSuccess, ' HTTP success=', this.httpSuccess)
        } else {
          log.error('Self test failed: Upload Status=', this.uploadSuccess, ' Http Connection=', this.httpSuccess)
          throw new Error('One or more components of Self Test have failed.')
        }
      } else {
        this.uploadSuccess = false
        const resJson = await response.json()
        throw new Error(`Self Test failed. Could not upload pod successfully due to: ${resJson.error}`)
      }
    } catch (err) {
      log.error(err)
      this.running = false
      this.selfTestSuccess = false
      throw new Error('Self test failed: Upload Status=' + this.uploadSuccess + ' Http Connection=' + this.httpSuccess)
    }
  }

  checkStatus (response: any) {
    if (response && response.status) {
      const statusString = `${response.status}`
      if (statusString.startsWith('2')) {
        log.info('Container upload returned %s', statusString)
        this.uploadSuccess = true
        return true
      }
    }
    log.error('Container upload failed')
    return false
  }

  getTestStats (): SelfTestStats {
    return {
      selfTestSuccess: this.selfTestSuccess,
      uploadSuccess: this.uploadSuccess,
      httpSuccess: this.httpSuccess,
      running: this.running
    }
  }
}
