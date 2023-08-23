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
import { useAppSelector } from '@/store'
import { selectAllAddedSafes, selectTotalAdded } from '@/store/addedSafesSlice'
import CheckWallet from '@/components/common/CheckWallet'
import { registerNotificationDevice, requestNotificationPermission, unregisterSafeNotifications } from './logic'
import { useNotificationDb } from './useNotificationDb'

export const AllSafesNotifications = (): ReactElement | null => {
  const chains = useChains()
  const totalAddedSafes = useAppSelector(selectTotalAdded)
  const addedSafes = useAppSelector(selectAllAddedSafes)

  const {
    deviceUuid,
    locallyRegisteredSafes,
    registerSafeLocally,
    unregisterSafeLocally,
    clearLocallyRegisteredSafes,
  } = useNotificationDb()

  const [selectedSafes, setSelectedSafes] = useState(() => locallyRegisteredSafes)

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
    for (const safeAddress of Object.keys(locallyRegisteredSafes)) {
      const [chainId, address] = safeAddress.split(':')

      if (chainId && address) {
        registerable[chainId] = Array.from(new Set([...registerable[chainId], address]))
      }
    }

    return registerable
  }, [addedSafes, locallyRegisteredSafes])

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

    const promises = []
    const safesToRegister: { [chainId: string]: Array<string> } = {}

    for (const [chainId, safeAddresses] of Object.entries(selectedSafes)) {
      for (const safeAddress of safeAddresses) {
        const shouldUnregister = locallyRegisteredSafes[chainId]?.includes(safeAddress)

        if (shouldUnregister) {
          promises.push(
            unregisterSafeNotifications({
              chainId,
              safeAddress: safeAddress,
              deviceUuid,
              callback: () => unregisterSafeLocally(chainId, safeAddress),
            }),
          )
        } else {
          if (!safesToRegister[chainId]) {
            safesToRegister[chainId] = []
          }

          safesToRegister[chainId].push(safeAddress)
        }
      }
    }

    if (Object.keys(safesToRegister).length > 0) {
      const callback = () => {
        Object.entries(safesToRegister).forEach(([chainId, safeAddresses]) => {
          safeAddresses.forEach((safeAddress) => {
            registerSafeLocally(chainId, safeAddress)
          })
        })
      }

      promises.push(
        registerNotificationDevice({
          safesToRegister,
          deviceUuid,
          callback,
        }),
      )
    }

    Promise.all(promises)
  }

  if (totalAddedSafes === 0) {
    return null
  }

  return (
    <Grid container>
      <Grid item xs={12} display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h4" fontWeight={700} display="inline">
          My Safes ({totalAddedSafes})
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
            <ListItem disablePadding>
              <ListItemButton onClick={onSelectAll} dense>
                <ListItemIcon>
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
                  <ListItem disablePadding>
                    <ListItemButton onClick={onSelectChain} dense>
                      <ListItemIcon>
                        <Checkbox edge="start" checked={isChainSelected} disableRipple />
                      </ListItemIcon>
                      <ListItemText primary={`${chain?.chainName} Safes`} primaryTypographyProps={{ variant: 'h5' }} />
                    </ListItemButton>
                  </ListItem>

                  <List disablePadding>
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
                          <ListItemButton sx={{ pl: 4 }} onClick={onSelectSafe} dense>
                            <ListItemIcon>
                              <Checkbox edge="start" checked={isSafeSelected} disableRipple />
                            </ListItemIcon>
                            <EthHashInfo key={address} address={address} shortAddress={false} showName={true} />
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
