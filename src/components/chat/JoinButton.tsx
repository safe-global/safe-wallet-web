import useSafeAddress from '@/hooks/useSafeAddress'
import { Box, Button, Stack } from '@mui/material'
import { Container } from '@mui/system'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { createNewGroup, getGroup, getMessages, joinGroup, listenForMessage } from '../../services/chat'

const JoinButton: React.FC<{
  user: any
  setGroup: any
  setMessages: any
}> = ({ user, setGroup, setMessages }) => {
  const safeAddress = useSafeAddress()

  useEffect(() => {
    handleCreateGroup()
    handleJoin()
  }, [])

  useEffect(() => {
    async function getM() {
      await getMessages(`pid_${safeAddress!}`)
        .then((msgs: any) => {
          console.log(msgs)
          setMessages(msgs)
        })
        .catch((error) => {
          console.log(error)
          setMessages([])
        })

      await listenForMessage(`pid_${safeAddress!}`)
        .then((msg: any) => {
          setMessages((prevState: any) => [...prevState, msg])
        })
        .catch((error) => console.log(error))
    }
    getM()
  }, [safeAddress])

  const handleJoin = async () => {
    await toast.promise(
      new Promise(async (resolve, reject) => {
        await joinGroup(`pid_${safeAddress}`)
          .then((user) => {
            console.log(user)
            resolve(user)
          })
          .catch((err) => {
            console.log(err)
            reject(err)
          })
      }),
      {
        pending: 'Signing up...',
        success: 'Signned up successful 👌',
        error: 'Error, maybe you should login instead? 🤯',
      },
    )
    await handleGetGroup()
  }

  const handleCreateGroup = async () => {
    if (!user) {
      toast.warning('You need to login or sign up first.')
      return
    }

    await toast.promise(
      new Promise(async (resolve, reject) => {
        await createNewGroup(`pid_${safeAddress}`, 'safe')
          .then((gp) => {
            setGroup(gp)
            resolve(gp)
          })
          .catch((error) => {
            console.log(error)
            return
          })
      }),
      {
        pending: 'Creating...',
        success: 'Group created 👌',
        error: 'Encountered error 🤯',
      },
    )
    await handleJoin()
    await handleGetGroup()
  }

  const handleGetGroup = async () => {
    if (!user) {
      toast.warning('You need to login or sign up first.')
      return
    }

    await toast.promise(
      new Promise(async (resolve, reject) => {
        await getGroup(`pid_${safeAddress}`)
          .then((gp) => {
            setGroup(gp)
            resolve(gp)
          })
          .catch((error) => console.log(error))
      }),
      {
        pending: 'Creating...',
        success: 'Group created 👌',
        error: 'Encountered error 🤯',
      },
    )
  }

  return (
    <Container>
      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={2}>
          <Button variant="contained" onClick={handleGetGroup}>
            Get Group
          </Button>
          {/* <Button variant="text" onClick={handleSignup}>
            Sign up <ChevronRightIcon />
          </Button> */}
        </Stack>
      </Box>
    </Container>
  )
}

export default JoinButton
