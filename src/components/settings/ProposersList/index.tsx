import CheckWallet from '@/components/common/CheckWallet'
import { Chip } from '@/components/common/Chip'
import EnhancedTable from '@/components/common/EnhancedTable'
import tableCss from '@/components/common/EnhancedTable/styles.module.css'
import Track from '@/components/common/Track'
import AddProposer from '@/features/proposers/components/AddProposer'
import DeleteProposer from '@/features/proposers/components/DeleteProposer'
import useProposers from '@/hooks/useProposers'
import AddIcon from '@/public/images/common/add.svg'
import DeleteIcon from '@/public/images/common/delete.svg'
import { SETTINGS_EVENTS } from '@/services/analytics'
import { Box, Button, Grid, IconButton, Paper, SvgIcon, Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import ExternalLink from '@/components/common/ExternalLink'
import { HelpCenterArticle } from '@/config/constants'
import React, { useMemo, useState } from 'react'

const ProposersList = () => {
  const [deleteProposer, setDeleteProposer] = useState<string>()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>()
  const proposers = useProposers()

  const rows = useMemo(() => {
    if (!proposers.data) return []

    return proposers.data.results.map((proposer) => {
      return {
        cells: {
          proposer: {
            rawValue: proposer.delegate,
            content: (
              <EthHashInfo
                address={proposer.delegate}
                showCopyButton
                hasExplorer
                name={proposer.label || undefined}
                shortAddress={false}
              />
            ),
          },
          actions: {
            rawValue: '',
            sticky: true,
            content: (
              <div className={tableCss.actions}>
                <CheckWallet>
                  {(isOk) => (
                    <Track {...SETTINGS_EVENTS.PROPOSERS.REMOVE_PROPOSER}>
                      <IconButton
                        data-testid="delete-btn"
                        onClick={() => onDelete(proposer.delegate)}
                        color="error"
                        size="small"
                        disabled={!isOk}
                      >
                        <SvgIcon component={DeleteIcon} inheritViewBox color="error" fontSize="small" />
                      </IconButton>
                    </Track>
                  )}
                </CheckWallet>
              </div>
            ),
          },
        },
      }
    })
  }, [proposers.data])

  if (!proposers.data?.results) return null

  const onDelete = (proposerAddress: string) => {
    setDeleteProposer(proposerAddress)
  }

  const onAdd = () => {
    setIsAddDialogOpen(true)
  }

  return (
    <Paper sx={{ mt: 2 }}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Grid container spacing={3}>
          <Grid item lg={4} xs={12}>
            <Typography variant="h4" fontWeight={700}></Typography>
          </Grid>

          <Grid item xs>
            <Typography fontWeight="bold" mb={2}>
              Proposers <Chip label="New" sx={{ backgroundColor: 'secondary.light', color: 'static.main' }} />
            </Typography>
            <Typography mb={2}>
              Proposers can suggest transactions but cannot approve or execute them. Signers should review and approve
              transactions first. <ExternalLink href={HelpCenterArticle.DELEGATES}>Learn more</ExternalLink>
            </Typography>

            <Box mb={2}>
              <CheckWallet>
                {(isOk) => (
                  <Track {...SETTINGS_EVENTS.PROPOSERS.ADD_PROPOSER}>
                    <Button
                      data-testid="add-owner-btn"
                      onClick={onAdd}
                      variant="text"
                      startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
                      disabled={!isOk}
                      size="compact"
                    >
                      Add proposer
                    </Button>
                  </Track>
                )}
              </CheckWallet>
            </Box>

            <EnhancedTable rows={rows} headCells={[]} />
          </Grid>

          {deleteProposer && (
            <DeleteProposer
              proposerAddress={deleteProposer}
              onClose={() => setDeleteProposer(undefined)}
              onSuccess={() => setDeleteProposer(undefined)}
            />
          )}

          {isAddDialogOpen && (
            <AddProposer onClose={() => setIsAddDialogOpen(false)} onSuccess={() => setIsAddDialogOpen(false)} />
          )}
        </Grid>
      </Box>
    </Paper>
  )
}

export default ProposersList
