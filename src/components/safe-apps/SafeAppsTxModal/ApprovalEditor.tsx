import PrefixedEthHashInfo from '@/components/common/EthHashInfo'
import useBalances from '@/hooks/useBalances'
import type { BaseTransaction } from '@gnosis.pm/safe-apps-sdk'
import { WarningOutlined } from '@mui/icons-material'
import { Accordion, AccordionDetails, AccordionSummary, Grid, Typography } from '@mui/material'
import { BigNumber, ethers } from 'ethers'
import { Interface, keccak256, toUtf8Bytes } from 'ethers/lib/utils'
import { groupBy } from 'lodash'
import { useMemo } from 'react'

const approvalSigHash = keccak256(toUtf8Bytes('approve(address,uint256)')).slice(0, 10)

const erc20interface = new Interface(['function approve(address,uint256)'])

const UNLIMITED = BigNumber.from(2).pow(256).sub(1)

console.log(UNLIMITED.toString())

export const ApprovalEditor = ({
  txs,
  updateTxs,
}: {
  txs: BaseTransaction[]
  updateTxs: (txs: BaseTransaction[]) => void
}) => {
  const { balances } = useBalances()

  const approvalTxs = txs.filter((tx) => tx.data.startsWith(approvalSigHash))

  const approvalInfos = useMemo(
    () =>
      approvalTxs.map((tx) => {
        const [spender, amount] = erc20interface.decodeFunctionData('approve', tx.data)
        return {
          tokenInfo: balances.items.find((item) => item.tokenInfo.address === tx.to)?.tokenInfo,
          tokenAddress: tx.to,
          spender: spender,
          amount: amount,
        }
      }),

    [balances, approvalTxs],
  )

  if (approvalTxs.length === 0) {
    return null
  }

  const uniqueTokens = groupBy(approvalTxs, (tx) => tx.to)
  const uniqueTokenCount = Object.keys(uniqueTokens).length

  return (
    <Accordion
      sx={{
        border: ({ palette }) => `1px ${palette.warning.main} solid`,
        backgroundColor: ({ palette }) => palette.warning,
      }}
    >
      <AccordionSummary>
        <WarningOutlined color="warning" />
        You are about to give access to {uniqueTokenCount} Token{uniqueTokenCount > 1 ? 's' : ''}
      </AccordionSummary>
      <AccordionDetails>
        <Grid container direction="column">
          {approvalInfos.map((tx) => (
            <Grid container key={tx.tokenAddress + tx.spender}>
              <Grid item>
                <PrefixedEthHashInfo address={tx.tokenAddress} />
              </Grid>
              <Grid item>
                <Typography>
                  Amount:{' '}
                  {UNLIMITED.eq(tx.amount) ? 'Unlimited' : ethers.utils.formatUnits(tx.amount, tx.tokenInfo?.decimals)}
                </Typography>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  )
}
