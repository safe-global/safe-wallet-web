import { Typography, Grid, Card, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import SnapshotWidget from '../SnapshotWidget'

import css from './styles.module.css'

const GovernanceSection = () => {
  return (
    <Accordion className={css.accordion} defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon color="border" />}>
        <div>
          <Typography component="h2" variant="subtitle1" fontWeight={700}>
            Governance
          </Typography>
          <Typography variant="body2" mb={2} color="text.secondary">
            Use your SAFE tokens to vote on important proposals or participate in forum discussions.
          </Typography>
        </div>
      </AccordionSummary>

      <AccordionDetails>
        <Grid spacing={3} container>
          <Grid item xs={8}>
            <SnapshotWidget />
          </Grid>
          <Grid item xs={4}>
            <Card>
              <Box m={2} sx={{ minHeight: '200px' }}>
                <Typography variant="h3">
                  <strong>Claiming app</strong>
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  )
}

export default GovernanceSection
