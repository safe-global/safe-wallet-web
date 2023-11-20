import { useContext, useEffect } from 'react'
import type { ReactElement } from 'react'

import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { Errors, logError } from '@/services/exceptions'
import { createMultiSendCallOnlyTx, createTx } from '@/services/tx/tx-sender'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { getEditRecoveryTransactions, getRecoverySetupTransactions } from '@/services/recovery/setup'
import { useWeb3 } from '@/hooks/wallets/web3'
import useSafeInfo from '@/hooks/useSafeInfo'
import { SvgIcon, Tooltip, Typography } from '@mui/material'
import { UpsertRecoveryFlowFields, RecoveryDelayPeriods, RecoveryExpirationPeriods } from '.'
import { TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import InfoIcon from '@/public/images/notifications/info.svg'
import EthHashInfo from '@/components/common/EthHashInfo'
import type { UpsertRecoveryFlowProps } from '.'
import type { Web3Provider } from '@ethersproject/providers'

const getSafeTx = async ({
  txCooldown,
  txExpiration,
  guardian,
  provider,
  moduleAddress,
  chainId,
  safeAddress,
}: UpsertRecoveryFlowProps & {
  moduleAddress?: string
  provider: Web3Provider
  chainId: string
  safeAddress: string
}) => {
  if (moduleAddress) {
    return getEditRecoveryTransactions({
      moduleAddress,
      newTxCooldown: txCooldown,
      newTxExpiration: txExpiration,
      newGuardians: [guardian],
      provider,
    })
  }

  const { transactions } = getRecoverySetupTransactions({
    txCooldown,
    txExpiration,
    guardians: [guardian],
    chainId,
    safeAddress,
    provider,
  })

  return transactions
}

export function UpsertRecoveryFlowReview({
  params,
  moduleAddress,
}: {
  params: UpsertRecoveryFlowProps
  moduleAddress?: string
}): ReactElement {
  const web3 = useWeb3()
  const { safe, safeAddress } = useSafeInfo()
  const { setSafeTx, safeTxError, setSafeTxError } = useContext(SafeTxContext)

  const guardian = params[UpsertRecoveryFlowFields.guardian]
  const delay = RecoveryDelayPeriods.find(({ value }) => value === params[UpsertRecoveryFlowFields.txCooldown])!.label
  const expiration = RecoveryExpirationPeriods.find(
    ({ value }) => value === params[UpsertRecoveryFlowFields.txExpiration],
  )!.label
  const emailAddress = params[UpsertRecoveryFlowFields.emailAddress]

  useEffect(() => {
    if (!web3) {
      return
    }

    getSafeTx({
      ...params,
      provider: web3,
      chainId: safe.chainId,
      safeAddress,
      moduleAddress,
    }).then((transactions) => {
      const promise = transactions.length > 1 ? createMultiSendCallOnlyTx(transactions) : createTx(transactions[0])

      promise.then(setSafeTx).catch(setSafeTxError)
    })
  }, [guardian, moduleAddress, params, safe.chainId, safeAddress, setSafeTx, setSafeTxError, web3])

  useEffect(() => {
    if (safeTxError) {
      logError(Errors._809, safeTxError.message)
    }
  }, [safeTxError])

  return (
    <SignOrExecuteForm onSubmit={() => null}>
      <Typography>
        This transaction will {moduleAddress ? 'update' : 'enable'} the Account recovery feature once executed.
      </Typography>

      <TxDataRow title="Trusted Guardian">
        <EthHashInfo address={guardian} showName={false} hasExplorer showCopyButton avatarSize={24} />
      </TxDataRow>

      <TxDataRow
        title={
          <>
            Recovery delay
            <Tooltip
              placement="top"
              title="You can cancel any recovery attempt when it is not needed or wanted within the delay period."
            >
              <span>
                <SvgIcon
                  component={InfoIcon}
                  inheritViewBox
                  fontSize="small"
                  color="border"
                  sx={{ verticalAlign: 'middle', ml: 0.5 }}
                />
              </span>
            </Tooltip>
          </>
        }
      >
        {delay}
      </TxDataRow>

      <TxDataRow
        title={
          <>
            Transaction validity
            <Tooltip
              placement="top"
              title="A period after which the recovery attempt will expire and can no longer be executed."
            >
              <span>
                <SvgIcon
                  component={InfoIcon}
                  inheritViewBox
                  fontSize="small"
                  color="border"
                  sx={{ verticalAlign: 'middle', ml: 0.5 }}
                />
              </span>
            </Tooltip>
          </>
        }
      >
        {expiration}
      </TxDataRow>

      {emailAddress ? <TxDataRow title="Email address">{emailAddress}</TxDataRow> : null}
    </SignOrExecuteForm>
  )
}
