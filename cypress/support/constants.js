import { LS_NAMESPACE } from '../../src/config/constants'
export const RECIPIENT_ADDRESS = '0x6a5602335a878ADDCa4BF63a050E34946B56B5bC'
export const GOERLI_SAFE_APPS_SAFE = 'gor:0x168ca275d1103cb0a30980813140053c7566932F'
export const GOERLI_TEST_SAFE = 'gor:0x97d314157727D517A706B5D08507A1f9B44AaaE9'
// SEPOLIA_TEST_SAFE_1 should always have no transactions, tokens and NFTs
export const SEPOLIA_TEST_SAFE_1 = 'sep:0xBb26E3717172d5000F87DeFd391994f789D80aEB'
// SEPOLIA_TEST_SAFE_2 Has no transactions, 1 owner, using for verificatons only
// Also used for non-owner verifications in spending limits
export const SEPOLIA_TEST_SAFE_2 = 'sep:0x33C4AA5729D91FfB3B87AEf8a324bb6304Fb905c'
export const SEPOLIA_TEST_SAFE_3 = 'sep:0x6E834E9D04ad6b26e1525dE1a37BFd9b215f40B7'
export const SEPOLIA_TEST_SAFE_4 = 'sep:0x03042B890b99552b60A073F808100517fb148F60'
export const SEPOLIA_TEST_SAFE_5 = 'sep:0xBd69b0a9DC90eB6F9bAc3E4a5875f437348b6415'
export const SEPOLIA_TEST_SAFE_6 = 'sep:0x6d0b6F96f665Bb4490f9ddb2e450Da2f7e546dC1'
// SAFE_7 has ENS assigned to it
export const SEPOLIA_TEST_SAFE_7 = 'sep:0xBf30F749FC027a5d79c4710D988F0D3C8e217A4F'
// SAFE 8 is used for tx history tests
export const SEPOLIA_TEST_SAFE_8 = 'sep:0x5912f6616c84024cD1aff0D5b55bb36F5180fFdb'
// SAFE 9 & 10 are used for safe apps tests
export const SEPOLIA_TEST_SAFE_9 = 'sep:0xD1571E8Cc4438aFef2836DD9a0E5D09fb63EDE9a'
export const SEPOLIA_TEST_SAFE_10 = 'sep:0x4DD4cB2299E491E1B469245DB589ccB2B16d7bde'
// SAFE 11 is used for remove owner tests
export const SEPOLIA_TEST_SAFE_11 = 'sep:0x81034C61a318649F7aD43f9e8C1051427e326443'
// SAFE 12 is used for spending limits
export const SEPOLIA_TEST_SAFE_12 = 'sep:0x9190cc22D592dDcf396Fa616ce84a9978fD96Fc9'
// SAFE 13 & 14 are used for sidebar with pending tx, no further tx should be made in it
export const SEPOLIA_TEST_SAFE_13 = 'sep:0x98705770aF3b18db0a64597F6d4DCe825915fec0'
export const SEPOLIA_TEST_SAFE_13_SHORT = '0x9870...fec0'
export const SEPOLIA_TEST_SAFE_14 = 'sep:0xC23e061252BFc7967203D054136d8fA7c7df2fc4'
// SAFE 15 is a safe with native tokens but the automation user is not its owner
export const SEPOLIA_TEST_SAFE_15_TOKEN = 'sep:0xfC0A7ac73Fde7547ac0792Cca1D8A50CE0AFC4Df'
export const SEPOLIA_TEST_SAFE_16_CREATE_TX = 'sep:0xc2F3645bfd395516d1a18CA6ad9298299d328C01'
export const SEPOLIA_TEST_SAFE_17_SIDEBAR_NONOWNER = 'sep:0x10B45a24640E2170B6AA63ea3A289D723a0C9cba'
export const SEPOLIA_CONTRACT_SHORT = '0x11AB...34aF'
export const SEPOLIA_RECIPIENT_ADDR_SHORT = '0x4DD4...7bde'
export const GNO_TEST_SAFE = 'gno:0xB8d760a90a5ed54D3c2b3EFC231277e99188642A'
export const PAGINATION_TEST_SAFE = 'gor:0x850493a15914aAC05a821A3FAb973b4598889A7b'
export const TEST_SAFE = 'gor:0x04f8b1EA3cBB315b87ced0E32deb5a43cC151a91'
export const EOA = '0x03042B890b99552b60A073F808100517fb148F60'
export const SAFE_APP_ADDRESS = '0x11AB70A4564C62F567B92868Cb5e69b50c5434aF'
export const SAFE_APP_ADDRESS_2 = '0x49d4450977E2c95362C13D3a31a09311E0Ea26A6'
export const SAFE_APP_ADDRESS_3 = '0xc6b82bA149CFA113f8f48d5E3b1F78e933e16DfD'
export const DEFAULT_OWNER_ADDRESS = '0xC16Db0251654C0a72E91B190d81eAD367d2C6fED'
// Below is also used in sidebar tests as a beneficiary
export const SPENDING_LIMIT_ADDRESS_2 = '0x52835f11E348605E9D791Ec09380a3224526d538'
export const SEPOLIA_OWNER_2 = '0x96D4c6fFC338912322813a77655fCC926b9A5aC5'
export const TEST_SAFE_2 = 'gor:0xE96C43C54B08eC528e9e815fC3D02Ea94A320505'
export const SIDEBAR_ADDRESS = '0x04f8...1a91'
//ENS_TEST_SEPOLIA resolves to 0xBf30F749FC027a5d79c4710D988F0D3C8e217A4F
export const ENS_TEST_SEPOLIA = 'e2etestsafe.eth'
export const ENS_TEST_GOERLI = 'goerli-safe-test.eth'
export const ENS_TEST_SEPOLIA_INVALID = 'ivladitestenssepolia.eth'
export const WRONGLY_CHECKSUMMED_ADDRESS = '0X6D0B6F96F665BB4490F9DDB2E450DA2F7E546DC1'

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
export const appsUrlGeneral = '/apps?=safe='
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
export const dataSettingsUrl = '/settings/data?safe='
export const securityUrl = '/settings/security-login?safe='
export const invalidAppUrl = 'https://my-invalid-custom-app.com/manifest.json'
export const validAppUrlJson = 'https://my-valid-custom-app.com/manifest.json'
export const validAppUrl = 'https://my-valid-custom-app.com'
export const sepoliaEtherscanlLink = 'https://sepolia.etherscan.io/address'

