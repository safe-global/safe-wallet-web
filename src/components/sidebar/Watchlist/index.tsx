import React, { Fragment, useState, type ReactElement, useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import List from '@mui/material/List'
import Typography from '@mui/material/Typography'
import Collapse from '@mui/material/Collapse'
import Button from '@mui/material/Button'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import IconButton from '@mui/material/IconButton'
import SvgIcon from '@mui/material/SvgIcon'
import Box from '@mui/material/Box'
import { Link as MuiLink } from '@mui/material'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'

import useChains, { useCurrentChain } from '@/hooks/useChains'
import useOwnedSafes from '@/hooks/useOwnedSafes'
import useChainId from '@/hooks/useChainId'
import { useAppSelector } from '@/store'
import type { AddedSafesOnChain } from '@/store/addedSafesSlice'
import { selectAllAddedSafes } from '@/store/addedSafesSlice'
import SafeListItem from '@/components/sidebar/SafeListItem'

import { AppRoutes } from '@/config/routes'
import css from './styles.module.css'
import { sameAddress } from '@/utils/addresses'
import useSafeInfo from '@/hooks/useSafeInfo'
import LoadingIcon from '@/public/images/common/loading.svg'
import useWallet from '@/hooks/wallets/useWallet'
import useConnectWallet from '@/components/common/ConnectWallet/useConnectWallet'
import KeyholeIcon from '@/components/common/icons/KeyholeIcon'
import { VisibilityOutlined, AddOutlined } from '@mui/icons-material'

export const _shouldExpandSafeList = ({
  isCurrentChain,
  safeAddress,
  ownedSafesOnChain,
  addedSafesOnChain,
}: {
  isCurrentChain: boolean
  safeAddress: string
  ownedSafesOnChain: string[]
  addedSafesOnChain: AddedSafesOnChain
}): boolean => {
  let shouldExpand = false

  const addedAddressesOnChain = Object.keys(addedSafesOnChain)

  if (isCurrentChain && ownedSafesOnChain.some((address) => sameAddress(address, safeAddress))) {
    // Expand the Owned Safes if the current Safe is owned, but not added
    shouldExpand = !addedAddressesOnChain.some((address) => sameAddress(address, safeAddress))
  } else {
    // Expand the Owned Safes if there are no added Safes
    shouldExpand = !addedAddressesOnChain.length && ownedSafesOnChain.length <= MAX_EXPANDED_SAFES
  }

  return shouldExpand
}

const MAX_EXPANDED_SAFES = 3
const NO_WALLET_MESSAGE = 'Connect a wallet to view your Safe Accounts\n or to create a new one'
const NO_SAFE_MESSAGE = 'Create a new Safe Account or add'

const Watchlist = ({ closeDrawer }: { closeDrawer?: () => void }): ReactElement => {
  const router = useRouter()
  const chainId = useChainId()
  const currentChain = useCurrentChain()
  const { safeAddress, safe } = useSafeInfo()
  const { configs } = useChains()
  const ownedSafes = useOwnedSafes()
  const addedSafes = useAppSelector(selectAllAddedSafes)
  const wallet = useWallet()
  const handleConnect = useConnectWallet()

  const [isOpen, setIsopen] = useState<boolean>(false)
  const toggleOpen = (open: boolean) => {
    setIsopen(open)
  }

  const hasWallet = !!wallet
  const hasNoSafes = Object.keys(ownedSafes).length === 0 && Object.keys(addedSafes).length === 0
  const isWelcomePage = router.pathname === AppRoutes.welcome.index || router.pathname === AppRoutes.welcome.socialLogin
  const isSingleTxPage = router.pathname === AppRoutes.transactions.tx

  const ownedSafesOnCurrentChain = currentChain ? ownedSafes[currentChain.chainId] : []

  /*
   * Navigate to the dashboard when selecting a safe on the welcome page,
   * navigate to the history when selecting a safe on a single tx page,
   * otherwise keep the current route
   */
  const getHref = useCallback(
    (chain: ChainInfo, address: string) => {
      return {
        pathname: isWelcomePage ? AppRoutes.home : isSingleTxPage ? AppRoutes.transactions.history : router.pathname,
        query: { ...router.query, safe: `${chain.shortName}:${address}` },
      }
    },
    [isWelcomePage, isSingleTxPage, router.pathname, router.query],
  )

  const getOwnedSafesOnAllChains = () => {
    let ownedSafesOnAllChains: { safeAddress: string; chain: ChainInfo }[] = []
    for (let chain of configs) {
      const ownedSafesOnChain = ownedSafes[chain.chainId] ?? []
      const ownedSafesWithChain = ownedSafesOnChain.map((safeAddress) => ({ safeAddress, chain }))
      ownedSafesOnAllChains = [...ownedSafesOnAllChains, ...ownedSafesWithChain]
    }

    return ownedSafesOnAllChains.sort((safeA, safeB) => {
      // display safes on current chain first.
      if (safeA.chain.chainId === currentChain?.chainId && safeB.chain.chainId !== currentChain?.chainId) return -1
      if (safeA.chain.chainId !== currentChain?.chainId && safeB.chain.chainId === currentChain?.chainId) return 1
      return 0
    })
  }

  return (
    <div>
      <div className={css.header}>
        <Typography variant="h5" display="inline" fontWeight={700}>
          <VisibilityOutlined sx={{ verticalAlign: 'middle', marginRight: '10px' }} fontSize="small" />
          Watchlist
        </Typography>

        <Button disableElevation>
          <AddOutlined /> Add
        </Button>
      </div>

      {hasNoSafes && (
        <Box display="flex" flexDirection="column" alignItems="center" py={10}>
          <Typography variant="body2" color="primary.light" textAlign="center" mt={3}>
            Add any Safe account to the watchlist
          </Typography>
        </Box>
      )}

      {!hasNoSafes && (
        <List className={css.list}>
          {getOwnedSafesOnAllChains()
            .slice(0, 3)
            .map(({ safeAddress, chain }) => {
              const href = getHref(chain, safeAddress)
              return (
                <SafeListItem
                  key={safeAddress}
                  address={safeAddress}
                  chainId={chain.chainId}
                  closeDrawer={closeDrawer}
                  href={href}
                  shouldScrollToSafe
                  isAdded
                  isWelcomePage={false}
                />
              )
            })}
        </List>
      )}
    </div>
  )
}

export default Watchlist
