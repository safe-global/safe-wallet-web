import { Typography, Table, TableBody, TableRow, TableCell, TableHead, TableContainer, Box } from '@mui/material'
import ExternalLink from '@/components/common/ExternalLink'
import Paper from '@mui/material/Paper'

const SafeLicenses = () => {
  return (
    <>
      <Typography variant="h1" mb={2}>
        Licenses
      </Typography>
      <Typography variant="h3" mb={2}>
        Libraries we use
      </Typography>
      <Box mb={4}>
        <Typography mb={3}>
          This page contains a list of attribution notices for third party software that may be contained in portions of
          the Safe. We thank the open source community for all of their contributions.
        </Typography>
        <Typography variant="h2" mb={2}>
          Android
        </Typography>
        <TableContainer component={Paper} sx={{ width: '100%' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Library</strong>
                </TableCell>
                <TableCell>
                  <strong>License</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>AndroidX</TableCell>
                <TableCell>
                  <ExternalLink href="https://android.googlesource.com/platform/frameworks/support/%2B/androidx-master-dev/LICENSE.txt">
                    https://android.googlesource.com/platform/frameworks/support/+/androidx-master-dev/LICENSE.txt
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Bivrost for Kotlin</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/gnosis/bivrost-kotlin/blob/master/LICENSE">
                    https://github.com/gnosis/bivrost-kotlin/blob/master/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Dagger</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/google/dagger#license">
                    {' '}
                    https://github.com/google/dagger#license{' '}
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>FloatingActionButton</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/Clans/FloatingActionButton/blob/master/LICENSE">
                    https://github.com/Clans/FloatingActionButton/blob/master/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Material Progress Bar</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/DreaminginCodeZH/MaterialProgressBar/blob/master/LICENSE">
                    https://github.com/DreaminginCodeZH/MaterialProgressBar/blob/master/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Kethereum</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/walleth/kethereum/blob/master/LICENSE">
                    https://github.com/walleth/kethereum/blob/master/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Koptional</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/gojuno/koptional#license">
                    {' '}
                    https://github.com/gojuno/koptional#license{' '}
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Moshi</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/square/moshi#license">
                    {' '}
                    https://github.com/square/moshi#license{' '}
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>OkHttp</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/square/okhttp#license">
                    {' '}
                    https://github.com/square/okhttp#license{' '}
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Okio</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/square/okio#license">
                    {' '}
                    https://github.com/square/okio#license{' '}
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Phrase</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/square/phrase/#license">
                    {' '}
                    https://github.com/square/phrase/#license{' '}
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Picasso</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/square/picasso#license">
                    {' '}
                    https://github.com/square/picasso#license{' '}
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>ReTrofit</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/square/reTrofit#license">
                    {' '}
                    https://github.com/square/reTrofit#license{' '}
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>RxAndroid</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/ReactiveX/RxAndroid#license">
                    https://github.com/ReactiveX/RxAndroid#license
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>RxBinding</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/JakeWharton/RxBinding#license">
                    https://github.com/JakeWharton/RxBinding#license
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>RxJava</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/ReactiveX/RxJava#license">
                    {' '}
                    https://github.com/ReactiveX/RxJava#license{' '}
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>RxKotlin</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/ReactiveX/RxKotlin/blob/2.x/LICENSE">
                    https://github.com/ReactiveX/RxKotlin/blob/2.x/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>SpongyCastle</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/rtyley/spongycastle/blob/spongy-master/LICENSE.html">
                    https://github.com/rtyley/spongycastle/blob/spongy-master/LICENSE.html
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Svalinn Android</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/gnosis/svalinn-kotlin/blob/master/LICENSE">
                    https://github.com/gnosis/svalinn-kotlin/blob/master/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Timber</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/JakeWharton/timber#license">
                    https://github.com/JakeWharton/timber#license
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Zxing</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/zxing/zxing/blob/master/LICENSE">
                    https://github.com/zxing/zxing/blob/master/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box mb={4}>
        <Typography variant="h2" mb={2}>
          iOS
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Library</strong>
                </TableCell>
                <TableCell>
                  <strong>License</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>BigInt</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/attaswift/BigInt/blob/master/LICENSE.md">
                    https://github.com/attaswift/BigInt/blob/master/LICENSE.md
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>BlockiesSwift</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/gnosis/BlockiesSwift/blob/master/LICENSE">
                    https://github.com/gnosis/BlockiesSwift/blob/master/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>CryptoEthereumSwift</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/yuzushioh/CryptoEthereumSwift/blob/master/LICENSE">
                    https://github.com/yuzushioh/CryptoEthereumSwift/blob/master/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>CryptoSwift</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/krzyzanowskim/CryptoSwift#license">
                    https://github.com/krzyzanowskim/CryptoSwift#license
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>DateTools</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/gnosis/DateTools#license">
                    {' '}
                    https://github.com/gnosis/DateTools#license{' '}
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>EthereumKit</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/D-Technologies/EthereumKit#license">
                    https://github.com/D-Technologies/EthereumKit#license
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Keycard.swift</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/gnosis/Keycard.swift/blob/master/LICENSE">
                    https://github.com/gnosis/Keycard.swift/blob/master/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Kingfisher</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/onevcat/Kingfisher#license">
                    https://github.com/onevcat/Kingfisher#license
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>SipHash</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/attaswift/SipHash/blob/master/LICENSE.md">
                    https://github.com/attaswift/SipHash/blob/master/LICENSE.md
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Starscream</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/daltoniam/Starscream/blob/master/LICENSE">
                    https://github.com/daltoniam/Starscream/blob/master/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>RsBarcodesSwift</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/yeahdongcn/RSBarcodes_Swift#license">
                    https://github.com/yeahdongcn/RSBarcodes_Swift#license
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>libidn2</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/gnosis/libidn2/blob/master/COPYING.LESSERv3">
                    https://github.com/gnosis/libidn2/blob/master/COPYING.LESSERv3
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>libunisTring</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/gnosis/libunisTring/blob/master/COPYING.LIB">
                    https://github.com/gnosis/libunisTring/blob/master/COPYING.LIB
                  </ExternalLink>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box>
        <Typography variant="h2" mb={2}>
          Web
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Library</TableCell>
                <TableCell>License</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>@date-io/date-fns</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/dmtrKovalenko/date-io/blob/main/LICENSE">
                    https://github.com/dmtrKovalenko/date-io/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@emotion/cache</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/emotion-js/emotion/blob/main/LICENSE">
                    https://github.com/emotion-js/emotion/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@emotion/react</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/emotion-js/emotion/blob/main/LICENSE">
                    https://github.com/emotion-js/emotion/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@emotion/server</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/emotion-js/emotion/blob/main/LICENSE">
                    https://github.com/emotion-js/emotion/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@emotion/styled</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/emotion-js/emotion/blob/main/LICENSE">
                    https://github.com/emotion-js/emotion/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@gnosis.pm/safe-deployments</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/gnosis/safe-deployments/blob/main/LICENSE">
                    https://github.com/gnosis/safe-deployments/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@safe-global/safe-modules-deployments</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/safe-global/safe-modules-deployments/blob/main/LICENSE">
                    https://github.com/safe-global/safe-modules-deployments/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@mui/icons-material</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/mui/material-ui/blob/main/LICENSE">
                    https://github.com/mui/material-ui/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@mui/material</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/mui/material-ui/blob/main/LICENSE">
                    https://github.com/mui/material-ui/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@mui/x-date-pickers</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/mui/mui-x/blob/main/LICENSE">
                    https://github.com/mui/mui-x/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@reduxjs/toolkit</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/reduxjs/redux-toolkit/blob/main/LICENSE">
                    https://github.com/reduxjs/redux-toolkit/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@safe-global/safe-apps-sdk</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/safe-global/safe-apps-sdk/blob/main/LICENSE">
                    https://github.com/safe-global/safe-apps-sdk/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@safe-global/safe-core-sdk</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/safe-global/safe-core-sdk/blob/main/LICENSE">
                    https://github.com/safe-global/safe-core-sdk/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@safe-global/safe-core-sdk-utils</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/safe-global/safe-core-sdk/blob/main/LICENSE">
                    https://github.com/safe-global/safe-core-sdk/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@safe-global/safe-deployments</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/safe-global/safe-deployments/blob/main/LICENSE">
                    https://github.com/safe-global/safe-deployments/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@safe-global/safe-ethers-lib</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/safe-global/safe-core-sdk/blob/main/LICENSE">
                    https://github.com/safe-global/safe-core-sdk/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@safe-global/safe-gateway-typescript-sdk</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/safe-global/safe-gateway-typescript-sdk/blob/main/LICENSE">
                    https://github.com/safe-global/safe-gateway-typescript-sdk/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@safe-global/safe-react-components</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/safe-global/safe-react-components/blob/main/LICENSE">
                    https://github.com/safe-global/safe-react-components/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@sentry/react</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/getsentry/sentry-javascript/blob/main/LICENSE">
                    https://github.com/getsentry/sentry-javascript/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@sentry/tracing</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/getsentry/sentry-javascript/blob/main/LICENSE">
                    https://github.com/getsentry/sentry-javascript/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@truffle/hdwallet-provider</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/trufflesuite/truffle/blob/main/LICENSE">
                    https://github.com/trufflesuite/truffle/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@web3-onboard/coinbase</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/blocknative/web3-onboard/blob/main/LICENSE">
                    https://github.com/blocknative/web3-onboard/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@web3-onboard/core</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/blocknative/web3-onboard/blob/main/LICENSE">
                    https://github.com/blocknative/web3-onboard/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@web3-onboard/injected-wallets</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/blocknative/web3-onboard/blob/main/LICENSE">
                    https://github.com/blocknative/web3-onboard/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@web3-onboard/keystone</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/blocknative/web3-onboard/blob/main/LICENSE">
                    https://github.com/blocknative/web3-onboard/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@web3-onboard/ledger</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/blocknative/web3-onboard/blob/main/LICENSE">
                    https://github.com/blocknative/web3-onboard/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@web3-onboard/tallyho</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/blocknative/web3-onboard/blob/main/LICENSE">
                    https://github.com/blocknative/web3-onboard/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@web3-onboard/trezor</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/blocknative/web3-onboard/blob/main/LICENSE">
                    https://github.com/blocknative/web3-onboard/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@web3-onboard/walletconnect</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/blocknative/web3-onboard/blob/main/LICENSE">
                    https://github.com/blocknative/web3-onboard/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>classnames</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/JedWatson/classnames/blob/main/LICENSE">
                    https://github.com/JedWatson/classnames/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>date-fns</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/date-fns/date-fns/blob/main/LICENSE">
                    https://github.com/date-fns/date-fns/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>ethereum-blockies-base64</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/MyCryptoHQ/ethereum-blockies-base64/blob/main/LICENSE">
                    https://github.com/MyCryptoHQ/ethereum-blockies-base64/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>ethers</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/ethers-io/ethers.js/blob/main/LICENSE">
                    https://github.com/ethers-io/ethers.js/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>exponential-backoff</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/coveo/exponential-backoff/blob/main/LICENSE">
                    https://github.com/coveo/exponential-backoff/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>fuse.js</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/krisk/Fuse/blob/main/LICENSE">
                    https://github.com/krisk/Fuse/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>js-cookie</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/js-cookie/js-cookie/blob/main/LICENSE">
                    https://github.com/js-cookie/js-cookie/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>lodash</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/lodash/lodash/blob/main/LICENSE">
                    https://github.com/lodash/lodash/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>next</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/vercel/next.js/blob/main/LICENSE">
                    https://github.com/vercel/next.js/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>next-pwa</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/shadowwalker/next-pwa/blob/main/LICENSE">
                    https://github.com/shadowwalker/next-pwa/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>papaparse</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/mholt/PapaParse/blob/main/LICENSE">
                    https://github.com/mholt/PapaParse/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>qrcode.react</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/zpao/qrcode.react/blob/main/LICENSE">
                    https://github.com/zpao/qrcode.react/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>react</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/facebook/react/blob/main/LICENSE">
                    https://github.com/facebook/react/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>react-dom</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/facebook/react/blob/main/LICENSE">
                    https://github.com/facebook/react/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>react-dropzone</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/react-dropzone/react-dropzone/blob/main/LICENSE">
                    https://github.com/react-dropzone/react-dropzone/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>react-gtm-module</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/alinemorelli/react-gtm/blob/main/LICENSE">
                    https://github.com/alinemorelli/react-gtm/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>react-hook-form</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/react-hook-form/react-hook-form/blob/main/LICENSE">
                    https://github.com/react-hook-form/react-hook-form/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>react-papaparse</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/Bunlong/react-papaparse/blob/main/LICENSE">
                    https://github.com/Bunlong/react-papaparse/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>react-qr-reader</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/JodusNodus/react-qr-reader/blob/main/LICENSE">
                    https://github.com/JodusNodus/react-qr-reader/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>react-redux</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/reduxjs/react-redux/blob/main/LICENSE">
                    https://github.com/reduxjs/react-redux/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>semver</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/npm/node-semver/blob/main/LICENSE">
                    https://github.com/npm/node-semver/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@next/bundle-analyzer</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/vercel/next.js/blob/main/LICENSE">
                    https://github.com/vercel/next.js/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@openzeppelin/contracts</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/OpenZeppelin/openzeppelin-contracts/blob/main/LICENSE">
                    https://github.com/OpenZeppelin/openzeppelin-contracts/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@safe-global/safe-core-sdk-types</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/safe-global/safe-core-sdk/blob/main/LICENSE">
                    https://github.com/safe-global/safe-core-sdk/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@sentry/types</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/getsentry/sentry-javascript/blob/main/LICENSE">
                    https://github.com/getsentry/sentry-javascript/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@svgr/webpack</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/gregberge/svgr/blob/main/LICENSE">
                    https://github.com/gregberge/svgr/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@testing-library/cypress</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/kentcdodds/cypress-testing-library/blob/main/LICENSE">
                    https://github.com/kentcdodds/cypress-testing-library/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@testing-library/jest-dom</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/testing-library/jest-dom/blob/main/LICENSE">
                    https://github.com/testing-library/jest-dom/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@testing-library/react</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/testing-library/react-testing-library/blob/main/LICENSE">
                    https://github.com/testing-library/react-testing-library/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@testing-library/user-event</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/testing-library/user-event/blob/main/LICENSE">
                    https://github.com/testing-library/user-event/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@typechain/ethers-v5</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/ethereum-ts/Typechain/blob/main/LICENSE">
                    https://github.com/ethereum-ts/Typechain/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@types/jest</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/DefinitelyTyped/DefinitelyTyped/blob/main/LICENSE">
                    https://github.com/DefinitelyTyped/DefinitelyTyped/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@types/js-cookie</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/DefinitelyTyped/DefinitelyTyped/blob/main/LICENSE">
                    https://github.com/DefinitelyTyped/DefinitelyTyped/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@types/lodash</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/DefinitelyTyped/DefinitelyTyped/blob/main/LICENSE">
                    https://github.com/DefinitelyTyped/DefinitelyTyped/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@types/node</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/DefinitelyTyped/DefinitelyTyped/blob/main/LICENSE">
                    https://github.com/DefinitelyTyped/DefinitelyTyped/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@types/qrcode</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/DefinitelyTyped/DefinitelyTyped/blob/main/LICENSE">
                    https://github.com/DefinitelyTyped/DefinitelyTyped/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@types/react</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/DefinitelyTyped/DefinitelyTyped/blob/main/LICENSE">
                    https://github.com/DefinitelyTyped/DefinitelyTyped/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@types/react-dom</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/DefinitelyTyped/DefinitelyTyped/blob/main/LICENSE">
                    https://github.com/DefinitelyTyped/DefinitelyTyped/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@types/react-gtm-module</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/DefinitelyTyped/DefinitelyTyped/blob/main/LICENSE">
                    https://github.com/DefinitelyTyped/DefinitelyTyped/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@types/react-qr-reader</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/DefinitelyTyped/DefinitelyTyped/blob/main/LICENSE">
                    https://github.com/DefinitelyTyped/DefinitelyTyped/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@types/semver</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/DefinitelyTyped/DefinitelyTyped/blob/main/LICENSE">
                    https://github.com/DefinitelyTyped/DefinitelyTyped/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>@typescript-eslint/eslint-plugin</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/typescript-eslint/typescript-eslint/blob/main/LICENSE">
                    https://github.com/typescript-eslint/typescript-eslint/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>cross-env</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/kentcdodds/cross-env/blob/main/LICENSE">
                    https://github.com/kentcdodds/cross-env/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>cypress</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/cypress-io/cypress/blob/main/LICENSE">
                    https://github.com/cypress-io/cypress/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>cypress-file-upload</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/abramenal/cypress-file-upload/blob/main/LICENSE">
                    https://github.com/abramenal/cypress-file-upload/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>eslint</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/eslint/eslint/blob/main/LICENSE">
                    https://github.com/eslint/eslint/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>eslint-config-next</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/vercel/next.js/blob/main/LICENSE">
                    https://github.com/vercel/next.js/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>eslint-config-prettier</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/prettier/eslint-config-prettier/blob/main/LICENSE">
                    https://github.com/prettier/eslint-config-prettier/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>eslint-plugin-prettier</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/prettier/eslint-plugin-prettier/blob/main/LICENSE">
                    https://github.com/prettier/eslint-plugin-prettier/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>eslint-plugin-unused-imports</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/sweepline/eslint-plugin-unused-imports/blob/main/LICENSE">
                    https://github.com/sweepline/eslint-plugin-unused-imports/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>jest</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/facebook/jest/blob/main/LICENSE">
                    https://github.com/facebook/jest/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>jest-environment-jsdom</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/facebook/jest/blob/main/LICENSE">
                    https://github.com/facebook/jest/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>pre-commit</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/observing/pre-commit/blob/main/LICENSE">
                    https://github.com/observing/pre-commit/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>prettier</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/prettier/prettier/blob/main/LICENSE">
                    https://github.com/prettier/prettier/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>ts-node</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/TypeStrong/ts-node/blob/main/LICENSE">
                    https://github.com/TypeStrong/ts-node/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>ts-prune</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/nadeesha/ts-prune/blob/main/LICENSE">
                    https://github.com/nadeesha/ts-prune/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>typechain</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/ethereum-ts/Typechain/blob/main/LICENSE">
                    https://github.com/ethereum-ts/Typechain/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>typescript</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/Microsoft/TypeScript/blob/main/LICENSE">
                    https://github.com/Microsoft/TypeScript/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>typescript-plugin-css-modules</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/mrmckeb/typescript-plugin-css-modules/blob/main/LICENSE">
                    https://github.com/mrmckeb/typescript-plugin-css-modules/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>whatwg-fetch</TableCell>
                <TableCell>
                  <ExternalLink href="https://github.com/github/fetch/blob/main/LICENSE">
                    https://github.com/github/fetch/blob/main/LICENSE
                  </ExternalLink>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  )
}

export default SafeLicenses
