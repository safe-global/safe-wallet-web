import { Alert, Box, Chip, SvgIcon, Typography } from '@mui/material'
import { ZERO_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import InfoIcon from '@/public/images/notifications/info.svg'
import SafeIcon from '@/components/common/SafeIcon'

const EmojiPreview = () => (
  <>
    <Chip label="New" color="secondary" sx={{ fontWeight: 'bold', borderRadius: 2 }} />

    <Alert severity="success" sx={{ marginTop: 2, borderColor: 'secondary.main' }} icon={<></>}>
      <SvgIcon component={InfoIcon} sx={{ marginRight: 1, verticalAlign: 'middle' }} color="secondary" />

      <Typography component="span">Enable emojis for all Ethereum addresses and your Safe Accounts.</Typography>

      <Box mt={1} display="flex" alignItems="center" gap={1}>
        <SafeIcon address={ZERO_ADDRESS} />
        <Typography variant="body2">{ZERO_ADDRESS}</Typography>
      </Box>
    </Alert>
  </>
)

export default EmojiPreview
