import type { StakingTxInfo } from '@safe-global/safe-gateway-typescript-sdk'
import TokenAmount from '@/components/common/TokenAmount'

const StakingTxExitInfo = ({ info }: { info: StakingTxInfo }) => {
  return (
    <>
      <TokenAmount
        value={info.value}
        tokenSymbol={info.tokenInfo.symbol}
        decimals={info.tokenInfo.decimals}
        logoUri={info.tokenInfo.logoUri}
      />
    </>
  )
}

export default StakingTxExitInfo
