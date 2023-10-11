import { useEffect, useState } from 'react'
import { Box, Button, TextField, Typography } from '@mui/material'
import { ethers } from 'ethers'
import { Card, WidgetBody, WidgetContainer } from '../styled'
import useBalances from '@/hooks/useBalances'
import useWallet from '@/hooks/wallets/useWallet'
import { createWeb3 } from '@/hooks/wallets/web3'
import useSafeInfo from '@/hooks/useSafeInfo'
import useSafeTransactionFlow from './useSafeTransactionFlow'

const WrappedEth = () => {
  const onTxSubmit = useSafeTransactionFlow()

  const { balances } = useBalances()
  const { safeAddress } = useSafeInfo()
  const wallet = useWallet()

  const [wethBalance, setWethBalance] = useState('')
  const [wrapAmount, setWrapAmount] = useState('')
  const [unwrapAmount, setUnwrapAmount] = useState('')

  const wethABIString =
    '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}]'
  const wethABI = JSON.parse(wethABIString)
  const wethAddress = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'

  const getWethContract = () => {
    if (!wallet) return null
    const provider = createWeb3(wallet.provider)
    const signer = provider.getSigner()
    return new ethers.Contract(wethAddress, wethABI, signer)
  }

  useEffect(() => {
    const getWethBalance = async () => {
      const wethContract = getWethContract()
      if (!safeAddress || !wethContract) return null
      const weiBalance = await wethContract.balanceOf(safeAddress)
      const balance = Number(ethers.utils.formatEther(weiBalance))
      setWethBalance(`${balance}`)
    }
    getWethBalance()
  }, [wallet, wethABI, safeAddress, getWethContract])

  const getEthBalance = () => {
    const item = balances.items.find((item) => item.tokenInfo.symbol === 'GOR')
    if (!item) return
    const balance = Number(item.balance) / 10 ** item.tokenInfo.decimals
    return balance
  }

  const submitWethTx = (isWrap: boolean) => {
    const wethContract = getWethContract()
    if (!wethContract) return null

    const amount = isWrap ? wrapAmount : unwrapAmount
    const amountInWei = ethers.utils.parseEther(amount)

    const encodedFunctionData = isWrap
      ? wethContract.interface.encodeFunctionData('deposit')
      : wethContract.interface.encodeFunctionData('withdraw', [amountInWei])

    const txValue = isWrap ? amountInWei.toString() : ethers.utils.parseEther('0').toString()

    const tx = {
      to: wethAddress,
      value: txValue,
      data: encodedFunctionData,
    }

    onTxSubmit(tx)
    // Clear the input field
    isWrap ? setWrapAmount('') : setUnwrapAmount('')
  }

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
            <TextField label="Amount" value={wrapAmount} onChange={(event) => setWrapAmount(event.target.value)} />

            <Button onClick={() => submitWethTx(true)} variant="contained">
              Wrap
            </Button>
          </Box>

          <Typography component="h3" variant="subtitle1" fontWeight={700} mb={1}>
            Your WETH balance is {wethBalance || '...'}
          </Typography>

          {/* Unwrap ETH */}
          <Box display="flex" gap={2}>
            <TextField label="Amount" value={unwrapAmount} onChange={(event) => setUnwrapAmount(event.target.value)} />

            <Button onClick={() => submitWethTx(false)} variant="contained">
              Unwrap
            </Button>
          </Box>
        </Card>
      </WidgetBody>
    </WidgetContainer>
  )
}

export default WrappedEth
