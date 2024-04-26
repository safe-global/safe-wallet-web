import type { ChangeEventHandler } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Box, Button, TextField, Typography } from '@mui/material'
import { ethers } from 'ethers'

import useBalances from '@/hooks/useBalances'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'

import useSafeTransactionFlow from './useSafeTransactionFlow'

import { Card, WidgetBody, WidgetContainer } from '../styled'
import { createWeb3 } from '@/hooks/wallets/web3'
import { WETH_ADDRESS, WETH_ABI } from './constants'

const WrappedEth = () => {
  const onTxSubmit = useSafeTransactionFlow()

  const { balances } = useBalances()
  const { safeAddress } = useSafeInfo()
  const wallet = useWallet()

  const [wrapAmount, setWrapAmount] = useState('')
  const [unwrapAmount, setUnwrapAmount] = useState('')
  const [wethBalance, setWethBalance] = useState('')

  const getWethContract = useCallback(async () => {
    if (!wallet) return null

    const provider = createWeb3(wallet.provider)
    const signer = await provider.getSigner()

    return new ethers.Contract(WETH_ADDRESS, WETH_ABI, signer)
  }, [wallet])

  const getWethBalance = useCallback(async () => {
    const wethContract = await getWethContract()

    if (!safeAddress || !wethContract) return null

    try {
      const weiBalance = await wethContract.balanceOf(safeAddress)
      const balance = Number(ethers.formatEther(weiBalance))

      return balance
    } catch (err) {
      // @todo: handle error, show error message
      console.log(err)
    }
  }, [getWethContract, safeAddress])

  const displayWethBalance = useCallback(async () => setWethBalance(`${await getWethBalance()}`), [getWethBalance])

  useEffect(() => {
    displayWethBalance()
  }, [wallet, getWethContract, getWethBalance, displayWethBalance])

  const getEthBalance = () => {
    const item = balances.items.find((item) => item.tokenInfo.symbol === 'ETH')

    if (!item) return null

    const balance = item.balance
    const formattedBalance = ethers.formatUnits(balance, item.tokenInfo.decimals)

    return Number(formattedBalance)
  }

  const submitWethTx = (isWrap: boolean) => async () => {
    try {
      const wethContract = await getWethContract()

      if (!wethContract) {
        throw new Error('WETH contract is not available')
      }

      const amount = isWrap ? wrapAmount : unwrapAmount

      if (!amount) {
        throw new Error('Amount is required')
      }

      const amountInWei = ethers.parseEther(amount)

      const method = isWrap ? 'deposit' : 'withdraw'
      const params = isWrap ? [] : [amountInWei]
      const encodedFunctionData = wethContract.interface.encodeFunctionData(method, params)

      const txValue = isWrap ? amountInWei : ethers.parseEther('0')

      const tx = {
        to: WETH_ADDRESS,
        value: txValue as unknown as string,
        data: encodedFunctionData,
      }

      await onTxSubmit(tx)

      isWrap ? setWrapAmount('') : setUnwrapAmount('')
    } catch (err) {}
  }

  const onChangeWrapAmount: ChangeEventHandler<HTMLInputElement> = (e) => setWrapAmount(e.target.value)
  const onChangeUpWrapAmmount: ChangeEventHandler<HTMLInputElement> = (e) => setUnwrapAmount(e.target.value)

  return (
    <WidgetContainer>
      <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
        Wrapped ETH
      </Typography>

      <WidgetBody>
        <Card>
          <Typography component="h3" variant="subtitle1" fontWeight={700} mb={1}>
            Your ETH balance is {getEthBalance() || '...'}
          </Typography>

          {/* Wrap ETH */}
          <Box display="flex" mb={3} gap={2}>
            <TextField label="Amount" value={wrapAmount} onChange={onChangeWrapAmount} />

            <Button variant="contained" onClick={submitWethTx(true)}>
              Wrap
            </Button>
          </Box>

          <Typography component="h3" variant="subtitle1" fontWeight={700} mb={1}>
            Your WETH balance is {wethBalance || '...'}
          </Typography>

          {/* Unwrap ETH */}
          <Box display="flex" gap={2} onClick={submitWethTx(false)}>
            <TextField label="Amount" value={unwrapAmount} onChange={onChangeUpWrapAmmount} />

            <Button variant="contained">Unwrap</Button>
          </Box>
        </Card>
      </WidgetBody>
    </WidgetContainer>
  )
}

export default WrappedEth
