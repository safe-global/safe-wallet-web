import type { Chain, ProviderAccounts, WalletInit, EIP1193Provider } from '@web3-onboard/common'
import type { ITxData } from '@walletconnect/types'

import { getPairingConnector, PAIRING_MODULE_STORAGE_ID } from '@/services/pairing/connector'
import local from '@/services/local-storage/local'
import { killPairingSession } from '@/services/pairing/utils'

enum ProviderEvents {
  ACCOUNTS_CHANGED = 'accountsChanged',
  CHAIN_CHANGED = 'chainChanged',
  DISCONNECT = 'disconnect',
  CONNECT = 'connect',
  WC_SESSION_UPDATE = 'session_update',
}

enum ProviderMethods {
  PERSONAL_SIGN = 'personal_sign',
  ETH_CHAIN_ID = 'eth_chainId',
  ETH_REQUEST_ACCOUNTS = 'eth_requestAccounts',
  ETH_SELECT_ACCOUNTS = 'eth_selectAccounts',
  ETH_SEND_TRANSACTION = 'eth_sendTransaction',
  ETH_SIGN_TRANSACTION = 'eth_signTransaction',
  ETH_SIGN = 'eth_sign',
  ETH_SIGN_TYPED_DATA = 'eth_signTypedData',
  ETH_SIGN_TYPED_DATA_V3 = 'eth_signTypedData_v3',
  ETH_SIGN_TYPED_DATA_V4 = 'eth_signTypedData_v4',
  ETH_ACCOUNTS = 'eth_accounts',
  WALLET_SWITCH_ETHEREUM_CHAIN = 'wallet_switchEthereumChain',
}

export const PAIRING_MODULE_LABEL = 'Safe{Wallet}'

