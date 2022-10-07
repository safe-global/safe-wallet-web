import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import { Errors, logError } from '@/services/exceptions'
import type { MasterCopyReponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { getMasterCopies } from '@gnosis.pm/safe-react-gateway-sdk'

export enum MasterCopyDeployer {
  GNOSIS = 'Gnosis',
  CIRCLES = 'Circles',
}

export type MasterCopy = MasterCopyReponse[number] & {
  deployer: MasterCopyDeployer
  deployerRepoUrl: string
}

const extractMasterCopyInfo = (mc: MasterCopyReponse[number]): MasterCopy => {
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

export const useMasterCopies = () => {
  const chainId = useChainId()
  const fetchMasterCopies = async (): Promise<MasterCopy[] | undefined> => {
    try {
      const res = await getMasterCopies(chainId)
      return res.map(extractMasterCopyInfo)
    } catch (error) {
      logError(Errors._620, (error as Error).message)
    }
  }
  return useAsync(fetchMasterCopies, [chainId])
}
