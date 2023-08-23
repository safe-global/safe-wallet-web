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
import { unregisterDevice } from '@safe-global/safe-gateway-typescript-sdk'
import { Fragment, useEffect, useMemo, useState } from 'react'
import type { ReactElement } from 'react'

import EthHashInfo from '@/components/common/EthHashInfo'
import { sameAddress } from '@/utils/addresses'
import useChains from '@/hooks/useChains'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectAllAddedSafes } from '@/store/addedSafesSlice'
import CheckWallet from '@/components/common/CheckWallet'
import { registerNotificationDevice, requestNotificationPermission, unregisterSafeNotifications } from './logic'
import { useNotificationDb } from './useNotificationDb'
import { showNotification } from '@/store/notificationsSlice'

import css from './styles.module.css'

export const AllSafesNotifications = (): ReactElement | null => {
  const chains = useChains()
  const dispatch = useAppDispatch()
  const addedSafes = useAppSelector(selectAllAddedSafes)

  const {
    deviceUuid,
    locallyRegisteredSafes,
    registerSafeLocally,
    unregisterSafeLocally,
    clearLocallyRegisteredSafes,
  } = useNotificationDb()

  const [selectedSafes, setSelectedSafes] = useState(locallyRegisteredSafes)

  // `locallyRegisteredSafes` is initially undefined until indexedDB resolves
  useEffect(() => {
    setSelectedSafes(locallyRegisteredSafes)
  }, [locallyRegisteredSafes])

  // Merge added Safes and locally notification-registered Safes
  const notifiableSafes = useMemo(() => {
    const registerable: { [chainId: string]: Array<string> } = {}

    // Added Safes
    for (const [chainId, addedSafesOnChain] of Object.entries(addedSafes)) {
      registerable[chainId] = Object.keys(addedSafesOnChain)
    }

    // Locally registered Safes (if not already added)
    for (const [chainId, safeAddresses] of Object.entries(locallyRegisteredSafes)) {
      registerable[chainId] = Array.from(new Set([...registerable[chainId], ...safeAddresses]))
    }

    return registerable
  }, [addedSafes, locallyRegisteredSafes])

  const totalNotifiableSafes = useMemo(() => {
    return Object.values(notifiableSafes).reduce((acc, safeAddresses) => {
      return (acc += safeAddresses.length)
    }, 0)
  }, [notifiableSafes])

  const isAllSelected = Object.entries(notifiableSafes).every(([chainId, safeAddresses]) => {
    const hasChain = Object.keys(selectedSafes).includes(chainId)
    const hasEverySafe = safeAddresses.every((safeAddress) => selectedSafes[chainId]?.includes(safeAddress))
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

  const shouldRegisterSafes = Object.entries(selectedSafes).some(([chainId, safeAddresses]) => {
    return safeAddresses.some((safeAddress) => !locallyRegisteredSafes[chainId]?.includes(safeAddress))
  })
  const shouldUnregisterSafes = Object.entries(locallyRegisteredSafes).some(([chainId, safeAddresses]) => {
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

    const shouldUnregisterDevice = Object.values(selectedSafes).every((safeAddresses) => safeAddresses.length === 0)

    if (shouldUnregisterDevice) {
      // Device unregister is chain agnostic
      await unregisterDevice('1', deviceUuid)

      clearLocallyRegisteredSafes()
      return
    }

    const registrationPromises = []

    const safesToRegister: { [chainId: string]: Array<string> } = {}

    for (const [chainId, safeAddresses] of Object.entries(selectedSafes)) {
      for (const safeAddress of safeAddresses) {
        const shouldUnregister = locallyRegisteredSafes[chainId]?.includes(safeAddress)

        if (shouldUnregister) {
          registrationPromises.push(
            unregisterSafeNotifications({
              chainId,
              safeAddress: safeAddress,
              deviceUuid,
              callback: () => unregisterSafeLocally(chainId, safeAddress),
            }),
          )
          continue
        }

        // Safes to register
        if (!safesToRegister[chainId]) {
          safesToRegister[chainId] = []
        }

        safesToRegister[chainId].push(safeAddress)
      }
    }

    const shouldRegisterSafes = Object.keys(safesToRegister).length > 0

    if (shouldRegisterSafes) {
      const callback = () => {
        Object.entries(safesToRegister).forEach(([chainId, safeAddresses]) => {
          safeAddresses.forEach((safeAddress) => {
            registerSafeLocally(chainId, safeAddress)
          })
        })

        dispatch(
          showNotification({
            message: 'You will now receive notifications for these Safe Accounts in your browser.',
            variant: 'success',
            groupKey: 'notifications',
          }),
        )
      }

      registrationPromises.push(
        registerNotificationDevice({
          safesToRegister,
          deviceUuid,
          callback,
        }),
      )
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
                if (isChainSelected) {
                  return {
                    ...prev,
                    [chainId]: [],
                  }
                }

                return {
                  ...prev,
                  [chainId]: safeAddresses,
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
                    {safeAddresses.map((address) => {
                      const isSafeSelected = selectedSafes[chainId]?.includes(address) ?? false

                      const onSelectSafe = () => {
                        setSelectedSafes((prev) => {
                          if (isSafeSelected) {
                            return {
                              ...prev,
                              [chainId]: prev[chainId].filter((addr) => !sameAddress(addr, address)),
                            }
                          }

                          return {
                            ...prev,
                            [chainId]: [...(prev[chainId] ?? []), address],
                          }
                        })
                      }

                      return (
                        <ListItem disablePadding key={address}>
                          <ListItemButton sx={{ pl: 7, py: 0.5 }} onClick={onSelectSafe} dense>
                            <ListItemIcon className={css.icon}>
                              <Checkbox edge="start" checked={isSafeSelected} disableRipple />
                            </ListItemIcon>
                            <EthHashInfo
                              avatarSize={36}
                              key={address}
                              address={address}
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
