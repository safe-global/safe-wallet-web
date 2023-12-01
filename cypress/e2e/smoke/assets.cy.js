import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as balances from '../pages/balances.pages'

const ASSET_NAME_COLUMN = 0
const TOKEN_AMOUNT_COLUMN = 1
const FIAT_AMOUNT_COLUMN = 2

describe('[SMOKE] Assets tests', () => {
  const fiatRegex = balances.fiatRegex

  beforeEach(() => {
    cy.visit(constants.BALANCE_URL + constants.SEPOLIA_TEST_SAFE_5)
    cy.clearLocalStorage()
    main.acceptCookies()
  })

  it('[SMOKE] Verify that the token tab is selected by default and the table is visible', () => {
    balances.verifyTokensTabIsSelected('true')
  })

  it('[SMOKE] Verify that the native token is visible', () => {
    balances.verifyTokenIsPresent(constants.tokenNames.sepoliaEther)
  })

  it('[SMOKE] Verify that Token list dropdown down options show/hide spam tokens', () => {
    let spamTokens = [
      balances.currencyAave,
      balances.currencyTestTokenA,
      balances.currencyTestTokenB,
      balances.currencyUSDC,
      balances.currencyLink,
      balances.currencyDaiCap,
    ]

    main.verifyValuesDoNotExist(balances.tokenListTable, spamTokens)
    balances.selectTokenList(balances.tokenListOptions.allTokens)
    spamTokens.push(constants.tokenNames.sepoliaEther)
    main.verifyValuesExist(balances.tokenListTable, spamTokens)
  })

  it('[SMOKE] Verify that "Hide token" button is present and opens the "Hide tokens menu"', () => {
    balances.selectTokenList(balances.tokenListOptions.allTokens)
    balances.openHideTokenMenu()
    balances.verifyEachRowHasCheckbox()
  })

  it('[SMOKE] Verify that clicking the button with an owner opens the Send funds form', () => {
    balances.selectTokenList(balances.tokenListOptions.allTokens)
    balances.clickOnSendBtn(0)
  })
})
