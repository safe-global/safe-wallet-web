import React, { useCallback, useMemo, useState } from 'react'
import SafeListItem from '@/components/sidebar/SafeListItem'
import useAllOwnedSafes from '@/hooks/useOwnedSafes'
import { Button, IconButton, Typography } from '@mui/material'
import css from './styles.module.css'
import { ExpandLess } from '@mui/icons-material'
import ExpandMore from '@mui/icons-material/ExpandMore'

const maxSafes = 3

const Login = () => {
  const [lastChainId, setLastChainId] = useState<string | undefined>()
  const [isListExpanded, setIsListExpanded] = useState<boolean>(false)

  const [safes] = useAllOwnedSafes(isListExpanded ? Infinity : maxSafes, lastChainId)

  const safesToShow = useMemo(() => {
    return [safes.slice(0, maxSafes), safes.slice(maxSafes)]
  }, [safes])

  const onShowMore = useCallback(() => {
    if (safes.length > 0) {
      setLastChainId(safes[safes.length - 1].chainId)
      setIsListExpanded((prev) => !prev)
    }
  }, [safes])

  return (
    <>
      {safesToShow[0].map(({ safeAddress, chainId }) => (
        <SafeListItem
          key={chainId + safeAddress}
          address={safeAddress}
          chainId={chainId}
          href={''}
          shouldScrollToSafe={false}
          isAdded
          isWelcomePage={false}
        />
      ))}

      {!isListExpanded && (
        <div className={css.ownedLabelWrapper} onClick={onShowMore}>
          <Typography variant="body2" display="inline" className={css.ownedLabel}>
            More Accounts
            <IconButton disableRipple>
              <ExpandMore />
            </IconButton>
          </Typography>
        </div>
      )}

      {!!lastChainId &&
        safesToShow[1].map(({ safeAddress, chainId }) => (
          <SafeListItem
            key={chainId + safeAddress}
            address={safeAddress}
            chainId={chainId}
            href={''}
            shouldScrollToSafe={false}
            isAdded
            isWelcomePage={false}
          />
        ))}
    </>
  )
}

export default Login
