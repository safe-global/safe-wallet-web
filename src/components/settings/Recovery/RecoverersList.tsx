import EthHashInfo from '@/components/common/EthHashInfo'
import { Grid, Typography, Button, SvgIcon, Tooltip, IconButton } from '@mui/material'
import { useContext, useMemo } from 'react'
import type { Delay } from '@gnosis.pm/zodiac'
import type { ReactElement } from 'react'

import EnhancedTable from '@/components/common/EnhancedTable'
import AddIcon from '@/public/images/common/add.svg'
import CheckWallet from '@/components/common/CheckWallet'
import DeleteIcon from '@/public/images/common/delete.svg'
import { AddRecoverer } from '@/components/tx-flow/flows/AddRecoverer'
import { TxModalContext } from '@/components/tx-flow'
import { RemoveRecoverer } from '@/components/tx-flow/flows/RemoveRecoverer'

import tableCss from '@/components/common/EnhancedTable/styles.module.css'

const headCells = [
  { id: 'owner', label: 'Recoverer' },
  { id: 'actions', label: '', sticky: true },
]

export const RecoverersList = ({
  delayModifier,
  recoverers,
}: {
  delayModifier: Delay
  recoverers: Array<string>
}): ReactElement => {
  const { setTxFlow } = useContext(TxModalContext)

  const rows = useMemo(() => {
    return recoverers.map((recoverer) => {
      return {
        cells: {
          owner: {
            rawValue: recoverer,
            content: (
              <EthHashInfo address={recoverer} showCopyButton shortAddress={false} showName={true} hasExplorer />
            ),
          },
          actions: {
            rawValue: '',
            sticky: true,
            content: (
              <div className={tableCss.actions}>
                <CheckWallet>
                  {(isOk) => (
                    <Tooltip title="Remove recoverer">
                      <IconButton
                        onClick={() =>
                          setTxFlow(<RemoveRecoverer delayModifier={delayModifier} recoverer={recoverer} />)
                        }
                        size="small"
                        disabled={!isOk}
                      >
                        <SvgIcon component={DeleteIcon} inheritViewBox color="error" fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </CheckWallet>
              </div>
            ),
          },
        },
      }
    })
  }, [delayModifier, recoverers, setTxFlow])

  return (
    <Grid container spacing={3}>
      <Grid item lg={4} xs={12}>
        <Typography variant="h4" fontWeight={700}>
          Manage recoverers
        </Typography>
      </Grid>

      <Grid item xs>
        <EnhancedTable rows={rows ?? []} headCells={headCells} />

        <CheckWallet>
          {(isOk) => (
            <Button
              onClick={() => setTxFlow(<AddRecoverer delayModifier={delayModifier} />)}
              variant="text"
              startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
              disabled={!isOk}
            >
              Add new recoverer
            </Button>
          )}
        </CheckWallet>
      </Grid>
    </Grid>
  )
}
