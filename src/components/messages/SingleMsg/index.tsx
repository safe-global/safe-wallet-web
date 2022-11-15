import { useRouter } from 'next/router'

const SingleMsg = () => {
  const router = useRouter()
  const { id } = router.query
  const messageHash = Array.isArray(id) ? id[0] : id

  // TODO: Shared single message
  return <>{messageHash}</>
}

export default SingleMsg
