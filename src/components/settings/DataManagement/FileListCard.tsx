import { useMemo } from 'react'
import { Card, CardContent, CardHeader, List, ListItem, ListItemIcon, ListItemText, SvgIcon } from '@mui/material'
import type { CardHeaderProps } from '@mui/material'
import type { ReactElement } from 'react'

import FileIcon from '@/public/images/settings/data/file.svg'
import type { AddedSafesState } from '@/store/addedSafesSlice'
import type { AddressBookState } from '@/store/addressBookSlice'
import type { SafeAppsState } from '@/store/safeAppsSlice'
import type { SettingsState } from '@/store/settingsSlice'

import css from './styles.module.css'
import { ImportErrors } from './useGlobalImportFileParser'

type Data = {
  addedSafes?: AddedSafesState
  addressBook?: AddressBookState
  settings?: SettingsState
  safeApps?: SafeAppsState
  error?: string
}

const getItems = ({ addedSafes, addressBook, settings, safeApps, error }: Data): Array<ReactElement> => {
  if (error) {
    return [<>{error}</>]
  }

  console.log(settings, safeApps)

  const addedSafeChainAmount = Object.keys(addedSafes || {}).length
  const addressBookChainAmount = Object.keys(addressBook || {}).length

  const items = [
    ...(addedSafeChainAmount
      ? [
          <>
            <b>Added Safes</b> on {addedSafeChainAmount} {addedSafeChainAmount === 1 ? 'chain' : 'chains'}
          </>,
        ]
      : []),
    ...(addressBookChainAmount > 0
      ? [
          <>
            <b>Address book</b> for {addressBookChainAmount} {addressBookChainAmount === 1 ? 'chain' : 'chains'}
          </>,
        ]
      : []),
    ...(settings || safeApps
      ? [
          <>
            <b>Settings</b>
          </>,
        ]
      : []),
  ]

  if (items.length === 0) {
    return [<>{ImportErrors.NO_IMPORT_DATA_FOUND}</>]
  }

  return items
}

export const FileListCard = ({
  addedSafes,
  addressBook,
  settings,
  safeApps,
  error,
  ...props
}: Data & CardHeaderProps): ReactElement => {
  const items = useMemo<Array<ReactElement>>(() => {
    return getItems({ addedSafes, addressBook, settings, safeApps, error })
  }, [addedSafes, addressBook, safeApps, settings, error])

  return (
    <Card className={css.card}>
      <CardHeader {...props} className={css.header} />
      <CardContent className={css.content}>
        <List sx={{ p: 0 }}>
          {items.map((item, i) => (
            <ListItem key={i} sx={{ p: 0 }}>
              <ListItemIcon className={css.listIcon}>
                <SvgIcon component={FileIcon} inheritViewBox fontSize="small" sx={{ fill: 'none' }} />
              </ListItemIcon>
              <ListItemText primary={<>{item}</>} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}
