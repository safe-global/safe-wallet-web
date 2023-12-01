import { getCurrentGnosisSafeContract, getReadOnlyMultiSendCallOnlyContract } from '@/services/contracts/safeContracts'
import { createTx } from '@/services/tx/tx-sender'
import { safeInfoBuilder } from '@/tests/builders/safe'
import { createSafeTx } from '@/tests/builders/safeTx'
import { connectedWalletBuilder } from '@/tests/builders/wallet'
import { renderHook, waitFor } from '@/tests/test-utils'
import { Multi_send__factory } from '@/types/contracts/factories/@safe-global/safe-deployments/dist/assets/v1.3.0'
import { Gnosis_safe__factory } from '@/types/contracts/factories/@safe-global/safe-deployments/dist/assets/v1.1.1'
import { faker } from '@faker-js/faker'
import { getModuleInstance } from '@gnosis.pm/zodiac'
import { BigNumber } from 'ethers'
import { useIsRecoverer } from '../useIsRecoverer'
import { getPatchedSignerProvider } from '../useIsValidExecution'
import {
  useIsValidRecoveryExecTransactionFromModule,
  useIsValidRecoveryExecuteNextTx,
  useIsValidRecoveryExecution,
  useIsValidRecoverySkipExpired,
} from '../useIsValidRecoveryExecution'
import { useRecoveryTxState } from '../useRecoveryTxState'
import useSafeInfo from '../useSafeInfo'
import useWallet from '../wallets/useWallet'
import { useWeb3ReadOnly } from '../wallets/web3'
import { id } from 'ethers/lib/utils'

jest.mock('@gnosis.pm/zodiac')

const mockGetModuleInstance = getModuleInstance as jest.MockedFunction<typeof getModuleInstance>

jest.mock('@/hooks/wallets/useWallet')
jest.mock('@/hooks/useSafeInfo')
jest.mock('@/hooks/wallets/web3')
jest.mock('@/hooks/useIsRecoverer')
jest.mock('@/hooks/useRecoveryTxState')
jest.mock('@/hooks/useIsValidExecution')
jest.mock('@/services/contracts/safeContracts')
jest.mock('@/services/tx/tx-sender')

const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>
const mockUseSafeInfo = useSafeInfo as jest.MockedFunction<typeof useSafeInfo>
const mockUseWeb3ReadOnly = useWeb3ReadOnly as jest.MockedFunction<typeof useWeb3ReadOnly>
const mockUseIsRecoverer = useIsRecoverer as jest.MockedFunction<typeof useIsRecoverer>
const mockUseRecoveryTxState = useRecoveryTxState as jest.MockedFunction<typeof useRecoveryTxState>
const mockGetPatchedSignerOrProvider = getPatchedSignerProvider as jest.MockedFunction<typeof getPatchedSignerProvider>
const mockGetReadOnlyMultiSendCallOnlyContract = getReadOnlyMultiSendCallOnlyContract as jest.MockedFunction<
  typeof getReadOnlyMultiSendCallOnlyContract
>
const mockGetCurrentGnosisSafeContract = getCurrentGnosisSafeContract as jest.MockedFunction<
  typeof getCurrentGnosisSafeContract
>
const mockCreateTx = createTx as jest.MockedFunction<typeof createTx>

