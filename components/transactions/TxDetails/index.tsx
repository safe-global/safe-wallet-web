import { type ReactElement } from 'react'
import { getTransactionDetails, TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import TxSigners from '@/components/transactions/TxSigners'
import Summary from '@/components/transactions/TxDetails/Summary'
import TxData, { AddressInfo } from '@/components/transactions/TxDetails/TxData'
import useChainId from '@/hooks/useChainId'
import useAsync from '@/hooks/useAsync'
import { isModuleExecutionInfo, isMultisendTxInfo, isMultisigExecutionInfo } from '@/utils/transaction-guards'
import { InfoDetails } from '@/components/transactions/TxDetails/TxData/SettingsChange'
import { TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import css from './styles.module.css'

export const NOT_AVAILABLE = 'n/a'

const TxDetails = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement => {
  const chainId = useChainId()
  const [txDetails, , loading] = useAsync(async () => {
    return getTransactionDetails(chainId, txSummary.id)
  }, [chainId, txSummary.id])

  if (loading || !txDetails) {
    return <div>Loading...</div>
  }

  // confirmations are in detailedExecutionInfo
  const hasSigners = isMultisigExecutionInfo(txSummary.executionInfo) && txSummary.executionInfo.confirmationsRequired

  return (
    <div className={css.container}>
      {/* /Details */}
      <div className={`${css.details} ${!hasSigners ? css.noSigners : ''}`}>
        {isMultisendTxInfo(txDetails.txInfo) ? (
          <>
            <div className={css.multisendInfo}>
              <InfoDetails title="MultiSend contract:">
                <AddressInfo address={txDetails.txInfo.to.value} />
              </InfoDetails>
              <TxDataRow title="Value:">{txDetails.txInfo.value}</TxDataRow>
            </div>
            <div className={`${css.txSummary} ${css.multisend}`}>
              <Summary txDetails={txDetails} />
            </div>
            <div className={`${css.txData} ${css.multisend} ${css.noPadding}`}>
              <TxData txDetails={txDetails} />
            </div>
          </>
        ) : (
          <>
            <div className={css.txData}>
              <TxData txDetails={txDetails} />
            </div>
            {/* Module information*/}
            {isModuleExecutionInfo(txSummary.executionInfo) ? (
              <div className={css.txModule}>
                <InfoDetails title="Module:">
                  <AddressInfo address={txSummary.executionInfo.address.value} />
                </InfoDetails>
              </div>
            ) : (
              <></>
            )}
            <div className={css.txSummary}>
              <Summary txDetails={txDetails} />
            </div>
          </>
        )}
      </div>
      {/* Signers */}
      {hasSigners && (
        <div className={css.txSigners}>
          <TxSigners txDetails={txDetails} txSummary={txSummary} />
        </div>
      )}
    </div>
  )
}

export default TxDetails
