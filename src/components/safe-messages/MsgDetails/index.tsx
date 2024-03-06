import CodeIcon from '@mui/icons-material/Code'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import { SafeMessageStatus } from '@safe-global/safe-gateway-typescript-sdk'
import classNames from 'classnames'
import type { ReactElement } from 'react'
import { useMemo } from 'react'

import EthHashInfo from '@/components/common/EthHashInfo'
import MsgSigners from '@/components/safe-messages/MsgSigners'
import SignMsgButton from '@/components/safe-messages/SignMsgButton'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import { generateDataRowValue, TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import useWallet from '@/hooks/wallets/useWallet'
import { formatDateTime } from '@/utils/date'
import { generateSafeMessageMessage } from '@/utils/safe-messages'

import CopyButton from '@/components/common/CopyButton'
import infoDetailsCss from '@/components/transactions/InfoDetails/styles.module.css'
import txDetailsCss from '@/components/transactions/TxDetails/styles.module.css'
import singleTxDecodedCss from '@/components/transactions/TxDetails/TxData/DecodedData/SingleTxDecoded/styles.module.css'
import { DecodedMsg } from '../DecodedMsg'

const MsgDetails = ({ msg }: { msg: SafeMessage }): ReactElement => {
  const wallet = useWallet()
  const isConfirmed = msg.status === SafeMessageStatus.CONFIRMED
  const safeMessage = useMemo(() => {
    return generateSafeMessageMessage(msg.message)
  }, [msg.message])

  return (
    <div data-sid="45866" className={txDetailsCss.container}>
      <div data-sid="30809" className={txDetailsCss.details}>
        <div data-sid="11452" className={txDetailsCss.txData}>
          <InfoDetails title="Created by:">
            <EthHashInfo
              address={msg.proposedBy.value || ''}
              name={msg.proposedBy.name}
              customAvatar={msg.proposedBy.logoUri}
              shortAddress={false}
              showCopyButton
              hasExplorer
            />
          </InfoDetails>
        </div>
        <div data-sid="87366" className={txDetailsCss.txData}>
          <InfoDetails
            title={
              <>
                Message <CopyButton text={JSON.stringify(msg.message, null, 2)} />
              </>
            }
          >
            <DecodedMsg message={msg.message} />
          </InfoDetails>
        </div>

        <div data-sid="33182" className={txDetailsCss.txSummary}>
          <TxDataRow title="Created:">{formatDateTime(msg.creationTimestamp)}</TxDataRow>
          <TxDataRow title="Last modified:">{formatDateTime(msg.modifiedTimestamp)}</TxDataRow>
          <TxDataRow title="Message hash:">{generateDataRowValue(msg.messageHash, 'hash')}</TxDataRow>
          <TxDataRow title="SafeMessage:">{generateDataRowValue(safeMessage, 'hash')}</TxDataRow>
        </div>

        {msg.preparedSignature && (
          <div data-sid="87884" className={classNames(txDetailsCss.txSummary, txDetailsCss.multiSend)}>
            <TxDataRow title="Prepared signature:">{generateDataRowValue(msg.preparedSignature, 'hash')}</TxDataRow>
          </div>
        )}

        <div data-sid="37880" className={txDetailsCss.multiSend}>
          {msg.confirmations.map((confirmation, i) => (
            <Accordion
              variant="elevation"
              key={confirmation.signature}
              defaultExpanded={confirmation.owner.value === wallet?.address}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <div data-sid="42445" className={singleTxDecodedCss.summary}>
                  <CodeIcon />
                  <Typography>{`Confirmation ${i + 1}`}</Typography>
                </div>
              </AccordionSummary>

              <AccordionDetails>
                <div data-sid="32360" className={infoDetailsCss.container}>
                  <EthHashInfo
                    address={confirmation.owner.value || ''}
                    name={confirmation.owner.name}
                    customAvatar={confirmation.owner.logoUri}
                    shortAddress={false}
                    showCopyButton
                    hasExplorer
                  />
                </div>
                <TxDataRow title="Signature:">
                  <EthHashInfo address={confirmation.signature} showAvatar={false} showCopyButton />
                </TxDataRow>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      </div>
      <div data-sid="17087" className={txDetailsCss.txSigners}>
        <MsgSigners msg={msg} />
        {wallet && !isConfirmed && (
          <Box data-sid="67262" display="flex" alignItems="center" justifyContent="center" gap={1} mt={2}>
            <SignMsgButton msg={msg} />
          </Box>
        )}
      </div>
    </div>
  )
}

export default MsgDetails
