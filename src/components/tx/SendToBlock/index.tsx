import { Box, Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'

// TODO: Remove this file after replacing in all tx flow components
const SendToBlock = ({ address, title = 'Recipient' }: { address: string; title?: string }) => {
  return (
    <Box mb={3}>
      <Typography color={({ palette }) => palette.text.secondary} mb={1}>
        {title}
      </Typography>

      <Typography variant="body2" component="div">
        <EthHashInfo address={address} shortAddress={false} hasExplorer showCopyButton />
      </Typography>
    </Box>
  )
}

export default SendToBlock
