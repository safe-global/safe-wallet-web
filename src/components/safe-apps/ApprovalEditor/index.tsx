import TokenIcon from '@/components/common/TokenIcon'
import useBalances from '@/hooks/useBalances'
import type { BaseTransaction } from '@safe-global/safe-apps-sdk'
import { WarningOutlined } from '@mui/icons-material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { Accordion, AccordionDetails, AccordionSummary, IconButton, Skeleton, Typography } from '@mui/material'
import { type TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { BigNumber, ethers } from 'ethers'
import { Interface, keccak256, parseUnits, toUtf8Bytes } from 'ethers/lib/utils'
import { groupBy } from 'lodash'
import css from './styles.module.css'
import useAsync from '@/hooks/useAsync'
import { getERC20TokenInfoOnChain } from '@/utils/tokens'
import { ApprovalEditorForm } from './ApprovalEditorForm'
import { useMemo } from 'react'

const approvalSigHash = keccak256(toUtf8Bytes('approve(address,uint256)')).slice(0, 10)

const erc20interface = new Interface(['function approve(address,uint256)'])

const UNLIMITED = BigNumber.from(2).pow(256).sub(1)

const Summary = ({ approvalInfos, uniqueTokenCount }: { approvalInfos: ApprovalInfo[]; uniqueTokenCount: number }) =>
  approvalInfos.length === 1 ? (
    <Typography display="inline-flex" alignItems="center" gap={1}>
      <WarningOutlined color="warning" />
      You are about to give access to <b>{approvalInfos[0].amountFormatted}</b>
      <TokenIcon logoUri={approvalInfos[0].tokenInfo?.logoUri} tokenSymbol={approvalInfos[0].tokenInfo?.symbol} />
      {approvalInfos[0].tokenInfo?.symbol}
    </Typography>
  ) : (
    <Typography display="inline-flex" alignItems="center" gap={1}>
      <WarningOutlined color="warning" />
      You are about to give access to {uniqueTokenCount} Token{uniqueTokenCount > 1 ? 's' : ''}
    </Typography>
  )

export type ApprovalInfo = {
  tokenInfo: (Omit<TokenInfo, 'logoUri' | 'name'> & { logoUri?: string }) | undefined
  tokenAddress: string
  spender: any
  amount: any
  amountFormatted: string
}

export const ApprovalEditor = ({
  txs,
  updateTxs,
}: {
  txs: BaseTransaction[]
  updateTxs: (txs: BaseTransaction[]) => void
}) => {
  const { balances } = useBalances()

  const approvalTxs = useMemo(() => txs.filter((tx) => tx.data.startsWith(approvalSigHash)), [txs])

  const [approvalInfos, error, loading] = useAsync(
    async () =>
      Promise.all(
        approvalTxs.map(async (tx) => {
          const [spender, amount] = erc20interface.decodeFunctionData('approve', tx.data)
          let tokenInfo: Omit<TokenInfo, 'name' | 'logoUri'> | undefined = balances.items.find(
            (item) => item.tokenInfo.address === tx.to,
          )?.tokenInfo

          tokenInfo = await getERC20TokenInfoOnChain(tx.to)

          return {
            tokenInfo: tokenInfo,
            tokenAddress: tx.to,
            spender: spender,
            amount: amount,
            amountFormatted: UNLIMITED.eq(amount) ? 'Unlimited' : ethers.utils.formatUnits(amount, tokenInfo?.decimals),
          }
        }),
      ),
    [balances, approvalTxs],
    false, // Do not clear data on balance updates
  )

  if (approvalTxs.length === 0) {
    return null
  }

  const uniqueTokens = groupBy(approvalTxs, (tx) => tx.to)
  const uniqueTokenCount = Object.keys(uniqueTokens).length

  const updateApprovals = (approvals: string[]) => {
    let approvalID = 0
    const updatedTxs = txs.map((tx) => {
      if (tx.data.startsWith(approvalSigHash)) {
        const newApproval = approvals[approvalID]
        const approvalInfo = approvalInfos?.[approvalID]
        if (!approvalInfo || !approvalInfo.tokenInfo) {
          // Without decimals and spender we cannot create a new tx
          return tx
        }
        approvalID++
        const decimals = approvalInfo.tokenInfo.decimals
        const newAmountWei = parseUnits(newApproval, decimals)
        return {
          to: approvalInfo.tokenAddress,
          value: '0',
          data: erc20interface.encodeFunctionData('approve', [approvalInfo.spender, newAmountWei]),
        }
      }
      return tx
    })
    updateTxs(updatedTxs)
  }

  return (
    <Accordion className={css.warningAccordion} disabled={loading}>
      <AccordionSummary
        expandIcon={
          <IconButton size="small">
            <ExpandMoreIcon color="border" />
          </IconButton>
        }
      >
        {loading ? <Skeleton /> : <Summary approvalInfos={approvalInfos || []} uniqueTokenCount={uniqueTokenCount} />}
      </AccordionSummary>
      <AccordionDetails>
        {loading ? null : <ApprovalEditorForm approvalInfos={approvalInfos || []} updateApprovals={updateApprovals} />}
      </AccordionDetails>
    </Accordion>
  )
}

export default ApprovalEditor
