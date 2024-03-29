import type { SessionTypes } from '@walletconnect/types'
import { Button, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText } from '@mui/material'
import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'
import useSafeInfo from '@/hooks/useSafeInfo'
import { getPeerName } from '@/features/walletconnect/services/utils'
import WcNoSessions from './WcNoSessions'
import css from './styles.module.css'

type WcSesstionListProps = {
  sessions: SessionTypes.Struct[]
  onDisconnect: (session: SessionTypes.Struct) => void
}

const WcSessionListItem = ({ session, onDisconnect }: { session: SessionTypes.Struct; onDisconnect: () => void }) => {
  const MAX_NAME_LENGTH = 23
  const { safeLoaded } = useSafeInfo()
  let name = getPeerName(session.peer) || 'Unknown dApp'

  if (name.length > MAX_NAME_LENGTH + 1) {
    name = `${name.slice(0, MAX_NAME_LENGTH)}…`
  }

  return (
    <ListItem className={css.sessionListItem}>
      {session.peer.metadata.icons[0] && (
        <ListItemAvatar className={css.sessionListAvatar}>
          <SafeAppIconCard src={session.peer.metadata.icons[0]} alt="icon" width={20} height={20} />
        </ListItemAvatar>
      )}

      <ListItemText primary={name} primaryTypographyProps={{ color: safeLoaded ? undefined : 'text.secondary' }} />

      <ListItemIcon className={css.sessionListSecondaryAction}>
        <Button variant="danger" onClick={onDisconnect} className={css.button}>
          Disconnect
        </Button>
      </ListItemIcon>
    </ListItem>
  )
}

const WcSessionList = ({ sessions, onDisconnect }: WcSesstionListProps) => {
  if (sessions.length === 0) {
    return <WcNoSessions />
  }

  return (
    <List className={css.sessionList}>
      {Object.values(sessions).map((session) => (
        <WcSessionListItem key={session.topic} session={session} onDisconnect={() => onDisconnect(session)} />
      ))}
    </List>
  )
}

export default WcSessionList
