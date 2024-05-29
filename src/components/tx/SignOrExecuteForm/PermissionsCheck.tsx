import { useContext, useEffect, useMemo, useState } from 'react'
import {
  type ChainId,
  chains,
  fetchRolesMod,
  Clearance,
  type RoleSummary,
  ExecutionOptions,
  Status,
} from 'zodiac-roles-deployments'
import {
  OperationType,
  type Transaction,
  type MetaTransactionData,
  type SafeTransaction,
} from '@safe-global/safe-core-sdk-types'
import { decodeBytes32String, type JsonRpcProvider } from 'ethers'
import { KnownContracts, getModuleInstance } from '@gnosis.pm/zodiac'
import { Box, Button, CardActions, Chip, CircularProgress, Divider, Typography } from '@mui/material'
import { backOff } from 'exponential-backoff'

import commonCss from '@/components/tx-flow/common/styles.module.css'
import CheckWallet from '@/components/common/CheckWallet'
import TxCard from '@/components/tx-flow/common/TxCard'
import { getTransactionTrackingType } from '@/services/analytics/tx-tracking'
import { TX_EVENTS } from '@/services/analytics/events/transactions'
import { trackEvent } from '@/services/analytics'
import useSafeInfo from '@/hooks/useSafeInfo'
import useAsync from '@/hooks/useAsync'
import WalletRejectionError from './WalletRejectionError'
import ErrorMessage from '../ErrorMessage'
import useWallet from '@/hooks/wallets/useWallet'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { type SubmitCallback } from '.'
import { getTxOptions } from '@/utils/transactions'
import { isWalletRejection } from '@/utils/wallets'
import { Errors, logError, trackError } from '@/services/exceptions'
import { asError } from '@/services/exceptions/utils'
import { SuccessScreenFlow } from '@/components/tx-flow/flows'
import AdvancedParams, { useAdvancedParams } from '../AdvancedParams'
import { useCurrentChain } from '@/hooks/useChains'
import { dispatchModuleTxExecution } from '@/services/tx/tx-sender'
import useOnboard from '@/hooks/wallets/useOnboard'
import { assertOnboard, assertWallet } from '@/utils/helpers'
import { trimTrailingSlash } from '@/utils/url'
import { TxModalContext } from '@/components/tx-flow'

const Role = ({ children }: { children: string }) => {
  let humanReadableRoleKey = children
  try {
    humanReadableRoleKey = decodeBytes32String(children)
  } catch (e) {}

  return <Chip label={humanReadableRoleKey} />
}