// Modified version of: https://github.com/blocknative/web3-onboard/blob/v2-web3-onboard-develop/packages/walletconnect/src/index.ts
const pairingModule = (): WalletInit => {
  return () => {
    return {
      label: PAIRING_MODULE_LABEL,
      getIcon: async () => (await import('./icon')).default,
      getInterface: async ({ chains, EventEmitter }) => {
        const { StaticJsonRpcProvider } = await import('@ethersproject/providers')

        const { ProviderRpcError, ProviderRpcErrorCode } = await import('@web3-onboard/common')

        const { default: WalletConnect } = await import('@walletconnect/client')

        const { default: QRModal } = await import('@/services/pairing/QRModal')

        const { Subject, fromEvent } = await import('rxjs')
        const { takeUntil, take } = await import('rxjs/operators')

        const emitter = new EventEmitter()

        class EthProvider {
          public request: EIP1193Provider['request']
          public connector: InstanceType<typeof WalletConnect>
          public chains: Chain[]
          public disconnect: EIP1193Provider['disconnect']
          // @ts-expect-error - 'emit' does not exist on `typeof EventEmitter`
          public emit: typeof EventEmitter['emit']
          // @ts-expect-error - 'on' does not exist on `typeof EventEmitter`
          public on: typeof EventEmitter['on']
          // @ts-expect-error - 'removeListener' does not exist on `typeof EventEmitter`
          public removeListener: typeof EventEmitter['removeListener']

          private disconnected$: InstanceType<typeof Subject>
          private providers: Record<string, InstanceType<typeof StaticJsonRpcProvider>>

          constructor({ connector, chains }: { connector: InstanceType<typeof WalletConnect>; chains: Chain[] }) {
            this.emit = emitter.emit.bind(emitter)
            this.on = emitter.on.bind(emitter)
            this.removeListener = emitter.removeListener.bind(emitter)

            this.connector = connector
            this.chains = chains
            this.disconnected$ = new Subject()
            this.providers = {}

            fromEvent(this.connector, ProviderEvents.WC_SESSION_UPDATE, (error, payload) => {
              if (error) {
                throw error
              }

              return payload
            })
              .pipe(takeUntil(this.disconnected$))
              .subscribe({
                next: ({ params }) => {
                  const [{ accounts, chainId }] = params

                  this.emit(ProviderEvents.ACCOUNTS_CHANGED, accounts)
                  this.emit(ProviderEvents.CHAIN_CHANGED, `0x${chainId.toString(16)}`)
                },
                error: console.warn,
              })

            fromEvent(this.connector, ProviderEvents.DISCONNECT, (error, payload) => {
              if (error) {
                throw error
              }

              return payload
            })
              .pipe(takeUntil(this.disconnected$))
              .subscribe({
                next: () => {
                  this.emit(ProviderEvents.ACCOUNTS_CHANGED, [])

                  this.disconnected$.next(true)

                  local.removeItem(PAIRING_MODULE_STORAGE_ID)
                },
                error: console.warn,
              })

            fromEvent(window, 'unload').subscribe(() => {
              this.disconnect?.()
            })

            this.disconnect = () => killPairingSession(this.connector)

            this.request = async ({ method, params }) => {
              switch (method) {
                case ProviderMethods.ETH_CHAIN_ID: {
                  return `0x${this.connector.chainId.toString(16)}`
                }

                case ProviderMethods.ETH_REQUEST_ACCOUNTS: {
                  return new Promise<ProviderAccounts>((resolve, reject) => {
                    if (!this.connector.connected) {
                      this.connector.createSession().then(() => {
                        QRModal.open(this.connector.uri, () =>
                          reject(
                            new ProviderRpcError({
                              code: 4001,
                              message: 'User rejected the request.',
                            }),
                          ),
                        )
                      })
                    } else {
                      const { accounts, chainId } = this.connector.session

                      this.emit(ProviderEvents.CHAIN_CHANGED, `0x${chainId.toString(16)}`)

                      return resolve(accounts)
                    }

                    // @ts-ignore
                    fromEvent(this.connector, ProviderEvents.CONNECT, (error, payload) => {
                      if (error) {
                        throw error
                      }

                      return payload
                    })
                      .pipe(take(1))
                      .subscribe({
                        next: ({ params }) => {
                          const [{ accounts, chainId }] = params

                          this.emit(ProviderEvents.ACCOUNTS_CHANGED, accounts)
                          this.emit(ProviderEvents.CHAIN_CHANGED, `0x${chainId.toString(16)}`)

                          QRModal.close()

                          resolve(accounts)
                        },
                        error: reject,
                      })
                  })
                }

                case ProviderMethods.ETH_SEND_TRANSACTION: {
                  const txData = params![0] as ITxData

                  return this.connector.sendTransaction({
                    ...txData,
                    // Mobile app expects `value`
                    value: txData.value || '0x0',
                  })
                }

                case ProviderMethods.ETH_SIGN_TRANSACTION: {
                  return this.connector.signTransaction(params![0] as ITxData)
                }

                // Mobile app only supports `eth_sign` but emits `personal_sign` event
                case ProviderMethods.PERSONAL_SIGN: {
                  const [safeTxHash, sender] = params as [string, string]
                  return this.connector.signMessage([sender, safeTxHash]) // `eth_sign`
                }

                case ProviderMethods.ETH_ACCOUNTS: {
                  return this.connector.sendCustomRequest({
                    id: 1337,
                    jsonrpc: '2.0',
                    method,
                    params,
                  })
                }

                // Not supported by mobile app
                case ProviderMethods.ETH_SIGN:
                case ProviderMethods.ETH_SIGN_TYPED_DATA:
                case ProviderMethods.ETH_SIGN_TYPED_DATA_V3:
                case ProviderMethods.ETH_SIGN_TYPED_DATA_V4:
                // Not supported by WC
                case ProviderMethods.ETH_SELECT_ACCOUNTS: {
                  throw new ProviderRpcError({
                    code: ProviderRpcErrorCode.UNSUPPORTED_METHOD,
                    message: `Safe{Wallet} mobile does not support the requested method: ${method}`,
                  })
                }

                // Switch wallet chain
                case ProviderMethods.WALLET_SWITCH_ETHEREUM_CHAIN: {
                  this.connector.updateSession({
                    chainId: parseInt((params as [{ chainId: string }])[0].chainId),
                    accounts: this.connector.accounts,
                  })
                  return
                }

                default: {
                  const chainId = await this.request({ method: ProviderMethods.ETH_CHAIN_ID })

                  if (!this.providers[chainId]) {
                    const currentChain = chains.find(({ id }) => id === chainId)

                    if (!currentChain) {
                      throw new ProviderRpcError({
                        code: ProviderRpcErrorCode.CHAIN_NOT_ADDED,
                        message: `The Provider does not have an RPC to request the method: ${method}`,
                      })
                    }

                    this.providers[chainId] = new StaticJsonRpcProvider(currentChain.rpcUrl)
                  }

                  return this.providers[chainId].send(method, params!)
                }
              }
            }
          }
        }

        return {
          provider: new EthProvider({ chains, connector: getPairingConnector()! }),
        }
      },
    }
  }
}

export default pairingModule
