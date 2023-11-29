import { Box, List, ListItem, ListItemIcon, ListItemText, SvgIcon, Typography } from '@mui/material'
import { useContext } from 'react'
import type { ReactElement } from 'react'

import CircleIcon from '@/public/images/common/circle.svg'
import CheckIcon from '@/public/images/common/circle-check.svg'
import EthHashInfo from '@/components/common/EthHashInfo'
import { Countdown } from '@/components/common/Countdown'
import { ExecuteRecoveryButton } from '../ExecuteRecoveryButton'
import { CancelRecoveryButton } from '../CancelRecoveryButton'
import { useRecoveryTxState } from '@/hooks/useRecoveryTxState'
import { formatDate } from '@/utils/date'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { RecoveryListItemContext } from '../RecoveryListItem/RecoveryListItemContext'
import type { RecoveryQueueItem } from '@/services/recovery/recovery-state'

import txSignersCss from '@/components/transactions/TxSigners/styles.module.css'

export function RecoverySigners({ item }: { item: RecoveryQueueItem }): ReactElement {
  const { submitError } = useContext(RecoveryListItemContext)
  const { isExecutable, isExpired, isNext, remainingSeconds } = useRecoveryTxState(item)

  const desc = isExecutable ? (
    item.expiresAt ? (
      <>
        The recovery transaction can be executed{' '}
        <Typography color="primary.main">until {formatDate(item.expiresAt.toNumber())}.</Typography>
      </>
    ) : (
      'The recovery transaction can be executed now.'
    )
  ) : isExpired ? (
    'The recovery transaction has expired and needs to be cancelled before a new one can be created.'
  ) : (
    'The recovery transaction can be executed after the delay period has passed:'
  )

  return (
    <>
      <List className={txSignersCss.signers}>
        <ListItem>
          <ListItemIcon>
            <SvgIcon
              component={CheckIcon}
              inheritViewBox
              className={txSignersCss.icon}
              sx={{
                '& path:last-of-type': { fill: ({ palette }) => palette.background.paper },
              }}
            />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>Created</ListItemText>
        </ListItem>
        <ListItem sx={{ py: 0, pb: 1, ml: 4 }}>
          <EthHashInfo address={item.executor} hasExplorer showCopyButton />
        </ListItem>
        <ListItem sx={{ py: 0 }}>
          <ListItemIcon>
            <SvgIcon
              component={CircleIcon}
              inheritViewBox
              className={txSignersCss.icon}
              sx={{ color: ({ palette }) => palette.border.main }}
            />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>Can be executed</ListItemText>
        </ListItem>
      </List>

      <Box className={txSignersCss.listFooter}>
        <Typography sx={({ palette }) => ({ color: palette.border.main, mb: 1 })}>{desc}</Typography>

        {isNext && <Countdown seconds={remainingSeconds} />}
      </Box>

      {submitError && (
        <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
      )}

      <Box display="flex" alignItems="center" justifyContent="center" gap={1} mt={2}>
        <ExecuteRecoveryButton recovery={item} />
        <CancelRecoveryButton recovery={item} />
      </Box>
    </>
  )
}
