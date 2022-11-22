import { useState, type ReactElement } from 'react'
import { Box, Link, List, ListItem, ListItemIcon, ListItemText, SvgIcon } from '@mui/material'

// TODO: Migrate TxSigners to use these icons
import CreatedIcon from '@/public/images/messages/created.svg'
import SignedIcon from '@/public/images/messages/signed.svg'
import DotIcon from '@/public/images/messages/dot.svg'
import EthHashInfo from '@/components/common/EthHashInfo'
import { MessageStatus } from '@/store/msgsSlice'
import type { Message } from '@/store/msgsSlice'

import css from '@/components/messages/MsgSigners/styles.module.css'

// TODO: Migrate TxSigners to no longer use a Stepper and move CSS there
import txSignersCss from '@/components/transactions/TxSigners/styles.module.css'

// Icons

const Created = () => (
  <SvgIcon
    component={CreatedIcon}
    inheritViewBox
    className={css.icon}
    sx={{
      '& path:last-of-type': { fill: ({ palette }) => palette.background.paper },
    }}
  />
)

const Signed = () => (
  <SvgIcon
    component={SignedIcon}
    inheritViewBox
    className={css.icon}
    sx={{
      '& path:last-of-type': { fill: ({ palette }) => palette.background.paper },
    }}
  />
)

const Dot = () => <SvgIcon component={DotIcon} inheritViewBox className={css.dot} />

const shouldHideConfirmations = (msg: Message): boolean => {
  const isConfirmed = msg.status === MessageStatus.CONFIRMED

  // Threshold reached or more than 3 confirmations
  return isConfirmed || msg.confirmations.length > 3
}

export const MsgSigners = ({ msg }: { msg: Message }): ReactElement => {
  const [hideConfirmations, setHideConfirmations] = useState<boolean>(shouldHideConfirmations(msg))

  const toggleHide = () => {
    setHideConfirmations((prev) => !prev)
  }

  const { confirmations, confirmationsRequired, confirmationsSubmitted } = msg

  const isConfirmed = msg.status === MessageStatus.CONFIRMED

  return (
    <List className={css.signers}>
      <ListItem>
        <ListItemIcon>
          <Created />
        </ListItemIcon>
        <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>Created</ListItemText>
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <Signed />
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
              <Dot />
            </ListItemIcon>
            <ListItemText>
              <EthHashInfo address={owner.value} name={owner.name} hasExplorer showCopyButton />
            </ListItemText>
          </ListItem>
        ))}
      {confirmations.length > 0 && (
        <ListItem>
          <ListItemIcon>
            <Dot />
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
            <Dot />
          </ListItemIcon>
          <ListItemText>Confirmed</ListItemText>
        </ListItem>
      )}
    </List>
  )
}

export default MsgSigners
