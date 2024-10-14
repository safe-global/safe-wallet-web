import type { StakingTxDepositInfo as StakingTxDepositInfoType } from '@safe-global/safe-gateway-typescript-sdk'
import TokenAmount from '@/components/common/TokenAmount'

export const StakingTxDepositInfo = ({ info }: { info: StakingTxDepositInfoType }) => {
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

export default StakingTxDepositInfo
