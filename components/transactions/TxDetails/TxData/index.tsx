import EthHashInfo from '@/components/common/EthHashInfo'
import SettingsChangeTxInfo from '@/components/transactions/TxDetails/TxData/SettingsChange'
import { TransferTx } from '@/components/transactions/TxInfo'
import { isSettingsChangeTxInfo, isTransferTxInfo } from '@/components/transactions/utils'
import { useCurrentChain } from '@/services/useChains'
import { TransactionDetails, Transfer, TransferDirection } from '@gnosis.pm/safe-react-gateway-sdk'
import { type ReactElement } from 'react'
import css from './styles.module.css'

export const AddressInfo = ({
  name,
  avatarUrl,
  address,
  shortName,
}: {
  name?: string | null
  avatarUrl?: string | null
  address: string | null
  shortName?: string
}): ReactElement => {
  if (!address) {
    return <></>
  }

  return (
    <>
      {/* TODO: Add these to EthHashInfo */}
      {name}
      <EthHashInfo address={address} shortName={shortName} customBlockie={avatarUrl ? avatarUrl : undefined} />
    </>
  )
}

const TransferTxInfoSummary = ({ txInfo }: { txInfo: Transfer }) => {
  const { direction } = txInfo
  return (
    <span>
      {/* Copy should be 'Send' if is a pending transaction */}
      {direction === TransferDirection.INCOMING ? 'Received' : 'Sent'}{' '}
      <span className={css.bold}>
        <TransferTx info={txInfo} withLogo={false} omitSign />
      </span>
      {direction === TransferDirection.INCOMING ? ' from:' : ' to:'}
    </span>
  )
}

const TxData = ({ txDetails }: { txDetails: TransactionDetails }): ReactElement => {
  const currentChain = useCurrentChain()
  const { shortName } = currentChain || {}

  const txInfo = txDetails.txInfo

  if (isTransferTxInfo(txInfo)) {
    const address =
      txInfo.direction.toUpperCase() === TransferDirection.INCOMING ? txInfo.sender.value : txInfo.recipient.value
    return (
      <div>
        <TransferTxInfoSummary txInfo={txInfo} />
        <AddressInfo address={address} shortName={shortName} />
      </div>
    )
  }
  if (isSettingsChangeTxInfo(txInfo)) {
    return <SettingsChangeTxInfo settingsInfo={txInfo.settingsInfo} />
  }

  // TODO: handle missing TxInfo types
  return <></>
}

export default TxData
