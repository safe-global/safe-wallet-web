import useWalletBalance from '@/hooks/wallets/useWalletBalance'
import { BigNumber } from 'ethers'

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

  // Take an optimistic approach and assume the wallet can pay
  // if gasLimit, maxFeePerGas or their walletBalance are missing
  if (!gasLimit || !maxFeePerGas || !walletBalance) return true

  const totalFee = maxFeePerGas.add(maxPriorityFeePerGas || BigNumber.from(0)).mul(gasLimit)

  return walletBalance.gte(totalFee)
}

export default useWalletCanPay
