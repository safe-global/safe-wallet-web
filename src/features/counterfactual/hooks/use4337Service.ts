import { useCurrentChain } from '@/hooks/useChains'
import useSafeAddress from '@/hooks/useSafeAddress'
import useWallet from '@/hooks/wallets/useWallet'
import type EthSafeOperation from '@safe-global/relay-kit/dist/src/packs/safe-4337/SafeOperation'
import { getSafe4337ModuleDeployment } from '@safe-global/safe-modules-deployments'
import { useCallback, useMemo } from 'react'

export interface Safe4337Service {
  proposeUserOperation: (userOperation: EthSafeOperation) => Promise<void>
}

export const use4337Service = (): Safe4337Service => {
  const currentChain = useCurrentChain()
  const safeAddress = useSafeAddress()
  const wallet = useWallet()

  const moduleDeployment = getSafe4337ModuleDeployment({ version: '0.2.0' })
  const moduleAddress = useMemo(
    () => (currentChain ? moduleDeployment?.networkAddresses[currentChain.chainId] : undefined),
    [currentChain, moduleDeployment?.networkAddresses],
  )
  const proposeUserOperation = useCallback(
    async (userOperation: EthSafeOperation) => {
      const txServiceUrl = currentChain?.transactionService
      if (!txServiceUrl || !safeAddress || !wallet || !moduleAddress) {
        return
      }

      // Post to endpoint
      const error = await fetch(`${txServiceUrl}/api/v1/safes/${safeAddress}/safe-operations/`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ['content-type']: 'application/json',
        },
        body: JSON.stringify({
          nonce: userOperation.data.nonce.toString(),
          initCode: userOperation.data.initCode,
          callData: userOperation.data.callData,
          callGasLimit: userOperation.data.callGasLimit.toString(),
          verificationGasLimit: userOperation.data.verificationGasLimit.toString(),
          preVerificationGas: userOperation.data.preVerificationGas.toString(),
          maxFeePerGas: userOperation.data.maxFeePerGas.toString(),
          maxPriorityFeePerGas: userOperation.data.maxPriorityFeePerGas.toString(),
          paymasterAndData: null,
          signature: userOperation.encodedSignatures(),
          entryPoint: userOperation.data.entryPoint,
          validAfter: null,
          validUntil: null,
          moduleAddress,
        }),
      }).then((resp) => {
        if (resp.ok) {
          return
        }
        return new Error(`Error submitting UserOperation: ${resp.statusText}`)
      })

      if (error) {
        throw error
      }
    },
    [currentChain, moduleAddress, safeAddress, wallet],
  )

  return { proposeUserOperation }
}
