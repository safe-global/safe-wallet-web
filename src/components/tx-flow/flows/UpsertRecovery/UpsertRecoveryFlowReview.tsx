import EthHashInfo from '@/components/common/EthHashInfo'
import { TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'

import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useWeb3 } from '@/hooks/wallets/web3'
import InfoIcon from '@/public/images/notifications/info.svg'
import { trackEvent } from '@/services/analytics'
import { RECOVERY_EVENTS } from '@/services/analytics/events/recovery'
import { TX_EVENTS, TX_TYPES } from '@/services/analytics/events/transactions'
import { Errors, logError } from '@/services/exceptions'
import { getRecoveryUpsertTransactions } from '@/services/recovery/setup'
import { createMultiSendCallOnlyTx, createTx } from '@/services/tx/tx-sender'
import { isSmartContractWallet } from '@/utils/wallets'
import { SvgIcon, Tooltip, Typography } from '@mui/material'
import { getSafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement } from 'react'
import { useContext, useEffect } from 'react'
import type { UpsertRecoveryFlowProps } from '.'
import { UpsertRecoveryFlowFields } from '.'
import { useRecoveryPeriods } from './useRecoveryPeriods'

enum AddressType {
  EOA = 'EOA',
  Safe = 'Safe',
  Other = 'Other',
}

const getAddressType = async (address: string, chainId: string) => {
  const isSmartContract = await isSmartContractWallet(chainId, address)
  if (!isSmartContract) return AddressType.EOA

  const isSafeContract = await getSafeInfo(chainId, address)
  if (isSafeContract) return AddressType.Safe

  return AddressType.Other
}

const onSubmit = async (isEdit: boolean, params: UpsertRecoveryFlowProps, chainId: string) => {
  const addressType = await getAddressType(params.guardian, chainId)
  const creationType = isEdit ? TX_TYPES.recovery_edit : TX_TYPES.recovery_setup
  const settings = `${creationType},delay_${params.txCooldown},expiry_${params.txExpiration},type_${addressType}`

  trackEvent({ ...TX_EVENTS.CREATE, label: creationType })
  trackEvent({ ...RECOVERY_EVENTS.RECOVERY_SETTINGS, label: settings })
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

  const periods = useRecoveryPeriods()
  const guardian = params[UpsertRecoveryFlowFields.guardian]
  const delay = periods.delay.find(({ value }) => value === params[UpsertRecoveryFlowFields.txCooldown])!.label
  const expiration = periods.expiration.find(
    ({ value }) => value === params[UpsertRecoveryFlowFields.txExpiration],
  )!.label

  useEffect(() => {
    if (!web3) {
      return
    }

    getRecoveryUpsertTransactions({
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

  const isEdit = !!moduleAddress

  return (
    <SignOrExecuteForm onSubmit={() => onSubmit(isEdit, params, safe.chainId)}>
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
            <Tooltip placement="top" title="You can cancel any recovery attempt when it is not needed or wanted.">
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
    </SignOrExecuteForm>
  )
}