const PermissionsCheck: React.FC<{ onSubmit?: SubmitCallback; safeTx: SafeTransaction; safeTxError?: Error }> = ({
  onSubmit,
  safeTx,
  safeTxError,
}) => {
  const currentChain = useCurrentChain()
  const onboard = useOnboard()
  const wallet = useWallet()
  const { safe } = useSafeInfo()

  const chainId = currentChain?.chainId || '1'

  const [isPending, setIsPending] = useState<boolean>(false)
  const [isRejectedByUser, setIsRejectedByUser] = useState<boolean>(false)
  const [submitError, setSubmitError] = useState<Error | undefined>()

  const { setTxFlow } = useContext(TxModalContext)

  const roles = useRoles(safeTx?.data)
  const allowingRole = roles.find((role) => role.status === Status.Ok)

  // If a user has multiple roles, we should prioritize the one that allows the transaction's to address (and function selector)
  const mostLikelyRole =
    allowingRole ||
    roles.find((role) => role.status !== Status.TargetAddressNotAllowed && role.status !== Status.FunctionNotAllowed) ||
    roles.find((role) => role.status !== Status.TargetAddressNotAllowed) ||
    roles[0]

  // Wrap call routing it through the Roles mod with the allowing role
  const txThroughRole = useExecuteThroughRole({
    modAddress: allowingRole?.modAddress,
    roleKey: allowingRole?.roleKey,
    metaTx: safeTx?.data,
  })
  // Estimate gas limit
  const { gasLimit, gasLimitError } = useGasLimit(txThroughRole)
  const [advancedParams, setAdvancedParams] = useAdvancedParams(gasLimit)

  const handleExecute = async () => {
    assertWallet(wallet)
    assertOnboard(onboard)

    setIsRejectedByUser(false)
    setIsPending(true)
    setSubmitError(undefined)
    setIsRejectedByUser(false)

    if (!txThroughRole) {
      throw new Error('Execution through role is not possible')
    }

    const txOptions = getTxOptions(advancedParams, currentChain)

    let txHash: string
    try {
      txHash = await dispatchModuleTxExecution({ ...txThroughRole, ...txOptions }, onboard, chainId, safe.address.value)
    } catch (_err) {
      const err = asError(_err)
      if (isWalletRejection(err)) {
        setIsRejectedByUser(true)
      } else {
        trackError(Errors._815, err)
        setSubmitError(err)
      }
      setIsPending(false)
      return
    }

    // On success, wait for module tx to be indexed
    const transactionService = currentChain?.transactionService
    if (!transactionService) {
      throw new Error('Transaction service not found')
    }
    const moduleTxId = await pollModuleTransactionId({
      transactionService,
      safeAddress: safe.address.value,
      txHash,
    })

    const txId = `module_${safe.address.value}_${moduleTxId}`

    onSubmit?.(txId, true)

    // Track tx event
    const txType = await getTransactionTrackingType(chainId, txId)
    trackEvent({ ...TX_EVENTS.EXECUTE_THROUGH_ROLE, label: txType })

    setTxFlow(<SuccessScreenFlow txId={txId} />, undefined, false)
  }

  // Only render the card if the connected wallet is a member of any role
  if (roles.length === 0) {
    return null
  }

  return (
    <TxCard>
      <Typography variant="h5">Execute through role</Typography>

      {allowingRole && (
        <>
          <Typography>
            As a member of the <Role>{allowingRole.roleKey}</Role> role you can execute this transaction immediately.
          </Typography>
          <AdvancedParams
            willExecute
            params={advancedParams}
            recommendedGasLimit={gasLimit}
            onFormSubmit={setAdvancedParams}
            gasLimitError={gasLimitError}
          />
        </>
      )}

      {!allowingRole && (
        <>
          <Typography>
            You are a member of the <Role>{mostLikelyRole.roleKey}</Role> role but it does not allow this transaction.
          </Typography>

          {mostLikelyRole.status && (
            <ErrorMessage>
              The permissions check fails with the following status:
              <br />
              <code>{Status[mostLikelyRole.status]}</code>
            </ErrorMessage>
          )}
        </>
      )}

      {safeTxError && (
        <ErrorMessage error={safeTxError}>
          This transaction will most likely fail. To save gas costs, avoid confirming the transaction.
        </ErrorMessage>
      )}

      {submitError && (
        <Box mt={1}>
          <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
        </Box>
      )}

      {isRejectedByUser && (
        <Box mt={1}>
          <WalletRejectionError />
        </Box>
      )}

      <div>
        <Divider className={commonCss.nestedDivider} sx={{ pt: 3 }} />

        <CardActions>
          <CheckWallet allowNonOwner>
            {(isOk) => (
              <Button
                data-testid="execute-through-role-btn"
                variant="contained"
                onClick={handleExecute}
                disabled={!isOk || !allowingRole || isPending}
                sx={{ minWidth: '209px' }}
              >
                {isPending ? <CircularProgress size={20} /> : 'Execute through role'}
              </Button>
            )}
          </CheckWallet>
        </CardActions>
      </div>
    </TxCard>
  )
}

export default PermissionsCheck

const ROLES_V2_SUPPORTED_CHAINS = Object.keys(chains)

/**
 * Returns all Zodiac Roles Modifiers v2 instances that are enabled and correctly configured on this Safe
 */
