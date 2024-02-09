import useBalances from '@/hooks/useBalances'
import { Box, FormControlLabel, Grid, Paper, Switch, Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import QRCode from '@/components/common/QRCode'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeAddress from '@/hooks/useSafeAddress'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectSettings, setQrShortName } from '@/store/settingsSlice'
import BuyCryptoButton from '@/components/common/BuyCryptoButton'

const AddFundsCTA = () => {
  const { balances } = useBalances()
  const safeAddress = useSafeAddress()
  const chain = useCurrentChain()
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)
  const qrPrefix = settings.shortName.qr ? `${chain?.shortName}:` : ''
  const qrCode = `${qrPrefix}${safeAddress}`

  const hasNoAssets = balances.items.length === 1 && balances.items[0].balance === '0'

  if (!hasNoAssets) return null

  return (
    <Paper>
      <Grid container gap={3} alignItems="center" justifyContent="center" p={4}>
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

        <Grid item container xs={12} md={8} gap={1} flexDirection="column">
          <Typography variant="h3" fontWeight="bold">
            Add funds to get started
          </Typography>

          <Typography mb={2}>
            Add funds directly from your bank account or copy your address to send tokens from a different account.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Typography mb={1}>Send assets to your address:</Typography>
              <Box bgcolor="background.main" p={2} borderRadius="6px" alignSelf="flex-start" fontSize="14px">
                <EthHashInfo
                  address={safeAddress}
                  showName={false}
                  shortAddress={false}
                  showCopyButton
                  hasExplorer
                  avatarSize={24}
                />
              </Box>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Typography mb={1}>Buy crypto with fiat:</Typography>
              <BuyCryptoButton />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default AddFundsCTA
