import type { NextPage, NextPageContext } from 'next'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'

const Error: NextPage = ({ statusCode }: { statusCode?: number }) => {
  const router = useRouter()

  if (statusCode === 403) router.replace(AppRoutes['403'])
  return <p>{statusCode ? `An error ${statusCode} occurred on server` : 'An error occurred on client'}</p>
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
