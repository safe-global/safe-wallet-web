import { encodeTxNote } from './encodeTxNote'

describe('encodeTxNote', () => {
  it('should encode tx note with an existing origin', () => {
    // Test goes here
    const note = 'test note'
    const origin = JSON.stringify({ url: 'http://some.dapp' })
    const result = encodeTxNote(note, origin)
    expect(result).toEqual(JSON.stringify({ url: 'http://some.dapp', note }, null, 0))
  })

  it('should encode tx note with an empty origin', () => {
    // Test goes here
    const note = 'test note'
    const result = encodeTxNote(note)
    expect(result).toEqual(JSON.stringify({ url: 'http://localhost', note }, null, 0))
  })
})
