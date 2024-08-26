import TokenInfoPair, { type InfoBlock } from '@/components/tx/ConfirmationOrder/TokenInfoPair'

const SwapTokens = ({ first, second }: { first: InfoBlock; second: InfoBlock }) => {
  return <TokenInfoPair blocks={[first, second]} showArrow />
}

export default SwapTokens
