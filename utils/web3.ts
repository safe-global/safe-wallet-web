import Web3 from 'web3'
import semverSatisfies from 'semver/functions/satisfies'
import Web3Adapter from '@gnosis.pm/safe-web3-lib'
import Safe from "@gnosis.pm/safe-core-sdk";

let web3: Web3 = new Web3(Web3.givenProvider)
export const getWeb3 = (): Web3 => web3

export const getWeb3Adapter = (signerAddress: string): Web3Adapter => {
  return new Web3Adapter({
    web3: getWeb3(),
    signerAddress,
  })
}

// TODO: Should we store this globally or instantiate on the fly?
export const getSafeSDK = async (signerAddress: string, safeAddress: string, safeVersion: string): Promise<Safe> => {
  const networkId = await getWeb3().eth.getChainId()
  const ethAdapter = getWeb3Adapter(signerAddress)

  let isL1SafeMasterCopy: boolean
  if (semverSatisfies(safeVersion, '<1.3.0')) {
    isL1SafeMasterCopy = true
  } else {
    isL1SafeMasterCopy = networkId === 1
  }

  return await Safe.create({
    ethAdapter,
    safeAddress,
    isL1SafeMasterCopy,
  })
}