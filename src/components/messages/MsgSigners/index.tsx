import { useState, type ReactElement } from 'react'
import { Box, Link, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import useWallet from '@/hooks/wallets/useWallet'
import EthHashInfo from '@/components/common/EthHashInfo'
import useIsMsgPending from '@/hooks/useIsMsgPending'
import useIsMessageSignableBy from '@/hooks/useIsMsgSignableBy'
import type { Message } from '@/hooks/useMessages'

import css from '@/components/messages/MsgSigners/styles.module.css'

// TODO: Migrate TxSigners to no longer use a Stepper and move CSS there
import txSignersCss from '@/components/transactions/TxSigners/styles.module.css'

// Icons

const DotIcon = () => <FiberManualRecordIcon className={css.dot} />

const shouldHideConfirmations = (msg: Message): boolean => {
  const confirmationsNeeded = msg.confirmationsRequired - msg.confirmationsSubmitted
  const isConfirmed = confirmationsNeeded <= 0

  // Threshold reached or more than 3 confirmations
  return isConfirmed || msg.confirmations.length > 3
}

export const MsgSigners = ({ msg }: { msg: Message }): ReactElement => {
  const [hideConfirmations, setHideConfirmations] = useState<boolean>(shouldHideConfirmations(msg))
  const isPending = useIsMsgPending(msg.messageHash)
  const wallet = useWallet()

  const toggleHide = () => {
    setHideConfirmations((prev) => !prev)
  }

  const { confirmations, confirmationsRequired, confirmationsSubmitted } = msg

  const canSign = useIsMessageSignableBy(msg, wallet?.address || '')
  const confirmationsNeeded = confirmationsRequired - confirmationsSubmitted
  const isConfirmed = confirmationsNeeded <= 0 || isPending || canSign

  return (
    <List className={css.signers}>
      <ListItem>
        <ListItemIcon>
          <AddCircleIcon className={css.icon} />
        </ListItemIcon>
        <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>Created</ListItemText>
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <CheckCircleIcon className={css.icon} />
        </ListItemIcon>
        <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>
          Confirmations{' '}
          <Box component="span" className={txSignersCss.confirmationsTotal}>
            ({`${confirmationsSubmitted} of ${confirmationsRequired}`})
          </Box>
        </ListItemText>
      </ListItem>
      {!hideConfirmations &&
        confirmations.map(({ owner }) => (
          <ListItem key={owner.value} sx={{ py: 0 }}>
            <ListItemIcon>
              <DotIcon />
            </ListItemIcon>
            <ListItemText>
              <EthHashInfo address={owner.value} name={owner.name} hasExplorer showCopyButton />
            </ListItemText>
          </ListItem>
        ))}
      {confirmations.length > 0 && (
        <ListItem>
          <ListItemIcon>
            <DotIcon />
          </ListItemIcon>
          <ListItemText>
            <Link component="button" onClick={toggleHide} fontSize="medium">
              {hideConfirmations ? 'Show all' : 'Hide all'}
            </Link>
          </ListItemText>
        </ListItem>
      )}
      {isConfirmed && (
        <ListItem>
          <ListItemIcon>
            <DotIcon />
          </ListItemIcon>
          <ListItemText>Confirmed</ListItemText>
        </ListItem>
      )}
    </List>
  )
}

export default MsgSigners
