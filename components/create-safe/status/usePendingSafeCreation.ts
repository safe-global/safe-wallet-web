import { JsonRpcProvider, Log } from '@ethersproject/providers'
import { getProxyFactoryDeployment } from '@gnosis.pm/safe-deployments'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import { Interface } from '@ethersproject/abi'
import { sameAddress } from '@/utils/addresses'
import { didRevert } from '@/utils/ethers-utils'
import { SafeCreationStatus } from '@/components/create-safe/status/useSafeCreation'
import { useEffect } from 'react'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'

export const getNewSafeAddressFromLogs = (logs: Log[]): string => {
  let safeAddress = ''
  const contract = getProxyFactoryDeployment({
    version: LATEST_SAFE_VERSION,
  })

  if (!contract) return safeAddress

  const contractInterface = new Interface(contract.abi)

  try {
    const logDescriptions = logs
      .filter((log) => sameAddress(log.address, contract.defaultAddress))
      .map((log) => contractInterface.parseLog(log))

    const proxyCreationEvent = logDescriptions.find(({ name }) => name === 'ProxyCreation')
    safeAddress = proxyCreationEvent?.args['proxy']

    return safeAddress
  } catch (error) {
    console.log('Failed to parse safe address from logs', error)
  }

  return safeAddress
}

export const checkSafeCreationTx = async (provider: JsonRpcProvider, txHash: string) => {
  const TIMEOUT_TIME = 6.5

  try {
    const receipt = await provider.waitForTransaction(txHash, 1, TIMEOUT_TIME * 60_000)

    if (didRevert(receipt)) {
      return {
        status: SafeCreationStatus.REVERTED,
        safeAddress: undefined,
      }
    }

    const safeAddress = getNewSafeAddressFromLogs(receipt.logs)

    return {
      status: SafeCreationStatus.SUCCESS,
      safeAddress,
    }
  } catch (error) {
    return {
      status: SafeCreationStatus.TIMEOUT,
      safeAddress: undefined,
    }
  }
}

type Props = {
  txHash: string | undefined
  setStatus: (status: SafeCreationStatus) => void
  setSafeAddress: (safeAddress: string | undefined) => void
}

export const usePendingSafeCreation = ({ txHash, setStatus, setSafeAddress }: Props) => {
  const provider = useWeb3ReadOnly()

  useEffect(() => {
    if (!txHash || !provider) return

    const monitorTx = async (txHash: string) => {
      const txStatus = await checkSafeCreationTx(provider, txHash)
      setStatus(txStatus.status)
      setSafeAddress(txStatus.safeAddress)
    }

    setStatus(SafeCreationStatus.MINING)
    monitorTx(txHash)
  }, [txHash, provider, setStatus, setSafeAddress])
}
