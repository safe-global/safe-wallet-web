import { toast } from 'react-toastify'
import useSafeAddress from '@/hooks/useSafeAddress'
import { joinGroup } from '../../services/chat'

const Join: any = ({}) => {
  const safeAddress = useSafeAddress()

  const handleJoin = async () => {
    await toast.promise(
      new Promise(async (resolve, reject) => {
        await joinGroup(safeAddress!)
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
  }

  return <button onClick={handleJoin}>Join</button>
}

export default Join
