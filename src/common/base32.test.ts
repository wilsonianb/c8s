import { encode, decode } from './base32'

const encoded: string = 'orsxg5a'
const decoded: Buffer = Buffer.from('test')

describe('encode', () => {
  test('encodes buffer to base32 string', () => {
    expect(encode(decoded)).toBe(encoded)
  })
})

describe('decode', () => {
  test('decodes base32 string to buffer', () => {
    expect(decode(encoded)).toStrictEqual(decoded)
  })
})
