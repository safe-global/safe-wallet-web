import { Typography, Grid, Card, Box } from '@mui/material'
import { WidgetBody, WidgetContainer } from '@/components/dashboard/styled'
import SafeWidget from '@/components/dashboard/SafeWidget/SafeWidget'

export type WidgetType = {
  appId: string
  appUrl: string
  widgetType?: 'iframe'
}

export const appWidgets: WidgetType[] = [
  {
    appId: '1',
    appUrl: 'https://swap.cow.fi/',
  },
  {
    appId: '2',
    appUrl: 'https://revoke.cash',
  },
]

const GovernanceSection = () => (
  <Grid item xs={12} md>
    <WidgetContainer>
      <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
        Governance
      </Typography>

      <WidgetBody>
        <Grid gap="24px" container>
          {appWidgets.map((widget) => (
            <Grid minWidth="200px" item xs md key={widget.appId}>
              <Card>
                <Box sx={{ minHeight: '300px' }}>
                  <SafeWidget widget={widget} />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </WidgetBody>
    </WidgetContainer>
  </Grid>
)

export default GovernanceSection