export const proposeEndpoint = '/**/propose'
export const appsEndpoint = '/**/safe-apps'
export const transactionHistoryEndpoint = '**/history*'
export const safeListEndpoint = '**/safes'

export const VALID_QR_CODE_PATH = '../fixtures/sepolia_test_safe_QR.png'
export const INVALID_QR_CODE_PATH = '../fixtures/invalid_image_QR_test.png'

export const TXActionNames = {
  resetAllowance: 'resetAllowance',
  setAllowance: 'setAllowance',
}

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
  gnosis: 'Gnosis',
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

export const currencies = {
  cad: 'CAD',
  aud: 'AUD',
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

export const enabledStates = {
  enabled: 'not.be.disabled',
  disabled: 'be.disabled',
}

export const elementExistanceStates = {
  exist: 'exist',
  not_exist: 'not.exist',
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
  qaToken: 'QAtest10',
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
  invalidPrefix(prefix) {
    return `"${prefix}" doesn't match the current chain`
  },
}

export const amountErrorMsg = {
  negativeValue: 'The value must be greater than 0',
  randomString: 'The value must be a number',
  largerThanCurrentBalance: /Maximum value is \d+(\.\d+)?/,
}

export const nonceTooltipMsg = {
  lowerThanCurrent: "Nonce can't be lower than ",
  higherThanRecommended: 'Nonce is higher than the recommended nonce',
  muchHigherThanRecommended: 'Nonce is much higher than the current nonce',
  mustBeNumber: 'Nonce must be a number',
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
  SAFE_v2__settings: 'SAFE_v2__settings',
  SAFE_v2__addedSafes: 'SAFE_v2__addedSafes',
  SAFE_v2__safeApps: 'SAFE_v2__safeApps',
}

export const connectWalletNames = {
  e2e: 'E2E Wallet',
}
