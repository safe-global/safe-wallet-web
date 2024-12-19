import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { LinkProps } from 'next/link'
import { AppRoutes } from '@/config/routes'

export const getTxLink = (
  txId: string,
  chain: ChainInfo,
  safeAddress: string,
): { href: LinkProps['href']; title: string } => {
  return {
    href: {
      pathname: AppRoutes.transactions.tx,
      query: { id: txId, safe: `${chain?.shortName}:${safeAddress}` },
    },
    title: 'View transaction',
  }
}