const useRolesMods = () => {
  const { safe } = useSafeInfo()

  const [data] = useAsync(async () => {
    if (!ROLES_V2_SUPPORTED_CHAINS.includes(safe.chainId)) return []

    const safeModules = safe.modules || []
    const rolesMods = await Promise.all(
      safeModules.map((address) =>
        fetchRolesMod({ address: address.value as `0x${string}`, chainId: parseInt(safe.chainId) as ChainId }),
      ),
    )

    return rolesMods.filter(
      (mod): mod is Exclude<typeof mod, null> =>
        mod !== null &&
        mod.target === safe.address.value.toLowerCase() &&
        mod.avatar === safe.address.value.toLowerCase() &&
        mod.roles.length > 0,
    )
  }, [safe])

  return data
}

/**
 * Returns a list of roles mod address + role key assigned to the connected wallet.
 * For each role, checks if the role allows the given meta transaction and returns the status.
 */
const useRoles = (metaTx?: MetaTransactionData) => {
  const rolesMods = useRolesMods()
  const wallet = useWallet()
  const walletAddress = wallet?.address.toLowerCase() as undefined | `0x${string}`

  // find all roles assigned to the connected wallet, statically check if they allow the given meta transaction
  const potentialRoles = useMemo(() => {
    const result: {
      modAddress: `0x${string}`
      roleKey: `0x${string}`
      status: Status | null
    }[] = []

    if (walletAddress && rolesMods) {
      for (const rolesMod of rolesMods) {
        for (const role of rolesMod.roles) {
          if (role.members.includes(walletAddress)) {
            result.push({
              modAddress: rolesMod.address,
              roleKey: role.key,
              status: metaTx ? checkTransaction(role, metaTx) : null,
            })
          }
        }
      }
    }

    return result
  }, [rolesMods, walletAddress, metaTx])
  const web3ReadOnly = useWeb3ReadOnly()

  // if the static check is inconclusive (status: null), evaluate the condition through a test call
  const [dynamicallyCheckedPotentialRoles] = useAsync(
    () =>
      Promise.all(
        potentialRoles.map(async (entry) => {
          if (entry.status === null && metaTx && walletAddress && web3ReadOnly) {
            entry.status = await checkCondition(entry.modAddress, entry.roleKey, metaTx, walletAddress, web3ReadOnly)
          }
          return entry
        }),
      ),
    [potentialRoles, metaTx, walletAddress, web3ReadOnly],
  )

  // Return the statically checked roles while the dynamic checks are still pending
  return dynamicallyCheckedPotentialRoles || potentialRoles
}

/**
 * Returns the status of the permissions check, `null` if it depends on the condition evaluation.
 */
const checkTransaction = (role: RoleSummary, metaTx: MetaTransactionData): Status | null => {
  const target = role.targets.find((t) => t.address === metaTx.to.toLowerCase())
  if (!target) return Status.TargetAddressNotAllowed

  if (target.clearance === Clearance.Target) {
    // all calls to the target are allowed
    return checkExecutionOptions(target.executionOptions, metaTx)
  }

  if (target.clearance === Clearance.Function) {
    // check if the function is allowed
    const selector = metaTx.data.slice(0, 10) as `0x${string}`
    const func = target.functions.find((f) => f.selector === selector)
    if (func) {
      const execOptionsStatus = checkExecutionOptions(func.executionOptions, metaTx)
      if (execOptionsStatus !== Status.Ok) return execOptionsStatus
      return func.wildcarded ? Status.Ok : null // wildcarded means there's no condition set
    }
  }

  return Status.FunctionNotAllowed
}

const checkExecutionOptions = (execOptions: ExecutionOptions, metaTx: MetaTransactionData): Status => {
  const isSend = BigInt(metaTx.value || '0') > 0n
  const isDelegateCall = metaTx.operation === OperationType.DelegateCall

  if (isSend && execOptions !== ExecutionOptions.Send && execOptions !== ExecutionOptions.Both) {
    return Status.SendNotAllowed
  }
  if (isDelegateCall && execOptions !== ExecutionOptions.DelegateCall && execOptions !== ExecutionOptions.Both) {
    return Status.DelegateCallNotAllowed
  }

  return Status.Ok
}

