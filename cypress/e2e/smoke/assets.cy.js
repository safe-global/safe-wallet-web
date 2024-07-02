import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as assets from '../pages/assets.pages'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'
import * as wallet from '../../support/utils/wallet.js'

let staticSafes = []

const walletCredentials = JSON.parse(Cypress.env('CYPRESS_WALLET_CREDENTIALS'))
const signer = walletCredentials.OWNER_4_PRIVATE_KEY

describe('[SMOKE] Assets tests', () => {
  const fiatRegex = assets.fiatRegex

  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
  })

  beforeEach(() => {
    cy.visit(constants.BALANCE_URL + staticSafes.SEP_STATIC_SAFE_2)
    cy.clearLocalStorage()
    main.acceptCookies()
  })

  it('[SMOKE] Verify that the native token is visible', () => {
    assets.verifyTokenIsPresent(constants.tokenNames.sepoliaEther)
  })

  it('[SMOKE] Verify that the token tab is selected by default and the table is visible', () => {
    assets.verifyTokensTabIsSelected('true')
  })

  it('[SMOKE] Verify that Token list dropdown down options show/hide spam tokens', () => {
    let spamTokens = [
      assets.currencyAave,
      assets.currencyTestTokenA,
      assets.currencyTestTokenB,
      assets.currencyUSDC,
      assets.currencyLink,
      assets.currencyDaiCap,
    ]

    main.verifyValuesDoNotExist(assets.tokenListTable, spamTokens)
    assets.selectTokenList(assets.tokenListOptions.allTokens)
    spamTokens.push(constants.tokenNames.sepoliaEther)
    main.verifyValuesExist(assets.tokenListTable, spamTokens)
  })

  it('[SMOKE] Verify that "Hide token" button is present and opens the "Hide tokens menu"', () => {
    assets.selectTokenList(assets.tokenListOptions.allTokens)
    assets.openHideTokenMenu()
    assets.verifyEachRowHasCheckbox()
  })

  it('[SMOKE] Verify that clicking the button with an owner opens the Send funds form', () => {
    wallet.connectSigner(signer)
    assets.selectTokenList(assets.tokenListOptions.allTokens)
    assets.clickOnSendBtn(0)
  })
})
