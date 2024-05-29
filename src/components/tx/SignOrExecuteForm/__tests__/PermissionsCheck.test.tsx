import { createMockSafeTransaction } from '@/tests/transactions'
import { OperationType } from '@safe-global/safe-core-sdk-types'
import { type ReactElement } from 'react'
import * as zodiacRoles from 'zodiac-roles-deployments'
import { fireEvent, render, waitFor, mockWeb3Provider } from '@/tests/test-utils'

import { type ConnectedWallet } from '@/hooks/wallets/useOnboard'
import * as useSafeInfoHook from '@/hooks/useSafeInfo'
import * as wallet from '@/hooks/wallets/useWallet'
import * as onboardHooks from '@/hooks/wallets/useOnboard'
import * as txSender from '@/services/tx/tx-sender/dispatch'
import { extendedSafeInfoBuilder } from '@/tests/builders/safe'
import { type OnboardAPI } from '@web3-onboard/core'
import { AbiCoder, encodeBytes32String } from 'ethers'
import PermissionsCheck, * as permissionsCheckModule from '../PermissionsCheck'

// We assume that CheckWallet always returns true
jest.mock('@/components/common/CheckWallet', () => ({
  __esModule: true,
  default({ children }: { children: (ok: boolean) => ReactElement }) {
    return children(true)
  },
}))

// mock useCurrentChain & useHasFeature
jest.mock('@/hooks/useChains', () => ({
  useCurrentChain: jest.fn(() => ({
    shortName: 'eth',
    chainId: '1',
    chainName: 'Ethereum',
    features: [],
    transactionService: 'https://tx.service.mock',
  })),
  useHasFeature: jest.fn(() => true), // used to check for EIP1559 support
}))

// mock getModuleTransactionId
jest.mock('@/services/transactions', () => ({
  getModuleTransactionId: jest.fn(() => 'i1234567890'),
}))

describe('PermissionsCheck', () => {
  let executeSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()

    // Safe info
    jest.spyOn(useSafeInfoHook, 'default').mockImplementation(() => ({
      safe: SAFE_INFO,
      safeAddress: SAFE_INFO.address.value,
      safeError: undefined,
      safeLoading: false,
      safeLoaded: true,
    }))

    // Onboard
    jest.spyOn(onboardHooks, 'default').mockReturnValue({
      setChain: jest.fn(),
      state: {
        get: () => ({
          wallets: [
            {
              label: 'MetaMask',
              accounts: [{ address: MEMBER_ADDRESS }],
              connected: true,
              chains: [{ id: '1' }],
            },
          ],
        }),
      },
    } as unknown as OnboardAPI)

    // Wallet
    jest.spyOn(wallet, 'default').mockReturnValue({
      chainId: '1',
      label: 'MetaMask',
      address: MEMBER_ADDRESS,
    } as unknown as ConnectedWallet)

    // Roles mod fetching

    // Mock the Roles mod fetching function to return the test roles mod

    jest.spyOn(zodiacRoles, 'fetchRolesMod').mockReturnValue(Promise.resolve(TEST_ROLES_MOD as any))

    // Mock signing and dispatching the module transaction
    executeSpy = jest
      .spyOn(txSender, 'dispatchModuleTxExecution')
      .mockReturnValue(Promise.resolve('0xabababababababababababababababababababababababababababababababab')) // tx hash

    // Mock return value of useWeb3ReadOnly
    // It's only used for eth_estimateGas requests
    mockWeb3Provider([])

    jest.spyOn(permissionsCheckModule, 'pollModuleTransactionId').mockReturnValue(Promise.resolve('i1234567890'))
  })

  it('execute the tx when the submit button is clicked', async () => {
    const safeTx = createMockSafeTransaction({
      to: WETH_ADDRESS,
      data: '0xd0e30db0', // deposit()
      value: AbiCoder.defaultAbiCoder().encode(['uint256'], [123]),
      operation: OperationType.Call,
    })

    const onSubmit = jest.fn()

    const { findByText } = render(<PermissionsCheck safeTx={safeTx} onSubmit={onSubmit} />)

    fireEvent.click(await findByText('Execute through role', { selector: 'button' }))

    await waitFor(() => {
      expect(executeSpy).toHaveBeenCalledWith(
        // call to the Roles mod's execTransactionWithRole function
        expect.objectContaining({
          to: TEST_ROLES_MOD.address,
          data: '0xc6fe8747000000000000000000000000fff9976782d46cc05630d1f6ebab18b2324d6b14000000000000000000000000000000000000000000000000000000000000007b00000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000006574685f7772617070696e67000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000004d0e30db000000000000000000000000000000000000000000000000000000000',
          value: '0',
        }),
        expect.anything(),
        expect.anything(),
        expect.anything(),
      )
    })

    // calls provided onSubmit callback
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
  })
})

const ROLES_MOD_ADDRESS = '0x1234567890000000000000000000000000000000'
const MEMBER_ADDRESS = '0x1111111110000000000000000000000000000000'
const ROLE_KEY = encodeBytes32String('eth_wrapping')

const SAFE_INFO = extendedSafeInfoBuilder().build()
SAFE_INFO.modules = [{ value: ROLES_MOD_ADDRESS }]
SAFE_INFO.chainId = '1'

const lowercaseSafeAddress = SAFE_INFO.address.value.toLowerCase()

const WETH_ADDRESS = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14'

const { Clearance, ExecutionOptions } = zodiacRoles

const TEST_ROLES_MOD = {
  address: ROLES_MOD_ADDRESS,
  owner: lowercaseSafeAddress,
  avatar: lowercaseSafeAddress,
  target: lowercaseSafeAddress,
  roles: [
    {
      key: ROLE_KEY,
      members: [MEMBER_ADDRESS],
      targets: [
        {
          address: '0xc36442b4a4522e871399cd717abdd847ab11fe88',
          clearance: Clearance.Function,
          executionOptions: ExecutionOptions.None,
          functions: [
            {
              selector: '0x49404b7c',
              wildcarded: false,
              executionOptions: ExecutionOptions.None,
            },
          ],
        },
        {
          address: WETH_ADDRESS, // WETH
          clearance: Clearance.Function,
          executionOptions: ExecutionOptions.None,
          functions: [
            {
              selector: '0x2e1a7d4d', // withdraw(uint256)
              wildcarded: true,
              executionOptions: ExecutionOptions.None,
            },
            {
              selector: '0xd0e30db0', // deposit()
              wildcarded: true,
              executionOptions: ExecutionOptions.Send,
            },
          ],
        },
      ],
    },
  ],
}
