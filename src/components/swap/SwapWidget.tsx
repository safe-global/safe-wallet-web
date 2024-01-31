import { SafeRpcProvider } from '@/services/safe-wallet-provider/rpc'
import useSafeWalletProvider from '@/services/safe-wallet-provider/useSafeWalletProvider'
import { useState, useEffect } from 'react'
import { Container, Grid } from '@mui/material'
import useChainId from '@/hooks/useChainId'
import { useRef } from 'react';
import useSafeAddress from '@/hooks/useSafeAddress'
import useWallet from '@/hooks/wallets/useWallet'
import { SWAP_1INCH_TOKEN } from '@/config/constants'
import { FusionSDK, NetworkEnum } from "@1inch/fusion-sdk";

// usdc: 0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83
// dai: 0x44fA8E6f47987339850636F88629646662444217
// import axios from 'redaxios';

const chainId = 100


type Params = {
  sell?: {
    asset: string
    amount: string
  }
}
export const SwapWidget = ({sell}:Params) => {
  const walletProvider = useSafeWalletProvider()
  const chainId = useChainId()
  const [orders, setOrders] = useState<any[]>([])
  const [quote, setQuote] = useState<any>(null)

  const safeAddress = useSafeAddress()
  const safeProvider = useSafeWalletProvider()

  const getOrders = async () => {
    if(!safeAddress || !safeProvider) return

    const sdk = new FusionSDK({
      url: "https://api.1inch.dev/fusion",
      network: NetworkEnum.GNOSIS,
      authKey: SWAP_1INCH_TOKEN,
      blockchainProvider: new SafeRpcProvider(safeProvider)
    });

    sdk
      .getOrdersByMaker({
        address: safeAddress,
      })
      .then((orders) => {
        console.log('orders', orders)
        setOrders(orders.items)
      });
  }
    const swap = async () => {
      if(!safeAddress || !safeProvider) return

      // def checkAllowance(tokenAddress, walletAddress):
      // url = apiRequestUrl("/approve/allowance", {"tokenAddress": tokenAddress, "walletAddress": walletAddress})
      // response = requests.get(url, headers=headers)
      // data = response.json()
      // return data.get("allowance")
      //
      // const orders = await httpCall()
      const sdk = new FusionSDK({
        url: "https://api.1inch.dev/fusion",
        network: NetworkEnum.GNOSIS,
        authKey: SWAP_1INCH_TOKEN,
        blockchainProvider: new SafeRpcProvider(safeProvider)
        // httpProvider: axios
      });

      sdk
        .placeOrder({
          toTokenAddress: "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83", // USDC
          fromTokenAddress: "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d", // wDAI
          amount: "5000000000000000", // 0.05 ETH
          walletAddress: safeAddress,
          // source: "1inch",
          // fee is an optional field
          // fee: {
          //   takingFeeBps: 100, // 1% as we use bps format, 1% is equal to 100bps
          //   takingFeeReceiver: safeAddress //  fee receiver address
          // }
        })
        .then(console.log);
      console.log('sdk', sdk)

    }

    const getQuote = async () => {
      const sdk = new FusionSDK({
        url: "https://api.1inch.dev/fusion",
        network: NetworkEnum.GNOSIS,
        authKey: SWAP_1INCH_TOKEN,
        blockchainProvider: new SafeRpcProvider(safeProvider)
      });

      sdk
        .getQuote({
          toTokenAddress: "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83", // USDC
          fromTokenAddress: "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d", // wDAI
          amount: "5000000000000000", // 0.05 ETH
        })
        .then((response) => {
          console.log('quote', response)
          setQuote(response)
        });
    }


  useEffect(() => {
    if (!walletProvider) return

    const provider = new SafeRpcProvider(walletProvider)

  }, [walletProvider])

  return (
    <Container>
        <div>1inch</div>
      <div>Token needs to have approval for 1inch aggregation router: 0x1111111254EEB25477B68fb85Ed929f73A960582</div>
      <button onClick={() => swap()}>Swap</button>
      <button onClick={() => getOrders()}>Get Orders</button>
      <button onClick={() => getQuote()}>Get Quote</button>

      {quote && (
        <div>
          <div>from: {quote.params.fromTokenAddress}</div>
          <div>to: {quote.params.toTokenAddress}</div>
          <div>amount: {quote.params.amount}</div>
          <div>price: {quote.volume.usd.fromToken}</div>
          <div>fee: {quote.volume.usd.toToken}</div>
        </div>
      )}
      {orders.map((order, index) => {
        return (
          <div key={index}>
            {order.id} <br />
            from: {order.makerAsset} <br />
            to: {order.takerAsset} <br />
            hash order: {order.orderHash} <br />
            status: {order.status} <br />
          </div>
        )
      })}
    </Container>
  )
}
