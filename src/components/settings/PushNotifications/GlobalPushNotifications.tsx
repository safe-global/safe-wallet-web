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
import { requestNotificationPermission } from './logic'
import type { NotifiableSafes } from './logic'
import type { AddedSafesState } from '@/store/addedSafesSlice'
import type { PushNotificationPreferences } from '@/services/push-notifications/preferences'
import CheckWallet from '@/components/common/CheckWallet'

import css from './styles.module.css'

// UI logic

// Convert data structure of added Safes
export const transformAddedSafes = (addedSafes: AddedSafesState): NotifiableSafes => {
  return Object.entries(addedSafes).reduce<NotifiableSafes>((acc, [chainId, addedSafesOnChain]) => {
    acc[chainId] = Object.keys(addedSafesOnChain)
    return acc
  }, {})
}

// Convert data structure of currently notified Safes
const transformCurrentSubscribedSafes = (allPreferences?: PushNotificationPreferences): NotifiableSafes | undefined => {
  if (!allPreferences) {
    return
  }

  return Object.values(allPreferences).reduce<NotifiableSafes>((acc, { chainId, safeAddress }) => {
    if (!acc[chainId]) {
      acc[chainId] = []
    }

    acc[chainId].push(safeAddress)
    return acc
  }, {})
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

const getTotalNotifiableSafes = (notifiableSafes: NotifiableSafes): number => {
  return Object.values(notifiableSafes).reduce((acc, safeAddresses) => {
    return (acc += safeAddresses.length)
  }, 0)
}

const areAllSafesSelected = (notifiableSafes: NotifiableSafes, selectedSafes: NotifiableSafes): boolean => {
  return Object.entries(notifiableSafes).every(([chainId, safeAddresses]) => {
    const hasChain = Object.keys(selectedSafes).includes(chainId)
    const hasEverySafe = safeAddresses?.every((safeAddress) => selectedSafes[chainId]?.includes(safeAddress))
    return hasChain && hasEverySafe
  })
}

// Total number of signatures required to register selected Safes
const getTotalSignaturesRequired = (selectedSafes: NotifiableSafes, currentNotifiedSafes?: NotifiableSafes): number => {
  return Object.keys(selectedSafes).filter((chainId) => {
    return !Object.keys(currentNotifiedSafes || {}).includes(chainId)
  }).length
}

const shouldRegisterSelectedSafes = (
  selectedSafes: NotifiableSafes,
  currentNotifiedSafes?: NotifiableSafes,
): boolean => {
  return Object.entries(selectedSafes).some(([chainId, safeAddresses]) => {
    return safeAddresses.some((safeAddress) => !currentNotifiedSafes?.[chainId]?.includes(safeAddress))
  })
}

const shouldUnregsiterSelectedSafes = (selectedSafes: NotifiableSafes, currentNotifiedSafes?: NotifiableSafes) => {
  return Object.entries(currentNotifiedSafes || {}).some(([chainId, safeAddresses]) => {
    return safeAddresses.some((safeAddress) => !selectedSafes[chainId]?.includes(safeAddress))
  })
}

// onSave logic

// Safes that need to be registered with the service
const getSafesToRegister = (
  selectedSafes: NotifiableSafes,
  currentNotifiedSafes?: NotifiableSafes,
): NotifiableSafes | undefined => {
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
    return safesToRegister
  }
}

// Safes that need to be unregistered with the service
const getSafesToUnregister = (
  selectedSafes: NotifiableSafes,
  currentNotifiedSafes?: NotifiableSafes,
): NotifiableSafes | undefined => {
  if (!currentNotifiedSafes) {
    return
  }

  const safesToUnregister = Object.entries(currentNotifiedSafes).reduce<NotifiableSafes>(
    (acc, [chainId, safeAddresses]) => {
      const safesToUnregisterOnChain = safeAddresses.filter(
        (safeAddress) => !selectedSafes[chainId]?.includes(safeAddress),
      )

      if (safesToUnregisterOnChain.length > 0) {
        acc[chainId] = safeAddresses
      }
      return acc
    },
    {},
  )

  const shouldUnregister = Object.values(safesToUnregister).some((safeAddresses) => safeAddresses.length > 0)

  if (shouldUnregister) {
    return safesToUnregister
  }
}

// Whether the device needs to be unregistered from the service
const shouldUnregisterDevice = (
  chainId: string,
  safeAddresses: Array<string>,
  currentNotifiedSafes?: NotifiableSafes,
): boolean => {
  if (!currentNotifiedSafes) {
    return false
  }

  if (safeAddresses.length !== currentNotifiedSafes[chainId].length) {
    return false
  }

  return safeAddresses.every((safeAddress) => {
    return currentNotifiedSafes[chainId]?.includes(safeAddress)
  })
}

export const GlobalPushNotifications = (): ReactElement | null => {
  const chains = useChains()
  const addedSafes = useAppSelector(selectAllAddedSafes)

  const { getAllPreferences } = useNotificationPreferences()
  const { unregisterChainNotifications, unregisterSafeNotifications, registerNotifications } =
    useNotificationRegistrations()

  // Safes selected in the UI
  const [selectedSafes, setSelectedSafes] = useState<NotifiableSafes>({})

  // Current Safes registered for notifications in indexedDB
  const currentNotifiedSafes = useMemo(() => {
    const allPreferences = getAllPreferences()
    return transformCurrentSubscribedSafes(allPreferences)
  }, [getAllPreferences])

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
    return getTotalNotifiableSafes(notifiableSafes)
  }, [notifiableSafes])

  const isAllSelected = useMemo(() => {
    return areAllSafesSelected(notifiableSafes, selectedSafes)
  }, [notifiableSafes, selectedSafes])

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

  const totalSignaturesRequired = useMemo(() => {
    return getTotalSignaturesRequired(selectedSafes, currentNotifiedSafes)
  }, [currentNotifiedSafes, selectedSafes])

  const canSave = useMemo(() => {
    return (
      shouldRegisterSelectedSafes(selectedSafes, currentNotifiedSafes) ||
      shouldUnregsiterSelectedSafes(selectedSafes, currentNotifiedSafes)
    )
  }, [selectedSafes, currentNotifiedSafes])

  const onSave = async () => {
    if (!canSave) {
      return
    }

    const isGranted = await requestNotificationPermission()

    if (!isGranted) {
      return
    }

    const registrationPromises: Array<Promise<void>> = []

    const safesToRegister = getSafesToRegister(selectedSafes, currentNotifiedSafes)
    if (safesToRegister) {
      registrationPromises.push(registerNotifications(safesToRegister))
    }

    const safesToUnregister = getSafesToUnregister(selectedSafes, currentNotifiedSafes)
    if (safesToUnregister) {
      const unregistrationPromises = Object.entries(safesToUnregister).flatMap(([chainId, safeAddresses]) => {
        if (shouldUnregisterDevice(chainId, safeAddresses, currentNotifiedSafes)) {
          return unregisterChainNotifications(chainId)
        }
        return safeAddresses.map((safeAddress) => unregisterSafeNotifications(chainId, safeAddress))
      })

      registrationPromises.push(...unregistrationPromises)
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
          My Safes Accounts ({totalNotifiableSafes})
        </Typography>

        <div>
          {totalSignaturesRequired > 0 && (
            <Typography display="inline" mr={2}>
              We&apos;ll ask you to verify your ownership of {totalSignaturesRequired} Safe Account
              {totalSignaturesRequired > 1 ? 's' : ''} with your signature
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
                      <ListItemText
                        primary={`${chain?.chainName} Safe Accounts`}
                        primaryTypographyProps={{ variant: 'h5' }}
                      />
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
