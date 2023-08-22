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
import { Fragment, useMemo, useState } from 'react'
import type { ReactElement } from 'react'

import EthHashInfo from '@/components/common/EthHashInfo'
import { sameAddress } from '@/utils/addresses'
import useChains from '@/hooks/useChains'
import { useAppSelector } from '@/store'
import { selectAllAddedSafes, selectTotalAdded } from '@/store/addedSafesSlice'
import CheckWallet from '@/components/common/CheckWallet'
import type { NotificationRegistration } from './logic'

export const AllSafesNotifications = ({
  currentRegistration,
  handleRegister,
}: {
  currentRegistration: NotificationRegistration | undefined
  handleRegister: (safesToRegister: { [chainId: string]: Array<string> }) => Promise<void>
}): ReactElement | null => {
  const chains = useChains()

  const totalAddedSafes = useAppSelector(selectTotalAdded)
  const addedSafes = useAppSelector(selectAllAddedSafes)

  const notifiableSafes = useMemo(() => {
    const registerable: { [chainId: string]: Array<string> } = {}

    for (const [chainId, addedSafesOnChain] of Object.entries(addedSafes)) {
      registerable[chainId] = Object.keys(addedSafesOnChain)
    }

    for (const { chainId, safes } of currentRegistration?.safeRegistrations ?? []) {
      registerable[chainId] = Array.from(new Set([...registerable[chainId], ...safes]))
    }

    return registerable
  }, [addedSafes, currentRegistration?.safeRegistrations])

  const [safesToRegister, setSafesToRegister] = useState<{ [chainId: string]: Array<string> }>(
    currentRegistration
      ? currentRegistration.safeRegistrations.reduce<{ [chainId: string]: Array<string> }>(
          (acc, { chainId, safes }) => {
            acc[chainId] = safes
            return acc
          },
          {},
        )
      : {},
  )

  const canRegister = Object.entries(safesToRegister).some(([chainId, safes]) => {
    const chainSafeRegistration = currentRegistration?.safeRegistrations.find(
      (safeRegistration) => safeRegistration.chainId === chainId,
    )

    return (
      !chainSafeRegistration ||
      safes.length !== chainSafeRegistration.safes.length ||
      safes.some((address) => !chainSafeRegistration.safes.includes(address))
    )
  })

  const isAllSelected = Object.entries(notifiableSafes).every(([chainId, safes]) => {
    const hasChain = Object.keys(safesToRegister).includes(chainId)
    const hasEverySafe = safes.every((address) => safesToRegister[chainId]?.includes(address))
    return hasChain && hasEverySafe
  })

  const onSelectAll = () => {
    setSafesToRegister(() => {
      if (isAllSelected) {
        return []
      }

      return Object.entries(notifiableSafes).reduce((acc, [chainId, safes]) => {
        return {
          ...acc,
          [chainId]: safes,
        }
      }, {})
    })
  }

  const onSubscribe = async () => {
    await handleRegister(safesToRegister)

    // TODO: Handle unregistration(s)
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
            <Button variant="contained" disabled={!isOk || !canRegister} onClick={onSubscribe}>
              Subscribe
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

          {Object.entries(notifiableSafes).map(([chainId, safes], i, arr) => {
            const chain = chains.configs?.find((chain) => chain.chainId === chainId)

            const isChainSelected = safes.every((address) => {
              return safesToRegister[chainId]?.includes(address)
            })

            const onSelectChain = () => {
              setSafesToRegister((prev) => {
                if (isChainSelected) {
                  return {
                    ...prev,
                    [chainId]: [],
                  }
                }

                return {
                  ...prev,
                  [chainId]: safes,
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
                    {safes.map((address) => {
                      const isSafeSelected = safesToRegister[chainId]?.includes(address) ?? false

                      const onSelectSafe = () => {
                        setSafesToRegister((prev) => {
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
