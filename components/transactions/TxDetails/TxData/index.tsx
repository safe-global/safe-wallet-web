import EthHashInfo from '@/components/common/EthHashInfo'
import SettingsChangeTxInfo from '@/components/transactions/TxDetails/TxData/SettingsChange'
import { TransferTx } from '@/components/transactions/TxInfo'
import {
  isCancellationTxInfo,
  isMultisigExecutionDetails,
  isSettingsChangeTxInfo,
  isTransferTxInfo,
} from '@/utils/transaction-guards'
import { useCurrentChain } from '@/hooks/useChains'
import { TransactionDetails, Transfer, TransferDirection } from '@gnosis.pm/safe-react-gateway-sdk'
import { type ReactElement } from 'react'
import RejectionTxInfo from '@/components/transactions/TxDetails/TxData/Rejection'

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
      <EthHashInfo address={address} prefix={shortName} customAvatar={avatarUrl ? avatarUrl : undefined} />
    </>
  )
}

const TransferTxInfoSummary = ({ txInfo }: { txInfo: Transfer }) => {
  const { direction } = txInfo
  return (
    <span>
      {/* TODO: copy should be 'Send' if is a queued tx */}
      {direction === TransferDirection.INCOMING ? 'Received' : 'Sent'}{' '}
      <b>
        <TransferTx info={txInfo} withLogo={false} omitSign />
      </b>
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
  if (isCancellationTxInfo(txInfo) && isMultisigExecutionDetails(txDetails.detailedExecutionInfo)) {
    return <RejectionTxInfo nonce={txDetails.detailedExecutionInfo?.nonce} isTxExecuted={!!txDetails.executedAt} />
  }

  // TODO: handle missing TxInfo types
  return <></>
}

export default TxData
