import { TransactionInfoType } from '@safe-global/safe-gateway-typescript-sdk'
import { NarrowConfirmationViewProps } from './types'
import type { SettingsChange } from '@safe-global/safe-gateway-typescript-sdk'
import SettingsChangeComponent from './SettingsChange'

export const getConfirmationViewComponent = (txType: TransactionInfoType, props: NarrowConfirmationViewProps) => {
  if (txType === TransactionInfoType.SETTINGS_CHANGE)
    return <SettingsChangeComponent txDetails={props.txDetails} txInfo={props.txInfo as SettingsChange} />

  return null
}
