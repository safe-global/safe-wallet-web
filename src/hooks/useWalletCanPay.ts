import useWalletBalance from '@/hooks/wallets/useWalletBalance'
import { BigNumber } from 'ethers'

// TODO: Test this hook
const useWalletCanPay = ({
  gasLimit,
  maxFeePerGas,
  maxPriorityFeePerGas,
}: {
  gasLimit?: BigNumber
  maxFeePerGas?: BigNumber | null
  maxPriorityFeePerGas?: BigNumber | null
}) => {
  const [walletBalance] = useWalletBalance()

  // Optimistic approach
  if (!gasLimit || !maxFeePerGas || !walletBalance) return true

  const totalFee = maxFeePerGas.add(maxPriorityFeePerGas || BigNumber.from(0)).mul(gasLimit)

  return walletBalance.gte(totalFee)
}

export default useWalletCanPay
