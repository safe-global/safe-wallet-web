import Web3 from 'web3'
import { provider as Provider } from 'web3-core'
import semverSatisfies from 'semver/functions/satisfies'
import Web3Adapter from '@gnosis.pm/safe-web3-lib'
import Safe from "@gnosis.pm/safe-core-sdk";
import {RPC_AUTHENTICATION, RpcUri} from "@gnosis.pm/safe-react-gateway-sdk";

import {INFURA_TOKEN} from "config/constants";

let web3ReadOnly: Web3
export const getWeb3ReadOnly = (): Web3 => web3ReadOnly
export const setWeb3ReadOnly = (provider: Provider): void => {
  web3ReadOnly = new Web3(provider)
}

let web3: Web3 = new Web3(Web3.givenProvider)
export const getWeb3 = (): Web3 => web3
export const setWeb3 = (provider: Provider): void => {
  web3 = new Web3(provider)
}

export const getWeb3Adapter = (signerAddress: string): Web3Adapter => {
  return new Web3Adapter({
    web3: getWeb3(),
    signerAddress,
  })
}

let safeSDK: Safe
export const getSafeSDK = (): Safe => safeSDK
export const setSafeSDK = async (signerAddress: string, safeAddress: string, safeVersion: string): Promise<void> => {
  const networkId = await getWeb3().eth.getChainId()
  const ethAdapter = getWeb3Adapter(signerAddress)

  let isL1SafeMasterCopy: boolean
  if (semverSatisfies(safeVersion, '<1.3.0')) {
    isL1SafeMasterCopy = true
  } else {
    isL1SafeMasterCopy = networkId === 1
  }

  safeSDK = await Safe.create({
    ethAdapter,
    safeAddress,
    isL1SafeMasterCopy,
  })
}

const formatRpcServiceUrl = ({ authentication, value }: RpcUri, TOKEN: string): string => {
  const needsToken = authentication === RPC_AUTHENTICATION.API_KEY_PATH
  return needsToken ? `${value}${TOKEN}` : value
}

export const getRpcServiceUrl = (rpcUri: RpcUri): string => {
  return formatRpcServiceUrl(rpcUri, INFURA_TOKEN)
}