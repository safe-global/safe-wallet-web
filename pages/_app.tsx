import { ReactElement } from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Provider } from 'react-redux'
import '../styles/globals.css'
import { store } from 'store'
import useChains from 'services/useChains'
import useSafeInfo from 'services/useSafeInfo'
import PageLayout from 'components/common/PageLayout'

const InitApp = (): null => {
  useChains()
  useSafeInfo()

  return null
}

const SafeWebCore = ({ Component, pageProps }: AppProps): ReactElement => {
  return (
    <Provider store={store}>
      <Head>
        <title>Safe</title>
        <meta name="description" content="Safe app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <InitApp />

      <PageLayout>
        <Component {...pageProps} />
      </PageLayout>
    </Provider>
  )
}

export default SafeWebCore
