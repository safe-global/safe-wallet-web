import Link from 'next/link'
import { useRouter } from 'next/router'
import { Box, Button, FormControlLabel, Grid, Paper, Switch, Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import QRCode from '@/components/common/QRCode'
import { AppRoutes } from '@/config/routes'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeAddress from '@/hooks/useSafeAddress'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectSettings, setQrShortName } from '@/store/settingsSlice'
import AddIcon from '@mui/icons-material/Add'

const NoAssets = () => {
  const router = useRouter()
  const safeAddress = useSafeAddress()
  const chain = useCurrentChain()
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)
  const qrPrefix = settings.shortName.qr ? `${chain?.shortName}:` : ''
  const qrCode = `${qrPrefix}${safeAddress}`
  const [apps] = useRemoteSafeApps()

  // @FIXME: use tags instead of name
  const rampSafeApp = apps?.find((app) => app.name === 'Ramp Network')

  return (
    <Paper>
      <Grid container gap={3} alignItems="center" justifyContent="center" py={10} px={2}>
        <Grid item>
          <div>
            <Box p={2} border="1px solid" borderColor="border.light" borderRadius={1} display="inline-block">
              <QRCode value={qrCode} size={195} />
            </Box>
          </div>

          <FormControlLabel
            control={
              <Switch checked={settings.shortName.qr} onChange={(e) => dispatch(setQrShortName(e.target.checked))} />
            }
            label={<>QR code with chain prefix</>}
          />
        </Grid>

        <Grid item container xs={12} md={6} gap={2} flexDirection="column">
          <Typography variant="h3" fontWeight="bold">
            Add funds to get started
          </Typography>

          <Typography>
            Add funds directly from your bank account or copy your address to send tokens from a different account.
          </Typography>

          <Box bgcolor="background.main" p={2} borderRadius="6px" alignSelf="flex-start" fontSize="14px">
            <EthHashInfo address={safeAddress} shortAddress={false} showCopyButton hasExplorer avatarSize={24} />
          </Box>

          {rampSafeApp && (
            <Box alignSelf="flex-start">
              <Link
                href={{ pathname: AppRoutes.apps.index, query: { safe: router.query.safe, appUrl: rampSafeApp.url } }}
                passHref
              >
                <Button variant="contained" size="small" startIcon={<AddIcon />}>
                  Buy crypto
                </Button>
              </Link>
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  )
}

export default NoAssets
