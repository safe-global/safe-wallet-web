import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import useOwnedSafes from '@/hooks/useOwnedSafes'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import useSafeAddress from '@/hooks/useSafeAddress'
import Head from 'next/head'
import dynamic from 'next/dynamic'

const JoinNoSSR = dynamic(() => import('../components/chat/join'), { ssr: false })

const CometChatNoSSR = dynamic(() => import('../components/chat/index'), { ssr: false })

//@ts-ignore
const CometChatLoginNoSSR = dynamic(() => import('../components/chat/login'), { ssr: false })

const Home: NextPage = () => {
  useEffect(() => {
    //@ts-ignore
    window.CometChat = require('@cometchat-pro/chat').CometChat
  })

  const [currentUser, setCurrentUser] = useState<any>()
  const [ownerStatus, setOwnerStatus] = useState<boolean>()

  const safeAddress = useSafeAddress
  const allOwnedSafes = useOwnedSafes()
  const { safe } = useSafeInfo()
  const wallet = useWallet()
  const owners = safe?.owners!

  console.log(allOwnedSafes)

  useEffect(() => {
    let isOwnerArr: any[] = []
    if (owners && wallet?.address) {
      owners.map((owner) => {
        if (owner.value == wallet.address) {
          isOwnerArr.push(wallet.address)
        }
      })
      isOwnerArr.length > 0 ? setOwnerStatus(true) : setOwnerStatus(false)
    }
  }, [owners, wallet])

  return (
    <>
      <Head>
        <title>Safe – Chat</title>
      </Head>

      <main>
        {ownerStatus ? (
          <>
            {!currentUser ? <CometChatLoginNoSSR setCurrentUser={setCurrentUser} /> : <div></div>}
            <CometChatNoSSR user={currentUser} />
            <div style={{ border: '2px solid white', padding: '2em', marginTop: '2em' }}>
              Group Members:
              {owners?.map((owner) => (
                <div key={owner.value}>{owner.value}</div>
              ))}
              <JoinNoSSR />
            </div>
          </>
        ) : (
          <div> You are not an owner on this safe. </div>
        )}
      </main>
    </>
  )
}

export default Home
