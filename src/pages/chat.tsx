import type { NextPage } from 'next'
import Head from 'next/head'
import Chat from '../components/chat'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Safe – Chat</title>
      </Head>

      <main>
        <Chat id={''} group={''} />
      </main>
    </>
  )
}

export default Home
