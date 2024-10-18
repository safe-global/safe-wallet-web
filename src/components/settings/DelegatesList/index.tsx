import CheckWallet from '@/components/common/CheckWallet'
import EnhancedTable from '@/components/common/EnhancedTable'
import Track from '@/components/common/Track'
import AddProposer from '@/features/proposers/components/AddProposer'
import DeleteProposer from '@/features/proposers/components/DeleteProposer'
import useDelegates from '@/hooks/useDelegates'
import AddIcon from '@/public/images/common/add.svg'
import DeleteIcon from '@/public/images/common/delete.svg'
import { SETTINGS_EVENTS } from '@/services/analytics'
import { Box, Button, Grid, IconButton, Paper, SvgIcon, Tooltip, Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import InfoIcon from '@/public/images/notifications/info.svg'
import ExternalLink from '@/components/common/ExternalLink'
import { HelpCenterArticle } from '@/config/constants'
import { useMemo, useState } from 'react'

const headCells = [
  { id: 'delegate', label: 'Delegate' },
  { id: 'actions', label: '', sticky: true },
]

const DelegatesList = () => {
  const [deleteProposer, setDeleteProposer] = useState<string>()
  const [addProposer, setAddProposer] = useState<boolean>()
  const delegates = useDelegates()

  const rows = useMemo(() => {
    if (!delegates.data) return []

    return delegates.data.results.map((delegate) => {
      return {
        cells: {
          delegate: {
            rawValue: delegate.delegate,
            content: (
              <EthHashInfo
                address={delegate.delegate}
                showCopyButton
                hasExplorer
                name={delegate.label || undefined}
                shortAddress={false}
              />
            ),
          },
          actions: {
            rawValue: '',
            sticky: true,
            content: (
              <CheckWallet>
                {(isOk) => (
                  <Track {...SETTINGS_EVENTS.PROPOSERS.REMOVE_PROPOSER}>
                    <IconButton
                      data-testid="delete-btn"
                      onClick={() => onDelete(delegate.delegate)}
                      color="error"
                      size="small"
                      disabled={!isOk}
                    >
                      <SvgIcon component={DeleteIcon} inheritViewBox color="error" fontSize="small" />
                    </IconButton>
                  </Track>
                )}
              </CheckWallet>
            ),
          },
        },
      }
    })
  }, [delegates.data?.results])

  if (!delegates.data?.results) return null

  const onDelete = (proposerAddress: string) => {
    setDeleteProposer(proposerAddress)
  }

  const onAdd = () => {
    setAddProposer(true)
  }

  return (
    <Paper sx={{ p: 4, mt: 2 }}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Grid container spacing={3}>
          <Grid item lg={4} xs={12}>
            <Typography variant="h4" fontWeight={700}>
              <Tooltip
                placement="top"
                title={
                  <>
                    What are delegated accounts?{' '}
                    <ExternalLink href={HelpCenterArticle.DELEGATES}>Learn more</ExternalLink>
                  </>
                }
              >
                <span>
                  Delegated accounts
                  <SvgIcon
                    component={InfoIcon}
                    inheritViewBox
                    fontSize="small"
                    color="border"
                    sx={{ verticalAlign: 'middle', ml: 0.5 }}
                  />
                </span>
              </Tooltip>
            </Typography>
          </Grid>

          <Grid item xs>
            Delegated accounts can propose transactions.
            <EnhancedTable rows={rows} headCells={headCells} />
            <CheckWallet>
              {(isOk) => (
                <Track {...SETTINGS_EVENTS.PROPOSERS.ADD_PROPOSER}>
                  <Button
                    data-testid="add-owner-btn"
                    onClick={onAdd}
                    variant="text"
                    startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
                    disabled={!isOk}
                  >
                    Add new delegate
                  </Button>
                </Track>
              )}
            </CheckWallet>
          </Grid>

          {deleteProposer && (
            <DeleteProposer
              delegateAddress={deleteProposer}
              onClose={() => setDeleteProposer(undefined)}
              onSuccess={() => setDeleteProposer(undefined)}
            />
          )}

          {addProposer && <AddProposer onClose={() => setAddProposer(false)} onSuccess={() => setAddProposer(false)} />}
        </Grid>
      </Box>
    </Paper>
  )
}

export default DelegatesList
