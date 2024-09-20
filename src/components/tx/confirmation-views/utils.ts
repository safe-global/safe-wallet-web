import type { TransactionInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { SettingsInfoType, TransactionInfoType } from '@safe-global/safe-gateway-typescript-sdk'
import { ConfirmBatchFlow } from '@/components/tx-flow/flows'

export const isSettingsChangeView = (txInfo: TransactionInfo) => txInfo.type === TransactionInfoType.SETTINGS_CHANGE

export const isConfirmBatchView = (txFlow?: JSX.Element) => txFlow?.type === ConfirmBatchFlow

export const isChangeThresholdView = (txInfo: TransactionInfo) =>
  txInfo.type === TransactionInfoType.SETTINGS_CHANGE && txInfo.settingsInfo?.type === SettingsInfoType.CHANGE_THRESHOLD
