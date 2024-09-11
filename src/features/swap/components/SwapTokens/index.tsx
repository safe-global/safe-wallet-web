import ConfirmationOrderHeader, { type InfoBlock } from '@/components/tx/ConfirmationOrder/ConfirmationOrderHeader'

const SwapTokens = ({ first, second }: { first: InfoBlock; second: InfoBlock }) => {
  return <ConfirmationOrderHeader blocks={[first, second]} showArrow />
}

export default SwapTokens
