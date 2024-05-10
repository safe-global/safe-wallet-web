import CopyButton from '@/components/common/CopyButton'
import ExplorerButton from '@/components/common/ExplorerButton'
import { Box } from '@mui/material'
import Stack from '@mui/material/Stack'

const OrderId = ({
  orderId,
  href,
  length = 8,
  showCopyButton = true,
}: {
  orderId: string
  href: string
  length?: number
  showCopyButton?: boolean
}) => {
  // CoWSwap doesn't show the 0x at the beginning of a tx
  const truncatedOrderId = orderId.replace('0x', '').slice(0, length)

  return (
    <Stack direction="row">
      <span>{truncatedOrderId}</span>
      {showCopyButton && <CopyButton text={orderId} />}
      <Box color="border.main">
        <ExplorerButton href={href} />
      </Box>
    </Stack>
  )
}

export default OrderId
