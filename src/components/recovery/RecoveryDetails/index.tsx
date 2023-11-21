import { Link, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { Operation } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement } from 'react'

import EthHashInfo from '@/components/common/EthHashInfo'
import { dateString } from '@/utils/formatters'
import { generateDataRowValue, TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import { getRecoveredSafeInfo } from '@/services/recovery/transaction-list'
import useSafeInfo from '@/hooks/useSafeInfo'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { RecoverySigners } from '../RecoverySigners'
import { Errors, logError } from '@/services/exceptions'
import type { RecoveryQueueItem } from '@/store/recoverySlice'

import txDetailsCss from '@/components/transactions/TxDetails/styles.module.css'
import summaryCss from '@/components/transactions/TxDetails/Summary/styles.module.css'

export function RecoveryDetails({ item }: { item: RecoveryQueueItem }): ReactElement {
  const { transactionHash, timestamp, validFrom, expiresAt, args, isMalicious, address } = item
  const { safe } = useSafeInfo()

  const newSetup = useMemo(() => {
    try {
      return getRecoveredSafeInfo(safe, {
        to: args.to,
        value: args.value.toString(),
        data: args.data,
      })
    } catch (e) {
      logError(Errors._811, e)
    }
    // We only render the threshold and owners
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [args.data, args.to, args.value, safe.threshold, safe.owners])

  const [expanded, setExpanded] = useState(false)

  const toggleExpanded = () => {
    setExpanded((prev) => !prev)
  }

  return (
    <div className={txDetailsCss.container}>
      <div className={txDetailsCss.details}>
        <div className={txDetailsCss.txData}>
          {newSetup && !isMalicious ? (
            <InfoDetails title="Add owner(s):">
              {newSetup.owners.map((owner) => (
                <EthHashInfo key={owner.value} address={owner.value} shortAddress={false} showCopyButton hasExplorer />
              ))}

              <div>
                <Typography fontWeight={700} gutterBottom>
                  Required confirmations for new transactions:
                </Typography>
                <Typography>
                  {newSetup.threshold} out of {newSetup.owners.length} owner(s)
                </Typography>
              </div>
            </InfoDetails>
          ) : (
            <ErrorMessage>This transaction potentially calls malicious actions. We recommend skipping it.</ErrorMessage>
          )}
        </div>

        <div className={txDetailsCss.txSummary}>
          <TxDataRow title="Transaction hash">{generateDataRowValue(transactionHash, 'hash', true)}</TxDataRow>
          <TxDataRow title="Created:">{dateString(timestamp.toNumber())}</TxDataRow>
          <TxDataRow title="Executable:">{dateString(validFrom.toNumber())}</TxDataRow>
          {expiresAt && <TxDataRow title="Expires:">{dateString(expiresAt.toNumber())}</TxDataRow>}
          <Link className={summaryCss.buttonExpand} onClick={toggleExpanded} component="button" variant="body1">
            Advanced details
          </Link>

          {expanded && (
            <>
              <TxDataRow title="Module:">{generateDataRowValue(address, 'address', true)}</TxDataRow>
              <TxDataRow title="Value:">{args.value.toString()}</TxDataRow>
              <TxDataRow title="Operation:">{`${args.operation} (${Operation[
                args.operation
              ].toLowerCase()})`}</TxDataRow>
              <TxDataRow title="Raw data:">{generateDataRowValue(args.data, 'rawData')}</TxDataRow>
            </>
          )}
        </div>
      </div>

      <div className={txDetailsCss.txSigners}>
        <RecoverySigners item={item} />
      </div>
    </div>
  )
}
