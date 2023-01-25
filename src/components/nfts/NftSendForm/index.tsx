import type { ReactElement } from 'react'
import { Box, Button, SvgIcon, Typography } from '@mui/material'
import ArrowIcon from '@/public/images/common/arrow-nw.svg'
import type { SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import Track from '@/components/common/Track'
import { NFT_EVENTS } from '@/services/analytics/events/nfts'
import useIsGranted from '@/hooks/useIsGranted'

type NftSendFormProps = {
  selectedNfts: SafeCollectibleResponse[]
  onSelectAll: () => void
}

const stickyTop = { xs: '103px', md: '111px' }
const Sticky = ({ children }: { children: ReactElement }): ReactElement => (
  <Box position="sticky" zIndex="1" top={stickyTop} py={1} bgcolor="background.main">
    {children}
  </Box>
)

const NftSendForm = ({ selectedNfts, onSelectAll }: NftSendFormProps): ReactElement => {
  const isGranted = useIsGranted()
  const nftsText = `NFT${selectedNfts.length === 1 ? '' : 's'}`
  const noSelected = selectedNfts.length === 0

  return (
    <Sticky>
      <Box display="flex" alignItems="center" gap={1}>
        <Box bgcolor="secondary.background" py={0.75} px={2} flex={1} borderRadius={1} mr={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <SvgIcon component={ArrowIcon} inheritViewBox color="border" sx={{ width: 12, height: 12 }} />

            <Typography variant="body2" lineHeight="inherit">
              {`${selectedNfts.length} ${nftsText} selected`}
            </Typography>
          </Box>
        </Box>

        <Button
          onClick={onSelectAll}
          variant="outlined"
          size="small"
          sx={{
            // The custom padding is needed to align the outlined button with the adjacent filled button
            py: '6px',
            minWidth: '10em',
          }}
        >
          {noSelected ? 'Select all' : 'Deselect all'}
        </Button>

        <Track {...NFT_EVENTS.SEND} label={selectedNfts.length}>
          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={!isGranted || noSelected}
            sx={{
              minWidth: '10em',
            }}
          >
            {!isGranted ? 'Read only' : selectedNfts.length ? `Send ${selectedNfts.length} ${nftsText}` : 'Send'}
          </Button>
        </Track>
      </Box>
    </Sticky>
  )
}

export default NftSendForm
