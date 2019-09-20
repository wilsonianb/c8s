import HttpServer from '../services/HttpServer'
import KubernetesClient from '../services/KubernetesClient'
import reduct from 'reduct'
import { ServerInjectResponse } from '@hapi/hapi'
const deps = reduct()
const server = deps(HttpServer)
const k8sClient = deps(KubernetesClient)

describe('containers controller', () => {

  const options = {
    headers: {
      Accept: `application/codius-v1.0.0+json`,
      'Content-Type': 'application/json',
      Host: 'localhost'
    },
    method: 'POST',
    url: '/containers'
  }

  beforeAll(async () => {
    await server.init()
  })

  afterAll(async () => {
    await server.stop()
  })

  test('accepts POST request with valid manifest', async () => {
    const k8sCreateSpy = jest.spyOn(k8sClient, 'createKnativeService')
    k8sCreateSpy.mockImplementation(() => Promise.resolve())

    const response: ServerInjectResponse = await server.getServer()!.inject({
      ...options,
      payload: JSON.stringify({
        manifest: {
          name: 'test-container',
          version: '1.0.0',
          machine: 'small',
          port: '8080',
          containers: [{
            id: 'c8s-container',
            image: 'androswong418/codius-test-image@sha256:0dce885c4e558a8a7612b80e3c7f5faa54520ed27836b1f892962cf855d031a2',
            environment: {}
          }],
          vars: {}
        },
        private: {
          vars: {}
        }
      })
    })

    expect(response.statusCode).toBe(200)
    expect(k8sCreateSpy).toHaveBeenCalled()
    expect(response.result).toMatchSnapshot()
  })

  test('rejects non-JSON payload', async () => {
    const response: ServerInjectResponse = await server.getServer()!.inject({
      ...options,
      payload: 'not JSON'
    })

    expect(response.statusCode).toBe(400)
    if (response.result) {
      expect(response.result['message']).toBe('Invalid request payload JSON format')
    } else {
      fail('response.result not defined')
    }
  })

  test('rejects invalid manifest payload', async () => {
    const response: ServerInjectResponse = await server.getServer()!.inject({
      ...options,
      payload: JSON.stringify({
        this: 'is not a valid manifest'
      })
    })

    expect(response.statusCode).toBe(400)
    if (response.result) {
      expect(response.result['message']).toBe('Invalid request payload input')
    } else {
      fail('response.result not defined')
    }
  })
})
