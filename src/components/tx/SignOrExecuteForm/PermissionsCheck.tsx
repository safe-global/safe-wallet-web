import { useContext, useMemo, useState } from 'react'
import {
  type ChainId,
  chains,
  fetchRolesMod,
  Clearance,
  type RoleSummary,
  ExecutionOptions,
  Status,
} from 'zodiac-roles-deployments'
import { OperationType, type MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { decodeBytes32String, type JsonRpcProvider } from 'ethers'
import { KnownContracts, getModuleInstance } from '@gnosis.pm/zodiac'

import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { Box, Button, CardActions, Chip, CircularProgress, Divider, Typography } from '@mui/material'
import commonCss from '@/components/tx-flow/common/styles.module.css'
import CheckWallet from '@/components/common/CheckWallet'
import TxCard from '@/components/tx-flow/common/TxCard'
import { getTransactionTrackingType } from '@/services/analytics/tx-tracking'
import { TX_EVENTS } from '@/services/analytics/events/transactions'
import { trackEvent } from '@/services/analytics'
import useChainId from '@/hooks/useChainId'
import useSafeInfo from '@/hooks/useSafeInfo'
import useAsync from '@/hooks/useAsync'
import WalletRejectionError from './WalletRejectionError'
import ErrorMessage from '../ErrorMessage'
import useWallet from '@/hooks/wallets/useWallet'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'

const Role = ({ children }: { children: string }) => {
  let humanReadableRoleKey = children
  try {
    humanReadableRoleKey = decodeBytes32String(children)
  } catch (e) {}

  return <Chip label={humanReadableRoleKey} />
}

const PermissionsCheck: React.FC<{}> = ({}) => {
  const chainId = useChainId()
  const { safeTx, safeTxError } = useContext(SafeTxContext)
  const [isRejectedByUser, setIsRejectedByUser] = useState<boolean>(false)

  const roles = useRoles(safeTx?.data)
  const allowingRole = roles.find((role) => role.status === Status.Ok)

  // If a user has multiple roles, we should prioritize the one that allows the transaction's to address (and function selector)
  const mostLikelyRole =
    allowingRole ||
    roles.find((role) => role.status !== Status.TargetAddressNotAllowed && role.status !== Status.FunctionNotAllowed) ||
    roles.find((role) => role.status !== Status.TargetAddressNotAllowed) ||
    roles[0]

  const isPending = false

  const handleExecute = async () => {
    setIsRejectedByUser(false)

    const txId = 'TODO'

    // Track tx event
    const txType = await getTransactionTrackingType(chainId, txId)
    trackEvent({ ...TX_EVENTS.EXECUTE_THROUGH_ROLE, label: txType })
  }

  // Only render the card if the connected wallet is a member of any role
  if (roles.length === 0) {
    return null
  }

  return (
    <TxCard>
      <Typography variant="h5">Execute through role</Typography>

      {allowingRole && (
        <Typography>
          As a member of the <Role>{allowingRole.roleKey}</Role> role you can execute this transaction immediately.
        </Typography>
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
          console.log('dynamic check', entry.status, metaTx, walletAddress)
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

    // status is a BigInt
    const { status } = rolesModifier.interface.decodeErrorResult(error, e.data)
    return Number(status) as Status
  }
}
