import { selectUndeployedSafe, type UndeployedSafe } from '@/features/counterfactual/store/undeployedSafesSlice'
import useChainId from '@/hooks/useChainId'
import useSafeInfo from '@/hooks/useSafeInfo'
import { trackEvent } from '@/services/analytics'
import { COUNTERFACTUAL_EVENTS } from '@/services/analytics/events/counterfactual'
import { useAppSelector } from '@/store'
import type { PredictedSafeProps } from '@safe-global/protocol-kit'
import React, { type ElementType, type MouseEvent } from 'react'
import { Alert, Box, Button, Dialog, DialogContent, Grid, Link, SvgIcon, Typography } from '@mui/material'
import { useRouter } from 'next/router'

import HomeIcon from '@/public/images/sidebar/home.svg'
import TransactionIcon from '@/public/images/sidebar/transactions.svg'
import AppsIcon from '@/public/images/sidebar/apps.svg'
import SettingsIcon from '@/public/images/sidebar/settings.svg'
import BeamerIcon from '@/public/images/sidebar/whats-new.svg'
import HelpCenterIcon from '@/public/images/sidebar/help-center.svg'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import { useCurrentChain } from '@/hooks/useChains'
import { CREATION_MODAL_QUERY_PARM } from '@/components/new-safe/create/logic'

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

const getExportFileName = () => {
  const today = new Date().toISOString().slice(0, 10)
  return `safe-backup-${today}.json`
}

const backupSafe = (chainId: string, safeAddress: string, undeployedSafe: PredictedSafeProps) => {
  const data = JSON.stringify({ chainId, safeAddress, safeProps: undeployedSafe }, null, 2)

  const blob = new Blob([data], { type: 'text/json' })
  const link = document.createElement('a')

  link.download = getExportFileName()
  link.href = window.URL.createObjectURL(blob)
  link.dataset.downloadurl = ['text/json', link.download, link.href].join(':')
  link.dispatchEvent(new MouseEvent('click'))
}

const CreationDialog = () => {
  const router = useRouter()
  const [open, setOpen] = React.useState(true)
  const [remoteSafeApps = []] = useRemoteSafeApps()
  const chain = useCurrentChain()
  const chainId = useChainId()
  const { safeAddress } = useSafeInfo()
  const undeployedSafe = useAppSelector((state) => selectUndeployedSafe(state, chainId, safeAddress))

  const onClose = () => {
    const { [CREATION_MODAL_QUERY_PARM]: _, ...query } = router.query
    router.replace({ pathname: router.pathname, query })

    setOpen(false)
  }

  const onBackup = (e: MouseEvent<HTMLAnchorElement>, undeployedSafe: UndeployedSafe) => {
    e.preventDefault()
    trackEvent(COUNTERFACTUAL_EVENTS.BACKUP_COUNTERFACTUAL_SAFE)
    backupSafe(chainId, safeAddress, undeployedSafe.props)
  }

  return (
    <Dialog open={open}>
      <DialogContent sx={{ paddingX: 8, paddingTop: 9, paddingBottom: 6 }}>
        <Typography variant="h3" fontWeight="700" mb={1}>
          Welcome to {'Safe{Wallet}'}!
        </Typography>
        <Typography variant="body2">
          Congratulations on your first step to truly unlock ownership. Enjoy the experience and discover our app.
        </Typography>

        <Grid container mt={2} mb={4} spacing={3}>
          <HintItem Icon={HomeIcon} title="Home" description="Get a status overview of your Safe Account here." />
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
            description="Want to change your Safe Account setup? Settings is the right place to go."
          />
          <HintItem Icon={BeamerIcon} title="What's new" description="Don't miss any future Safe updates." />
          <HintItem
            Icon={HelpCenterIcon}
            title="Help center"
            description="Have any questions? Check out our collection of articles."
          />
        </Grid>

        {undeployedSafe && (
          <Alert data-testid="safe-backup-alert" severity="info" sx={{ mb: 2 }}>
            We recommend{' '}
            <Link href="#" onClick={(e) => onBackup(e, undeployedSafe)}>
              backing up your Safe Account
            </Link>{' '}
            in case you lose access to this device.
          </Alert>
        )}

        <Box display="flex" justifyContent="center">
          <Button data-testid="dialog-confirm-btn" onClick={onClose} variant="contained" size="stretched">
            Got it
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default CreationDialog
