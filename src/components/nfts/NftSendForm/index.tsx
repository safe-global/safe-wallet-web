import type { ReactElement } from 'react'
import { Box, Button, Grid, SvgIcon, Typography } from '@mui/material'
import ArrowIcon from '@/public/images/common/arrow-nw.svg'
import type { SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { Sticky } from '@/components/common/Sticky'
import CheckWallet from '@/components/common/CheckWallet'

type NftSendFormProps = {
  selectedNfts: SafeCollectibleResponse[]
  onSelectAll: () => void
}

const NftSendForm = ({ selectedNfts, onSelectAll }: NftSendFormProps): ReactElement => {
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
          <CheckWallet>
            {(isOk) => (
              <Button
                type="submit"
                variant="contained"
                size="small"
                disabled={!isOk || noSelected}
                sx={{
                  minWidth: '10em',
                }}
              >
                {noSelected ? 'Send' : `Send ${selectedNfts.length} ${nftsText}`}
              </Button>
            )}
          </CheckWallet>
        </Grid>
      </Grid>
    </Sticky>
  )
}

export default NftSendForm
