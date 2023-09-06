import {
  Grid,
  Paper,
  Typography,
  Checkbox,
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { Fragment, useEffect, useMemo, useState } from 'react'
import type { ReactElement } from 'react'

import EthHashInfo from '@/components/common/EthHashInfo'
import { sameAddress } from '@/utils/addresses'
import useChains from '@/hooks/useChains'
import { useAppSelector } from '@/store'
import { useNotificationPreferences } from './hooks/useNotificationPreferences'
import { useNotificationRegistrations } from './hooks/useNotificationRegistrations'
import { selectAllAddedSafes } from '@/store/addedSafesSlice'
import { trackEvent } from '@/services/analytics'
import { PUSH_NOTIFICATION_EVENTS } from '@/services/analytics/events/push-notifications'
// import { requestNotificationPermission } from './logic'
import type { NotifiableSafes } from './logic'
import type { AddedSafesState } from '@/store/addedSafesSlice'
import type { NotificationPreferences } from '@/services/firebase/preferences'
import CheckWallet from '@/components/common/CheckWallet'

import css from './styles.module.css'

// Convert data structure of added Safes
export const transformAddedSafes = (addedSafes: AddedSafesState): NotifiableSafes => {
  const obj: NotifiableSafes = {}

  for (const [chainId, addedSafesOnChain] of Object.entries(addedSafes)) {
    obj[chainId] = Object.keys(addedSafesOnChain)
  }

  return obj
}

// Convert data structure of currently notified Safes
const transformCurrentSubscribedSafes = (allPreferences: NotificationPreferences): NotifiableSafes => {
  const obj: NotifiableSafes = {}

  for (const { chainId, safeAddress } of Object.values(allPreferences)) {
    if (!obj[chainId]) {
      obj[chainId] = []
    }

    obj[chainId].push(safeAddress)
  }

  return obj
}

// Merges added Safes and currently notified Safes into a single data structure without duplicates
const mergeNotifiableSafes = (addedSafes: AddedSafesState, currentSubscriptions?: NotifiableSafes): NotifiableSafes => {
  const notifiableSafes = transformAddedSafes(addedSafes)

  if (!currentSubscriptions) {
    return notifiableSafes
  }

  // Locally registered Safes (if not already added)
  for (const [chainId, safeAddresses] of Object.entries(currentSubscriptions)) {
    const notifiableSafesOnChain = notifiableSafes[chainId] ?? []
    const uniqueSafeAddresses = Array.from(new Set([...notifiableSafesOnChain, ...safeAddresses]))

    notifiableSafes[chainId] = uniqueSafeAddresses
  }

  return notifiableSafes
}

export const GlobalPushNotifications = (): ReactElement | null => {
  const chains = useChains()
  const addedSafes = useAppSelector(selectAllAddedSafes)

  const { getAllPreferences } = useNotificationPreferences()
  const { unregisterChainNotifications, unregisterSafeNotifications, registerNotifications } =
    useNotificationRegistrations()

  // Safes selected in the UI
  const [selectedSafes, setSelectedSafes] = useState<NotifiableSafes>({})
  const selectedChains = Object.keys(selectedSafes)

  // Current Safes registered for notifications in indexedDB
  const currentNotifiedSafes = useMemo(() => {
    const allPreferences = getAllPreferences()
    if (!allPreferences) {
      return
    }
    return transformCurrentSubscribedSafes(allPreferences)
  }, [getAllPreferences])
  const currentNotifiedChains = currentNotifiedSafes ? Object.keys(currentNotifiedSafes) : []

  // `currentNotifiedSafes` is initially undefined until indexedDB resolves
  useEffect(() => {
    let isMounted = true

    if (currentNotifiedSafes && isMounted) {
      setSelectedSafes(currentNotifiedSafes)
    }

    return () => {
      isMounted = false
    }
  }, [currentNotifiedSafes])

  // Merged added Safes and `currentNotifiedSafes` (in case subscriptions aren't added)
  const notifiableSafes = useMemo(() => {
    return mergeNotifiableSafes(addedSafes, currentNotifiedSafes)
  }, [addedSafes, currentNotifiedSafes])

  const totalNotifiableSafes = useMemo(() => {
    return Object.values(notifiableSafes).reduce((acc, safeAddresses) => {
      return (acc += safeAddresses.length)
    }, 0)
  }, [notifiableSafes])

  const isAllSelected = Object.entries(notifiableSafes).every(([chainId, safeAddresses]) => {
    const hasChain = selectedChains.includes(chainId)
    const hasEverySafe = safeAddresses?.every((safeAddress) => selectedSafes[chainId]?.includes(safeAddress))
    return hasChain && hasEverySafe
  })

  const onSelectAll = () => {
    setSelectedSafes(() => {
      if (isAllSelected) {
        return []
      }

      return Object.entries(notifiableSafes).reduce((acc, [chainId, safeAddresses]) => {
        return {
          ...acc,
          [chainId]: safeAddresses,
        }
      }, {})
    })
  }

  const totalSignaturesRequired = selectedChains.filter((chainId) => {
    return !currentNotifiedChains.includes(chainId)
  }).length

  // Whether Safes need to be (un-)registered with the service
  const shouldRegisterSelectedSafes = Object.entries(selectedSafes).some(([chainId, safeAddresses]) => {
    return safeAddresses.some((safeAddress) => !currentNotifiedSafes?.[chainId]?.includes(safeAddress))
  })

  const shouldUnregisterUnselectedSafes =
    currentNotifiedSafes &&
    Object.entries(currentNotifiedSafes).some(([chainId, safeAddresses]) => {
      return safeAddresses.some((safeAddress) => !selectedSafes[chainId]?.includes(safeAddress))
    })

  const canSave = shouldRegisterSelectedSafes || shouldUnregisterUnselectedSafes

  const onSave = async () => {
    if (!canSave) {
      return
    }

    // TODO: Can we remove this?
    // const isGranted = await requestNotificationPermission()

    // if (!isGranted) {
    //   return
    // }

    const registrationPromises: Array<Promise<void>> = []

    const safesToRegister = Object.entries(selectedSafes).reduce<NotifiableSafes>((acc, [chainId, safeAddresses]) => {
      const safesToRegisterOnChain = safeAddresses.filter(
        (safeAddress) => !currentNotifiedSafes?.[chainId]?.includes(safeAddress),
      )

      if (safesToRegisterOnChain.length > 0) {
        acc[chainId] = safeAddresses
      }

      return acc
    }, {})

    const shouldRegister = Object.values(safesToRegister).some((safeAddresses) => safeAddresses.length > 0)

    if (shouldRegister) {
      registrationPromises.push(registerNotifications(safesToRegister))
    }

    const shouldUnregister =
      currentNotifiedSafes &&
      Object.entries(currentNotifiedSafes).reduce<NotifiableSafes>((acc, [chainId, safeAddresses]) => {
        const safesToUnregisterOnChain = safeAddresses.filter(
          (safeAddress) => !selectedSafes[chainId]?.includes(safeAddress),
        )

        if (safesToUnregisterOnChain.length > 0) {
          acc[chainId] = safeAddresses
        }
        return acc
      }, {})

    if (shouldUnregister) {
      for (const [chainId, safeAddresses] of Object.entries(shouldUnregister)) {
        const shouldUnregsiterDevice =
          safeAddresses.length === currentNotifiedSafes[chainId].length &&
          safeAddresses.every((safeAddress) => {
            return currentNotifiedSafes[chainId]?.includes(safeAddress)
          })

        if (shouldUnregsiterDevice) {
          registrationPromises.push(unregisterChainNotifications(chainId))
          continue
        }

        for (const safeAddress of safeAddresses) {
          registrationPromises.push(unregisterSafeNotifications(chainId, safeAddress))
        }
      }
    }

    await Promise.all(registrationPromises)

    trackEvent(PUSH_NOTIFICATION_EVENTS.SAVE_SETTINGS)
  }

  if (totalNotifiableSafes === 0) {
    return null
  }

  return (
    <Grid container>
      <Grid item xs={12} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h4" fontWeight={700} display="inline">
          My Safes ({totalNotifiableSafes})
        </Typography>

        <div>
          {totalSignaturesRequired > 0 && (
            <Typography display="inline" mr={1}>
              We&apos;ll ask you to verify with your signature {totalSignaturesRequired} times
            </Typography>
          )}

          <CheckWallet allowNonOwner>
            {(isOk) => (
              <Button variant="contained" disabled={!canSave || !isOk} onClick={onSave}>
                Save
              </Button>
            )}
          </CheckWallet>
        </div>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ border: ({ palette }) => `1px solid ${palette.border.light}` }}>
          <List>
            <ListItem disablePadding className={css.item}>
              <ListItemButton onClick={onSelectAll} dense>
                <ListItemIcon className={css.icon}>
                  <Checkbox edge="start" checked={isAllSelected} disableRipple />
                </ListItemIcon>
                <ListItemText primary="Select all" primaryTypographyProps={{ variant: 'h5' }} />
              </ListItemButton>
            </ListItem>
          </List>

          <Divider />

          {Object.entries(notifiableSafes).map(([chainId, safeAddresses], i, arr) => {
            const chain = chains.configs?.find((chain) => chain.chainId === chainId)

            const isChainSelected = safeAddresses.every((address) => {
              return selectedSafes[chainId]?.includes(address)
            })

            const onSelectChain = () => {
              setSelectedSafes((prev) => {
                return {
                  ...prev,
                  [chainId]: isChainSelected ? [] : safeAddresses,
                }
              })
            }

            return (
              <Fragment key={chainId}>
                <List>
                  <ListItem disablePadding className={css.item}>
                    <ListItemButton onClick={onSelectChain} dense>
                      <ListItemIcon className={css.icon}>
                        <Checkbox edge="start" checked={isChainSelected} disableRipple />
                      </ListItemIcon>
                      <ListItemText primary={`${chain?.chainName} Safes`} primaryTypographyProps={{ variant: 'h5' }} />
                    </ListItemButton>
                  </ListItem>

                  <List disablePadding className={css.item}>
                    {safeAddresses.map((safeAddress) => {
                      const isSafeSelected = selectedSafes[chainId]?.includes(safeAddress) ?? false

                      const onSelectSafe = () => {
                        setSelectedSafes((prev) => {
                          return {
                            ...prev,
                            [chainId]: isSafeSelected
                              ? prev[chainId]?.filter((addr) => !sameAddress(addr, safeAddress))
                              : [...(prev[chainId] ?? []), safeAddress],
                          }
                        })
                      }

                      return (
                        <ListItem disablePadding key={safeAddress}>
                          <ListItemButton sx={{ pl: 7, py: 0.5 }} onClick={onSelectSafe} dense>
                            <ListItemIcon className={css.icon}>
                              <Checkbox edge="start" checked={isSafeSelected} disableRipple />
                            </ListItemIcon>
                            <EthHashInfo
                              avatarSize={36}
                              prefix={chain?.shortName}
                              key={safeAddress}
                              address={safeAddress || ''}
                              shortAddress={false}
                              showName={true}
                            />
                          </ListItemButton>
                        </ListItem>
                      )
                    })}
                  </List>
                </List>

                {i !== arr.length - 1 ? <Divider /> : null}
              </Fragment>
            )
          })}
        </Paper>
      </Grid>
    </Grid>
  )
}
