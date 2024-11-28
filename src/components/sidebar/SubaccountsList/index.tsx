import Track from '@/components/common/Track'
import { SUBACCOUNT_EVENTS, SUBACCOUNT_LABELS } from '@/services/analytics/events/subaccounts'
import { ChevronRight } from '@mui/icons-material'
import { List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from '@mui/material'
import { useState, type ReactElement } from 'react'
import Identicon from '@/components/common/Identicon'
import { shortenAddress } from '@/utils/formatters'
import useAddressBook from '@/hooks/useAddressBook'
import { trackEvent } from '@/services/analytics'

const MAX_SUBACCOUNTS = 5

export function SubaccountsList({ subaccounts }: { subaccounts: Array<string> }): ReactElement {
  const [showAll, setShowAll] = useState(false)
  const subaccountsToShow = showAll ? subaccounts : subaccounts.slice(0, MAX_SUBACCOUNTS)

  const onShowAll = () => {
    setShowAll(true)
  }

  return (
    <List sx={{ gap: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {subaccountsToShow.map((subaccount) => {
        return <SubaccountListItem subaccount={subaccount} key={subaccount} />
      })}
      {subaccounts.length > MAX_SUBACCOUNTS && !showAll && (
        <Track {...SUBACCOUNT_EVENTS.SHOW_ALL}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
            onClick={onShowAll}
          >
            Show all Subaccounts
            <ChevronRight color="border" sx={{ transform: 'rotate(90deg)', ml: 1 }} fontSize="inherit" />
          </Typography>
        </Track>
      )}
    </List>
  )
}

function SubaccountListItem({ subaccount }: { subaccount: string }): ReactElement {
  const addressBook = useAddressBook()
  const name = addressBook[subaccount]

  // Note: using the Track element breaks accessibility/styles
  const onClick = () => {
    trackEvent({ ...SUBACCOUNT_EVENTS.OPEN_SUBACCOUNT, label: SUBACCOUNT_LABELS.list })
  }

  return (
    <ListItem
      sx={{
        border: ({ palette }) => `1px solid ${palette.border.light}`,
        borderRadius: ({ shape }) => `${shape.borderRadius}px`,
        p: 0,
      }}
    >
      <ListItemButton sx={{ p: '11px 12px' }} onClick={onClick}>
        <ListItemAvatar sx={{ minWidth: 'unset', pr: 1 }}>
          <Identicon address={subaccount} size={32} />
        </ListItemAvatar>
        <ListItemText
          primary={name}
          primaryTypographyProps={{
            fontWeight: 700,
            sx: {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          }}
          secondary={shortenAddress(subaccount)}
          secondaryTypographyProps={{ color: 'primary.light' }}
          sx={{ my: 0 }}
        />
        <ChevronRight color="border" />
      </ListItemButton>
    </ListItem>
  )
}
