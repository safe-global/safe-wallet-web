import { camelCaseToSpaces } from '@/utils/formatters'
import type { StakingTxInfo } from '@safe-global/safe-gateway-typescript-sdk'

const StakingTx = ({ info }: { info: StakingTxInfo }) => {
  return <>{camelCaseToSpaces(info.type).toLowerCase()}</>
}

export default StakingTx
