import type { StakingTxInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { camelCaseToSpaces } from '@/utils/formatters'

export const StakingTxDepositInfo = ({ info }: { info: StakingTxInfo }) => {
  return <>{camelCaseToSpaces(info.type).toLowerCase()}</>
}

export default StakingTxDepositInfo
