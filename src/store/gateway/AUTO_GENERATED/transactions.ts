import { cgwClient as api } from '../cgwClient'
export const addTagTypes = ['transactions'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      v1GetTransactionById: build.query<V1GetTransactionByIdApiResponse, V1GetTransactionByIdApiArg>({
        query: (queryArg) => ({ url: `/v1/chains/${queryArg.chainId}/transactions/${queryArg.id}` }),
        providesTags: ['transactions'],
      }),
      v1GetMultisigTransactions: build.query<V1GetMultisigTransactionsApiResponse, V1GetMultisigTransactionsApiArg>({
        query: (queryArg) => ({
          url: `/v1/chains/${queryArg.chainId}/safes/${queryArg.safeAddress}/multisig-transactions`,
          params: {
            execution_date__gte: queryArg.executionDateGte,
            execution_date__lte: queryArg.executionDateLte,
            to: queryArg.to,
            value: queryArg.value,
            nonce: queryArg.nonce,
            executed: queryArg.executed,
            cursor: queryArg.cursor,
          },
        }),
        providesTags: ['transactions'],
      }),
      v1DeleteTransaction: build.mutation<V1DeleteTransactionApiResponse, V1DeleteTransactionApiArg>({
        query: (queryArg) => ({
          url: `/v1/chains/${queryArg.chainId}/transactions/${queryArg.safeTxHash}`,
          method: 'DELETE',
          body: queryArg.deleteTransactionDto,
        }),
        invalidatesTags: ['transactions'],
      }),
      v1GetModuleTransactions: build.query<V1GetModuleTransactionsApiResponse, V1GetModuleTransactionsApiArg>({
        query: (queryArg) => ({
          url: `/v1/chains/${queryArg.chainId}/safes/${queryArg.safeAddress}/module-transactions`,
          params: {
            to: queryArg.to,
            module: queryArg['module'],
            transaction_hash: queryArg.transactionHash,
            cursor: queryArg.cursor,
          },
        }),
        providesTags: ['transactions'],
      }),
      v1AddConfirmation: build.mutation<V1AddConfirmationApiResponse, V1AddConfirmationApiArg>({
        query: (queryArg) => ({
          url: `/v1/chains/${queryArg.chainId}/transactions/${queryArg.safeTxHash}/confirmations`,
          method: 'POST',
          body: queryArg.addConfirmationDto,
        }),
        invalidatesTags: ['transactions'],
      }),
      v1GetIncomingTransfers: build.query<V1GetIncomingTransfersApiResponse, V1GetIncomingTransfersApiArg>({
        query: (queryArg) => ({
          url: `/v1/chains/${queryArg.chainId}/safes/${queryArg.safeAddress}/incoming-transfers`,
          params: {
            trusted: queryArg.trusted,
            execution_date__gte: queryArg.executionDateGte,
            execution_date__lte: queryArg.executionDateLte,
            to: queryArg.to,
            value: queryArg.value,
            token_address: queryArg.tokenAddress,
            cursor: queryArg.cursor,
          },
        }),
        providesTags: ['transactions'],
      }),
      v1PreviewTransaction: build.mutation<V1PreviewTransactionApiResponse, V1PreviewTransactionApiArg>({
        query: (queryArg) => ({
          url: `/v1/chains/${queryArg.chainId}/transactions/${queryArg.safeAddress}/preview`,
          method: 'POST',
          body: queryArg.previewTransactionDto,
        }),
        invalidatesTags: ['transactions'],
      }),
      v1GetTransactionQueue: build.query<V1GetTransactionQueueApiResponse, V1GetTransactionQueueApiArg>({
        query: (queryArg) => ({
          url: `/v1/chains/${queryArg.chainId}/safes/${queryArg.safeAddress}/transactions/queued`,
          params: {
            trusted: queryArg.trusted,
            cursor: queryArg.cursor,
          },
        }),
        providesTags: ['transactions'],
      }),
      v1GetTransactionsHistory: build.query<V1GetTransactionsHistoryApiResponse, V1GetTransactionsHistoryApiArg>({
        query: (queryArg) => ({
          url: `/v1/chains/${queryArg.chainId}/safes/${queryArg.safeAddress}/transactions/history`,
          params: {
            timezone_offset: queryArg.timezoneOffset,
            trusted: queryArg.trusted,
            imitation: queryArg.imitation,
            timezone: queryArg.timezone,
            cursor: queryArg.cursor,
          },
        }),
        providesTags: ['transactions'],
      }),
      v1ProposeTransaction: build.mutation<V1ProposeTransactionApiResponse, V1ProposeTransactionApiArg>({
        query: (queryArg) => ({
          url: `/v1/chains/${queryArg.chainId}/transactions/${queryArg.safeAddress}/propose`,
          method: 'POST',
          body: queryArg.proposeTransactionDto,
        }),
        invalidatesTags: ['transactions'],
      }),
      v1GetCreationTransaction: build.query<V1GetCreationTransactionApiResponse, V1GetCreationTransactionApiArg>({
        query: (queryArg) => ({
          url: `/v1/chains/${queryArg.chainId}/safes/${queryArg.safeAddress}/transactions/creation`,
        }),
        providesTags: ['transactions'],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as cgwApi }
export type V1GetTransactionByIdApiResponse = /** status 200  */ TransactionDetails
export type V1GetTransactionByIdApiArg = {
  chainId: string
  id: string
}
export type V1GetMultisigTransactionsApiResponse = /** status 200  */ MultisigTransactionPage
export type V1GetMultisigTransactionsApiArg = {
  chainId: string
  safeAddress: string
  executionDateGte?: string
  executionDateLte?: string
  to?: string
  value?: string
  nonce?: string
  executed?: boolean
  cursor?: string
}
export type V1DeleteTransactionApiResponse = unknown
export type V1DeleteTransactionApiArg = {
  chainId: string
  safeTxHash: string
  deleteTransactionDto: DeleteTransactionDto
}
export type V1GetModuleTransactionsApiResponse = /** status 200  */ ModuleTransactionPage
export type V1GetModuleTransactionsApiArg = {
  chainId: string
  safeAddress: string
  to?: string
  module?: string
  transactionHash?: string
  cursor?: string
}
export type V1AddConfirmationApiResponse = /** status 200  */ Transaction
export type V1AddConfirmationApiArg = {
  chainId: string
  safeTxHash: string
  addConfirmationDto: AddConfirmationDto
}
export type V1GetIncomingTransfersApiResponse = /** status 200  */ IncomingTransferPage
export type V1GetIncomingTransfersApiArg = {
  chainId: string
  safeAddress: string
  trusted?: boolean
  executionDateGte?: string
  executionDateLte?: string
  to?: string
  value?: string
  tokenAddress?: string
  cursor?: string
}
export type V1PreviewTransactionApiResponse = /** status 200  */ TransactionPreview
export type V1PreviewTransactionApiArg = {
  chainId: string
  safeAddress: string
  previewTransactionDto: PreviewTransactionDto
}
export type V1GetTransactionQueueApiResponse = /** status 200  */ QueuedItemPage
export type V1GetTransactionQueueApiArg = {
  chainId: string
  safeAddress: string
  trusted?: boolean
  cursor?: string
}
export type V1GetTransactionsHistoryApiResponse = /** status 200  */ TransactionItemPage
export type V1GetTransactionsHistoryApiArg = {
  chainId: string
  safeAddress: string
  timezoneOffset?: string
  trusted?: boolean
  imitation?: boolean
  timezone?: string
  cursor?: string
}
export type V1ProposeTransactionApiResponse = /** status 200  */ Transaction
export type V1ProposeTransactionApiArg = {
  chainId: string
  safeAddress: string
  proposeTransactionDto: ProposeTransactionDto
}
export type V1GetCreationTransactionApiResponse = /** status 200  */ CreationTransaction
export type V1GetCreationTransactionApiArg = {
  chainId: string
  safeAddress: string
}
export type TransactionInfo = {
  type:
    | 'Creation'
    | 'Custom'
    | 'SettingsChange'
    | 'Transfer'
    | 'SwapOrder'
    | 'SwapTransfer'
    | 'TwapOrder'
    | 'NativeStakingDeposit'
    | 'NativeStakingValidatorsExit'
    | 'NativeStakingWithdraw'
  humanDescription?: string | null
}
export type DataDecodedParameter = {
  name: string
  type: string
  value: object
  valueDecoded?: ((object | null) | (object[] | null)) | null
}
export type DataDecoded = {
  method: string
  parameters?: DataDecodedParameter[] | null
}
export type AddressInfo = {
  value: string
  name?: string | null
  logoUri?: string | null
}
export type TransactionData = {
  hexData?: string | null
  dataDecoded?: DataDecoded | null
  to: AddressInfo
  value?: string | null
  operation: number
  trustedDelegateCallTarget?: boolean | null
  addressInfoIndex?: object | null
}
export type Token = {
  address: string
  decimals?: number | null
  logoUri: string
  name: string
  symbol: string
  type: 'ERC721' | 'ERC20' | 'NATIVE_TOKEN' | 'UNKNOWN'
}
export type MultisigExecutionDetails = {
  type: 'MULTISIG'
  submittedAt: number
  nonce: number
  safeTxGas: string
  baseGas: string
  gasPrice: string
  gasToken: string
  refundReceiver: AddressInfo
  safeTxHash: string
  executor?: AddressInfo | null
  signers: string[]
  confirmationsRequired: number
  confirmations: string[]
  rejectors: AddressInfo[]
  gasTokenInfo?: Token | null
  trusted: boolean
  proposer?: AddressInfo | null
  proposedByDelegate?: AddressInfo | null
}
export type ModuleExecutionDetails = {
  type: 'MODULE'
  address: AddressInfo
}
export type SafeAppInfo = {
  name: string
  url: string
  logoUri?: string | null
}
export type TransactionDetails = {
  safeAddress: string
  txId: string
  executedAt?: number | null
  txStatus: 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'AWAITING_CONFIRMATIONS' | 'AWAITING_EXECUTION'
  txInfo: TransactionInfo | null
  txData?: TransactionData | null
  detailedExecutionInfo?: (MultisigExecutionDetails | ModuleExecutionDetails) | null
  txHash?: string | null
  safeAppInfo?: SafeAppInfo | null
}
export type CreationTransactionInfo = {
  type: 'Creation'
  humanDescription?: string | null
  creator: AddressInfo
  transactionHash: string
  implementation?: AddressInfo | null
  factory?: AddressInfo
  saltNonce?: string | null
}
export type CustomTransactionInfo = {
  type: 'Custom'
  humanDescription?: string | null
  to: AddressInfo
  dataSize: string
  value?: string | null
  isCancellation: boolean
  methodName?: string | null
  actionCount?: number | null
}
export type SettingsChange = {
  type:
    | 'ADD_OWNER'
    | 'CHANGE_MASTER_COPY'
    | 'CHANGE_THRESHOLD'
    | 'DELETE_GUARD'
    | 'DISABLE_MODULE'
    | 'ENABLE_MODULE'
    | 'REMOVE_OWNER'
    | 'SET_FALLBACK_HANDLER'
    | 'SET_GUARD'
    | 'SWAP_OWNER'
}
export type SettingsChangeTransaction = {
  type: 'SettingsChange'
  humanDescription?: string | null
  dataDecoded: DataDecoded
  settingsInfo?: SettingsChange | null
}
export type TokenInfo = {
  /** The token address */
  address: string
  /** The token decimals */
  decimals: number
  /** The logo URI for the token */
  logoUri?: string | null
  /** The token name */
  name: string
  /** The token symbol */
  symbol: string
  /** The token trusted status */
  trusted: boolean
}
export type SwapOrderTransactionInfo = {
  type: 'SwapOrder'
  humanDescription?: string | null
  /** The order UID */
  uid: string
  status: 'presignaturePending' | 'open' | 'fulfilled' | 'cancelled' | 'expired' | 'unknown'
  kind: 'buy' | 'sell' | 'unknown'
  orderClass: 'market' | 'limit' | 'liquidity' | 'unknown'
  /** The timestamp when the order expires */
  validUntil: number
  /** The sell token raw amount (no decimals) */
  sellAmount: string
  /** The buy token raw amount (no decimals) */
  buyAmount: string
  /** The executed sell token raw amount (no decimals) */
  executedSellAmount: string
  /** The executed buy token raw amount (no decimals) */
  executedBuyAmount: string
  /** The sell token of the order */
  sellToken: TokenInfo
  /** The buy token of the order */
  buyToken: TokenInfo
  /** The URL to the explorer page of the order */
  explorerUrl: string
  /** The amount of fees paid for this order. */
  executedSurplusFee?: string | null
  /** The (optional) address to receive the proceeds of the trade */
  receiver?: string | null
  owner: string
  /** The App Data for this order */
  fullAppData?: object | null
}
export type Erc20Transfer = {
  type: 'ERC20'
  tokenAddress: string
  value: string
  tokenName?: string | null
  tokenSymbol?: string | null
  logoUri?: string | null
  decimals?: number | null
  trusted?: boolean | null
  imitation: boolean
}
export type Erc721Transfer = {
  type: 'ERC721'
  tokenAddress: string
  tokenId: string
  tokenName?: string | null
  tokenSymbol?: string | null
  logoUri?: string | null
  trusted?: boolean | null
}
export type NativeCoinTransfer = {
  type: 'NATIVE_COIN'
  value?: string | null
}
export type SwapTransferTransactionInfo = {
  type: 'SwapTransfer'
  humanDescription?: string | null
  sender: AddressInfo
  recipient: AddressInfo
  direction: string
  transferInfo: Erc20Transfer | Erc721Transfer | NativeCoinTransfer
  /** The order UID */
  uid: string
  status: 'presignaturePending' | 'open' | 'fulfilled' | 'cancelled' | 'expired' | 'unknown'
  kind: 'buy' | 'sell' | 'unknown'
  orderClass: 'market' | 'limit' | 'liquidity' | 'unknown'
  /** The timestamp when the order expires */
  validUntil: number
  /** The sell token raw amount (no decimals) */
  sellAmount: string
  /** The buy token raw amount (no decimals) */
  buyAmount: string
  /** The executed sell token raw amount (no decimals) */
  executedSellAmount: string
  /** The executed buy token raw amount (no decimals) */
  executedBuyAmount: string
  /** The sell token of the order */
  sellToken: TokenInfo
  /** The buy token of the order */
  buyToken: TokenInfo
  /** The URL to the explorer page of the order */
  explorerUrl: string
  /** The amount of fees paid for this order. */
  executedSurplusFee?: string | null
  /** The (optional) address to receive the proceeds of the trade */
  receiver?: string | null
  owner: string
  /** The App Data for this order */
  fullAppData?: object | null
}
export type TwapOrderTransactionInfo = {
  type: 'TwapOrder'
  humanDescription?: string | null
  /** The TWAP status */
  status: 'presignaturePending' | 'open' | 'fulfilled' | 'cancelled' | 'expired' | 'unknown'
  kind: 'buy' | 'sell' | 'unknown'
  class?: 'market' | 'limit' | 'liquidity' | 'unknown'
  /** The order UID of the active order, or null if none is active */
  activeOrderUid?: string | null
  /** The timestamp when the TWAP expires */
  validUntil: number
  /** The sell token raw amount (no decimals) */
  sellAmount: string
  /** The buy token raw amount (no decimals) */
  buyAmount: string
  /** The executed sell token raw amount (no decimals), or null if there are too many parts */
  executedSellAmount?: string | null
  /** The executed buy token raw amount (no decimals), or null if there are too many parts */
  executedBuyAmount?: string | null
  /** The executed surplus fee raw amount (no decimals), or null if there are too many parts */
  executedSurplusFee?: string | null
  /** The sell token of the TWAP */
  sellToken: TokenInfo
  /** The buy token of the TWAP */
  buyToken: TokenInfo
  /** The address to receive the proceeds of the trade */
  receiver: string
  owner: string
  /** The App Data for this TWAP */
  fullAppData?: object | null
  /** The number of parts in the TWAP */
  numberOfParts: string
  /** The amount of sellToken to sell in each part */
  partSellAmount: string
  /** The amount of buyToken that must be bought in each part */
  minPartLimit: string
  /** The duration of the TWAP interval */
  timeBetweenParts: number
  /** Whether the TWAP is valid for the entire interval or not */
  durationOfPart: object
  /** The start time of the TWAP */
  startTime: object
}
export type TransferTransactionInfo = {
  type: 'Transfer'
  humanDescription?: string | null
  sender: AddressInfo
  recipient: AddressInfo
  direction: 'INCOMING' | 'OUTGOING' | 'UNKNOWN'
  transferInfo: Erc20Transfer | Erc721Transfer | NativeCoinTransfer
}
export type NativeStakingDepositTransactionInfo = {
  type: 'NativeStakingDeposit'
  humanDescription?: string | null
  status:
    | 'NOT_STAKED'
    | 'ACTIVATING'
    | 'DEPOSIT_IN_PROGRESS'
    | 'ACTIVE'
    | 'EXIT_REQUESTED'
    | 'EXITING'
    | 'EXITED'
    | 'SLASHED'
  estimatedEntryTime: number
  estimatedExitTime: number
  estimatedWithdrawalTime: number
  fee: number
  monthlyNrr: number
  annualNrr: number
  value: string
  numValidators: number
  expectedAnnualReward: string
  expectedMonthlyReward: string
  expectedFiatAnnualReward: number
  expectedFiatMonthlyReward: number
  tokenInfo: TokenInfo
  /** Populated after transaction has been executed */
  validators?: string[] | null
}
export type NativeStakingValidatorsExitTransactionInfo = {
  type: 'NativeStakingValidatorsExit'
  humanDescription?: string | null
  status:
    | 'NOT_STAKED'
    | 'ACTIVATING'
    | 'DEPOSIT_IN_PROGRESS'
    | 'ACTIVE'
    | 'EXIT_REQUESTED'
    | 'EXITING'
    | 'EXITED'
    | 'SLASHED'
  estimatedExitTime: number
  estimatedWithdrawalTime: number
  value: string
  numValidators: number
  tokenInfo: TokenInfo
  validators: string[]
}
export type NativeStakingWithdrawTransactionInfo = {
  type: 'NativeStakingWithdraw'
  humanDescription?: string | null
  value: string
  tokenInfo: TokenInfo
  validators: string[]
}
export type MultisigExecutionInfo = {
  type: 'MULTISIG'
  nonce: number
  confirmationsRequired: number
  confirmationsSubmitted: number
  missingSigners?: AddressInfo[] | null
}
export type ModuleExecutionInfo = {
  type: 'MODULE'
  address: AddressInfo
}
export type Transaction = {
  id: string
  txHash?: string | null
  timestamp: number
  txStatus: 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'AWAITING_CONFIRMATIONS' | 'AWAITING_EXECUTION'
  txInfo:
    | CreationTransactionInfo
    | CustomTransactionInfo
    | SettingsChangeTransaction
    | SwapOrderTransactionInfo
    | SwapTransferTransactionInfo
    | TwapOrderTransactionInfo
    | TransferTransactionInfo
    | NativeStakingDepositTransactionInfo
    | NativeStakingValidatorsExitTransactionInfo
    | NativeStakingWithdrawTransactionInfo
  executionInfo?: (MultisigExecutionInfo | ModuleExecutionInfo) | null
  safeAppInfo?: SafeAppInfo | null
}
export type MultisigTransaction = {
  type: 'TRANSACTION'
  transaction: Transaction
  conflictType: 'None' | 'HasNext' | 'End'
}
export type MultisigTransactionPage = {
  count?: number | null
  next?: string | null
  previous?: string | null
  results: MultisigTransaction[]
}
export type DeleteTransactionDto = {
  signature: string
}
export type ModuleTransaction = {
  type: 'TRANSACTION'
  transaction: Transaction
  conflictType: 'None'
}
export type ModuleTransactionPage = {
  count?: number | null
  next?: string | null
  previous?: string | null
  results: ModuleTransaction[]
}
export type AddConfirmationDto = {
  signedSafeTxHash: string
}
export type IncomingTransfer = {
  type: 'TRANSACTION'
  transaction: Transaction
  conflictType: 'None'
}
export type IncomingTransferPage = {
  count?: number | null
  next?: string | null
  previous?: string | null
  results: IncomingTransfer[]
}
export type TransactionPreview = {
  txInfo:
    | CreationTransactionInfo
    | CustomTransactionInfo
    | SettingsChangeTransaction
    | TransferTransactionInfo
    | SwapOrderTransactionInfo
    | TwapOrderTransactionInfo
    | NativeStakingDepositTransactionInfo
    | NativeStakingValidatorsExitTransactionInfo
    | NativeStakingWithdrawTransactionInfo
  txData: TransactionData
}
export type PreviewTransactionDto = {
  to: string
  data?: string | null
  value: string
  operation: number
}
export type ConflictHeaderQueuedItem = {
  type: 'CONFLICT_HEADER'
  nonce: number
}
export type LabelQueuedItem = {
  type: 'LABEL'
  label: string
}
export type TransactionQueuedItem = {
  type: 'TRANSACTION'
  transaction: Transaction
  conflictType: 'None' | 'HasNext' | 'End'
}
export type QueuedItemPage = {
  count?: number | null
  next?: string | null
  previous?: string | null
  results: (ConflictHeaderQueuedItem | LabelQueuedItem | TransactionQueuedItem)[]
}
export type TransactionItem = {
  type: 'TRANSACTION'
  transaction: Transaction
  conflictType: 'None'
}
export type DateLabel = {
  type: 'DATE_LABEL'
  timestamp: number
}
export type TransactionItemPage = {
  count?: number | null
  next?: string | null
  previous?: string | null
  results: (TransactionItem | DateLabel)[]
}
export type ProposeTransactionDto = {
  to: string
  value: string
  data?: string | null
  nonce: string
  operation: number
  safeTxGas: string
  baseGas: string
  gasPrice: string
  gasToken: string
  refundReceiver?: string | null
  safeTxHash: string
  sender: string
  signature?: string | null
  origin?: string | null
}
export type CreationTransaction = {
  created: string
  creator: string
  transactionHash: string
  factoryAddress: string
  masterCopy?: string | null
  setupData?: string | null
  saltNonce?: string | null
  dataDecoded?: DataDecoded | null
}
export const {
  useV1GetTransactionByIdQuery,
  useV1GetMultisigTransactionsQuery,
  useV1DeleteTransactionMutation,
  useV1GetModuleTransactionsQuery,
  useV1AddConfirmationMutation,
  useV1GetIncomingTransfersQuery,
  useV1PreviewTransactionMutation,
  useV1GetTransactionQueueQuery,
  useV1GetTransactionsHistoryQuery,
  useV1ProposeTransactionMutation,
  useV1GetCreationTransactionQuery,
} = injectedRtkApi
