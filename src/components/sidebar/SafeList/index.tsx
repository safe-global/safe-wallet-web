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

import AddIcon from '@/public/images/common/add.svg'
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
import ChainIndicator from '@/components/common/ChainIndicator'
import useSafeInfo from '@/hooks/useSafeInfo'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS } from '@/services/analytics/events/overview'
import LoadingIcon from '@/public/images/common/loading.svg'
import useWallet from '@/hooks/wallets/useWallet'
import useConnectWallet from '@/components/common/ConnectWallet/useConnectWallet'
import KeyholeIcon from '@/components/common/icons/KeyholeIcon'

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

const SafeList = ({ closeDrawer }: { closeDrawer?: () => void }): ReactElement => {
  const router = useRouter()
  const chainId = useChainId()
  const currentChain = useCurrentChain()
  const { safeAddress, safe } = useSafeInfo()
  const { configs } = useChains()
  const ownedSafes = useOwnedSafes()
  const addedSafes = useAppSelector(selectAllAddedSafes)
  const wallet = useWallet()
  const handleConnect = useConnectWallet()

  const [open, setOpen] = useState<Record<string, boolean>>({})
  const toggleOpen = (chainId: string, open: boolean) => {
    setOpen((prev) => ({ ...prev, [chainId]: open }))
  }

  const hasWallet = !!wallet
  const hasNoSafes = Object.keys(ownedSafes).length === 0 && Object.keys(addedSafes).length === 0
  const isWelcomePage = router.pathname === AppRoutes.welcome.index || router.pathname === AppRoutes.welcome.socialLogin
  const isSingleTxPage = router.pathname === AppRoutes.transactions.tx

  /**
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

  return (
    <div data-testid="sidebar-safe-container">
      <div className={css.header}>
        <Typography variant="h4" display="inline" fontWeight={700}>
          My Safe Accounts
        </Typography>

        {!isWelcomePage && (
          <Track {...OVERVIEW_EVENTS.ADD_SAFE}>
            <Link
              href={{ pathname: AppRoutes.welcome.index, query: { chain: currentChain?.shortName } }}
              passHref
              legacyBehavior
            >
              <Button
                disableElevation
                size="small"
                variant="outlined"
                onClick={closeDrawer}
                startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
              >
                Add
              </Button>
            </Link>
          </Track>
        )}
      </div>

      {hasNoSafes && (
        <Box display="flex" flexDirection="column" alignItems="center" py={10}>
          {hasWallet ? (
            <>
              <SvgIcon component={LoadingIcon} inheritViewBox sx={{ width: '85px', height: '80px' }} />

              <Typography variant="body2" color="primary.light" textAlign="center" mt={3}>
                {!isWelcomePage ? (
                  <Link href={{ pathname: AppRoutes.welcome.index, query: router.query }} passHref legacyBehavior>
                    <MuiLink onClick={closeDrawer}>{NO_SAFE_MESSAGE}</MuiLink>
                  </Link>
                ) : (
                  <>{NO_SAFE_MESSAGE}</>
                )}{' '}
                an existing one
              </Typography>
            </>
          ) : (
            <Box display="flex" flexDirection="column" alignItems="center" gap={3} maxWidth={250}>
              <Box display="flex" alignItems="center" justifyContent="center">
                <KeyholeIcon size={40} />
              </Box>

              <Typography variant="body2" color="primary.light" textAlign="center" sx={{ textWrap: 'balance' }}>
                {NO_WALLET_MESSAGE}
              </Typography>

              <Button onClick={handleConnect} variant="contained" size="stretched" disableElevation>
                Connect wallet
              </Button>
            </Box>
          )}
        </Box>
      )}

      {!hasNoSafes &&
        configs.map((chain) => {
          const ownedSafesOnChain = ownedSafes[chain.chainId] ?? []
          const addedSafesOnChain = addedSafes[chain.chainId] ?? {}
          const isCurrentChain = chain.chainId === chainId
          const addedSafeEntriesOnChain = Object.entries(addedSafesOnChain)

          if (!isCurrentChain && !ownedSafesOnChain.length && !addedSafeEntriesOnChain.length) {
            return null
          }

          const isOpen =
            chain.chainId in open
              ? open[chain.chainId]
              : _shouldExpandSafeList({
                  isCurrentChain,
                  safeAddress,
                  ownedSafesOnChain,
                  addedSafesOnChain,
                })

          return (
            <Fragment key={chain.chainName}>
              {/* Chain indicator */}
              <ChainIndicator chainId={chain.chainId} className={css.chainDivider} showLogo={false} />

              {/* No Safes yet */}
              {!addedSafeEntriesOnChain.length && !ownedSafesOnChain.length && (
                <Typography variant="body2" color="primary.light" p={2} textAlign="center">
                  {!isWelcomePage ? (
                    <Link href={{ pathname: AppRoutes.welcome.index, query: router.query }} passHref legacyBehavior>
                      <MuiLink onClick={closeDrawer}>{NO_SAFE_MESSAGE}</MuiLink>
                    </Link>
                  ) : (
                    <>{NO_SAFE_MESSAGE}</>
                  )}{' '}
                  an existing one on this network
                </Typography>
              )}

              {/* Added Safes */}
              <List className={css.list}>
                {addedSafeEntriesOnChain.map(([address, { threshold, owners }]) => {
                  const href = getHref(chain, address)
                  return (
                    <SafeListItem
                      key={address}
                      address={address}
                      threshold={threshold}
                      owners={owners.length}
                      chainId={chain.chainId}
                      closeDrawer={closeDrawer}
                      href={href}
                      shouldScrollToSafe
                      isAdded
                    />
                  )
                })}

                {isCurrentChain &&
                  safeAddress &&
                  !addedSafesOnChain[safeAddress] &&
                  !ownedSafesOnChain.includes(safeAddress) && (
                    <SafeListItem
                      address={safeAddress}
                      threshold={safe.threshold}
                      owners={safe.owners.length}
                      chainId={safe.chainId}
                      closeDrawer={closeDrawer}
                      href={{ pathname: router.pathname, query: router.query }}
                      shouldScrollToSafe
                    />
                  )}
              </List>

              {/* Owned Safes */}
              {ownedSafesOnChain.length > 0 && (
                <>
                  <div onClick={() => toggleOpen(chain.chainId, !isOpen)} className={css.ownedLabelWrapper}>
                    <Typography variant="body2" display="inline" className={css.ownedLabel}>
                      Safe Accounts owned on {chain.chainName} ({ownedSafesOnChain.length})
                      <IconButton disableRipple>{isOpen ? <ExpandLess /> : <ExpandMore />}</IconButton>
                    </Typography>
                  </div>

                  <Collapse key={chainId} in={isOpen}>
                    <List sx={{ py: 0 }}>
                      {ownedSafesOnChain.map((address) => {
                        const href = getHref(chain, address)

                        return (
                          <SafeListItem
                            key={address}
                            address={address}
                            chainId={chain.chainId}
                            closeDrawer={closeDrawer}
                            href={href}
                            shouldScrollToSafe={!addedSafesOnChain[address]}
                          />
                        )
                      })}
                    </List>
                  </Collapse>
                </>
              )}
            </Fragment>
          )
        })}
    </div>
  )
}

export default SafeList
