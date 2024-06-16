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
import { AbiCoder, ZeroAddress, encodeBytes32String } from 'ethers'
import PermissionsCheck from '..'
import * as hooksModule from '../hooks'
import { FEATURES } from '@/utils/chains'
import { chainBuilder } from '@/tests/builders/chains'
import { useHasFeature } from '@/hooks/useChains'

// We assume that CheckWallet always returns true
jest.mock('@/components/common/CheckWallet', () => ({
  __esModule: true,
  default({ children }: { children: (ok: boolean) => ReactElement }) {
    return children(true)
  },
}))

const mockChain = chainBuilder()
  // @ts-expect-error - we are using a local FEATURES enum
  .with({ features: [FEATURES.ZODIAC_ROLES, FEATURES.EIP1559] })
  .with({ chainId: '1' })
  .with({ shortName: 'eth' })
  .with({ chainName: 'Ethereum' })
  .with({ transactionService: 'https://tx.service.mock' })
  .build()

// mock useCurrentChain
jest.mock('@/hooks/useChains', () => ({
  __esModule: true,
  ...jest.requireActual('@/hooks/useChains'),
  useCurrentChain: jest.fn(() => mockChain),
  useHasFeature: jest.fn(),
}))

jest.mock('@/hooks/useChainId', () => ({
  useChainId: jest.fn().mockReturnValue(() => '1'),
}))

// mock getModuleTransactionId
jest.mock('@/services/transactions', () => ({
  getModuleTransactionId: jest.fn(() => 'i1234567890'),
}))

describe('PermissionsCheck', () => {
  let executeSpy: jest.SpyInstance
  let fetchRolesModMock: jest.SpyInstance

  const mockConnectedWalletAddress = (address: string) => {
    // Onboard
    jest.spyOn(onboardHooks, 'default').mockReturnValue({
      setChain: jest.fn(),
      state: {
        get: () => ({
          wallets: [
            {
              label: 'MetaMask',
              accounts: [{ address }],
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
      address,
    } as unknown as ConnectedWallet)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useHasFeature as jest.Mock).mockImplementation((feature) => mockChain.features.includes(feature)),
      // Safe info
      jest.spyOn(useSafeInfoHook, 'default').mockImplementation(() => ({
        safe: SAFE_INFO,
        safeAddress: SAFE_INFO.address.value,
        safeError: undefined,
        safeLoading: false,
        safeLoaded: true,
      }))

    // Roles mod fetching

    // Mock the Roles mod fetching function to return the test roles mod

    fetchRolesModMock = jest.spyOn(zodiacRoles, 'fetchRolesMod').mockReturnValue(Promise.resolve(TEST_ROLES_MOD as any))

    // Mock signing and dispatching the module transaction
    executeSpy = jest
      .spyOn(txSender, 'dispatchModuleTxExecution')
      .mockReturnValue(Promise.resolve('0xabababababababababababababababababababababababababababababababab')) // tx hash

    // Mock return value of useWeb3ReadOnly
    // It's only used for eth_estimateGas requests
    mockWeb3Provider([])

    jest.spyOn(hooksModule, 'pollModuleTransactionId').mockReturnValue(Promise.resolve('i1234567890'))
  })

  it('only fetch roles and show the card if the feature is enabled', async () => {
    ;(useHasFeature as jest.Mock).mockImplementation((feature) => feature !== FEATURES.ZODIAC_ROLES)
    mockConnectedWalletAddress(SAFE_INFO.owners[0].value) // connect as safe owner (not a role member)

    const safeTx = createMockSafeTransaction({
      to: ZeroAddress,
      data: '0xd0e30db0', // deposit()
      value: AbiCoder.defaultAbiCoder().encode(['uint256'], [123]),
      operation: OperationType.Call,
    })

    const { queryByText } = render(<PermissionsCheck safeTx={safeTx} />)

    // the card is not shown
    expect(queryByText('Execute without confirmations')).not.toBeInTheDocument()

    expect(fetchRolesModMock).not.toHaveBeenCalled()
  })

  it('only shows the card when the user is a member of any role', async () => {
    mockConnectedWalletAddress(SAFE_INFO.owners[0].value) // connect as safe owner (not a role member)

    const safeTx = createMockSafeTransaction({
      to: ZeroAddress,
      data: '0xd0e30db0', // deposit()
      value: AbiCoder.defaultAbiCoder().encode(['uint256'], [123]),
      operation: OperationType.Call,
    })

    const { queryByText } = render(<PermissionsCheck safeTx={safeTx} />)

    // wait for the Roles mod to be fetched
    await waitFor(() => {
      expect(fetchRolesModMock).toBeCalled()
    })

    // the card is not shown
    expect(queryByText('Execute without confirmations')).not.toBeInTheDocument()
  })

  it('disables the submit button when the call is not allowed and shows the permission check status', async () => {
    mockConnectedWalletAddress(MEMBER_ADDRESS)

    const safeTx = createMockSafeTransaction({
      to: ZeroAddress,
      data: '0xd0e30db0', // deposit()
      value: AbiCoder.defaultAbiCoder().encode(['uint256'], [123]),
      operation: OperationType.Call,
    })

    const { findByText, getByText } = render(<PermissionsCheck safeTx={safeTx} />)
    expect(await findByText('Execute')).toBeDisabled()

    expect(
      getByText(
        textContentMatcher('You are a member of the eth_wrapping role but it does not allow this transaction.'),
      ),
    ).toBeInTheDocument()

    expect(getByText('TargetAddressNotAllowed')).toBeInTheDocument()
  })

  it('execute the tx when the submit button is clicked', async () => {
    mockConnectedWalletAddress(MEMBER_ADDRESS)

    const safeTx = createMockSafeTransaction({
      to: WETH_ADDRESS,
      data: '0xd0e30db0', // deposit()
      value: AbiCoder.defaultAbiCoder().encode(['uint256'], [123]),
      operation: OperationType.Call,
    })

    const onSubmit = jest.fn()

    const { findByText } = render(<PermissionsCheck safeTx={safeTx} onSubmit={onSubmit} />)

    fireEvent.click(await findByText('Execute'))

    await waitFor(() => {
      expect(executeSpy).toHaveBeenCalledWith(
        // call to the Roles mod's execTransactionWithRole function
        expect.objectContaining({
          to: TEST_ROLES_MOD.address,
          data: '0xc6fe8747000000000000000000000000fff9976782d46cc05630d1f6ebab18b2324d6b14000000000000000000000000000000000000000000000000000000000000007b00000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000006574685f7772617070696e67000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000004d0e30db000000000000000000000000000000000000000000000000000000000',
          value: '0',
        }),
        undefined,
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

/**
 * Getting the deepest element that contain string / match regex even when it split between multiple elements
 *
 * @example
 * For:
 * <div>
 *   <span>Hello</span><span> World</span>
 * </div>
 *
 * screen.getByText('Hello World') // ❌ Fail
 * screen.getByText(textContentMatcher('Hello World')) // ✅ pass
 */
function textContentMatcher(textMatch: string | RegExp) {
  const hasText =
    typeof textMatch === 'string'
      ? (node: Element) => node.textContent === textMatch
      : (node: Element) => textMatch.test(node.textContent || '')

  const matcher = (_content: string, node: Element | null) => {
    if (!node || !hasText(node)) {
      return false
    }

    return Array.from(node?.children || []).every((child) => !hasText(child))
  }

  matcher.toString = () => `textContentMatcher(${textMatch})`

  return matcher
}
