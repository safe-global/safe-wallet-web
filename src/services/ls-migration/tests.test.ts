import { waitFor } from '@testing-library/react'
import { migrateAddressBook } from './addressBook'
import { migrateAddedSafes } from './addedSafes'
import { createIframe, sendReadyMessage, receiveMessage } from './iframe'

describe('Local storage migration', () => {
  describe('migrateAddressBook', () => {
    it('should migrate the address book', () => {
      const oldStorage = {
        SAFE__addressBook: JSON.stringify([
          { address: '0x1F2504De05f5167650bE5B28c472601Be434b60A', name: 'Alice', chainId: '1' },
          { address: '0x501E66bF7a8F742FA40509588eE751e93fA354Df', name: 'Bob', chainId: '1' },
          { address: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808', name: 'Charlie', chainId: '5' },
          { address: '0x979774d85274A5F63C85786aC4Fa54B9A4f391c2', name: 'Dave', chainId: '5' },
        ]),
      }

      const newData = migrateAddressBook(oldStorage)

      expect(newData).toEqual({
        '1': {
          '0x1F2504De05f5167650bE5B28c472601Be434b60A': 'Alice',
          '0x501E66bF7a8F742FA40509588eE751e93fA354Df': 'Bob',
        },
        '5': {
          '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808': 'Charlie',
          '0x979774d85274A5F63C85786aC4Fa54B9A4f391c2': 'Dave',
        },
      })
    })

    it('should not add empty names', () => {
      const oldStorage = {
        SAFE__addressBook: JSON.stringify([
          { address: '0x1F2504De05f5167650bE5B28c472601Be434b60A', name: 'Alice', chainId: '1' },
          { address: '0x501E66bF7a8F742FA40509588eE751e93fA354Df', name: '', chainId: '1' },
          { address: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808', name: 'Charlie', chainId: '5' },
          { address: '0x979774d85274A5F63C85786aC4Fa54B9A4f391c2', name: undefined, chainId: '5' },
        ]),
      }

      const newData = migrateAddressBook(oldStorage)

      expect(newData).toEqual({
        '1': {
          '0x1F2504De05f5167650bE5B28c472601Be434b60A': 'Alice',
        },
        '5': {
          '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808': 'Charlie',
        },
      })
    })

    it('should not add invalid addresses', () => {
      const oldStorage = {
        SAFE__addressBook: JSON.stringify([
          { address: '0x1F2504De05f5167650bE5B28c472601Be434b60A', name: 'Alice', chainId: '1' },
          { address: 'sdfgsdfg', name: 'Bob', chainId: '1' },
          { address: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808', name: 'Charlie', chainId: '5' },
          { address: '', name: 'Dave', chainId: '5' },
          { address: undefined, name: 'John', chainId: '5' },
        ]),
      }

      const newData = migrateAddressBook(oldStorage)

      expect(newData).toEqual({
        '1': {
          '0x1F2504De05f5167650bE5B28c472601Be434b60A': 'Alice',
        },
        '5': {
          '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808': 'Charlie',
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
        '0x1F2504De05f5167650bE5B28c472601Be434b60A': {
          address: '0x1F2504De05f5167650bE5B28c472601Be434b60A',
          chainId: '1',
          ethBalance: '0.1',
          owners: ['0x1F2504De05f5167650bE5B28c472601Be434b60A'],
          threshold: 1,
        },
        '0x501E66bF7a8F742FA40509588eE751e93fA354Df': {
          address: '0x501E66bF7a8F742FA40509588eE751e93fA354Df',
          chainId: '1',
          ethBalance: '20.3',
          owners: ['0x501E66bF7a8F742FA40509588eE751e93fA354Df', '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808'],
          threshold: 2,
        },
      }),
      '_immortal|v2_1313161554__SAFES': JSON.stringify({
        '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808': {
          address: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
          chainId: '1313161554',
          ethBalance: '0',
          owners: ['0x9913B9180C20C6b0F21B6480c84422F6ebc4B808'],
          threshold: 1,
        },
        '0x979774d85274A5F63C85786aC4Fa54B9A4f391c2': {
          address: '0x979774d85274A5F63C85786aC4Fa54B9A4f391c2',
          chainId: '1313161554',
          ethBalance: '0.00001',
          owners: ['0x979774d85274A5F63C85786aC4Fa54B9A4f391c2', '0xdef', '0x1F2504De05f5167650bE5B28c472601Be434b60A'],
          threshold: 2,
        },
      }),
    }

    it('should migrate the added safes', () => {
      const newData = migrateAddedSafes(oldStorage)

      expect(newData).toEqual({
        '1': {
          '0x1F2504De05f5167650bE5B28c472601Be434b60A': {
            ethBalance: '0.1',
            owners: [{ value: '0x1F2504De05f5167650bE5B28c472601Be434b60A' }],
            threshold: 1,
          },
          '0x501E66bF7a8F742FA40509588eE751e93fA354Df': {
            ethBalance: '20.3',
            owners: [
              { value: '0x501E66bF7a8F742FA40509588eE751e93fA354Df' },
              { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
            ],
            threshold: 2,
          },
        },
        '1313161554': {
          '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808': {
            ethBalance: '0',
            owners: [{ value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' }],
            threshold: 1,
          },
          '0x979774d85274A5F63C85786aC4Fa54B9A4f391c2': {
            ethBalance: '0.00001',
            owners: [
              { value: '0x979774d85274A5F63C85786aC4Fa54B9A4f391c2' },
              { value: '0xdef' },
              { value: '0x1F2504De05f5167650bE5B28c472601Be434b60A' },
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
