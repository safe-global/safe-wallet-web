import { Paper, Grid, Typography, Box, Button } from '@mui/material'
import { getSpendingLimitContract, getSpendingLimitModuleAddress } from '@/services/contracts/spendingLimitContracts'
import { sameAddress } from '@/utils/addresses'
import Safe from '@gnosis.pm/safe-core-sdk'
import { useWeb3 } from '@/hooks/wallets/web3'
import { useSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import useChainId from '@/hooks/useChainId'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Web3Provider } from '@ethersproject/providers'
import { logError } from '@/services/exceptions'
import ErrorCodes from '@/services/exceptions/ErrorCodes'
import { BigNumber } from 'ethers'
import { NoSpendingLimits } from '@/components/settings/SpendingLimits/NoSpendingLimits'
import { SpendingLimitsTable } from '@/components/settings/SpendingLimits/SpendingLimitsTable'
import useAsync from '@/hooks/useAsync'

export const isModuleEnabled = (modules: string[], moduleAddress: string): boolean => {
  return modules?.some((module) => sameAddress(module, moduleAddress)) ?? false
}

export type SpendingLimitData = {
  beneficiary: string
  token: string
  amount: BigNumber
  nonce: BigNumber
  resetTimeMin: BigNumber
  lastResetMin: BigNumber
  spent: BigNumber
}

export const getSpendingLimits = async (
  sdk: Safe,
  provider: Web3Provider,
  safeAddress: string,
  chainId: string,
): Promise<SpendingLimitData[] | undefined> => {
  const spendingLimitModuleAddress = getSpendingLimitModuleAddress(chainId)
  if (!spendingLimitModuleAddress) return

  const isSpendingLimitEnabled = sdk.isModuleEnabled(spendingLimitModuleAddress)
  if (!isSpendingLimitEnabled) return

  try {
    const contract = getSpendingLimitContract(chainId, provider)
    const delegates = await contract.getDelegates(safeAddress, 0, 100)

    const spendingLimits = await Promise.all(
      delegates.results.map(async (delegate) => {
        const tokens = await contract.getTokens(safeAddress, delegate)
        return Promise.all(
          tokens.map(async (token) => {
            const tokenAllowance = await contract.getTokenAllowance(safeAddress, delegate, token)
            const [amount, spent, resetTimeMin, lastResetMin, nonce] = tokenAllowance

            return {
              beneficiary: delegate,
              token,
              amount,
              spent,
              resetTimeMin,
              lastResetMin,
              nonce,
            }
          }),
        )
      }),
    )
    return spendingLimits.flat()
  } catch (err) {
    logError(ErrorCodes._609, (err as Error).message)
  }
}

const SpendingLimits = () => {
  const { safeAddress } = useSafeInfo()
  const chainId = useChainId()
  const ethersProvider = useWeb3()
  const sdk = useSafeSDK()

  const [spendingLimits] = useAsync<SpendingLimitData[] | undefined>(async () => {
    if (!ethersProvider || !sdk) return

    return getSpendingLimits(sdk, ethersProvider, safeAddress, chainId)
  }, [sdk, ethersProvider, safeAddress, chainId])

  return (
    <Paper sx={{ padding: 4 }} variant="outlined">
      <Grid container direction="row" justifyContent="space-between" gap={2} mb={2}>
        <Grid item>
          <Typography variant="h4" fontWeight={700}>
            Spending limit
          </Typography>
        </Grid>
        <Grid item sm={12} md={8}>
          <Box>
            <Typography>
              You can set rules for specific beneficiaries to access funds from this Safe without having to collect all
              signatures.
            </Typography>
            <Button sx={{ marginTop: 2 }} variant="contained">
              New spending limit
            </Button>
          </Box>
        </Grid>
      </Grid>

      {spendingLimits ? <SpendingLimitsTable spendingLimits={spendingLimits} /> : <NoSpendingLimits />}
    </Paper>
  )
}

export default SpendingLimits
