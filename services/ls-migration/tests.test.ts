import { waitFor } from '@testing-library/react'
import { migrateAddressBook } from './addressBook'
import { migrateAddedSafes } from './addedSafes'
import { createIframe, sendReadyMessage, receiveMessage } from './iframe'

describe('Local storage migration', () => {
  describe('migrateAddressBook', () => {
    const oldStorage = {
      SAFE__addressBook: JSON.stringify([
        { address: '0x123', name: 'Alice', chainId: '1' },
        { address: '0x456', name: 'Bob', chainId: '1' },
        { address: '0x789', name: 'Charlie', chainId: '4' },
        { address: '0xabc', name: 'Dave', chainId: '4' },
      ]),
    }

    it('should migrate the address book', () => {
      const newData = migrateAddressBook(oldStorage)

      expect(newData).toEqual({
        '1': {
          '0x123': 'Alice',
          '0x456': 'Bob',
        },
        '4': {
          '0x789': 'Charlie',
          '0xabc': 'Dave',
        },
      })
    })

    it('should return undefined if there are no address book entries', () => {
      const newData = migrateAddressBook({
        SAFE__addressBook: '[]',
      })

      expect(newData).toEqual(undefined)
    })
  })

  describe('migrateAddedSafes', () => {
    const oldStorage = {
      '_immortal|v2_MAINNET__SAFES': JSON.stringify({
        '0x123': { address: '0x123', chainId: '1', ethBalance: '0.1', owners: ['0x123'], threshold: 1 },
        '0x456': { address: '0x456', chainId: '1', ethBalance: '20.3', owners: ['0x456', '0x789'], threshold: 2 },
      }),
      '_immortal|v2_1313161554__SAFES': JSON.stringify({
        '0x789': { address: '0x789', chainId: '1313161554', ethBalance: '0', owners: ['0x789'], threshold: 1 },
        '0xabc': {
          address: '0xabc',
          chainId: '1313161554',
          ethBalance: '0.00001',
          owners: ['0xabc', '0xdef', '0x123'],
          threshold: 2,
        },
      }),
    }

    it('should migrate the added safes', () => {
      const newData = migrateAddedSafes(oldStorage)

      expect(newData).toEqual({
        '1': {
          '0x123': {
            ethBalance: '0.1',
            owners: [{ value: '0x123', name: null, logoUri: null }],
            threshold: 1,
          },
          '0x456': {
            ethBalance: '20.3',
            owners: [
              { value: '0x456', name: null, logoUri: null },
              { value: '0x789', name: null, logoUri: null },
            ],
            threshold: 2,
          },
        },
        '1313161554': {
          '0x789': {
            ethBalance: '0',
            owners: [{ value: '0x789', name: null, logoUri: null }],
            threshold: 1,
          },
          '0xabc': {
            ethBalance: '0.00001',
            owners: [
              { value: '0xabc', name: null, logoUri: null },
              { value: '0xdef', name: null, logoUri: null },
              { value: '0x123', name: null, logoUri: null },
            ],
            threshold: 2,
          },
        },
      })
    })

    it('should return undefined if there are no added safes', () => {
      const newData = migrateAddedSafes({
        '_immortal|v2_MAINNET__SAFES': '{}',
      })

      expect(newData).toEqual(undefined)
    })
  })

  describe('iframe', () => {
    it('should create an iframe', () => {
      const iframe = createIframe('http://localhost:3000/test')
      expect(iframe).toBeInstanceOf(HTMLIFrameElement)
      expect(iframe.src).toBe('http://localhost:3000/test')
      expect(iframe.style.display).toBe('none')
      iframe.remove()
    })

    it('should send a message to the iframe', async () => {
      const postMessage = jest.fn()
      const onLoad = jest.fn((callback: () => void) => callback())

      sendReadyMessage(
        {
          addEventListener: jest.fn((_, callback: () => void) => onLoad(callback)),
          contentWindow: {
            postMessage,
          },
        } as unknown as HTMLIFrameElement,
        '*',
      )

      expect(onLoad).toHaveBeenCalled()
      expect(postMessage).toHaveBeenCalledWith('ready', '*')
    })
  })

  it('should receive a message from the iframe', async () => {
    let message: string | null = null

    receiveMessage((data) => {
      message = data
    }, '')

    window.postMessage('hello', '*')

    await waitFor(() => expect(message).toEqual('hello'))
  })
})
