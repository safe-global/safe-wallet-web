import React from 'react'
import { Button } from '@mui/material'
import { sendMessage } from '@/services/chat'

const SendMessage: React.FC<{
  message: any
  safeAddress: string
  setMessages: any
  setMessage: any
  prevState: any
}> = ({ message, safeAddress, setMessages, setMessage, prevState }) => {
  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!message) return
    await sendMessage(`pid_${safeAddress}`, message)
      .then(async (msg: any) => {
        setMessages(() => [...prevState, msg])
        setMessage('')
      })
      .catch((error: any) => {
        console.log(error)
      })
  }

  return (
    <Button variant="contained" onClick={handleSubmit}>
      Send chat
    </Button>
  )
}

export default SendMessage
