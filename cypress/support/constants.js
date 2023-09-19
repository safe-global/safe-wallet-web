import { LS_NAMESPACE } from '../../src/config/constants'
export const RECIPIENT_ADDRESS = '0x6a5602335a878ADDCa4BF63a050E34946B56B5bC'
export const GOERLI_TEST_SAFE = 'gor:0x97d314157727D517A706B5D08507A1f9B44AaaE9'
export const GNO_TEST_SAFE = 'gno:0xB8d760a90a5ed54D3c2b3EFC231277e99188642A'
export const PAGINATION_TEST_SAFE = 'gor:0x850493a15914aAC05a821A3FAb973b4598889A7b'
export const TEST_SAFE = 'gor:0x04f8b1EA3cBB315b87ced0E32deb5a43cC151a91'
export const EOA = '0xE297437d6b53890cbf004e401F3acc67c8b39665'
export const DEFAULT_OWNER_ADDRESS = '0xC16Db0251654C0a72E91B190d81eAD367d2C6fED'
export const TEST_SAFE_2 = 'gor:0xE96C43C54B08eC528e9e815fC3D02Ea94A320505'
export const SIDEBAR_ADDRESS = '0x04f8...1a91'

export const BROWSER_PERMISSIONS_KEY = `${LS_NAMESPACE}SafeApps__browserPermissions`
export const SAFE_PERMISSIONS_KEY = `${LS_NAMESPACE}SafeApps__safePermissions`
export const INFO_MODAL_KEY = `${LS_NAMESPACE}SafeApps__infoModal`

export const goerlyE2EWallet = /E2E Wallet @ G(ö|oe)rli/
export const goerlySafeName = /g(ö|oe)rli-safe/
export const goerliToken = /G(ö|oe)rli Ether/

export const testAppUrl = 'https://safe-test-app.com'
export const addressBookUrl = '/address-book?safe='
export const BALANCE_URL = '/balances?safe='
export const balanceNftsUrl = '/balances/nfts?safe='
export const transactionQueueUrl = '/transactions/queue?safe='
export const transactionsHistoryUrl = '/transactions/history?safe='
export const openAppsUrl = '/apps/open?safe='
export const homeUrl = '/home?safe='
export const welcomeUrl = '/welcome'
export const chainMaticUrl = '/welcome?chain=matic'
export const appsUrl = '/apps'
export const requestPermissionsUrl = '/request-permissions'
export const getPermissionsUrl = '/get-permissions'
export const appSettingsUrl = '/settings/safe-apps'
export const invalidappUrl = 'https://my-invalid-custom-app.com/manifest.json'
export const validappUrlJson = 'https://my-valid-custom-app.com/manifest.json'
export const validappUrl = 'https://my-valid-custom-app.com'

export const proposeEndPoint = '/**/propose'
export const appsEndPoint = '/**/safe-apps'

export const GOERLI_CSV_ENTRY = {
  name: 'goerli user 1',
  address: '0x730F87dA2A3C6721e2196DFB990759e9bdfc5083',
}
export const GNO_CSV_ENTRY = {
  name: 'gno user 1',
  address: '0x61a0c717d18232711bC788F19C9Cd56a43cc8872',
}

export const networks = {
  ethereum: 'Ethereum',
  goerli: /^G(ö|oe)rli$/,
  sepolia: 'Sepolia',
  polygon: 'Polygon',
}

export const tokenAbbreviation = {
  gor: 'GOR',
}

export const appNames = {
  walletconnect: 'walletconnect',
  customcontract: 'compose custom contract',
  noresults: 'atextwithoutresults',
}

export const testAppData = {
  name: 'Cypress Test App',
  descr: 'Cypress Test App Description',
}
