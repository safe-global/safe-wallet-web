import type { ITokenList } from '@/components/safe-apps/types'
import fuji from './fuji'
import goerli from './goerli'

interface ILists {
  [key: number]: ITokenList
}

const tokenLists: ILists = {
  43113: fuji,
  5: goerli,
}

export default tokenLists
