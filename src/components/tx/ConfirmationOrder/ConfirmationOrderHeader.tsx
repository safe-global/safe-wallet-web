import { Stack, Box, Typography, SvgIcon } from '@mui/material'
import EastRoundedIcon from '@mui/icons-material/EastRounded'
import TokenIcon from '@/components/common/TokenIcon'
import TokenAmount from '@/components/common/TokenAmount'

export type InfoBlock = {
  value: string
  label: string
  tokenInfo?: {
    decimals: number
    symbol: string
    logoUri?: string | null
  }
}

const ConfirmationOrderHeader = ({ blocks, showArrow }: { blocks: [InfoBlock, InfoBlock]; showArrow?: boolean }) => {
  return (
    <Stack direction="row" spacing={1}>
      {blocks.map((block, index) => (
        <Stack
          key={index}
          direction="row"
          flexWrap="wrap"
          alignItems="center"
          width="50%"
          bgcolor="border.background"
          position="relative"
          borderRadius={1}
          py={2}
          px={3}
        >
          {block.tokenInfo && (
            <Box width={40} mr={2}>
              <TokenIcon size={40} logoUri={block.tokenInfo.logoUri || ''} tokenSymbol={block.tokenInfo.symbol} />
            </Box>
          )}

          <Box flex={1}>
            <Typography variant="body2" color="primary.light">
              {block.label}
            </Typography>

            <Typography variant="h4" fontWeight="bold" component="div">
              {block.tokenInfo ? (
                <TokenAmount
                  tokenSymbol={block.tokenInfo.symbol}
                  decimals={block.tokenInfo.decimals}
                  value={block.value}
                />
              ) : (
                block.value
              )}
            </Typography>
          </Box>

          {showArrow && index === 0 && (
            <Box
              bgcolor="background.paper"
              width={40}
              height={40}
              p={1}
              borderRadius="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              sx={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
            >
              <SvgIcon component={EastRoundedIcon} inheritViewBox fontSize="small" />
            </Box>
          )}
        </Stack>
      ))}
    </Stack>
  )
}

export default ConfirmationOrderHeader
