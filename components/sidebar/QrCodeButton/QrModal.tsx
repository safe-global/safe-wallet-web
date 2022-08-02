import { type ReactElement } from 'react'
import { Box, Checkbox, DialogContent, FormControlLabel, Typography } from '@mui/material'
import ModalDialog from '@/components/common/ModalDialog'
import useSafeAddress from '@/hooks/useSafeAddress'
import { useCurrentChain } from '@/hooks/useChains'
import useGenerateQrCode from '@/hooks/useGenerateQrCode'
import EthHashInfo from '@/components/common/EthHashInfo'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectSettings, setQrShortName } from '@/store/settingsSlice'

const QrModal = ({ onClose }: { onClose: () => void }): ReactElement => {
  const safeAddress = useSafeAddress()
  const chain = useCurrentChain()
  const settings = useAppSelector(selectSettings)
  const dispatch = useAppDispatch()
  const qrPrefix = settings.shortName.qr ? `${chain?.shortName}:` : ''
  const qrCode = useGenerateQrCode(`${qrPrefix}${safeAddress}`)
  const chainName = chain?.chainName || ''
  const nativeToken = chain?.nativeCurrency.symbol || ''

  return (
    <ModalDialog open dialogTitle="Receive assets" onClose={onClose} hideChainIndicator>
      <DialogContent>
        <Box bgcolor={chain?.theme.backgroundColor} color={chain?.theme.textColor} px={3} py={2} mx={-3}>
          {chainName} network &mdash; only send {chainName} assets to this Safe.
        </Box>

        <Typography my={2}>
          This is the address of your Safe. Deposit funds by scanning the QR code or copying the address below. Only
          send {nativeToken} and tokens (e.g. ERC20, ERC721) to this address.
        </Typography>

        <Box display="flex" flexDirection="column" flexWrap="wrap" justifyContent="center" alignItems="center" my={2}>
          <Box mt={1} mb={1} p={1} border="1px solid" borderColor="border.main" borderRadius={1}>
            <img src={qrCode} alt="QR code" width={164} height={164} />
          </Box>

          <FormControlLabel
            control={
              <Checkbox checked={settings.shortName.qr} onChange={(e) => dispatch(setQrShortName(e.target.checked))} />
            }
            label={
              <>
                QR code with chain prefix (<b>{chain?.shortName}:</b>)
              </>
            }
          />

          <Box mt={2}>
            <EthHashInfo address={safeAddress} shortAddress={false} hasExplorer showCopyButton />
          </Box>
        </Box>
      </DialogContent>
    </ModalDialog>
  )
}

export default QrModal
