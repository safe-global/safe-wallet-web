import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import useOwnedSafes from '@/hooks/useOwnedSafes'
import Head from 'next/head'
import dynamic from 'next/dynamic'

const CometChatNoSSR = dynamic(() => import('../components/chat/index'), { ssr: false })

//@ts-ignore
const CometChatLoginNoSSR = dynamic(() => import('../components/chat/login'), { ssr: false })

const Home: NextPage = () => {
  useEffect(() => {
    //@ts-ignore
    window.CometChat = require('@cometchat-pro/chat').CometChat
  })

  const [currentUser, setCurrentUser] = useState<any>()
  const allOwnedSafes = useOwnedSafes()

  console.log(allOwnedSafes)

  return (
    <>
      <Head>
        <title>Safe – Chat</title>
      </Head>

      <main>
        {!currentUser ? <CometChatLoginNoSSR setCurrentUser={setCurrentUser} /> : <div></div>}
        <CometChatNoSSR user={currentUser} />
      </main>
    </>
  )
}

export default Home
