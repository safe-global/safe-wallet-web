import React, { type ElementType } from 'react'
import { Box, Button, Dialog, DialogContent, Grid, SvgIcon, Typography } from '@mui/material'

import HomeIcon from '@/public/images/sidebar/home.svg'
import TransactionIcon from '@/public/images/sidebar/transactions.svg'
import AppsIcon from '@/public/images/sidebar/apps.svg'
import SettingsIcon from '@/public/images/sidebar/settings.svg'
import BeamerIcon from '@/public/images/sidebar/whats-new.svg'
import HelpCenterIcon from '@/public/images/sidebar/help-center.svg'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import { useCurrentChain } from '@/hooks/useChains'

const HintItem = ({ Icon, title, description }: { Icon: ElementType; title: string; description: string }) => {
  return (
    <Grid item md={6}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <SvgIcon component={Icon} inheritViewBox fontSize="small" />
        <Typography variant="subtitle2" fontWeight="700">
          {title}
        </Typography>
      </Box>

      <Typography variant="body2">{description}</Typography>
    </Grid>
  )
}

const CreationDialog = () => {
  const [open, setOpen] = React.useState(true)
  const [remoteSafeApps = []] = useRemoteSafeApps()
  const chain = useCurrentChain()

  return (
    <Dialog open={open}>
      <DialogContent sx={{ paddingX: 8, paddingTop: 9, paddingBottom: 6 }}>
        <Typography variant="h3" fontWeight="700" mb={1}>
          Welcome to your Safe!
        </Typography>
        <Typography variant="body2">
          Congratulations on your first step to truly unlock ownership. Enjoy the experience and discover our app.
        </Typography>
        <Grid container mt={4} mb={6} spacing={3}>
          <HintItem Icon={HomeIcon} title="Home" description="Get a status overview of your Safe here." />
          <HintItem
            Icon={TransactionIcon}
            title="Transactions"
            description="Review, approve, execute and keep track of asset movement."
          />
          <HintItem
            Icon={AppsIcon}
            title="Apps"
            description={`Over ${remoteSafeApps.length} dApps available for you on ${chain?.chainName}.`}
          />
          <HintItem
            Icon={SettingsIcon}
            title="Settings"
            description="Want to change your Safe setup? Settings is the right place to go."
          />
          <HintItem Icon={BeamerIcon} title="What's new" description="Don't miss any future Safe updates." />
          <HintItem
            Icon={HelpCenterIcon}
            title="Help center"
            description="Have any questions? Check out our collection of articles."
          />
        </Grid>
        <Box display="flex" justifyContent="center">
          <Button onClick={() => setOpen(false)} variant="contained" size="stretched">
            Got it
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default CreationDialog
