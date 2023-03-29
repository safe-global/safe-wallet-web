import { useMemo } from 'react'
import { Box, Card, CardContent, CardHeader, List, ListItem, ListItemIcon, ListItemText, SvgIcon } from '@mui/material'
import type { ListItemTextProps } from '@mui/material'
import type { CardHeaderProps } from '@mui/material'
import type { ReactElement } from 'react'

import FileIcon from '@/public/images/settings/data/file.svg'
import useChains from '@/hooks/useChains'
import { ImportErrors } from '@/components/settings/DataManagement/useGlobalImportFileParser'
import type { AddedSafesState } from '@/store/addedSafesSlice'
import type { AddressBookState } from '@/store/addressBookSlice'
import type { SafeAppsState } from '@/store/safeAppsSlice'
import type { SettingsState } from '@/store/settingsSlice'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'

import css from './styles.module.css'

const getItemSecondaryText = (
  chains: ChainInfo[],
  data: AddedSafesState | AddressBookState = {},
  singular: string,
  plural: string,
): ReactElement => {
  return (
    <List sx={{ p: 0 }}>
      {Object.keys(data).map((chainId) => {
        const count = Object.keys(data[chainId] ?? {}).length

        if (count === 0) {
          return null
        }

        const chain = chains.find((chain) => chain.chainId === chainId)

        return (
          <ListItem key={chainId} sx={{ p: 0, m: '4px' }}>
            <Box
              className={css.networkIcon}
              sx={{ backgroundColor: chain?.theme.backgroundColor ?? '#D9D9D9' }}
              component="span"
            />
            {chain?.chainName}: {count} {count === 1 ? singular : plural}
          </ListItem>
        )
      })}
    </List>
  )
}

type Data = {
  addedSafes?: AddedSafesState
  addressBook?: AddressBookState
  settings?: SettingsState
  safeApps?: SafeAppsState
  error?: string
}

type ListProps = Data & {
  showPreview?: boolean
}

type ItemProps = ListProps & { chains: ChainInfo[] }

const getItems = ({
  addedSafes,
  addressBook,
  settings,
  safeApps,
  error,
  chains,
  showPreview = false,
}: ItemProps): Array<ListItemTextProps> => {
  if (error) {
    return [{ primary: <>{error}</> }]
  }

  const addedSafeChainAmount = Object.keys(addedSafes || {}).length
  const addressBookChainAmount = Object.keys(addressBook || {}).length

  const items: Array<ListItemTextProps> = [
    ...(addedSafeChainAmount > 0
      ? [
          {
            primary: (
              <>
                <b>Added Safes</b> on {addedSafeChainAmount} {addedSafeChainAmount === 1 ? 'chain' : 'chains'}
              </>
            ),
            secondary: showPreview ? getItemSecondaryText(chains, addedSafes, 'Safe', 'Safes') : undefined,
          },
        ]
      : []),
    ...(addressBookChainAmount > 0
      ? [
          {
            primary: (
              <>
                <b>Address book</b> for {addressBookChainAmount} {addressBookChainAmount === 1 ? 'chain' : 'chains'}
              </>
            ),
            secondary: showPreview ? getItemSecondaryText(chains, addressBook, 'contact', 'contacts') : undefined,
          },
        ]
      : []),
    ...(settings
      ? [
          {
            primary: (
              <>
                <b>Settings</b> (appearance, currency, hidden tokens and custom environment variables)
              </>
            ),
          },
        ]
      : []),
    ...(safeApps
      ? [
          {
            primary: (
              <>
                Bookmarked <b>Safe Apps</b>
              </>
            ),
          },
        ]
      : []),
  ]

  if (items.length === 0) {
    return [{ primary: <>{ImportErrors.NO_IMPORT_DATA_FOUND}</> }]
  }

  return items
}

type Props = ListProps & CardHeaderProps

export const FileListCard = ({
  addedSafes,
  addressBook,
  settings,
  safeApps,
  error,
  showPreview = false,
  ...cardHeaderProps
}: Props): ReactElement => {
  const chains = useChains()
  const items = useMemo<Array<ListItemTextProps>>(() => {
    return getItems({ addedSafes, addressBook, settings, safeApps, error, chains: chains.configs, showPreview })
  }, [addedSafes, addressBook, settings, safeApps, error, chains.configs, showPreview])

  return (
    <Card className={css.card}>
      <CardHeader {...cardHeaderProps} className={css.header} />
      <CardContent className={css.content}>
        <List sx={{ p: 0 }}>
          {items.map((item, i) => (
            <ListItem key={i} sx={{ p: 0 }}>
              <ListItemIcon className={css.listIcon}>
                <SvgIcon component={FileIcon} inheritViewBox fontSize="small" sx={{ fill: 'none' }} />
              </ListItemIcon>
              <ListItemText {...item} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}
