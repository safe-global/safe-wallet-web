import type { ConfigFile } from '@rtk-query/codegen-openapi'

const config: ConfigFile = {
  schemaFile: './src/store/gateway/api-schema/schema.json',
  prettierConfigFile: './.prettierrc',
  apiFile: './src/store/gateway/cgwClient.ts',
  apiImport: 'cgwClient',
  exportName: 'cgwApi',
  hooks: true,
  filterEndpoints: [/^(?!.*delegates).*/],
  tag: true,
  outputFiles: {
    './src/store/gateway/AUTO_GENERATED/about.ts': {
      filterEndpoints: [/^about/],
    },
    './src/store/gateway/AUTO_GENERATED/accounts.ts': {
      filterEndpoints: [/^accounts/],
    },
    './src/store/gateway/AUTO_GENERATED/auth.ts': {
      filterEndpoints: [/^auth/],
    },
    './src/store/gateway/AUTO_GENERATED/balances.ts': {
      filterEndpoints: [/^balances/],
    },
    './src/store/gateway/AUTO_GENERATED/chains.ts': {
      filterEndpoints: [/^chains/],
    },
    './src/store/gateway/AUTO_GENERATED/collectibles.ts': {
      filterEndpoints: [/^collectibles/],
    },
    './src/store/gateway/AUTO_GENERATED/community.ts': {
      filterEndpoints: [/^community/],
    },
    './src/store/gateway/AUTO_GENERATED/contracts.ts': {
      filterEndpoints: [/^contracts/],
    },
    './src/store/gateway/AUTO_GENERATED/data-decoded.ts': {
      filterEndpoints: [/^dataDecoded/],
    },
    './src/store/gateway/AUTO_GENERATED/delegates.ts': {
      filterEndpoints: [/^delegates(?!DeleteSafeDelegateV1)/],
    },
    './src/store/gateway/AUTO_GENERATED/estimations.ts': {
      filterEndpoints: [/^estimations/],
    },
    './src/store/gateway/AUTO_GENERATED/messages.ts': {
      filterEndpoints: [/^messages/],
    },
    './src/store/gateway/AUTO_GENERATED/notifications.ts': {
      filterEndpoints: [/^notifications/],
    },
    './src/store/gateway/AUTO_GENERATED/owners.ts': {
      filterEndpoints: [/^owners/],
    },
    './src/store/gateway/AUTO_GENERATED/relay.ts': {
      filterEndpoints: [/^relay/],
    },
    './src/store/gateway/AUTO_GENERATED/safe-apps.ts': {
      filterEndpoints: [/^safeApps/],
    },
    './src/store/gateway/AUTO_GENERATED/safes.ts': {
      filterEndpoints: [/^safes/],
    },
    './src/store/gateway/AUTO_GENERATED/targeted-messages.ts': {
      filterEndpoints: [/^targetedMessaging/],
    },
    './src/store/gateway/AUTO_GENERATED/transactions.ts': {
      filterEndpoints: [/^transactions/],
    },
  },
}

export default config
