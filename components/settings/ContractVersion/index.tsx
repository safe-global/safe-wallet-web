import { LATEST_SAFE_VERSION } from '@/config/constants'
import { sameAddress } from '@/utils/addresses'
import { safeNeedsUpdate } from '@/utils/safeVersion'
import { MasterCopy, MasterCopyDeployer, useMasterCopies } from '@/hooks/useMasterCopies'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Box, Link, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded'

export const ContractVersion = () => {
  const [masterCopies] = useMasterCopies()
  const [safeMasterCopy, setSafeMasterCopy] = useState<MasterCopy>()
  const { safe } = useSafeInfo()

  useEffect(() => {
    const getMasterCopyInfo = () => {
      const masterCopyAddress = safe?.implementation.value
      const masterCopy = masterCopies?.find((mc) => sameAddress(mc.address, masterCopyAddress))

      setSafeMasterCopy(masterCopy)
    }
    getMasterCopyInfo()
  }, [masterCopies, safe?.implementation.value])

  const needsUpdate = safeNeedsUpdate(safe?.version, LATEST_SAFE_VERSION)

  // TODO: Fetch from master contract on-chain after initiating typechain
  const latestMasterContractVersion = LATEST_SAFE_VERSION

  const getSafeVersionUpdate = () => {
    return safeMasterCopy?.deployer === MasterCopyDeployer.GNOSIS && needsUpdate
      ? ` (there's a newer version: ${latestMasterContractVersion})`
      : ''
  }
  return (
    <div>
      <Typography variant="h4" fontWeight={700} marginBottom={1}>
        Contract Version
      </Typography>
      <Link rel="noreferrer noopener" href={safeMasterCopy?.deployerRepoUrl} target="_blank">
        <Box display="flex" alignContent={'center'}>
          {safe?.version}
          {getSafeVersionUpdate()}
          <OpenInNewRounded fontSize="small" />
        </Box>
      </Link>
    </div>
  )
}
