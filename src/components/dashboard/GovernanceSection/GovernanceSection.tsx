import { Typography, Grid, Card, Box, IconButton } from '@mui/material'
import { WidgetBody, WidgetContainer } from '@/components/dashboard/styled'
import SafeWidget from '@/components/dashboard/SafeWidget/SafeWidget'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { useState } from 'react'

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

const GovernanceSection = () => {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleExpandClick = () => {
    setIsExpanded((val) => !val)
  }

  return (
    <Grid item xs={12} md>
      <WidgetContainer>
        <Box display="flex" justifyContent="space-between" position="relative">
          <Typography component="h2" variant="subtitle1" fontWeight={700}>
            Governance
          </Typography>

          <IconButton
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
            onClick={handleExpandClick}
          >
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Typography variant="body2" mb={2} color="text.secondary">
          Use your SAFE tokens to vote on important proposals or participate in forum discussions.
        </Typography>

        {isExpanded && (
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
        )}
      </WidgetContainer>
    </Grid>
  )
}

export default GovernanceSection
