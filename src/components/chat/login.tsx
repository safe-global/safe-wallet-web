import { toast } from 'react-toastify'
import useWallet from '@/hooks/wallets/useWallet'
import { loginWithCometChat, signUpWithCometChat } from '../../services/chat'
import useSafeAddress from '@/hooks/useSafeAddress'

//@ts-ignore
const Login = ({ setCurrentUser }) => {
  const wallet = useWallet()
  const safeAddress = useSafeAddress()
  console.log('safe', safeAddress)

  const handleLogin = async () => {
    await toast.promise(
      new Promise(async (resolve, reject) => {
        await loginWithCometChat(wallet?.address!)
          .then((user) => {
            setCurrentUser(user)
            console.log(user)
          })
          .catch((err) => {
            console.log(err)
            reject()
          })
      }),
      {
        pending: 'Signing in...',
        success: 'Logged in successful 👌',
        error: 'Error, are you signed up? 🤯',
      },
    )
  }

  const handleSignup = async () => {
    await toast.promise(
      new Promise(async (resolve, reject) => {
        await signUpWithCometChat(wallet?.address!)
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

  return (
    <div className="flex justify-start items-center space-x-2">
      <button onClick={handleLogin}>Login Now</button>
      <button onClick={handleSignup}>Signup Now</button>
    </div>
  )
}

export default Login
