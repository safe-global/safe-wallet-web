import { Typography, Grid, Card, Box } from '@mui/material'
import { WidgetBody } from '@/components/dashboard/styled'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import css from './styles.module.css'

const GovernanceSection = () => (
  <Grid item xs={12} md>
    <Accordion className={css.accordion}>
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

      <AccordionDetails sx={({ spacing }) => ({ padding: `0 ${spacing(3)}` })}>
        <WidgetBody>
          <Grid spacing={3} container>
            <Grid item xs={8}>
              <Card>
                <Box m={2} sx={{ minHeight: '200px' }}>
                  <Typography variant="h3">
                    <strong>Snapshot</strong>
                  </Typography>
                </Box>
              </Card>
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
        </WidgetBody>
      </AccordionDetails>
    </Accordion>
  </Grid>
)

export default GovernanceSection
