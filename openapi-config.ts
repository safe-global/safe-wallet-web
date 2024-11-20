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
      filterEndpoints: [/getAbout/],
    },
    './src/store/gateway/AUTO_GENERATED/accounts.ts': {
      filterEndpoints: [
        /v1CreateAccount/,
        /v1GetDataTypes/,
        /v1GetAccountDataSettings/,
        /v1UpsertAccountDataSettings/,
        /v1GetAccount/,
        /v1DeleteAccount/,
        /v1GetCounterfactualSafe/,
        /v1DeleteCounterfactualSafe/,
        /v1GetCounterfactualSafes/,
        /v1CreateCounterfactualSafe/,
        /v1DeleteCounterfactualSafes/,
      ],
    },
    './src/store/gateway/AUTO_GENERATED/auth.ts': {
      filterEndpoints: [/v1GetNonce/, /v1Verify/],
    },
    './src/store/gateway/AUTO_GENERATED/balances.ts': {
      filterEndpoints: [/v1GetBalances/, /v1GetSupportedFiatCodes/],
    },
    './src/store/gateway/AUTO_GENERATED/chains.ts': {
      filterEndpoints: [
        /v1GetChains/,
        /v1GetChain/,
        /v1GetAboutChain/,
        /v1GetBackbone/,
        /v1GetMasterCopies/,
        /v1GetIndexingStatus/,
      ],
    },
    './src/store/gateway/AUTO_GENERATED/collectibles.ts': {
      filterEndpoints: [/v2GetCollectibles/],
    },
    './src/store/gateway/AUTO_GENERATED/community.ts': {
      filterEndpoints: [
        /v1GetCampaigns/,
        /v1GetCampaignById/,
        /v1GetCampaignActivities/,
        /v1GetCampaignLeaderboard/,
        /v1GetCampaignRank/,
        /v1GheckEligibility/,
        /v1GetLeaderboard/,
        /v1GetLockingRank/,
        /v1GetLockingHistory/,
      ],
    },
    './src/store/gateway/AUTO_GENERATED/contracts.ts': {
      filterEndpoints: [/v1GetContract/],
    },
    './src/store/gateway/AUTO_GENERATED/data-decoded.ts': {
      filterEndpoints: [/v1GetDataDecoded/],
    },
    './src/store/gateway/AUTO_GENERATED/delegates.ts': {
      filterEndpoints: [/v2GetDelegates/, /v2PostDelegate/, /v2DeleteDelegate/],
    },
    './src/store/gateway/AUTO_GENERATED/estimations.ts': {
      filterEndpoints: [/v2GetEstimation/],
    },
    './src/store/gateway/AUTO_GENERATED/messages.ts': {
      filterEndpoints: [/v1GetMessageByHash/, /v1GetMessagesBySafe/, /v1CreateMessage/, /v1UpdateMessageSignature/],
    },
    './src/store/gateway/AUTO_GENERATED/notifications.ts': {
      filterEndpoints: [/v1RegisterDevice/, /v1UnregisterDevice/, /v1UnregisterSafe/],
    },
    './src/store/gateway/AUTO_GENERATED/owners.ts': {
      filterEndpoints: [/v1GetSafesByOwner/, /v1GetAllSafesByOwner/],
    },
    './src/store/gateway/AUTO_GENERATED/relay.ts': {
      filterEndpoints: [/v1Relay/, /v1GetRelaysRemaining/],
    },
    './src/store/gateway/AUTO_GENERATED/safe-apps.ts': {
      filterEndpoints: [/v1GetSafeApps/],
    },
    './src/store/gateway/AUTO_GENERATED/safes.ts': {
      filterEndpoints: [/v1GetSafe/, /v1GetNonces/, /v1GetSafeOverview/],
    },
    './src/store/gateway/AUTO_GENERATED/targeted-messages.ts': {
      filterEndpoints: [/v1GetSubmission/, /v1CreateSubmission/],
    },
    './src/store/gateway/AUTO_GENERATED/transactions.ts': {
      filterEndpoints: [
        /v1GetTransactionById/,
        /v1GetMultisigTransactions/,
        /v1DeleteTransaction/,
        /v1GetModuleTransactions/,
        /v1AddConfirmation/,
        /v1GetIncomingTransfers/,
        /v1PreviewTransaction/,
        /v1GetTransactionQueue/,
        /v1GetTransactionsHistory/,
        /v1ProposeTransaction/,
        /v1GetCreationTransaction/,
      ],
    },
  },
}

export default config
