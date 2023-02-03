import type { ReactElement } from 'react'
import { Box, Button, Grid, SvgIcon, Typography } from '@mui/material'
import ArrowIcon from '@/public/images/common/arrow-nw.svg'
import type { SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import useIsGranted from '@/hooks/useIsGranted'

type NftSendFormProps = {
  selectedNfts: SafeCollectibleResponse[]
  onSelectAll: () => void
}

const stickyTop = { xs: '103px', md: '111px' }
const Sticky = ({ children }: { children: ReactElement }): ReactElement => (
  <Box position="sticky" zIndex="1" top={stickyTop} py={1} bgcolor="background.main" mt={-1} mb={1}>
    {children}
  </Box>
)

const NftSendForm = ({ selectedNfts, onSelectAll }: NftSendFormProps): ReactElement => {
  const isGranted = useIsGranted()
  const nftsText = `NFT${selectedNfts.length === 1 ? '' : 's'}`
  const noSelected = selectedNfts.length === 0

  return (
    <Sticky>
      <Grid container spacing={1} justifyContent="flex-end" alignItems="center">
        <Grid item display={['none', 'block']} flex="1">
          <Box bgcolor="secondary.background" py={0.75} px={2} flex={1} borderRadius={1} mr={1}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <SvgIcon component={ArrowIcon} inheritViewBox color="border" sx={{ width: 12, height: 12 }} />

              <Typography variant="body2" lineHeight="inherit">
                {`${selectedNfts.length} ${nftsText} selected`}
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item>
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
        </Grid>

        <Grid item>
          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={!isGranted || noSelected}
            sx={{
              minWidth: '10em',
            }}
          >
            {noSelected ? 'Send' : `Send ${selectedNfts.length} ${nftsText}`}
          </Button>
        </Grid>
      </Grid>
    </Sticky>
  )
}

export default NftSendForm
