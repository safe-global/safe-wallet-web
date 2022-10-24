import { Typography, Grid, Card, Box } from '@mui/material'
import { WidgetBody, WidgetContainer } from '@/components/dashboard/styled'

const GovernanceSection = () => (
  <Grid item xs={12} md>
    <WidgetContainer>
      <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
        Governance
      </Typography>

      <WidgetBody>
        <Grid gap="24px" container>
          <Grid minWidth="200px" item xs md>
            <Card>
              <Box m={2} sx={{ minHeight: '200px' }}>
                <Typography variant="h3">
                  <strong>Claiming app</strong>
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid minWidth="200px" item xs md>
            <Card>
              <Box m={2} sx={{ minHeight: '200px' }}>
                <Typography variant="h3">
                  <strong>Snapshot</strong>
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </WidgetBody>
    </WidgetContainer>
  </Grid>
)

export default GovernanceSection
