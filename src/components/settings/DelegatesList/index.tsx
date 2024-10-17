import CheckWallet from '@/components/common/CheckWallet'
import EnhancedTable from '@/components/common/EnhancedTable'
import Track from '@/components/common/Track'
import DeleteProposer from '@/features/proposers/components/DeleteProposer'
import useDelegates from '@/hooks/useDelegates'
import DeleteIcon from '@/public/images/common/delete.svg'
import { SETTINGS_EVENTS } from '@/services/analytics'
import { Box, Grid, IconButton, Paper, SvgIcon, Tooltip, Typography } from '@mui/material'
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

  const onDelete = async (proposerAddress: string) => {
    setDeleteProposer(proposerAddress)
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
          </Grid>

          {deleteProposer && (
            <DeleteProposer
              delegateAddress={deleteProposer}
              onClose={() => setDeleteProposer(undefined)}
              onSuccess={() => setDeleteProposer(undefined)}
            />
          )}
        </Grid>
      </Box>
    </Paper>
  )
}

export default DelegatesList
