import { Accordion, AccordionSummary, Typography, AccordionDetails, Link } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CodeIcon from '@mui/icons-material/Code'
import classNames from 'classnames'
import { useState } from 'react'
import type { ReactElement } from 'react'

import { formatDateTime } from '@/utils/date'
import EthHashInfo from '@/components/common/EthHashInfo'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import { TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import type { Message } from '@/hooks/useMessages'

import txDetailsCss from '@/components/transactions/TxDetails/styles.module.css'
import singleTxDecodedCss from '@/components/transactions/TxDetails/TxData/DecodedData/SingleTxDecoded/styles.module.css'
import infoDetailsCss from '@/components/transactions/InfoDetails/styles.module.css'
import useWallet from '@/hooks/wallets/useWallet'

const Msg = ({ message }: { message: Message['message'] }): ReactElement => {
  const [showMsg, setShowMsg] = useState(true)

  const handleToggleMsg = () => {
    setShowMsg((prev) => !prev)
  }

  if (typeof message === 'string') {
    return <>{message}</>
  }

  return (
    <div>
      {showMsg && (
        <pre style={{ margin: 0 }}>
          <code>{JSON.stringify(message, null, 2)}</code>
        </pre>
      )}
      <Link
        component="button"
        onClick={handleToggleMsg}
        fontSize="medium"
        fontWeight={700}
        sx={{ textDecoration: 'underline' }}
      >
        {showMsg ? 'Hide' : 'Show'}
      </Link>
    </div>
  )
}

const MsgDetails = ({ msg }: { msg: Message }) => {
  const wallet = useWallet()

  return (
    <div className={txDetailsCss.container}>
      <div className={txDetailsCss.details}>
        <div className={txDetailsCss.txData}>
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

        <div className={txDetailsCss.txSummary}>
          <TxDataRow title="Message:">
            <Msg message={msg.message} />
          </TxDataRow>
          <TxDataRow title="Hash:">{msg.messageHash}</TxDataRow>
          <TxDataRow title="Created:">{formatDateTime(msg.creationTimestamp)}</TxDataRow>
          <TxDataRow title="Last modified:">{formatDateTime(msg.modifiedTimestamp)}</TxDataRow>
        </div>

        {msg.preparedSignature && (
          <div className={classNames(txDetailsCss.txSummary, txDetailsCss.multiSend)}>
            <TxDataRow title="Prepared signature:">{msg.preparedSignature}</TxDataRow>
          </div>
        )}

        <div className={txDetailsCss.multiSend}>
          {msg.confirmations.map((confirmation, i) => (
            <Accordion
              variant="elevation"
              key={confirmation.signature}
              expanded={confirmation.owner.value === wallet?.address}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <div className={singleTxDecodedCss.summary}>
                  <CodeIcon />
                  <Typography>{`Confirmation ${i + 1}`}</Typography>
                </div>
              </AccordionSummary>

              <AccordionDetails>
                <div className={infoDetailsCss.container}>
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
    </div>
  )
}

export default MsgDetails
