import { type ReactElement, type ReactNode, useState } from 'react'
import { Box, Checkbox, DialogContent, FormControlLabel, Typography } from '@mui/material'
import ModalDialog from '@/components/common/ModalDialog'
import useSafeAddress from '@/hooks/useSafeAddress'
import { useCurrentChain } from '@/hooks/useChains'
import useGenerateQrCode from '@/hooks/useGenerateQrCode'
import EthHashInfo from '@/components/common/EthHashInfo'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectSettings, setQrShortName } from '@/store/settingsSlice'

const QrCodeButton = ({ children }: { children: ReactNode }): ReactElement => {
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const safeAddress = useSafeAddress()
  const chain = useCurrentChain()
  const settings = useAppSelector(selectSettings)
  const dispatch = useAppDispatch()
  const qrPrefix = settings.shortName.qr ? `${chain?.shortName}:` : ''
  const qrCode = useGenerateQrCode(`${qrPrefix}${safeAddress}`)

  return (
    <>
      <div onClick={() => setModalOpen(true)}>{children}</div>

      {modalOpen && (
        <ModalDialog open dialogTitle="Receive assets" onClose={() => setModalOpen(false)} hideChainIndicator>
          <DialogContent>
            <Box bgcolor={chain?.theme.backgroundColor} color={chain?.theme.textColor} px={3} py={2} mx={-3}>
              {chain?.chainName} network &mdash; only send {chain?.chainName} assets to this Safe.
            </Box>

            <Typography my={2}>
              This is the address of your Safe. Deposit funds by scanning the QR code or copying the address below. Only
              send ETH and assets to this address (e.g. ETH, ERC20, ERC721)!
            </Typography>

            <Box
              display="flex"
              flexDirection="column"
              flexWrap="wrap"
              justifyContent="center"
              alignItems="center"
              my={2}
            >
              <Box mt={1} mb={1} p={1} border="1px solid" borderColor="border.main" borderRadius={1}>
                <img src={qrCode} alt="QR code" width={164} height={164} />
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.shortName.qr}
                    onChange={(e) => dispatch(setQrShortName(e.target.checked))}
                  />
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
      )}
    </>
  )
}

export default QrCodeButton
