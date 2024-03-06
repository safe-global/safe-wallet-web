import { Link } from '@mui/material'
import { Operation } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement } from 'react'
import { useState } from 'react'

import { generateDataRowValue, TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import type { RecoveryQueueItem } from '@/features/recovery/services/recovery-state'
import { dateString } from '@/utils/formatters'
import { RecoveryDescription } from '../RecoveryDescription'
import { RecoverySigners } from '../RecoverySigners'

import txDetailsCss from '@/components/transactions/TxDetails/styles.module.css'
import summaryCss from '@/components/transactions/TxDetails/Summary/styles.module.css'

export function RecoveryDetails({ item }: { item: RecoveryQueueItem }): ReactElement {
  const { transactionHash, timestamp, validFrom, expiresAt, args, address } = item

  const [expanded, setExpanded] = useState(false)

  const toggleExpanded = () => {
    setExpanded((prev) => !prev)
  }

  return (
    <div data-sid="43160" className={txDetailsCss.container}>
      <div data-sid="83574" className={txDetailsCss.details}>
        <div data-sid="52502" className={txDetailsCss.txData}>
          <RecoveryDescription item={item} />
        </div>

        <div data-sid="20646" className={txDetailsCss.txSummary}>
          <TxDataRow title="Transaction hash">{generateDataRowValue(transactionHash, 'hash', true)}</TxDataRow>
          <TxDataRow title="Created:">{dateString(Number(timestamp))}</TxDataRow>
          <TxDataRow title="Executable:">{dateString(Number(validFrom))}</TxDataRow>

          {expiresAt !== null && <TxDataRow title="Expires:">{dateString(Number(expiresAt))}</TxDataRow>}

          <Link className={summaryCss.buttonExpand} onClick={toggleExpanded} component="button" variant="body1">
            Advanced details
          </Link>

          {expanded && (
            <>
              <TxDataRow title="Module:">{generateDataRowValue(address, 'address', true)}</TxDataRow>
              <TxDataRow title="Value:">{args.value.toString()}</TxDataRow>
              <TxDataRow title="Operation:">{`${Number(args.operation)} (${Operation[
                Number(args.operation)
              ].toLowerCase()})`}</TxDataRow>
              <TxDataRow title="Raw data:">{generateDataRowValue(args.data, 'rawData')}</TxDataRow>
            </>
          )}
        </div>
      </div>

      <div data-sid="60267" className={txDetailsCss.txSigners}>
        <RecoverySigners item={item} />
      </div>
    </div>
  )
}
