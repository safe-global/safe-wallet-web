import { Box, List, ListItem, ListItemIcon, ListItemText, SvgIcon, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import CircleIcon from '@/public/images/common/circle.svg'
import CheckIcon from '@/public/images/common/circle-check.svg'
import EthHashInfo from '@/components/common/EthHashInfo'
import { Countdown } from '@/components/common/Countdown'
import { ExecuteRecoveryButton } from '../ExecuteRecoveryButton'
import { CancelRecoveryButton } from '../CancelRecoveryButton'
import { useRecoveryTxState } from '@/hooks/useRecoveryTxState'
import type { RecoveryQueueItem } from '@/services/recovery/recovery-state'

import txSignersCss from '@/components/transactions/TxSigners/styles.module.css'
import { formatDate } from '@/utils/date'

export function RecoverySigners({ item }: { item: RecoveryQueueItem }): ReactElement {
  const { isExecutable, isNext, remainingSeconds } = useRecoveryTxState(item)

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
        <Typography sx={({ palette }) => ({ color: palette.border.main, mb: 1 })}>
          The recovery can be executed{' '}
          {isExecutable ? (
            item.expiresAt ? (
              <Typography color="primary.main">until {formatDate(item.expiresAt.toNumber())}.</Typography>
            ) : (
              'now.'
            )
          ) : !isNext ? (
            'after the previous recovery attempts are executed or skipped and the delay period has passed:'
          ) : (
            'after the delay period:'
          )}
        </Typography>

        {isNext && <Countdown seconds={remainingSeconds} />}
      </Box>

      <Box display="flex" alignItems="center" justifyContent="center" gap={1} mt={2}>
        <ExecuteRecoveryButton recovery={item} />
        <CancelRecoveryButton recovery={item} />
      </Box>
    </>
  )
}
