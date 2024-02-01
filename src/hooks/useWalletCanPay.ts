import useWalletBalance from '@/hooks/wallets/useWalletBalance'

const useWalletCanPay = ({
  gasLimit,
  maxFeePerGas,
  maxPriorityFeePerGas,
}: {
  gasLimit?: bigint
  maxFeePerGas?: bigint | null
  maxPriorityFeePerGas?: bigint | null
}) => {
  const [walletBalance] = useWalletBalance()

  // Take an optimistic approach and assume the wallet can pay
  // if gasLimit, maxFeePerGas or their walletBalance are missing
  if (!gasLimit || !maxFeePerGas || walletBalance === undefined) return true

  const totalFee = (maxFeePerGas + BigInt(maxPriorityFeePerGas || 0)) * gasLimit

  return walletBalance >= totalFee
}

export default useWalletCanPay
