import Script from 'next/script'
import { GA_ID, GA_DEV_ID, IS_PRODUCTION } from '@/config/constants'

const gaId = IS_PRODUCTION ? GA_ID : GA_DEV_ID

const AnalyticsScripts = () => {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />

      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  )
}

export default AnalyticsScripts
