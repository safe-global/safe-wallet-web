import useAsync, { type AsyncResult } from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import { Errors, logError } from '@/services/exceptions'
import { getMasterCopies, type MasterCopy as SdkMasterCopy } from 'safe-client-gateway-sdk'

export enum MasterCopyDeployer {
  GNOSIS = 'Gnosis',
  CIRCLES = 'Circles',
}

export type MasterCopy = SdkMasterCopy & {
  deployer: MasterCopyDeployer
  deployerRepoUrl: string
}

const extractMasterCopyInfo = (mc: SdkMasterCopy): MasterCopy => {
  const isCircles = mc.version.toLowerCase().includes(MasterCopyDeployer.CIRCLES.toLowerCase())
  const dashIndex = mc.version.indexOf('-')

  const masterCopy = {
    address: mc.address,
    version: !isCircles ? mc.version : mc.version.substring(0, dashIndex),
    deployer: !isCircles ? MasterCopyDeployer.GNOSIS : MasterCopyDeployer.CIRCLES,
    deployerRepoUrl: !isCircles
      ? 'https://github.com/gnosis/safe-contracts/releases'
      : 'https://github.com/CirclesUBI/safe-contracts/releases',
  }
  return masterCopy
}

export const useMasterCopies = (): AsyncResult<MasterCopy[]> => {
  const chainId = useChainId()

  return useAsync(async () => {
    try {
      const { data, error } = await getMasterCopies({ path: { chainId } })
      if (error) {
        throw error
      }
      return data.map(extractMasterCopyInfo)
    } catch (error) {
      logError(Errors._619, error)
      throw error
    }
  }, [chainId])
}
