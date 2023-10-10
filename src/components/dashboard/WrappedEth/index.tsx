import { useEffect, useState } from 'react'
import { Box, Button, TextField, Typography } from '@mui/material'
import { Card, WidgetBody, WidgetContainer } from '../styled'
import useSafeTransactionFlow from './useSafeTransactionFlow'
import useBalances from '@/hooks/useBalances'
import useWallet from '@/hooks/wallets/useWallet'
import { createWeb3 } from '@/hooks/wallets/web3'
import useSafeInfo from '@/hooks/useSafeInfo'
import { ethers } from 'ethers'

const WrappedEth = () => {
  const onTxSubmit = useSafeTransactionFlow()
  const [wethBalance, setWethBalance] = useState(0)
  const [wrapAmount, setWrapAmount] = useState('')
  const [unwrapAmount, setUnwrapAmount] = useState('')
  const { balances } = useBalances()
  const { safeAddress } = useSafeInfo()

  const wethABIString =
    '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}]'
  const wethABI = JSON.parse(wethABIString)
  const wethAddress = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'
  const wallet = useWallet()

  const wrapEth = () => {
    if (!wallet) return
    const provider = createWeb3(wallet.provider)
    const signer = provider.getSigner()
    const wethContract = new ethers.Contract(wethAddress, wethABI, signer)
    let amountInWei = ethers.utils.parseEther(wrapAmount)

    const encodedFunctionData = wethContract.interface.encodeFunctionData('deposit')

    const tx = {
      to: wethAddress,
      value: amountInWei.toString(),
      data: encodedFunctionData,
    }

    onTxSubmit(tx)
    setWrapAmount('')
  }

  const unwrapEth = () => {
    if (!wallet) return
    const provider = createWeb3(wallet.provider)
    const signer = provider.getSigner()
    const wethContract = new ethers.Contract(wethAddress, wethABI, signer)
    let amountInWei = ethers.utils.parseEther(unwrapAmount)

    const encodedFunctionData = wethContract.interface.encodeFunctionData('withdraw', [amountInWei])

    const tx = {
      to: wethAddress,
      value: ethers.utils.parseEther('0').toString(),
      data: encodedFunctionData,
    }

    onTxSubmit(tx)
    setUnwrapAmount('')
  }

  useEffect(() => {
    const getWethBalance = async () => {
      if (!wallet) return
      const provider = createWeb3(wallet.provider)
      const wethContract = new ethers.Contract(wethAddress, wethABI, provider)
      const weiBalance = await wethContract.balanceOf(safeAddress)
      const balance = Number(ethers.utils.formatEther(weiBalance))
      setWethBalance(balance)
    }
    getWethBalance()
  }, [wallet, wethABI, safeAddress])

  const item = (balances.items || [])[0]
  const bal = Number(item?.balance) / 10 ** item?.tokenInfo.decimals

  return (
    <WidgetContainer>
      <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
        Wrapped ETH
      </Typography>

      <WidgetBody>
        <Card>
          <Typography component="h3" variant="subtitle1" fontWeight={700} mb={1}>
            Your ETH balance is {bal}
          </Typography>

          {/* Wrap ETH */}
          <Box display="flex" mb={3} gap={2}>
            <TextField label="Amount" value={wrapAmount} onChange={(event) => setWrapAmount(event.target.value)} />

            <Button onClick={wrapEth} variant="contained">
              Wrap
            </Button>
          </Box>

          <Typography component="h3" variant="subtitle1" fontWeight={700} mb={1}>
            Your WETH balance is {wethBalance}
          </Typography>

          {/* Unwrap ETH */}
          <Box display="flex" gap={2}>
            <TextField label="Amount" value={unwrapAmount} onChange={(event) => setUnwrapAmount(event.target.value)} />

            <Button onClick={unwrapEth} variant="contained">
              Unwrap
            </Button>
          </Box>
        </Card>
      </WidgetBody>
    </WidgetContainer>
  )
}

export default WrappedEth
