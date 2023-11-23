import { Alert, Box, Button, Grid, Paper, SvgIcon, Tooltip, Typography } from '@mui/material'
import { useContext, useMemo } from 'react'
import type { ReactElement } from 'react'

import { UpsertRecoveryFlow } from '@/components/tx-flow/flows/UpsertRecovery'
import { TxModalContext } from '@/components/tx-flow'
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
  Guardian = 'guardian',
  TxCooldown = 'txCooldown',
  TxExpiration = 'txExpiration',
  Actions = 'actions',
}

const headCells = [
  { id: HeadCells.Guardian, label: 'Guardian' },
  {
    id: HeadCells.TxCooldown,
    label: (
      <>
        Recovery delay{' '}
        <Tooltip title="You can cancel any recovery attempt when it is not needed or wanted within the delay period.">
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
  const { setTxFlow } = useContext(TxModalContext)
  const [recovery] = useRecovery()

  const rows = useMemo(() => {
    return recovery?.flatMap((delayModifier) => {
      const { guardians, txCooldown, txExpiration } = delayModifier

      return guardians.map((guardian) => {
        const txCooldownSeconds = txCooldown.toNumber()
        const txExpirationSeconds = txExpiration.toNumber()

        return {
          cells: {
            [HeadCells.Guardian]: {
              rawValue: guardian,
              content: <EthHashInfo address={guardian} showCopyButton hasExplorer />,
            },
            [HeadCells.TxCooldown]: {
              rawValue: txCooldownSeconds,
              content: <Typography>{getPeriod(txCooldownSeconds)}</Typography>,
            },
            [HeadCells.TxExpiration]: {
              rawValue: txExpirationSeconds,
              content: <Typography>{getPeriod(txExpirationSeconds)}</Typography>,
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
            Choose a trusted Guardian to recover your Safe Account, in case you should ever lose access to your Account.
            Enabling the Account recovery module will require a transactions.
          </Typography>

          {!recovery || recovery.length === 0 ? (
            <>
              <Alert severity="info">
                Unhappy with the provided option? {/* TODO: Add link */}
                <ExternalLink noIcon href="#">
                  Give us feedback
                </ExternalLink>
              </Alert>
              <CheckWallet>
                {(isOk) => (
                  <Button
                    variant="contained"
                    disabled={!isOk}
                    onClick={() => setTxFlow(<UpsertRecoveryFlow />)}
                    sx={{ mt: 2 }}
                  >
                    Set up recovery
                  </Button>
                )}
              </CheckWallet>
            </>
          ) : rows ? (
            <EnhancedTable rows={rows} headCells={headCells} />
          ) : null}
        </Grid>
      </Grid>
    </Paper>
  )
}
