import type { NextPage } from 'next'
import { useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'

const CometChatNoSSR = dynamic(() => import('../components/chat/index'), { ssr: false })

const Home: NextPage = () => {
  useEffect(() => {
    //@ts-ignore
    window.CometChat = require('@cometchat-pro/chat').CometChat
  })

  return (
    <>
      <Head>
        <title>Safe – Chat</title>
      </Head>

      <main>
        <CometChatNoSSR id={''} group={''} />
      </main>
    </>
  )
}

export default Home
