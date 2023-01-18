import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { getMessages, initCometChat, listenForMessage, sendMessage, createNewGroup } from '../../services/chat'

//@ts-ignore
const Chat = ({ user }) => {
  console.log('loaded')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [group, setGroup] = useState<any>()
  const connectedAccount = '0xc0163E58648b247c143023CFB26C2BAA42C9d9A9'

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!message) return
    await sendMessage(`pid_${'safe'}`, message)
      .then(async (msg: any) => {
        //@ts-ignore
        setMessages((prevState) => [...prevState, msg])
        setMessage('')
        scrollToEnd()
      })
      .catch((error: any) => {
        console.log(error)
      })
  }

  useEffect(() => {
    initCometChat()
    async function getM() {
      await getMessages(`pid_${connectedAccount}`)
        .then((msgs) => {
          //@ts-ignore
          setMessages(msgs)
          scrollToEnd()
        })
        .catch((error) => console.log(error))

      await listenForMessage(`pid_${connectedAccount}`)
        .then((msg) => {
          //@ts-ignore
          setMessages((prevState) => [...prevState, msg])
          scrollToEnd()
        })
        .catch((error) => console.log(error))
    }
    getM()
  }, [])

  const scrollToEnd = () => {
    const elmnt = document.getElementById('messages-container')
    //@ts-ignore
    elmnt.scrollTop = elmnt.scrollHeight
  }

  const handleCreateGroup = async () => {
    if (!user) {
      toast.warning('You need to login or sign up first.')
      return
    }

    await toast.promise(
      new Promise(async (resolve, reject) => {
        await createNewGroup(`pid_${'safe'}`, 'safe')
          .then((gp) => {
            setGroup(gp)
            resolve(gp)
          })
          .catch((error) => reject(new Error(error)))
      }),
      {
        pending: 'Creating...',
        success: 'Group created 👌',
        error: 'Encountered error 🤯',
      },
    )
  }

  return (
    <div>
      <h2>Safe Chat</h2>
      <h4>Join the Live Chat</h4>
      <div>
        <div id="messages-container">
          {messages.map((msg, i) => (
            //@ts-ignore
            <Message isOwner={msg.sender.uid == connectedAccount} owner={msg.sender.uid} msg={msg.text} key={i} />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="Leave a Message"
            placeholder={!group?.hasJoined ? 'Join group first to chat...' : 'Leave a Message...'}
            disabled={!group?.hasJoined}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <button type="submit">Send</button>
        </form>

        {!group ? (
          <button
            type="button"
            className="shadow-sm shadow-black text-white
            bg-red-500 hover:bg-red-700 md:text-xs p-2.5
            rounded-sm cursor-pointer font-light"
            onClick={handleCreateGroup}
          >
            Create Group
          </button>
        ) : null}
      </div>
    </div>
  )
}

//@ts-ignore
const Message = ({ msg, owner, isOwner }) => (
  <div>
    <div>
      <div>
        <span>{isOwner ? '@You' : owner}</span>
        <span>{msg}</span>
      </div>
    </div>
  </div>
)

export default Chat
