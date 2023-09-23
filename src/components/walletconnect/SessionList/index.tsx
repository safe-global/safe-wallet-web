import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'
import { Button, Typography } from '@mui/material'
import type { SessionTypes } from '@walletconnect/types'

type SesstionListProps = {
  sessions: SessionTypes.Struct[]
  onDisconnect: (session: SessionTypes.Struct) => void
}

const SessionList = ({ sessions, onDisconnect }: SesstionListProps) => {
  return (
    <>
      <Typography variant="h5">Connected peers</Typography>

      <ul>
        {Object.values(sessions).map((session) => (
          <li key={session.topic}>
            {session.peer.metadata.icons[0] && (
              <SafeAppIconCard src={session.peer.metadata.icons[0]} alt="icon" width={20} height={20} />
            )}
            {session.peer.metadata.name}
            <Button onClick={() => onDisconnect(session)}>Disconnect</Button>
          </li>
        ))}
      </ul>
    </>
  )
}

export default SessionList
