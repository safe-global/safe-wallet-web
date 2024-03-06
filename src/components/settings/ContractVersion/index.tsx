import CheckWallet from '@/components/common/CheckWallet'
import ExternalLink from '@/components/common/ExternalLink'
import { TxModalContext } from '@/components/tx-flow'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import type { MasterCopy } from '@/hooks/useMasterCopies'
import { MasterCopyDeployer, useMasterCopies } from '@/hooks/useMasterCopies'
import useSafeInfo from '@/hooks/useSafeInfo'
import InfoIcon from '@/public/images/notifications/info.svg'
import { sameAddress } from '@/utils/addresses'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Alert, AlertTitle, Box, Button, Skeleton, SvgIcon, Typography } from '@mui/material'
import { ImplementationVersionState } from '@safe-global/safe-gateway-typescript-sdk'
import { useContext, useMemo } from 'react'

export const ContractVersion = () => {
  const { setTxFlow } = useContext(TxModalContext)
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
      <Box data-sid="89707" mt={2}>
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

              <CheckWallet>
                {(isOk) => (
                  <Button
                    data-sid="23243"
                    onClick={() => setTxFlow(<UpdateSafeFlow />)}
                    variant="contained"
                    disabled={!isOk}
                  >
                    Update
                  </Button>
                )}
              </CheckWallet>
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
