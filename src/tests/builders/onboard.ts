import { faker } from '@faker-js/faker'
import { type AppState, type OnboardAPI } from '@web3-onboard/core'
import { type IBuilder, Builder } from '../Builder'
import { eip1193ProviderBuilder } from './eip1193Provider'

const appStateBuilder = (): IBuilder<AppState> => {
  const chains = [{ id: faker.string.numeric() }]
  return Builder.new<AppState>().with({
    chains,
    connect: {},
    accountCenter: { enabled: false },
    locale: 'en_US',
    appMetadata: { name: faker.string.alpha() },
    notifications: [],
    notify: {
      enabled: false,
      transactionHandler: jest.fn(),
    },
    walletModules: [],
    wallets: [
      {
        accounts: [
          {
            address: faker.finance.ethereumAddress(),
            balance: null,
            ens: { name: `${faker.string.alpha()}.eth`, avatar: null, contentHash: null, getText: jest.fn() },
            uns: null,
            secondaryTokens: null,
          },
        ],
        chains: chains.map((chain) => ({
          id: chain.id,
          namespace: 'evm',
        })),
        icon: faker.string.numeric(),
        label: faker.string.numeric(),
        provider: eip1193ProviderBuilder().build(),
        instance: undefined,
      },
    ],
  })
}

export const onboardBuilder = (): IBuilder<OnboardAPI> => {
  return Builder.new<OnboardAPI>().with({
    connectWallet: jest.fn(),
    disconnectWallet: jest.fn(),
    setChain: jest.fn(),
    state: {
      get: () => appStateBuilder().build(),
      actions: {
        customNotification: jest.fn(),
        preflightNotifications: jest.fn(),
        setLocale: jest.fn(),
        setPrimaryWallet: jest.fn(),
        updateAccountCenter: jest.fn(),
        updateAppMetadata: jest.fn(),
        updateBalances: jest.fn(),
        updateNotify: jest.fn(),
        updateTheme: jest.fn(),
        setWalletModules: jest.fn(),
      },
      select: jest.fn(),
    },
  })
}
