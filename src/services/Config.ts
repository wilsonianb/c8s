import * as crypto from 'crypto'
import { Injector } from 'reduct'
import { SelfTestConfig } from '../schemas/SelfTestConfig'

export default class Config {
  readonly bearerToken: string
  readonly port: number
  readonly bindIp: string
  readonly paymentPointer: string
  readonly publicUri: string
  readonly devMode: boolean
  readonly k8sNamespace: string
  readonly k8sServiceAccount: string
  selfTestSuccess: boolean
  selfTestConfig: SelfTestConfig

  constructor (env: Injector | { [k: string]: string | undefined }) {
    // Load config from environment by default
    if (typeof env === 'function') {
      env = process.env
    }
    this.bearerToken = crypto.randomBytes(32).toString('hex')

    this.devMode = env.CODIUS_DEV === 'true' || env.NODE_ENV === 'test'

    this.port = Number(env.CODIUS_PORT) || 3000
    if (env.CODIUS_PUBLIC_URI) {
      this.publicUri = env.CODIUS_PUBLIC_URI
    } else if (this.devMode) {
      this.publicUri = ('http://local.codius.org:' + this.port)
    } else {
      throw new Error('Codiusd requires CODIUS_PUBLIC_URI to be set')
    }

    if (env.CODIUS_PAYMENT_POINTER) {
      this.paymentPointer = env.CODIUS_PAYMENT_POINTER
    } else {
      throw new Error('Codiusd requires CODIUS_PAYMENT_POINTER to be set')
    }

    this.bindIp = env.CODIUS_BIND_IP || '127.0.0.1'

    this.selfTestSuccess = false
    this.selfTestConfig = {
      retryCount: Number(env.CODIUS_SELF_TEST_RETRIES) || 6,
      retryInterval: Number(env.CODIUS_SELF_TEST_INTERVAL) * 1000 || 10000
    }
    this.k8sNamespace = env.CODIUS_K8S_NAMESPACE || 'default'
    this.k8sServiceAccount = env.CODIUS_K8S_SERVICE_ACCOUNT || 'default'
  }
}