describe('useIsValidRecoveryExecution', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useIsValidRecoveryExecTransactionFromModule', () => {
    it('should return undefined if the user is not a guardian', async () => {
      mockUseWallet.mockReturnValue(connectedWalletBuilder().build())
      mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
      mockUseWeb3ReadOnly.mockReturnValue({} as any)
      mockUseIsRecoverer.mockReturnValue(false)

      const { result } = renderHook(() =>
        useIsValidRecoveryExecTransactionFromModule(faker.finance.ethereumAddress(), createSafeTx()),
      )

      expect(result.current).toEqual([undefined, undefined, false])

      await waitFor(() => {
        expect(result.current).toEqual([undefined, undefined, false])
      })
    })

    it('should return undefined if no delay modifier address is provided', async () => {
      mockUseWallet.mockReturnValue(connectedWalletBuilder().build())
      mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
      mockUseWeb3ReadOnly.mockReturnValue({} as any)
      mockUseIsRecoverer.mockReturnValue(true)

      const { result } = renderHook(() => useIsValidRecoveryExecTransactionFromModule(undefined, createSafeTx()))

      expect(result.current).toEqual([undefined, undefined, false])

      await waitFor(() => {
        expect(result.current).toEqual([undefined, undefined, false])
      })
    })

    it('should return undefined if no transaction is provided', async () => {
      mockUseWallet.mockReturnValue(connectedWalletBuilder().build())
      mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
      mockUseWeb3ReadOnly.mockReturnValue({} as any)
      mockUseIsRecoverer.mockReturnValue(true)

      const { result } = renderHook(() => useIsValidRecoveryExecTransactionFromModule(faker.finance.ethereumAddress()))

      expect(result.current).toEqual([undefined, undefined, false])

      await waitFor(() => {
        expect(result.current).toEqual([undefined, undefined, false])
      })
    })

    it('should return undefined if no wallet is connected', async () => {
      mockUseWallet.mockReturnValue(null)
      mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
      mockUseWeb3ReadOnly.mockReturnValue({} as any)
      mockUseIsRecoverer.mockReturnValue(true)

      const { result } = renderHook(() =>
        useIsValidRecoveryExecTransactionFromModule(faker.finance.ethereumAddress(), createSafeTx()),
      )

      expect(result.current).toEqual([undefined, undefined, false])

      await waitFor(() => {
        expect(result.current).toEqual([undefined, undefined, false])
      })
    })

    it('should return undefined if no provider is connected', async () => {
      mockUseWallet.mockReturnValue(connectedWalletBuilder().build())
      mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
      mockUseWeb3ReadOnly.mockReturnValue(undefined)
      mockUseIsRecoverer.mockReturnValue(true)

      const { result } = renderHook(() =>
        useIsValidRecoveryExecTransactionFromModule(faker.finance.ethereumAddress(), createSafeTx()),
      )

      expect(result.current).toEqual([undefined, undefined, false])

      await waitFor(() => {
        expect(result.current).toEqual([undefined, undefined, false])
      })
    })

    it('should return whether the transaction is valid', async () => {
      mockUseWallet.mockReturnValue(connectedWalletBuilder().build())
      mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
      mockUseWeb3ReadOnly.mockReturnValue({} as any)
      mockUseIsRecoverer.mockReturnValue(true)

      mockGetPatchedSignerOrProvider.mockReturnValue({
        getSigner: () => ({} as any),
      } as any)

      const isValid = faker.datatype.boolean()
      mockGetModuleInstance.mockReturnValue({
        connect: () => ({
          callStatic: {
            execTransactionFromModule: jest.fn().mockResolvedValue(isValid),
          },
        }),
      } as any)

      const delayModifierAddress = faker.finance.ethereumAddress()
      const safeTx = createSafeTx()

      const { result } = renderHook(() => useIsValidRecoveryExecTransactionFromModule(delayModifierAddress, safeTx))

      expect(result.current).toEqual([undefined, undefined, true])

      await waitFor(() => {
        expect(result.current[2]).toBe(false)
      })

      await waitFor(() => {
        expect(result.current).toEqual([isValid, undefined, false])
      })
    })

    it('should otherwise return an error if the transaction validity check throws', async () => {
      mockUseWallet.mockReturnValue(connectedWalletBuilder().build())
      mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
      mockUseWeb3ReadOnly.mockReturnValue({} as any)
      mockUseIsRecoverer.mockReturnValue(true)

      mockGetPatchedSignerOrProvider.mockReturnValue({
        getSigner: () => ({} as any),
      } as any)

      const error = new Error('Some error')
      mockGetModuleInstance.mockReturnValue({
        connect: () => ({
          callStatic: {
            execTransactionFromModule: () => Promise.reject(error),
          },
        }),
      } as any)

      const delayModifierAddress = faker.finance.ethereumAddress()
      const safeTx = createSafeTx()

      const { result } = renderHook(() => useIsValidRecoveryExecTransactionFromModule(delayModifierAddress, safeTx))

      expect(result.current).toEqual([undefined, undefined, true])

      await waitFor(() => {
        expect(result.current).toEqual([undefined, error, false])
      })
    })
  })

  describe('useIsValidRecoveryExecuteNextTx', () => {
    it('should return undefined if the transaction is not executable', async () => {
      mockUseWallet.mockReturnValue(connectedWalletBuilder().build())
      mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
      mockUseWeb3ReadOnly.mockReturnValue({} as any)
      mockUseRecoveryTxState.mockReturnValue({ isExecutable: false } as any)

      const recovery = {
        address: faker.finance.ethereumAddress(),
        args: {
          to: faker.finance.ethereumAddress(),
          value: BigNumber.from(0),
          data: '0x',
          operation: 0,
        },
      }

      const { result } = renderHook(() => useIsValidRecoveryExecuteNextTx(recovery as any))

      expect(result.current).toEqual([undefined, undefined, false])

      await waitFor(() => {
        expect(result.current).toEqual([undefined, undefined, false])
      })
    })

    it('should return undefined if no wallet is connected', async () => {
      mockUseWallet.mockReturnValue(null)
      mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
      mockUseWeb3ReadOnly.mockReturnValue({} as any)
      mockUseRecoveryTxState.mockReturnValue({ isExecutable: true } as any)

      const recovery = {
        address: faker.finance.ethereumAddress(),
        args: {
          to: faker.finance.ethereumAddress(),
          value: BigNumber.from(0),
          data: '0x',
          operation: 0,
        },
      }

      const { result } = renderHook(() => useIsValidRecoveryExecuteNextTx(recovery as any))

      expect(result.current).toEqual([undefined, undefined, false])

      await waitFor(() => {
        expect(result.current).toEqual([undefined, undefined, false])
      })
    })

    it('should return undefined if no provider is connected', async () => {
      mockUseWallet.mockReturnValue(connectedWalletBuilder().build())
      mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
      mockUseWeb3ReadOnly.mockReturnValue(undefined)
      mockUseRecoveryTxState.mockReturnValue({ isExecutable: true } as any)

      const recovery = {
        address: faker.finance.ethereumAddress(),
        args: {
          to: faker.finance.ethereumAddress(),
          value: BigNumber.from(0),
          data: '0x',
          operation: 0,
        },
      }

      const { result } = renderHook(() => useIsValidRecoveryExecuteNextTx(recovery as any))

      expect(result.current).toEqual([undefined, undefined, false])

      await waitFor(() => {
        expect(result.current).toEqual([undefined, undefined, false])
      })
    })

    it('should return whether the transaction is valid', async () => {
      mockUseWallet.mockReturnValue(connectedWalletBuilder().build())
      mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
      mockUseWeb3ReadOnly.mockReturnValue({} as any)
      mockUseRecoveryTxState.mockReturnValue({ isExecutable: true } as any)

      mockGetPatchedSignerOrProvider.mockReturnValue({
        getSigner: () => ({} as any),
      } as any)

      mockGetModuleInstance.mockReturnValue({
        connect: () => ({
          callStatic: {
            executeNextTx: () => Promise.resolve(),
          },
        }),
      } as any)

      const recovery = {
        address: faker.finance.ethereumAddress(),
        args: {
          to: faker.finance.ethereumAddress(),
          value: BigNumber.from(0),
          data: '0x',
          operation: 0,
        },
      }

      const { result } = renderHook(() => useIsValidRecoveryExecuteNextTx(recovery as any))

      expect(result.current).toEqual([undefined, undefined, true])

      await waitFor(() => {
        expect(result.current).toEqual([true, undefined, false])
      })
    })

    it('should otherwise return an error if the transaction is invalid', async () => {
      mockUseWallet.mockReturnValue(connectedWalletBuilder().build())
      mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
      mockUseWeb3ReadOnly.mockReturnValue({} as any)
      mockUseRecoveryTxState.mockReturnValue({ isExecutable: true } as any)

      mockGetPatchedSignerOrProvider.mockReturnValue({
        getSigner: () => ({} as any),
      } as any)

      const error = new Error('Some error')
      mockGetModuleInstance.mockReturnValue({
        connect: () => ({
          callStatic: {
            executeNextTx: () => Promise.reject(error),
          },
        }),
      } as any)

      const recovery = {
        address: faker.finance.ethereumAddress(),
        args: {
          to: faker.finance.ethereumAddress(),
          value: BigNumber.from(0),
          data: '0x',
          operation: 0,
        },
      }

      const { result } = renderHook(() => useIsValidRecoveryExecuteNextTx(recovery as any))

      expect(result.current).toEqual([undefined, undefined, true])

      await waitFor(() => {
        expect(result.current).toEqual([undefined, error, false])
      })
    })
  })

  describe('useIsValidRecoverySkipExpired', () => {
    it('should return undefined if the transaction has not expired', async () => {
      mockUseWallet.mockReturnValue(connectedWalletBuilder().build())
      mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
      mockUseWeb3ReadOnly.mockReturnValue({} as any)
      mockUseRecoveryTxState.mockReturnValue({ isExpired: false } as any)

      const recovery = {
        address: faker.finance.ethereumAddress(),
        args: {
          to: faker.finance.ethereumAddress(),
          value: BigNumber.from(0),
          data: '0x',
          operation: 0,
        },
      }

      const { result } = renderHook(() => useIsValidRecoverySkipExpired(recovery as any))

      expect(result.current).toEqual([undefined, undefined, false])

      await waitFor(() => {
        expect(result.current).toEqual([undefined, undefined, false])
      })
    })

    it('should return undefined if no wallet is connected', async () => {
      mockUseWallet.mockReturnValue(null)
      mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
      mockUseWeb3ReadOnly.mockReturnValue({} as any)
      mockUseRecoveryTxState.mockReturnValue({ isExpired: true } as any)

      const recovery = {
        address: faker.finance.ethereumAddress(),
        args: {
          to: faker.finance.ethereumAddress(),
          value: BigNumber.from(0),
          data: '0x',
          operation: 0,
        },
      }

      const { result } = renderHook(() => useIsValidRecoverySkipExpired(recovery as any))

      expect(result.current).toEqual([undefined, undefined, false])

      await waitFor(() => {
        expect(result.current).toEqual([undefined, undefined, false])
      })
    })

    it('should return undefined if no provider is connected', async () => {
      mockUseWallet.mockReturnValue(connectedWalletBuilder().build())
      mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
      mockUseWeb3ReadOnly.mockReturnValue(undefined)
      mockUseRecoveryTxState.mockReturnValue({ isExpired: true } as any)

      const recovery = {
        address: faker.finance.ethereumAddress(),
        args: {
          to: faker.finance.ethereumAddress(),
          value: BigNumber.from(0),
          data: '0x',
          operation: 0,
        },
      }

      const { result } = renderHook(() => useIsValidRecoverySkipExpired(recovery as any))

      expect(result.current).toEqual([undefined, undefined, false])

      await waitFor(() => {
        expect(result.current).toEqual([undefined, undefined, false])
      })
    })

    it('should return true if the transaction is valid', async () => {
      mockUseWallet.mockReturnValue(connectedWalletBuilder().build())
      mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
      mockUseWeb3ReadOnly.mockReturnValue({} as any)
      mockUseRecoveryTxState.mockReturnValue({ isExpired: true } as any)

      mockGetPatchedSignerOrProvider.mockReturnValue({
        getSigner: () => ({} as any),
      } as any)

      mockGetModuleInstance.mockReturnValue({
        connect: () => ({
          callStatic: {
            skipExpired: () => Promise.resolve(),
          },
        }),
      } as any)

      const recovery = {
        address: faker.finance.ethereumAddress(),
        args: {
          to: faker.finance.ethereumAddress(),
          value: BigNumber.from(0),
          data: '0x',
          operation: 0,
        },
      }

      const { result } = renderHook(() => useIsValidRecoverySkipExpired(recovery as any))

      expect(result.current).toEqual([undefined, undefined, true])

      await waitFor(() => {
        expect(result.current).toEqual([true, undefined, false])
      })
    })

    it('should otherwise return an error if the transaction is invalid', async () => {
      mockUseWallet.mockReturnValue(connectedWalletBuilder().build())
      mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
      mockUseWeb3ReadOnly.mockReturnValue({} as any)
      mockUseRecoveryTxState.mockReturnValue({ isExpired: true } as any)

      mockGetPatchedSignerOrProvider.mockReturnValue({
        getSigner: () => ({} as any),
      } as any)

      const error = new Error('Some error')
      mockGetModuleInstance.mockReturnValue({
        connect: () => ({
          callStatic: {
            skipExpired: () => Promise.reject(error),
          },
        }),
      } as any)

      const recovery = {
        address: faker.finance.ethereumAddress(),
        args: {
          to: faker.finance.ethereumAddress(),
          value: BigNumber.from(0),
          data: '0x',
          operation: 0,
        },
      }

      const { result } = renderHook(() => useIsValidRecoverySkipExpired(recovery as any))

      expect(result.current).toEqual([undefined, undefined, true])

      await waitFor(() => {
        expect(result.current).toEqual([undefined, error, false])
      })
    })
  })

  describe('useIsValidRecoveryExecution', () => {
    it('should return undefined if the transaction is not executable', async () => {
      mockUseWallet.mockReturnValue(connectedWalletBuilder().build())
      mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
      mockUseWeb3ReadOnly.mockReturnValue({} as any)
      mockUseRecoveryTxState.mockReturnValue({ isExecutable: false } as any)

      const recovery = {
        address: faker.finance.ethereumAddress(),
        args: {
          to: faker.finance.ethereumAddress(),
          value: BigNumber.from(0),
          data: '0x',
          operation: 0,
        },
      }

      const { result } = renderHook(() => useIsValidRecoveryExecution(recovery as any))

      expect(result.current).toEqual([undefined, undefined, false])

      await waitFor(() => {
        expect(result.current).toEqual([undefined, undefined, false])
      })
    })

    it('should return undefined if no wallet is connected', async () => {
      mockUseWallet.mockReturnValue(null)
      mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
      mockUseWeb3ReadOnly.mockReturnValue({} as any)
      mockUseRecoveryTxState.mockReturnValue({ isExecutable: true } as any)

      const recovery = {
        address: faker.finance.ethereumAddress(),
        args: {
          to: faker.finance.ethereumAddress(),
          value: BigNumber.from(0),
          data: '0x',
          operation: 0,
        },
      }

      const { result } = renderHook(() => useIsValidRecoveryExecution(recovery as any))

      expect(result.current).toEqual([undefined, undefined, false])

      await waitFor(() => {
        expect(result.current).toEqual([undefined, undefined, false])
      })
    })

    it('should return undefined if no provider is connected', async () => {
      mockUseWallet.mockReturnValue(connectedWalletBuilder().build())
      mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
      mockUseWeb3ReadOnly.mockReturnValue(undefined)
      mockUseRecoveryTxState.mockReturnValue({ isExecutable: true } as any)

      const recovery = {
        address: faker.finance.ethereumAddress(),
        args: {
          to: faker.finance.ethereumAddress(),
          value: BigNumber.from(0),
          data: '0x',
          operation: 0,
        },
      }

      const { result } = renderHook(() => useIsValidRecoveryExecution(recovery as any))

      expect(result.current).toEqual([undefined, undefined, false])

      await waitFor(() => {
        expect(result.current).toEqual([undefined, undefined, false])
      })
    })

    describe('multiSend', () => {
      it('should return true if the transaction is valid', async () => {
        mockUseWallet.mockReturnValue(connectedWalletBuilder().build())
        mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
        mockUseWeb3ReadOnly.mockReturnValue({} as any)
        mockUseRecoveryTxState.mockReturnValue({ isExecutable: true } as any)
        mockGetReadOnlyMultiSendCallOnlyContract.mockReturnValue({
          contract: {
            connect: () => ({
              callStatic: {
                multiSend: () => Promise.resolve(),
              },
            }),
          },
        } as any)

        const recovery = {
          address: faker.finance.ethereumAddress(),
          args: {
            to: faker.finance.ethereumAddress(),
            value: BigNumber.from(0),
            data: id(Multi_send__factory.createInterface().getFunction('multiSend').format()),
            operation: 0,
          },
        }

        const { result } = renderHook(() => useIsValidRecoveryExecution(recovery as any))

        expect(result.current).toEqual([undefined, undefined, true])

        await waitFor(() => {
          expect(result.current).toEqual([true, undefined, false])
        })
      })

      it('should otherwise return an error if the transaction is invalid', async () => {
        mockUseWallet.mockReturnValue(connectedWalletBuilder().build())
        mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
        mockUseWeb3ReadOnly.mockReturnValue({} as any)
        mockUseRecoveryTxState.mockReturnValue({ isExecutable: true } as any)
        const error = new Error('Some error')
        mockGetReadOnlyMultiSendCallOnlyContract.mockReturnValue({
          contract: {
            connect: () => ({
              callStatic: {
                multiSend: () => Promise.reject(error),
              },
            }),
          },
        } as any)

        const recovery = {
          address: faker.finance.ethereumAddress(),
          args: {
            to: faker.finance.ethereumAddress(),
            value: BigNumber.from(0),
            data: id(Multi_send__factory.createInterface().getFunction('multiSend').format()),
            operation: 0,
          },
        }

        const { result } = renderHook(() => useIsValidRecoveryExecution(recovery as any))

        expect(result.current).toEqual([undefined, undefined, true])

        await waitFor(() => {
          expect(result.current).toEqual([undefined, error, false])
        })
      })
    })

    describe('Safe', () => {
      it('should return true if the transaction is valid', async () => {
        mockUseWallet.mockReturnValue(connectedWalletBuilder().build())
        mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
        mockUseWeb3ReadOnly.mockReturnValue({} as any)
        mockUseRecoveryTxState.mockReturnValue({ isExecutable: true } as any)
        mockGetCurrentGnosisSafeContract.mockReturnValue({
          contract: {
            callStatic: {
              execTransaction: () => Promise.resolve(),
            },
          },
        } as any)

        const recovery = {
          address: faker.finance.ethereumAddress(),
          args: {
            to: faker.finance.ethereumAddress(),
            value: BigNumber.from(0),
            data: id(Gnosis_safe__factory.createInterface().getFunction('execTransaction').format()),
            operation: 0,
          },
        }
        mockCreateTx.mockResolvedValue(createSafeTx(recovery.args.data))

        const { result } = renderHook(() => useIsValidRecoveryExecution(recovery as any))

        expect(result.current).toEqual([undefined, undefined, true])

        await waitFor(() => {
          expect(result.current).toEqual([true, undefined, false])
        })
      })

      it('should otherwise return an error if the transaction is invalid', async () => {
        mockUseWallet.mockReturnValue(connectedWalletBuilder().build())
        mockUseSafeInfo.mockReturnValue({ safe: safeInfoBuilder().build() } as any)
        mockUseWeb3ReadOnly.mockReturnValue({} as any)
        mockUseRecoveryTxState.mockReturnValue({ isExecutable: true } as any)
        const error = new Error('Some error')
        mockGetCurrentGnosisSafeContract.mockReturnValue({
          contract: {
            callStatic: {
              execTransaction: () => Promise.reject(error),
            },
          },
        } as any)

        const recovery = {
          address: faker.finance.ethereumAddress(),
          args: {
            to: faker.finance.ethereumAddress(),
            value: BigNumber.from(0),
            data: id(Gnosis_safe__factory.createInterface().getFunction('execTransaction').format()),
            operation: 0,
          },
        }
        mockCreateTx.mockResolvedValue(createSafeTx(recovery.args.data))

        const { result } = renderHook(() => useIsValidRecoveryExecution(recovery as any))

        expect(result.current).toEqual([undefined, undefined, true])

        await waitFor(() => {
          expect(result.current).toEqual([undefined, error, false])
        })
      })
    })
  })
})
