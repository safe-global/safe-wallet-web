import EthHashInfo from '@/components/common/EthHashInfo'
import { TxDetailsProps } from '@/components/transactions/TxDetails'
import SettingsChangeTxInfo from '@/components/transactions/TxDetails/TxData/SettingsChange'
import { TransferTx } from '@/components/transactions/TxInfo'
import { isSettingsChangeTxInfo, isTransferTxInfo } from '@/components/transactions/utils'
import { useCurrentChain } from '@/services/useChains'
import { Transfer, TransferDirection } from '@gnosis.pm/safe-react-gateway-sdk'
import { type ReactElement } from 'react'
import css from './styles.module.css'

export const AddressInfo = ({ address, shortName }: { address: string | null; shortName?: string }): ReactElement => {
  if (!address) {
    return <></>
  }

  return (
    <>
      <EthHashInfo address={address} shortName={shortName} />
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

const TxData = ({ txWithDetails }: TxDetailsProps): ReactElement => {
  const currentChain = useCurrentChain()
  const { shortName } = currentChain || {}

  const txInfo = txWithDetails.txInfo
  console.log(txInfo)
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
  return (
    <>
      Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eos commodi sit dolorum, ex quod vero necessitatibus
      consequatur maiores cumque id deserunt iure dolor aspernatur?
    </>
  )
}

export default TxData
