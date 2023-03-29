import { useMemo } from 'react'
import { Box, SvgIcon, Typography, Alert, AlertTitle, Skeleton } from '@mui/material'
import { ImplementationVersionState } from '@safe-global/safe-gateway-typescript-sdk'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import { sameAddress } from '@/utils/addresses'
import type { MasterCopy } from '@/hooks/useMasterCopies'
import { MasterCopyDeployer, useMasterCopies } from '@/hooks/useMasterCopies'
import useSafeInfo from '@/hooks/useSafeInfo'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import InfoIcon from '@/public/images/notifications/info.svg'

import UpdateSafeDialog from './UpdateSafeDialog'
import ExternalLink from '@/components/common/ExternalLink'
export const ContractVersion = () => {
  const [masterCopies] = useMasterCopies()
  const { safe, safeLoaded } = useSafeInfo()
  const masterCopyAddress = safe.implementation.value

  const safeMasterCopy: MasterCopy | undefined = useMemo(() => {
    return masterCopies?.find((mc) => sameAddress(mc.address, masterCopyAddress))
  }, [masterCopies, masterCopyAddress])

  const needsUpdate = safe.implementationVersionState === ImplementationVersionState.OUTDATED
  const showUpdateDialog = safeMasterCopy?.deployer === MasterCopyDeployer.GNOSIS && needsUpdate

  return (
    <>
      <Typography variant="h4" fontWeight={700} marginBottom={1}>
        Contract version
      </Typography>

      <Typography variant="body1" fontWeight={400}>
        {safeLoaded ? safe.version ? safe.version : 'Unsupported contract' : <Skeleton width="60px" />}
      </Typography>
      <Box mt={2}>
        {safeLoaded ? (
          showUpdateDialog ? (
            <Alert
              sx={{ borderRadius: '2px', borderColor: '#B0FFC9' }}
              icon={<SvgIcon component={InfoIcon} inheritViewBox color="secondary" />}
            >
              <AlertTitle sx={{ fontWeight: 700 }}>New version is available: {LATEST_SAFE_VERSION}</AlertTitle>
              <Typography mb={3}>
                Update now to take advantage of new features and the highest security standards available. You will need
                to confirm this update just like any other transaction.{' '}
                <ExternalLink href={safeMasterCopy?.deployerRepoUrl}>GitHub</ExternalLink>
              </Typography>
              <UpdateSafeDialog />
            </Alert>
          ) : (
            <Typography display="flex" alignItems="center">
              <CheckCircleIcon color="primary" sx={{ mr: 0.5 }} /> Latest version
            </Typography>
          )
        ) : null}
      </Box>
    </>
  )
}
