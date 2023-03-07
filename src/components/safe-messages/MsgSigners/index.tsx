import { useState, type ReactElement } from 'react'
import { Box, Link, List, ListItem, ListItemIcon, ListItemText, SvgIcon } from '@mui/material'
import { SafeMessageStatus } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'

import CreatedIcon from '@/public/images/messages/created.svg'
import SignedIcon from '@/public/images/messages/signed.svg'
import DotIcon from '@/public/images/messages/dot.svg'
import EthHashInfo from '@/components/common/EthHashInfo'

import css from '@/components/safe-messages/MsgSigners/styles.module.css'
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

const shouldHideConfirmations = (msg: SafeMessage): boolean => {
  const isConfirmed = msg.status === SafeMessageStatus.CONFIRMED

  // Threshold reached or more than 3 confirmations
  return isConfirmed || msg.confirmations.length > 3
}

export const MsgSigners = ({ msg }: { msg: SafeMessage }): ReactElement => {
  const [hideConfirmations, setHideConfirmations] = useState<boolean>(shouldHideConfirmations(msg))

  const toggleHide = () => {
    setHideConfirmations((prev) => !prev)
  }

  const { confirmations, confirmationsRequired, confirmationsSubmitted } = msg

  const isConfirmed = msg.status === SafeMessageStatus.CONFIRMED

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
