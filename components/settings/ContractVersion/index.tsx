import { LATEST_SAFE_VERSION } from '@/config/constants'
import { sameAddress } from '@/services/addresses'
import { safeNeedsUpdate } from '@/services/safeVersion'
import { MasterCopy, MasterCopyDeployer, useMasterCopies } from '@/services/useMasterCopies'
import useSafeInfo from '@/services/useSafeInfo'
import { Link, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded'

export const ContractVersion = () => {
  const [masterCopies, error, loading] = useMasterCopies()
  const [safeMasterCopy, setSafeMasterCopy] = useState<MasterCopy>()
  const { safe } = useSafeInfo()

  useEffect(() => {
    let isMounted = true
    const getMasterCopyInfo = () => {
      const masterCopyAddress = safe?.implementation.value
      const masterCopy = masterCopies?.find((mc) => sameAddress(mc.address, masterCopyAddress))
      if (isMounted) {
        setSafeMasterCopy(masterCopy)
      }
    }
    getMasterCopyInfo()
    return () => {
      isMounted = false
    }
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
      <Typography variant="h4" fontWeight={700}>
        Contract Version
      </Typography>
      <Link rel="noreferrer noopener" href={safeMasterCopy?.deployerRepoUrl} target="_blank">
        {safe?.version}
        {getSafeVersionUpdate()}
        <OpenInNewRounded />
      </Link>
    </div>
  )
}
