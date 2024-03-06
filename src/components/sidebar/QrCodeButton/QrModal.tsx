import EthHashInfo from '@/components/common/EthHashInfo'
import ModalDialog from '@/components/common/ModalDialog'
import QRCode from '@/components/common/QRCode'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeAddress from '@/hooks/useSafeAddress'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectSettings, setQrShortName } from '@/store/settingsSlice'
import { Box, DialogContent, FormControlLabel, Switch, Typography } from '@mui/material'
import { type ReactElement } from 'react'

const QrModal = ({ onClose }: { onClose: () => void }): ReactElement => {
  const safeAddress = useSafeAddress()
  const chain = useCurrentChain()
  const settings = useAppSelector(selectSettings)
  const dispatch = useAppDispatch()
  const qrPrefix = settings.shortName.qr ? `${chain?.shortName}:` : ''
  const qrCode = `${qrPrefix}${safeAddress}`
  const chainName = chain?.chainName || ''
  const nativeToken = chain?.nativeCurrency.symbol || ''

  return (
    <ModalDialog open dialogTitle="Receive assets" onClose={onClose} hideChainIndicator>
      <DialogContent>
        <Box
          data-sid="32544"
          bgcolor={chain?.theme.backgroundColor}
          color={chain?.theme.textColor}
          px={3}
          py={2}
          mx={-3}
        >
          {chainName} network &mdash; only send {chainName} assets to this Safe Account.
        </Box>

        <Typography my={2}>
          This is the address of your Safe Account. Deposit funds by scanning the QR code or copying the address below.
          Only send {nativeToken} and tokens (e.g. ERC20, ERC721) to this address.
        </Typography>

        <Box
          data-sid="12564"
          display="flex"
          flexDirection="column"
          flexWrap="wrap"
          justifyContent="center"
          alignItems="center"
          my={2}
        >
          <Box data-sid="43887" mt={1} mb={1} p={1} border="1px solid" borderColor="border.main" borderRadius={1}>
            <QRCode value={qrCode} size={164} />
          </Box>

          <FormControlLabel
            control={
              <Switch checked={settings.shortName.qr} onChange={(e) => dispatch(setQrShortName(e.target.checked))} />
            }
            label={
              <>
                QR code with chain prefix (<b>{chain?.shortName}:</b>)
              </>
            }
          />

          <Box data-sid="78922" mt={2}>
            <EthHashInfo address={safeAddress} shortAddress={false} hasExplorer showCopyButton />
          </Box>
        </Box>
      </DialogContent>
    </ModalDialog>
  )
}

export default QrModal
