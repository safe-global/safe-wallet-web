import { type ReactElement } from 'react'
import { getTransactionDetails, Operation, TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import TxSigners from '@/components/transactions/TxSigners'
import Summary from '@/components/transactions/TxDetails/Summary'
import TxData from '@/components/transactions/TxDetails/TxData'
import useChainId from '@/hooks/useChainId'
import useAsync from '@/hooks/useAsync'
import { isModuleExecutionInfo, isMultisendTxInfo, isMultisigExecutionInfo } from '@/utils/transaction-guards'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import { TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import { Alert, Tooltip } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import css from './styles.module.css'

export const NOT_AVAILABLE = 'n/a'

const DelegateCallWarning = ({ showWarning }: { showWarning: boolean }): ReactElement => (
  <Tooltip
    title="This transaction calls a smart contract that will be able to modify your Safe."
    placement="top-start"
    arrow
  >
    <Alert
      className={css.alert}
      sx={({ palette }) => ({
        color: palette.black[500],
        backgroundColor: `${showWarning ? palette.orange[200] : palette.green[200]}`,
        borderLeft: `3px solid ${showWarning ? palette.orange[500] : palette.green[400]}`,

        '&.MuiAlert-standardInfo .MuiAlert-icon': {
          marginRight: '8px',
          color: `${showWarning ? palette.orange[500] : palette.green[400]}`,
        },
      })}
      severity="info"
    >
      <b>{showWarning ? 'Unexpected Delegate Call' : 'Delegate Call'}</b>
    </Alert>
  </Tooltip>
)

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
            {txDetails.txData?.operation === Operation.DELEGATE && (
              <div className={css.delegateCall}>
                <DelegateCallWarning showWarning={!txDetails.txData.trustedDelegateCallTarget} />
              </div>
            )}
            <div className={css.multisendInfo}>
              <InfoDetails title="MultiSend contract:">
                <EthHashInfo address={txDetails.txInfo.to.value} />
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
                  <EthHashInfo address={txSummary.executionInfo.address.value} />
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
