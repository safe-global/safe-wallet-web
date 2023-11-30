import Track from '@/components/common/Track'
import { ChooseRecoveryMethodModal } from '@/components/settings/Recovery/ChooseRecoveryMethodModal'
import { FEEDBACK_FORM } from '@/config/constants'
import { RECOVERY_EVENTS } from '@/services/analytics/events/recovery'
import { Alert, Box, Button, Grid, Paper, SvgIcon, Tooltip, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import type { ReactElement } from 'react'

import { Chip } from '@/components/common/Chip'
import ExternalLink from '@/components/common/ExternalLink'
import { DelayModifierRow } from './DelayModifierRow'
import { useRecovery } from '@/components/recovery/RecoveryContext'
import EthHashInfo from '@/components/common/EthHashInfo'
import EnhancedTable from '@/components/common/EnhancedTable'
import InfoIcon from '@/public/images/notifications/info.svg'
import CheckWallet from '@/components/common/CheckWallet'
import { getPeriod } from '@/utils/date'

import tableCss from '@/components/common/EnhancedTable/styles.module.css'

enum HeadCells {
  Recoverer = 'recoverer',
  TxCooldown = 'txCooldown',
  TxExpiration = 'txExpiration',
  Actions = 'actions',
}

const headCells = [
  { id: HeadCells.Recoverer, label: 'Recoverer' },
  {
    id: HeadCells.TxCooldown,
    label: (
      <>
        Recovery delay{' '}
        <Tooltip title="You can cancel any recovery attempt when it is not needed or wanted.">
          <span>
            <SvgIcon
              component={InfoIcon}
              inheritViewBox
              color="border"
              fontSize="small"
              sx={{ verticalAlign: 'middle', ml: 0.5 }}
            />
          </span>
        </Tooltip>
      </>
    ),
  },
  {
    id: HeadCells.TxExpiration,
    label: (
      <>
        Expiry{' '}
        <Tooltip title="A period of time after which the recovery attempt will expire and can no longer be executed.">
          <span>
            <SvgIcon
              component={InfoIcon}
              inheritViewBox
              color="border"
              fontSize="small"
              sx={{ verticalAlign: 'middle', ml: 0.5 }}
            />
          </span>
        </Tooltip>
      </>
    ),
  },
  { id: HeadCells.Actions, label: '', sticky: true },
]

export function Recovery(): ReactElement {
  const [recovery] = useRecovery()

  const rows = useMemo(() => {
    return recovery?.flatMap((delayModifier) => {
      const { recoverers, txCooldown, txExpiration } = delayModifier

      return recoverers.map((recoverer) => {
        const txCooldownSeconds = txCooldown.toNumber()
        const txExpirationSeconds = txExpiration.toNumber()

        return {
          cells: {
            [HeadCells.Recoverer]: {
              rawValue: recoverer,
              content: <EthHashInfo address={recoverer} showCopyButton hasExplorer />,
            },
            [HeadCells.TxCooldown]: {
              rawValue: txCooldownSeconds,
              content: <Typography>{txCooldownSeconds === 0 ? 'none' : getPeriod(txCooldownSeconds)}</Typography>,
            },
            [HeadCells.TxExpiration]: {
              rawValue: txExpirationSeconds,
              content: <Typography>{txExpirationSeconds === 0 ? 'never' : getPeriod(txExpirationSeconds)}</Typography>,
            },
            [HeadCells.Actions]: {
              rawValue: '',
              sticky: true,
              content: (
                <div className={tableCss.actions}>
                  <DelayModifierRow delayModifier={delayModifier} />
                </div>
              ),
            },
          },
        }
      })
    })
  }, [recovery])

  return (
    <Paper sx={{ p: 4 }}>
      <Grid container spacing={3}>
        <Grid item lg={4} xs={12}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography variant="h4" fontWeight="bold">
              Account recovery
            </Typography>

            <Chip label="New" />
          </Box>
        </Grid>

        <Grid item xs>
          <Typography mb={2}>
            Choose a trusted Recoverer to recover your Safe Account, in case you should ever lose access to your
            Account. Enabling the Account recovery module will require a transactions.
          </Typography>

          {!recovery || recovery.length === 0 ? (
            <SetupRecoveryButton location="settings" />
          ) : rows ? (
            <EnhancedTable rows={rows} headCells={headCells} />
          ) : null}
        </Grid>
      </Grid>
    </Paper>
  )
}

export const SetupRecoveryButton = ({ location }: { location: string }) => {
  const [open, setOpen] = useState<boolean>(false)

  return (
    <>
      <CheckWallet>
        {(isOk) => (
          <Track {...RECOVERY_EVENTS.SETUP_RECOVERY} label={location}>
            <Button variant="contained" disabled={!isOk} onClick={() => setOpen(true)} sx={{ mt: 2 }}>
              Set up recovery
            </Button>
          </Track>
        )}
      </CheckWallet>

      <ChooseRecoveryMethodModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