const useExecuteThroughRole = ({
  modAddress,
  roleKey,
  metaTx,
}: {
  modAddress?: `0x${string}`
  roleKey?: `0x${string}`
  metaTx?: MetaTransactionData
}) => {
  const web3ReadOnly = useWeb3ReadOnly()
  const wallet = useWallet()
  const walletAddress = wallet?.address.toLowerCase() as undefined | `0x${string}`

  return useMemo(
    () =>
      modAddress && roleKey && metaTx && walletAddress && web3ReadOnly
        ? encodeExecuteThroughRole(modAddress, roleKey, metaTx, walletAddress, web3ReadOnly)
        : undefined,
    [modAddress, roleKey, metaTx, walletAddress, web3ReadOnly],
  )
}

const encodeExecuteThroughRole = (
  modAddress: `0x${string}`,
  roleKey: `0x${string}`,
  metaTx: MetaTransactionData,
  from: `0x${string}`,
  provider: JsonRpcProvider,
): Transaction => {
  const rolesModifier = getModuleInstance(KnownContracts.ROLES_V2, modAddress, provider)
  const data = rolesModifier.interface.encodeFunctionData('execTransactionWithRole', [
    metaTx.to,
    BigInt(metaTx.value),
    metaTx.data,
    metaTx.operation || 0,
    roleKey,
    true,
  ])

  return {
    to: modAddress,
    data,
    value: '0',
    from,
  }
}

const checkCondition = async (
  modAddress: `0x${string}`,
  roleKey: `0x${string}`,
  metaTx: MetaTransactionData,
  from: `0x${string}`,
  provider: JsonRpcProvider,
) => {
  const rolesModifier = getModuleInstance(KnownContracts.ROLES_V2, modAddress, provider)
  try {
    await rolesModifier.execTransactionWithRole.estimateGas(
      metaTx.to,
      BigInt(metaTx.value),
      metaTx.data,
      metaTx.operation || 0,
      roleKey,
      false,
      { from },
    )

    return Status.Ok
  } catch (e: any) {
    const error = rolesModifier.interface.getError(e.data.slice(0, 10))
    if (error === null || error.name !== 'ConditionViolation') {
      console.error('Unexpected error in condition check', error, e.data, e)
      return null
    }

    // status is a BigInt, convert it to enum
    const { status } = rolesModifier.interface.decodeErrorResult(error, e.data)
    return Number(status) as Status
  }
}

const useGasLimit = (
  tx?: Transaction,
): {
  gasLimit?: bigint
  gasLimitError?: Error
  gasLimitLoading: boolean
} => {
  const web3ReadOnly = useWeb3ReadOnly()

  const [gasLimit, gasLimitError, gasLimitLoading] = useAsync<bigint | undefined>(async () => {
    if (!web3ReadOnly || !tx) return

    return web3ReadOnly.estimateGas(tx)
  }, [web3ReadOnly, tx])

  useEffect(() => {
    if (gasLimitError) {
      logError(Errors._612, gasLimitError.message)
    }
  }, [gasLimitError])

  return { gasLimit, gasLimitError, gasLimitLoading }
}

const pollModuleTransactionId = async (props: {
  transactionService: string
  safeAddress: string
  txHash: string
}): Promise<string> => {
  // exponential delay between attempts for around 4 min
  return backOff(() => fetchModuleTransactionId(props), {
    startingDelay: 750,
    maxDelay: 20000,
    numOfAttempts: 19,
    retry: (e: any) => {
      console.info('waiting for transaction-service to index the module transaction', e)
      return true
    },
  })
}

const fetchModuleTransactionId = async ({
  transactionService,
  safeAddress,
  txHash,
}: {
  transactionService: string
  safeAddress: string
  txHash: string
}) => {
  const url = `${trimTrailingSlash(
    transactionService,
  )}/api/v1/safes/${safeAddress}/module-transactions/?transaction_hash=${txHash}`
  const { results } = await fetch(url).then((res) => {
    if (res.ok && res.status === 200) {
      return res.json() as Promise<any>
    } else {
      throw new Error('Error fetching Safe module transactions')
    }
  })

  if (results.length === 0) throw new Error('module transaction not found')

  return results[0].moduleTransactionId as string
}
