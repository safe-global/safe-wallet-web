import { Grid, IconButton, SvgIcon, Tooltip, Typography } from '@mui/material'
import { Interface } from 'ethers/lib/utils'
import { useContext } from 'react'
import type { ReactElement } from 'react'
import type { Delay } from '@gnosis.pm/zodiac'
import type { TransactionAddedEvent } from '@gnosis.pm/zodiac/dist/cjs/types/Delay'

import RocketIcon from '@/public/images/transactions/rocket.svg'
import ErrorIcon from '@/public/images/notifications/error.svg'
import { useDelayModifierQueue } from './useDelayModifierQueue'
import { getSafeContractDeployment } from '@/services/contracts/deployments'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { memoize } from 'lodash'
import { useWeb3 } from '@/hooks/wallets/web3'
import CheckWallet from '@/components/common/CheckWallet'
import { CancelRecovery } from '@/components/tx-flow/flows/CancelRecovery'
import { TxModalContext } from '@/components/tx-flow'

function getSigHash(data: string) {
  return data.substring(0, 10)
}

const getFunctionFragment = memoize(
  (safeInterface: Interface, data: string) => {
    const sigHash = getSigHash(data)

    return Object.values(safeInterface.functions).find((fn) => {
      return sigHash === safeInterface.getSighash(fn)
    })
  },
  (_, data) => getSigHash(data),
)

export function RecoveryProposals({
  delayModifier,
  isRecoverer,
}: {
  delayModifier: Delay
  isRecoverer?: boolean
}): ReactElement | null {
  const { setTxFlow } = useContext(TxModalContext)
  const [queue] = useDelayModifierQueue(delayModifier)
  const chain = useCurrentChain()
  const { safe } = useSafeInfo()
  const web3 = useWeb3()

  if (!chain || !queue) {
    return null
  }

  const safeInterface = new Interface(getSafeContractDeployment(chain, safe.version)?.abi ?? [])

  const onExecute = async (event: TransactionAddedEvent) => {
    if (!web3) {
      return
    }

    const { to, value, data, operation } = event.args

    const signer = web3.getSigner()

    await delayModifier.connect(signer).executeNextTx(to, value, data, operation)
  }

  const onCancel = async (event: TransactionAddedEvent) => {
    setTxFlow(<CancelRecovery delayModifier={delayModifier} recovery={event} />)
  }

  return (
    <Grid container spacing={3}>
      <Grid item lg={4} xs={12}>
        <Typography variant="h4" fontWeight={700}>
          Recovery proposals
        </Typography>
      </Grid>

      <Grid item xs>
        <ol>
          {queue.map((item) => {
            const queuedNonce = item.args.queueNonce.toString()

            const functionFragment = getFunctionFragment(safeInterface, item.args.data)
            const args = functionFragment ? safeInterface.decodeFunctionData(functionFragment, item.args.data) : []

            const formattedMethod = functionFragment
              ? `${functionFragment.name}(${functionFragment.inputs
                  .map(({ name }, i) => `${name}: ${args[i]}`)
                  .join(', ')})`
              : 'Unknown'

            return (
              <li key={queuedNonce} value={queuedNonce}>
                {formattedMethod}{' '}
                {isRecoverer ? (
                  <CheckWallet allowNonOwner>
                    {(isOk) => (
                      <Tooltip title={isOk ? 'Recover Safe Account' : undefined} arrow placement="top">
                        <span>
                          <IconButton onClick={() => onExecute(item)} color="primary" size="small" disabled={!isOk}>
                            <SvgIcon component={RocketIcon} inheritViewBox fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </CheckWallet>
                ) : (
                  <CheckWallet>
                    {(isOk) => (
                      <Tooltip title={isOk ? 'Cancel recovery' : undefined} arrow placement="top">
                        <span>
                          <IconButton onClick={() => onCancel(item)} color="error" size="small" disabled={!isOk}>
                            <SvgIcon component={ErrorIcon} inheritViewBox fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </CheckWallet>
                )}
              </li>
            )
          })}
        </ol>
      </Grid>
    </Grid>
  )
}
