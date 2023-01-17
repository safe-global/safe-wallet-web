import { useEffect, useState } from 'react'

import { getMessages, initCometChat, listenForMessage, sendMessage } from '../../services/chat'

//@ts-ignore
const Chat = ({ id, group }) => {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const connectedAccount = '0xc0163E58648b247c143023CFB26C2BAA42C9d9A9'
  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!message) return
    await sendMessage(`pid_${connectedAccount}`, message)
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

  return (
    <div>
      <h2 className="mt-12 px-2 py-1 font-bold text-2xl italic">Safe Chat</h2>
      <h4 className="px-2 font-semibold text-xs">Join the Live Chat</h4>
      <div
        className="bg-gray-800 bg-opacity-50 w-full
        rounded-md p-2 sm:p-8 mt-5 shadow-md shadow-[#25bd9c]"
      >
        <div id="messages-container" className="h-[calc(100vh_-_30rem)] overflow-y-auto">
          {messages.map((msg, i) => (
            //@ts-ignore
            <Message isOwner={msg.sender.uid == connectedAccount} owner={msg.sender.uid} msg={msg.text} key={i} />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-row justify-between items-center bg-gray-800 rounded-md">
          <input
            className="block w-full text-sm resize-none
            text-slate-100 bg-transparent border-0
              focus:outline-none focus:ring-0 h-15 px-4 py-4"
            type="text"
            name="Leave a Message"
            placeholder={!group?.hasJoined ? 'Join group first to chat...' : 'Leave a Message...'}
            disabled={!group?.hasJoined}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <button type="submit" hidden>
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

//@ts-ignore
const Message = ({ msg, owner, isOwner }) => (
  <div>
    <div className="flex justify-start items-center space-x-1 mb-2">
      <div className="space-x-1">
        <span className="text-[#25bd9c] font-bold">{isOwner ? '@You' : owner}</span>
        <span className="text-gray-200 text-xs">{msg}</span>
      </div>
    </div>
  </div>
)

export default Chat
