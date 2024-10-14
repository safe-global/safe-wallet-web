import type { StakingTxExitInfo } from '@safe-global/safe-gateway-typescript-sdk'

const StakingTxExitInfo = ({ info }: { info: StakingTxExitInfo }) => {
  return (
    <>
      {info.numValidators} Validator{info.numValidators > 1 ? 's' : ''}
    </>
  )
}

export default StakingTxExitInfo
