import { LS_NAMESPACE } from '../../src/config/constants'
export const RECIPIENT_ADDRESS = '0x6a5602335a878ADDCa4BF63a050E34946B56B5bC'
export const GOERLI_SAFE_APPS_SAFE = 'gor:0x168ca275d1103cb0a30980813140053c7566932F'
export const GOERLI_TEST_SAFE = 'gor:0x97d314157727D517A706B5D08507A1f9B44AaaE9'
// SEPOLIA_TEST_SAFE_1 should always have no transactions, tokens and NFTs
export const SEPOLIA_TEST_SAFE_1 = 'sep:0xBb26E3717172d5000F87DeFd391994f789D80aEB'
// SEPOLIA_TEST_SAFE_2 Has no transactions, 1 owner, using for verificatons only
export const SEPOLIA_TEST_SAFE_2 = 'sep:0x33C4AA5729D91FfB3B87AEf8a324bb6304Fb905c'
export const SEPOLIA_TEST_SAFE_3 = 'sep:0x6E834E9D04ad6b26e1525dE1a37BFd9b215f40B7'
export const SEPOLIA_TEST_SAFE_4 = 'sep:0x03042B890b99552b60A073F808100517fb148F60'
export const SEPOLIA_TEST_SAFE_5 = 'sep:0xBd69b0a9DC90eB6F9bAc3E4a5875f437348b6415'
export const SEPOLIA_TEST_SAFE_6 = 'sep:0x6d0b6F96f665Bb4490f9ddb2e450Da2f7e546dC1'
export const SEPOLIA_TEST_SAFE_7 = 'sep:0xBf30F749FC027a5d79c4710D988F0D3C8e217A4F'
export const GNO_TEST_SAFE = 'gno:0xB8d760a90a5ed54D3c2b3EFC231277e99188642A'
export const PAGINATION_TEST_SAFE = 'gor:0x850493a15914aAC05a821A3FAb973b4598889A7b'
export const TEST_SAFE = 'gor:0x04f8b1EA3cBB315b87ced0E32deb5a43cC151a91'
export const EOA = '0x03042B890b99552b60A073F808100517fb148F60'
export const SAFE_APP_ADDRESS = '0x51A099ac1BF46D471110AA8974024Bfe518Fd6C4'
export const SAFE_APP_ADDRESS_2 = '0x49d4450977E2c95362C13D3a31a09311E0Ea26A6'
export const SAFE_APP_ADDRESS_3 = '0xc6b82bA149CFA113f8f48d5E3b1F78e933e16DfD'
export const SAFE_APP_ADDRESS_2_SHORT = '0x49d4...26A6'
export const DEFAULT_OWNER_ADDRESS = '0xC16Db0251654C0a72E91B190d81eAD367d2C6fED'
export const SEPOLIA_OWNER_2 = '0x96D4c6fFC338912322813a77655fCC926b9A5aC5'
export const TEST_SAFE_2 = 'gor:0xE96C43C54B08eC528e9e815fC3D02Ea94A320505'
export const SIDEBAR_ADDRESS = '0x04f8...1a91'
export const ENS_TEST_SEPOLIA = 'testenssepolia.eth'
export const ENS_TEST_GOERLI = 'goerli-safe-test.eth'
export const ENS_TEST_SEPOLIA_INVALID = 'ivladitestenssepolia.eth'

export const BROWSER_PERMISSIONS_KEY = `${LS_NAMESPACE}SafeApps__browserPermissions`
export const SAFE_PERMISSIONS_KEY = `${LS_NAMESPACE}SafeApps__safePermissions`
export const INFO_MODAL_KEY = `${LS_NAMESPACE}SafeApps__infoModal`

export const goerlyE2EWallet = /E2E Wallet @ G(ö|oe)rli/
export const goerlySafeName = /g(ö|oe)rli-safe/
export const sepoliaSafeName = 'sepolia-safe'
export const goerliToken = /G(ö|oe)rli Ether/

export const TX_Builder_url = 'https://safe-apps.dev.5afe.dev/tx-builder'
export const drainAccount_url = 'https://safe-apps.dev.5afe.dev/drain-safe'
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
export const createNewSafeSepoliaUrl = '/new-safe/create?chain=sep'
export const loadNewSafeSepoliaUrl = '/new-safe/load?chain=sep'
export const appsUrl = '/apps'
export const requestPermissionsUrl = '/request-permissions'
export const getPermissionsUrl = '/get-permissions'
export const appSettingsUrl = '/settings/safe-apps'
export const setupUrl = '/settings/setup?safe='
export const dataSettingsUrl = '/settings/data'
export const invalidAppUrl = 'https://my-invalid-custom-app.com/manifest.json'
export const validAppUrlJson = 'https://my-valid-custom-app.com/manifest.json'
export const validAppUrl = 'https://my-valid-custom-app.com'

export const proposeEndpoint = '/**/propose'
export const appsEndpoint = '/**/safe-apps'
export const transactionHistoryEndpoint = '**/history'
export const safeListEndpoint = '**/safes'

export const VALID_QR_CODE_PATH = '../fixtures/sepolia_test_safe_QR.png'
export const INVALID_QR_CODE_PATH = '../fixtures/invalid_image_QR_test.png'

export const networkKeys = {
  sepolia: '11155111',
}
export const mainSideMenuOptions = {
  home: 'Home',
}
export const SEPOLIA_CSV_ENTRY = {
  name: 'test-sepolia-3',
  address: SEPOLIA_TEST_SAFE_3,
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
  sep: 'ETH',
  tta: 'TT_A',
  ttb: 'TT_B',
  dai: 'DAI',
  usds: 'USDC',
  aave: 'AAVE',
  link: 'LINK',
}

export const appNames = {
  walletConnect: 'walletconnect',
  customContract: 'compose custom contract',
  noResults: 'atextwithoutresults',
}

export const testAppData = {
  name: 'Cypress Test App',
  descr: 'Cypress Test App Description',
}

export const checkboxStates = {
  unchecked: 'not.be.checked',
  checked: 'be.checked',
}

export const transactionStatus = {
  received: 'Receive',
  sent: 'Send',
  deposit: 'deposit',
  approve: 'Approve',
  success: 'Success',
  interaction: 'Contract interaction',
  confirm: 'Confirm transaction',
}

export const tokenNames = {
  wrappedEther: 'Wrapped Ether',
  sepoliaEther: 'Sepolia Ether',
}

export const addressBookErrrMsg = {
  invalidFormat: 'Invalid address format',
  invalidChecksum: 'Invalid address checksum',
  exceedChars: 'Maximum 50 symbols',
  ownSafe: 'Cannot use Safe Account itself as owner',
  alreadyAdded: 'Address already added',
  ownerAdded: 'Owner is already added',
  failedResolve: 'Failed to resolve the address',
  emptyAddress: 'Owner',
}
export const addresBookContacts = {
  user1: {
    address: '0x01A9F68e339da12565cfBc47fe7D6EdEcB11C46f',
    name: 'David',
  },
  user2: {
    address: 'francotest.eth',
    name: 'Franco ESN',
  },
}

export const localStorageKeys = {
  SAFE_v2__addressBook: 'SAFE_v2__addressBook',
  SAFE_v2__batch: 'SAFE_v2__batch',
}

export const connectWalletNames = {
  e2e: 'E2E Wallet',
}
