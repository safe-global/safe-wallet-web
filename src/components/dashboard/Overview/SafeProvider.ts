import { SafeAppProvider } from '@safe-global/safe-apps-provider'
import { EthereumProvider, JsonRpcRequest } from '@cowprotocol/widget-react'
import SafeAppsSDK, { SafeInfo } from '@safe-global/safe-apps-sdk'
import { BrowserProvider } from 'ethers'

type CallbackFunction = (...args: any[]) => void

function isCallbackFunction(args: unknown): args is CallbackFunction {
  return typeof args === 'function'
}

function transformToCallback(args: unknown): CallbackFunction | null {
  if (isCallbackFunction(args)) {
    return args
  }
  return null
}

export class SafeProvider implements EthereumProvider {
  safeAppProvider: SafeAppProvider

  constructor(safe: SafeInfo, sdk: SafeAppsSDK) {
    this.safeAppProvider = new SafeAppProvider(safe, sdk)
  }

  on(event: string, args: unknown): void {
    this.safeAppProvider.on(event, transformToCallback(args) ?? (() => {}))
  }
  request<T>(params: JsonRpcRequest): Promise<T> {
    return this.safeAppProvider.request(params)
  }
  enable(): Promise<void> {
    return this.safeAppProvider.connect()
  }
}

export class SafeProvider2 implements EthereumProvider {
  web3Provider: BrowserProvider

  constructor(safe: SafeInfo, sdk: SafeAppsSDK) {
    this.web3Provider = new BrowserProvider(new SafeAppProvider(safe, sdk))
  }

  on(event: string, args: unknown): void {
    this.web3Provider.on(event, transformToCallback(args) ?? (() => {}))
  }
  request<T>(params: JsonRpcRequest): Promise<T> {
    return this.web3Provider.send(params.method, params.params)
  }
  enable(): Promise<void> {
    return this.web3Provider.send('eth_requestAccounts', [])
  }
}
