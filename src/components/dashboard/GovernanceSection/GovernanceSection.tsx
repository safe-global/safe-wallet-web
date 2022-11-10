import { Typography, Grid, Card, Box, IconButton } from '@mui/material'
import { WidgetBody, WidgetContainer } from '@/components/dashboard/styled'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { useState } from 'react'

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
        )}
      </WidgetContainer>
    </Grid>
  )
}

export default GovernanceSection
