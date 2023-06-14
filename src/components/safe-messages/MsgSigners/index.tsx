import { useState, type ReactElement } from 'react'
import { Box, Link, List, ListItem, ListItemIcon, ListItemText, Skeleton, SvgIcon, Typography } from '@mui/material'
import { SafeMessageStatus } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined'

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

export const MsgSigners = ({
  msg,
  showOnlyConfirmations = false,
  showMissingSignatures = false,
  backgroundColor,
}: {
  msg: SafeMessage
  showOnlyConfirmations?: boolean
  showMissingSignatures?: boolean
  backgroundColor?: string
}): ReactElement => {
  const [hideConfirmations, setHideConfirmations] = useState<boolean>(shouldHideConfirmations(msg))

  const toggleHide = () => {
    setHideConfirmations((prev) => !prev)
  }

  const { confirmations, confirmationsRequired, confirmationsSubmitted } = msg

  const missingConfirmations = [...new Array(Math.max(0, confirmationsRequired - confirmationsSubmitted))]

  const isConfirmed = msg.status === SafeMessageStatus.CONFIRMED

  return (
    <List className={css.signers}>
      {!showOnlyConfirmations && (
        <ListItem>
          <ListItemIcon>
            <Created />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>Created</ListItemText>
        </ListItem>
      )}
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
            <ListItemIcon sx={{ backgroundColor: backgroundColor }}>
              <Dot />
            </ListItemIcon>
            <ListItemText>
              <EthHashInfo address={owner.value} name={owner.name} hasExplorer showCopyButton />
            </ListItemText>
          </ListItem>
        ))}
      {!showOnlyConfirmations && confirmations.length > 0 && (
        <ListItem>
          <ListItemIcon sx={{ backgroundColor: backgroundColor }}>
            <Dot />
          </ListItemIcon>
          <ListItemText>
            <Link component="button" onClick={toggleHide} fontSize="medium">
              {hideConfirmations ? 'Show all' : 'Hide all'}
            </Link>
          </ListItemText>
        </ListItem>
      )}
      {showMissingSignatures &&
        missingConfirmations.map((_, idx) => (
          <ListItem key={`skeleton${idx}`} sx={{ py: 0 }}>
            <ListItemIcon sx={{ backgroundColor: backgroundColor }}>
              <SvgIcon component={CircleOutlinedIcon} className={css.dot} color="border" fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
                <Skeleton variant="circular" width={36} height={36} />
                <Typography variant="body2" color={'text.secondary'}>
                  Confirmation #{idx + 1 + confirmationsSubmitted}
                </Typography>
              </Box>
            </ListItemText>
          </ListItem>
        ))}
      {isConfirmed && (
        <ListItem>
          <ListItemIcon sx={{ backgroundColor: backgroundColor }}>
            <Dot />
          </ListItemIcon>
          <ListItemText>Confirmed</ListItemText>
        </ListItem>
      )}
    </List>
  )
}

export default MsgSigners
