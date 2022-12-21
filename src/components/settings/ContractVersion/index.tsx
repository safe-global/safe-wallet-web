import { useMemo } from 'react'
import { Typography } from '@mui/material'
import { ImplementationVersionState } from '@safe-global/safe-gateway-typescript-sdk'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import { sameAddress } from '@/utils/addresses'
import type { MasterCopy } from '@/hooks/useMasterCopies'
import { MasterCopyDeployer, useMasterCopies } from '@/hooks/useMasterCopies'
import useSafeInfo from '@/hooks/useSafeInfo'

import UpdateSafeDialog from './UpdateSafeDialog'
import ExternalLink from '@/components/common/ExternalLink'

export const ContractVersion = ({ isGranted }: { isGranted: boolean }) => {
  const [masterCopies] = useMasterCopies()
  const { safe } = useSafeInfo()
  const masterCopyAddress = safe.implementation.value

  const safeMasterCopy: MasterCopy | undefined = useMemo(() => {
    return masterCopies?.find((mc) => sameAddress(mc.address, masterCopyAddress))
  }, [masterCopies, masterCopyAddress])

  const needsUpdate = safe.implementationVersionState === ImplementationVersionState.OUTDATED
  const latestMasterContractVersion = LATEST_SAFE_VERSION
  const showUpdateDialog = safeMasterCopy?.deployer === MasterCopyDeployer.GNOSIS && needsUpdate

  const getSafeVersionUpdate = () => {
    return showUpdateDialog ? ` (there's a newer version: ${latestMasterContractVersion})` : ''
  }

  return (
    <div>
      <Typography variant="h4" fontWeight={700} marginBottom={1}>
        Contract version
      </Typography>
      {safe.version ? (
        <ExternalLink href={safeMasterCopy?.deployerRepoUrl}>
          {safe.version}
          {getSafeVersionUpdate()}
        </ExternalLink>
      ) : (
        <Typography variant="body1" fontWeight={400}>
          Unsupported contract
        </Typography>
      )}

      {showUpdateDialog && isGranted && <UpdateSafeDialog />}
    </div>
  )
}
