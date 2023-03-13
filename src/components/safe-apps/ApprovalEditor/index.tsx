import PrefixedEthHashInfo from '@/components/common/EthHashInfo'
import TokenIcon from '@/components/common/TokenIcon'
import useBalances from '@/hooks/useBalances'
import type { BaseTransaction } from '@safe-global/safe-apps-sdk'
import { WarningOutlined } from '@mui/icons-material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EditIcon from '@/public/images/common/edit.svg'
import CheckIcon from '@mui/icons-material/Check'

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  IconButton,
  SvgIcon,
  Typography,
} from '@mui/material'
import { type TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { BigNumber, ethers } from 'ethers'
import { Interface, keccak256, parseUnits, toUtf8Bytes } from 'ethers/lib/utils'
import { groupBy } from 'lodash'
import { useMemo, useState } from 'react'
import css from './styles.module.css'
import { useForm } from 'react-hook-form'
import { shortenAddress } from '@/utils/formatters'
import { validateAmount, validateDecimalLength } from '@/utils/validation'
import NumberField from '@/components/common/NumberField'

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

type ApprovalInfo = {
  tokenInfo: TokenInfo | undefined
  tokenAddress: string
  spender: any
  amount: any
  amountFormatted: string
}

type FormData = {
  approvals: string[]
}

export const ApprovalEditor = ({
  txs,
  updateTxs,
}: {
  txs: BaseTransaction[]
  updateTxs: (txs: BaseTransaction[]) => void
}) => {
  const { balances } = useBalances()
  const [editIDx, setEditIdx] = useState(-1)

  const approvalTxs = txs.filter((tx) => tx.data.startsWith(approvalSigHash))

  const approvalInfos = useMemo(
    () =>
      approvalTxs.map((tx) => {
        const [spender, amount] = erc20interface.decodeFunctionData('approve', tx.data)
        const tokenInfo = balances.items.find((item) => item.tokenInfo.address === tx.to)?.tokenInfo
        return {
          tokenInfo: tokenInfo,
          tokenAddress: tx.to,
          spender: spender,
          amount: amount,
          amountFormatted: UNLIMITED.eq(amount) ? 'Unlimited' : ethers.utils.formatUnits(amount, tokenInfo?.decimals),
        }
      }),

    [balances, approvalTxs],
  )

  const formMethods = useForm<FormData>({
    defaultValues: {
      approvals: approvalInfos.map((info) => info.amountFormatted),
    },
    mode: 'onChange',
  })

  const {
    handleSubmit,
    setValue,
    control,
    register,
    formState: { errors },
    getValues,
  } = formMethods

  if (approvalTxs.length === 0) {
    return null
  }

  const uniqueTokens = groupBy(approvalTxs, (tx) => tx.to)
  const uniqueTokenCount = Object.keys(uniqueTokens).length

  const onSetEditing = (idx: number) => {
    setEditIdx(idx)
  }

  const onSave = () => {
    const formData = getValues('approvals')

    let approvalID = 0
    const updatedTxs = txs.map((tx) => {
      if (tx.data.startsWith(approvalSigHash)) {
        const newApproval = formData[approvalID]
        const approvalInfo = approvalInfos[approvalID]
        approvalID++
        const decimals = approvalInfo?.tokenInfo?.decimals
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
    setEditIdx(-1)
  }

  return (
    <Accordion className={css.warningAccordion}>
      <AccordionSummary
        expandIcon={
          <IconButton size="small">
            <ExpandMoreIcon color="border" />
          </IconButton>
        }
      >
        <Summary approvalInfos={approvalInfos} uniqueTokenCount={uniqueTokenCount} />
      </AccordionSummary>
      <AccordionDetails>
        <Grid container direction="column">
          {approvalInfos.map((tx, idx) => (
            <Grid
              container
              key={tx.tokenAddress + tx.spender}
              className={css.approval}
              gap="4px"
              justifyContent="space-between"
            >
              <Grid item display="flex" xs={12} md={3} flexDirection="column">
                <Typography variant="overline">Token</Typography>
                <Box display="flex" flexDirection="row" alignItems="center" gap="4px">
                  <TokenIcon logoUri={tx.tokenInfo?.logoUri} tokenSymbol={tx.tokenInfo?.symbol} />
                  <Typography>{tx.tokenInfo?.symbol || shortenAddress(tx.tokenAddress)}</Typography>
                </Box>
              </Grid>
              <Grid item display="flex" xs flexDirection="column">
                <NumberField
                  label={errors.approvals?.[idx]?.message || 'Amount'}
                  error={!!errors.approvals?.[idx]}
                  size="small"
                  disabled={editIDx !== idx}
                  InputProps={{
                    endAdornment:
                      (editIDx === -1 || idx === editIDx) &&
                      (editIDx === idx ? (
                        <IconButton size="small" onClick={onSave}>
                          <SvgIcon component={CheckIcon} />
                        </IconButton>
                      ) : (
                        <IconButton size="small" onClick={() => onSetEditing(idx)}>
                          <SvgIcon component={EditIcon} />
                        </IconButton>
                      )),
                  }}
                  {...register(`approvals.${idx}`, {
                    required: true,
                    validate: (val) => {
                      const decimals = tx.tokenInfo?.decimals
                      return validateAmount(val, true) || validateDecimalLength(val, decimals)
                    },
                  })}
                />
              </Grid>

              <Grid item display="flex" xs={4} flexDirection="column">
                <Typography variant="overline">Spender</Typography>

                <Typography>
                  <PrefixedEthHashInfo address={tx.spender} hasExplorer showAvatar={false} />{' '}
                </Typography>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  )
}

export default ApprovalEditor
