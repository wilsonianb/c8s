import HttpServer from '../services/HttpServer'
import reduct from 'reduct'
const deps = reduct()
const server = deps(HttpServer)

describe('static controller', () => {

  const options = {
    method: 'GET',
    url: '/'
  }

  beforeAll(async () => {
    await server.init()
  })

  afterAll(async () => {
    await server.stop()
  })

  test('responds with static index.html', async () => {
    const response = await server.getServer()!.inject(options)

    expect(response.statusCode).toBe(200)
    expect(response.result).toMatchSnapshot()
  })
})
