import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'
import {
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from '@mui/material'
import type { SessionTypes } from '@walletconnect/types'
import type { ReactElement } from 'react'

import css from './styles.module.css'

type SesstionListProps = {
  sessions: SessionTypes.Struct[]
  onDisconnect: (session: SessionTypes.Struct) => void
}

const SessionListItem = ({
  session,
  onDisconnect,
}: {
  session: SessionTypes.Struct
  onDisconnect: () => void
}): ReactElement => {
  return (
    <ListItem className={css.sessionListItem}>
      {session.peer.metadata.icons[0] && (
        <ListItemAvatar>
          <SafeAppIconCard src={session.peer.metadata.icons[0]} alt="icon" width={20} height={20} />
        </ListItemAvatar>
      )}
      <ListItemText primary={session.peer.metadata.name} />
      <ListItemSecondaryAction className={css.sessionListSecondaryAction}>
        <Button variant="danger" onClick={onDisconnect} className={css.button}>
          Disconnect
        </Button>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

const SessionList = ({ sessions, onDisconnect }: SesstionListProps): ReactElement => {
  if (sessions.length === 0) {
    return (
      <Typography variant="body2" textAlign="center" color="text.secondary">
        No dApps are connected yet
      </Typography>
    )
  }

  return (
    <List className={css.sessionList}>
      {Object.values(sessions).map((session) => (
        <SessionListItem key={session.topic} session={session} onDisconnect={() => onDisconnect(session)} />
      ))}
    </List>
  )
}

export default SessionList
