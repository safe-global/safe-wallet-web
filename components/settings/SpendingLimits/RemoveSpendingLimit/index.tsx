import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { getSpendingLimitInterface, getSpendingLimitModuleAddress } from '@/services/contracts/spendingLimitContracts'
import useChainId from '@/hooks/useChainId'
import { useWeb3 } from '@/hooks/wallets/web3'
import { createTx } from '@/services/tx/txSender'
import useAsync from '@/hooks/useAsync'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import useSafeInfo from '@/hooks/useSafeInfo'
import EthHashInfo from '@/components/common/EthHashInfo'
import { Typography } from '@mui/material'
import { SpendingLimitState } from '@/store/spendingLimitsSlice'
import { relativeTime } from '@/utils/date'

export const RemoveSpendingLimit = ({
  data,
  onSubmit,
}: {
  data: SpendingLimitState
  onSubmit: (data: null) => void
}) => {
  const { safe } = useSafeInfo()
  const chainId = useChainId()
  const provider = useWeb3()

  const [safeTx, safeTxError] = useAsync<SafeTransaction | undefined>(async () => {
    const spendingLimitAddress = getSpendingLimitModuleAddress(chainId)
    if (!provider || !spendingLimitAddress) return

    const spendingLimitInterface = getSpendingLimitInterface()
    const txData = spendingLimitInterface.encodeFunctionData('deleteAllowance', [data.beneficiary, data.token])

    const txParams = {
      to: spendingLimitAddress,
      value: '0',
      data: txData,
    }

    return createTx(txParams)
  }, [provider, chainId, data.beneficiary, data.token])

  return (
    <SignOrExecuteForm
      safeTx={safeTx}
      isExecutable={safe.threshold === 1}
      onSubmit={onSubmit}
      error={safeTxError}
      title="Remove spending limit"
    >
      <Typography>Beneficiary</Typography>
      <EthHashInfo address={data.beneficiary} showCopyButton hasExplorer shortAddress={false} />
      <Typography mt={2}>Reset Time</Typography>
      <Typography mb={2}>{relativeTime(data.lastResetMin, data.resetTimeMin)}</Typography>
    </SignOrExecuteForm>
  )
}
