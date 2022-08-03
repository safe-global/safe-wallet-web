import React, { ReactElement } from 'react'
import { isMultiSendTxInfo } from '@/utils/transaction-guards'
import { TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import EthHashInfo from '@/components/common/EthHashInfo'
import { TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import Summary from '@/components/transactions/TxDetails/Summary'
import TxData from '@/components/transactions/TxDetails/TxData'
import css from './styles.module.css'
import { ErrorBoundary } from '@sentry/react'

const MultiSendTx = ({ txDetails }: { txDetails: TransactionDetails }): ReactElement => {
  const txInfo = isMultiSendTxInfo(txDetails.txInfo) ? txDetails.txInfo : undefined

  return (
    <>
      <div className={css.multisendInfo}>
        <InfoDetails title="MultiSend contract:">
          <EthHashInfo
            address={txInfo?.to.value || ''}
            name={txInfo?.to.name}
            customAvatar={txInfo?.to.logoUri}
            shortAddress={false}
            showCopyButton
            hasExplorer
          />
        </InfoDetails>
        <TxDataRow title="Value:">{txInfo?.value}</TxDataRow>
      </div>

      <div className={`${css.txSummary}`}>
        <Summary txDetails={txDetails} />
      </div>

      <div className={`${css.txData}`}>
        <ErrorBoundary fallback={<div>Error parsing data</div>}>
          <TxData txDetails={txDetails} />
        </ErrorBoundary>
      </div>
    </>
  )
}

export default MultiSendTx
