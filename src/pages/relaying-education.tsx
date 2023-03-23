import RelayingEducationSeries from '@/components/relaying-educational'
import { type NextPage } from 'next'
import Head from 'next/head'

const relayingEducation: NextPage = () => {
  return (
    <>
      <Head>
        <title>Safe – What is relaying?</title>
      </Head>

      <RelayingEducationSeries />
    </>
  )
}

export default relayingEducation
