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
import CheckWallet from '@/components/common/CheckWallet'
import { requestNotificationPermission } from './logic'
import { useNotificationPreferences } from './hooks/useNotificationPreferences'
import { useNotificationRegistrations } from './hooks/useNotificationRegistrations'
import { selectAllAddedSafes } from '@/store/addedSafesSlice'
import type { AddedSafesState } from '@/store/addedSafesSlice'
import type { NotificationPreferences } from './hooks/notifications-idb'

import css from './styles.module.css'

type NotifiableSafes = { [chainId: string]: Array<string> }

// Convert data structure of added Safes
export const getNotiableAddedSafes = (addedSafes: AddedSafesState): NotifiableSafes => {
  const notifiableAddedSafes: NotifiableSafes = {}

  for (const [chainId, addedSafesOnChain] of Object.entries(addedSafes)) {
    notifiableAddedSafes[chainId] = Object.keys(addedSafesOnChain)
  }

  return notifiableAddedSafes
}

// Convert data structure of locally notification-registered Safes
const getCurrentNotifiedSafes = (allPreferences: NotificationPreferences): NotifiableSafes => {
  const currentNotifiedSafes: NotifiableSafes = {}

  for (const { chainId, safeAddress } of Object.values(allPreferences)) {
    if (!currentNotifiedSafes[chainId]) {
      currentNotifiedSafes[chainId] = []
    }

    currentNotifiedSafes[chainId].push(safeAddress)
  }

  return currentNotifiedSafes
}

const mergeNotifiableSafes = (addedSafes: AddedSafesState, currentSubscriptions?: NotifiableSafes): NotifiableSafes => {
  const notifiableSafes = getNotiableAddedSafes(addedSafes)

  if (!currentSubscriptions) {
    return notifiableSafes
  }

  // Locally registered Safes (if not already added)
  for (const [chainId, safeAddresses] of Object.entries(notifiableSafes)) {
    const notifiableAddedSafes = notifiableSafes[chainId] ?? []
    const uniqueSafeAddresses = Array.from(new Set([...notifiableAddedSafes, ...safeAddresses]))

    notifiableSafes[chainId] = uniqueSafeAddresses
  }

  return notifiableSafes
}

export const GlobalNotifications = (): ReactElement | null => {
  const chains = useChains()
  const addedSafes = useAppSelector(selectAllAddedSafes)

  const { getAllPreferences } = useNotificationPreferences()
  const { unregisterSafeNotifications, registerNotifications } = useNotificationRegistrations()

  // Current Safes registered for notifications in IndexedDB
  const currentSubscriptions = useMemo(() => {
    const allPreferences = getAllPreferences()
    return allPreferences ? getCurrentNotifiedSafes(allPreferences) : undefined
  }, [getAllPreferences])

  // Safes selected in the UI
  const [selectedSafes, setSelectedSafes] = useState<NotifiableSafes>({})

  useEffect(() => {
    // `currentSubscriptions` is initially undefined until indexedDB resolves
    if (currentSubscriptions) {
      setSelectedSafes(currentSubscriptions)
    }
  }, [currentSubscriptions])

  // Merged added Safes and `currentSubscriptions` (in case subscriptions aren't added)
  const notifiableSafes = useMemo(() => {
    return mergeNotifiableSafes(addedSafes, currentSubscriptions)
  }, [addedSafes, currentSubscriptions])

  const totalNotifiableSafes = useMemo(() => {
    return Object.values(notifiableSafes).reduce((acc, safeAddresses) => {
      return (acc += safeAddresses.length)
    }, 0)
  }, [notifiableSafes])

  const isAllSelected = Object.entries(notifiableSafes).every(([chainId, safeAddresses]) => {
    const hasChain = Object.keys(selectedSafes).includes(chainId)
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

  // Wether Safes need to be registered or unregistered with the service
  const shouldRegisterSafes = Object.entries(selectedSafes).some(([chainId, safeAddresses]) => {
    return safeAddresses.some((safeAddress) => !currentSubscriptions?.[chainId]?.includes(safeAddress))
  })
  const shouldUnregisterSafes =
    currentSubscriptions &&
    Object.entries(currentSubscriptions).some(([chainId, safeAddresses]) => {
      return safeAddresses.some((safeAddress) => !selectedSafes[chainId]?.includes(safeAddress))
    })

  const canSave = shouldRegisterSafes || shouldUnregisterSafes

  const onSave = async () => {
    if (!canSave) {
      return
    }

    const isGranted = await requestNotificationPermission()

    if (!isGranted) {
      return
    }

    // TODO: Enable when live on prod.
    // const shouldUnregisterDevice = Object.values(selectedSafes).every((safeAddresses) => safeAddresses.length === 0)
    // if (shouldUnregisterDevice) {
    //   // Device unregister is chain agnostic
    //   await unregisterDevice('1', uuid)
    //   clearPreferences()
    //   return
    // }

    const registrationPromises = []

    const safesToRegister = Object.entries(selectedSafes).reduce<NotifiableSafes>((acc, [chainId, safeAddresses]) => {
      const safesToRegisterOnChain = safeAddresses.filter(
        (safeAddress) => !currentSubscriptions?.[chainId]?.includes(safeAddress),
      )

      if (safesToRegisterOnChain.length > 0) {
        acc[chainId] = safeAddresses
      }

      return acc
    }, {})

    const safesToUnregister =
      currentSubscriptions &&
      Object.entries(currentSubscriptions).reduce<NotifiableSafes>((acc, [chainId, safeAddresses]) => {
        const safesToUnregisterOnChain = safeAddresses.filter(
          (safeAddress) => !selectedSafes[chainId]?.includes(safeAddress),
        )

        if (safesToUnregisterOnChain.length > 0) {
          acc[chainId] = safeAddresses
        }
        return acc
      }, {})

    const shouldRegisterSafes = Object.values(safesToRegister).some((safeAddresses) => safeAddresses.length > 0)

    if (shouldRegisterSafes) {
      registrationPromises.push(registerNotifications(safesToRegister))
    }

    if (safesToUnregister) {
      for (const [chainId, safeAddresses] of Object.entries(safesToUnregister)) {
        for (const safeAddress of safeAddresses) {
          registrationPromises.push(unregisterSafeNotifications(chainId, safeAddress))
        }
      }
    }

    Promise.all(registrationPromises)
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

        <CheckWallet allowNonOwner>
          {(isOk) => (
            <Button variant="contained" disabled={!isOk || !canSave} onClick={onSave}>
              Save
            </Button>
          )}
        </CheckWallet>
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
