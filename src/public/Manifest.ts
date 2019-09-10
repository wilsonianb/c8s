const canonicalJson = require('canonical-json')
import { createHash, randomBytes } from 'crypto'

function generateNonce () {
  // Generates 16 byte nonce
  const buf = randomBytes(16)
  return buf.toString('hex')
}

const hashPrivateVar = (privateVar: object) => {
  return createHash('sha256')
    .update(canonicalJson(privateVar))
    .digest('hex')
}

export interface EnvVar {
  name: string
  value: string
  private: boolean
}

export interface ManifestOpts {
  image: string
  port: number
  envVars: Array<EnvVar>
}

export class Manifest {
  public manifest: object
  public private: object

  constructor (opts: ManifestOpts) {
    this.manifest = {
      name: 'c8s-service',
      version: '1.0.0',
      machine: 'small',
      port: `${opts.port}`,
      containers: [{
        id: 'c8s-container',
        image: opts.image,
        environment: opts.envVars.reduce((acc, envVar) => {
          acc[envVar.name] = `$${envVar.name}`
          return acc
        }, {})
      }],
      vars: opts.envVars.reduce((acc, envVar) => {
        if (!envVar.private) {
          acc[envVar.name] = {
            value: envVar.value
          }
        }
        return acc
      }, {})
    }
    this.private = {
      vars: opts.envVars.reduce((acc, envVar) => {
        if (envVar.private) {
          acc[envVar.name] = {
            nonce: generateNonce(),
            value: envVar.value
          }
        }
        return acc
      }, {})
    }

    for (const privVar in this.private['vars']) {
      this.manifest['vars'][privVar] = {
        encoding: 'private:sha256',
        value: hashPrivateVar(this.private['vars'][privVar])
      }
    }
  }
}
