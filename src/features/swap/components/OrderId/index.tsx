import CopyButton from '@/components/common/CopyButton'
import ExplorerButton from '@/components/common/ExplorerButton'
import { Box } from '@mui/material'
import Stack from '@mui/material/Stack'

const COW_EXPLORER_BASE_URL = 'https://explorer.cow.fi/orders/'

const OrderId = ({
  orderId,
  length = 8,
  showCopyButton = true,
}: {
  orderId: string
  length?: number
  showCopyButton?: boolean
}) => {
  const truncatedOrderId = orderId.slice(0, length)

  return (
    <Stack direction="row">
      <span>{truncatedOrderId}</span>
      {showCopyButton && <CopyButton text={orderId} />}
      <Box color="border.main">
        <ExplorerButton href={`${COW_EXPLORER_BASE_URL}${orderId}`} />
      </Box>
    </Stack>
  )
}

export default OrderId
