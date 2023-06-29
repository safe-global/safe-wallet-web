import { type ReactElement, useMemo, useState, useCallback, useContext, useEffect } from 'react'
import { type TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { useVisibleBalances } from '@/hooks/useVisibleBalances'
import useAddressBook from '@/hooks/useAddressBook'
import useChainId from '@/hooks/useChainId'
import { getSafeTokenAddress } from '@/components/common/SafeTokenWidget'
import useIsSafeTokenPaused from '@/hooks/useIsSafeTokenPaused'
import useIsOnlySpendingLimitBeneficiary from '@/hooks/useIsOnlySpendingLimitBeneficiary'
import { useAppSelector } from '@/store'
import { selectSpendingLimits } from '@/store/spendingLimitsSlice'
import useWallet from '@/hooks/wallets/useWallet'
import { FormProvider, useForm } from 'react-hook-form'
import useSpendingLimit from '@/hooks/useSpendingLimit'
import { BigNumber } from '@ethersproject/bignumber'
import { sameAddress } from '@/utils/addresses'
import { Box, Button, CardActions, Divider, FormControl, Grid, SvgIcon, Typography } from '@mui/material'
import TokenIcon from '@/components/common/TokenIcon'
import AddressBookInput from '@/components/common/AddressBookInput'
import AddressInputReadOnly from '@/components/common/AddressInputReadOnly'
import InfoIcon from '@/public/images/notifications/info.svg'
import SpendingLimitRow from '@/components/tx/SpendingLimitRow'
import { TokenTransferFields, type TokenTransferParams, TokenTransferType } from '.'
import TxCard from '../../common/TxCard'
import { formatVisualAmount, safeFormatUnits } from '@/utils/formatters'
import commonCss from '@/components/tx-flow/common/styles.module.css'
import TokenAmountInput, { TokenAmountFields } from '@/components/common/TokenAmountInput'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'

export const AutocompleteItem = (item: { tokenInfo: TokenInfo; balance: string }): ReactElement => (
  <Grid container alignItems="center" gap={1}>
    <TokenIcon logoUri={item.tokenInfo.logoUri} tokenSymbol={item.tokenInfo.symbol} />

    <Grid item xs>
      <Typography variant="body2">{item.tokenInfo.name}</Typography>

      <Typography variant="caption" component="p">
        {formatVisualAmount(item.balance, item.tokenInfo.decimals)} {item.tokenInfo.symbol}
      </Typography>
    </Grid>
  </Grid>
)

const CreateTokenTransfer = ({
  params,
  onSubmit,
  txNonce,
}: {
  params: TokenTransferParams
  onSubmit: (data: TokenTransferParams) => void
  txNonce?: number
}): ReactElement => {
  const disableSpendingLimit = txNonce !== undefined
  const { balances } = useVisibleBalances()
  const addressBook = useAddressBook()
  const chainId = useChainId()
  const safeTokenAddress = getSafeTokenAddress(chainId)
  const isSafeTokenPaused = useIsSafeTokenPaused()
  const isOnlySpendingLimitBeneficiary = useIsOnlySpendingLimitBeneficiary()
  const spendingLimits = useAppSelector(selectSpendingLimits)
  const wallet = useWallet()
  const { setNonce } = useContext(SafeTxContext)
  const [recipientFocus, setRecipientFocus] = useState(!params.recipient)

  useEffect(() => {
    if (txNonce) {
      setNonce(txNonce)
    }
  }, [setNonce, txNonce])

  const formMethods = useForm<TokenTransferParams>({
    defaultValues: {
      ...params,
      [TokenTransferFields.type]: disableSpendingLimit
        ? TokenTransferType.multiSig
        : isOnlySpendingLimitBeneficiary
        ? TokenTransferType.spendingLimit
        : params.type,
    },
    mode: 'onChange',
    delayError: 500,
  })

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = formMethods

  const recipient = watch(TokenTransferFields.recipient)

  // Selected token
  const tokenAddress = watch(TokenAmountFields.tokenAddress)
  const selectedToken = tokenAddress
    ? balances.items.find((item) => item.tokenInfo.address === tokenAddress)
    : undefined

  const type = watch(TokenTransferFields.type)
  const spendingLimit = useSpendingLimit(selectedToken?.tokenInfo)
  const isSpendingLimitType = type === TokenTransferType.spendingLimit
  const spendingLimitAmount = spendingLimit ? BigNumber.from(spendingLimit.amount).sub(spendingLimit.spent) : undefined
  const totalAmount = BigNumber.from(selectedToken?.balance || 0)
  const maxAmount = isSpendingLimitType
    ? spendingLimitAmount && totalAmount.gt(spendingLimitAmount)
      ? spendingLimitAmount
      : totalAmount
    : totalAmount

  const balancesItems = useMemo(() => {
    return isOnlySpendingLimitBeneficiary
      ? balances.items.filter(({ tokenInfo }) => {
          return spendingLimits?.some(({ beneficiary, token }) => {
            return sameAddress(beneficiary, wallet?.address || '') && sameAddress(tokenInfo.address, token.address)
          })
        })
      : balances.items
  }, [balances.items, isOnlySpendingLimitBeneficiary, spendingLimits, wallet?.address])

  const onMaxAmountClick = useCallback(() => {
    if (!selectedToken) return

    const amount =
      isSpendingLimitType && spendingLimitAmount && spendingLimitAmount.lte(selectedToken.balance)
        ? spendingLimitAmount.toString()
        : selectedToken.balance

    setValue(TokenAmountFields.amount, safeFormatUnits(amount, selectedToken.tokenInfo.decimals), {
      shouldValidate: true,
    })
  }, [isSpendingLimitType, selectedToken, setValue, spendingLimitAmount])

  const isSafeTokenSelected = sameAddress(safeTokenAddress, tokenAddress)
  const isDisabled = isSafeTokenSelected && isSafeTokenPaused
  const isAddressValid = !!recipient && !errors[TokenTransferFields.recipient]

  return (
    <TxCard>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)} className={commonCss.form}>
          <FormControl fullWidth sx={{ mt: 1 }}>
            {addressBook[recipient] ? (
              <Box
                onClick={() => {
                  setValue(TokenTransferFields.recipient, '')
                  setRecipientFocus(true)
                }}
              >
                <AddressInputReadOnly label="Sending to" address={recipient} />
              </Box>
            ) : (
              <AddressBookInput
                name={TokenTransferFields.recipient}
                label="Recipient address or ENS"
                canAdd={isAddressValid}
                focused={recipientFocus}
              />
            )}
          </FormControl>

          <TokenAmountInput
            balances={balancesItems}
            selectedToken={selectedToken}
            maxAmount={maxAmount}
            onMaxAmountClick={onMaxAmountClick}
          />

          {isDisabled && (
            <Box display="flex" alignItems="center" mt={-2} mb={3}>
              <SvgIcon component={InfoIcon} color="error" fontSize="small" />
              <Typography variant="body2" color="error" ml={0.5}>
                $SAFE is currently non-transferable.
              </Typography>
            </Box>
          )}

          {!disableSpendingLimit && !!spendingLimitAmount && (
            <FormControl fullWidth sx={{ mt: 3 }}>
              <SpendingLimitRow availableAmount={spendingLimitAmount} selectedToken={selectedToken?.tokenInfo} />
            </FormControl>
          )}

          <Divider className={commonCss.nestedDivider} />

          <CardActions>
            <Button variant="contained" type="submit" disabled={isDisabled}>
              Next
            </Button>
          </CardActions>
        </form>
      </FormProvider>
    </TxCard>
  )
}

export default CreateTokenTransfer
