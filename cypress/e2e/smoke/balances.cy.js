import * as constants from '../../support/constants'
import * as balances from '../pages/balances.pages'
import * as main from '../../e2e/pages/main.page'

const ASSETS_LENGTH = 8
const ASSET_NAME_COLUMN = 0
const TOKEN_AMOUNT_COLUMN = 1
const FIAT_AMOUNT_COLUMN = 2

describe('Balance tests', () => {
  // Fiat balance regex
  const fiatRegex = balances.fiatRegex

  before(() => {
    cy.clearLocalStorage()
    // Open the Safe used for testing
    cy.visit(constants.BALANCE_URL + constants.GOERLI_TEST_SAFE)
    main.acceptCookies()
    // Table is loaded
    cy.contains('Görli Ether')

    cy.contains('button', 'Got it').click()

    cy.get(balances.balanceSingleRow).should('have.length.lessThan', ASSETS_LENGTH)
    cy.contains('div', 'Default tokens').click()
    cy.wait(100)
    cy.contains('div', 'All tokens').click()
    cy.get(balances.balanceSingleRow).should('have.length', ASSETS_LENGTH)
  })

  it('Verify that token is present: Dai [C56074]', () => {
    balances.verityTokenAltImageIsVisible(balances.currencyDai, balances.currencyDaiAlttext)
    balances.verifyAssetNameHasExplorerLink(balances.currencyDai, ASSET_NAME_COLUMN)
    balances.verifyBalance(balances.currencyDai, TOKEN_AMOUNT_COLUMN, balances.currencyDaiAlttext)
  })

  it('Verify that token is present: Wrapped Ether [C56075]', () => {
    balances.verityTokenAltImageIsVisible(balances.currencyEther, balances.currencyEtherAlttext)
    balances.verifyAssetNameHasExplorerLink(balances.currencyEther, ASSET_NAME_COLUMN)
    balances.verifyBalance(balances.currencyEther, TOKEN_AMOUNT_COLUMN, balances.currencyEtherAlttext)
  })

  it('Verify that token is present: USD Coin [C56076]', () => {
    balances.verityTokenAltImageIsVisible(balances.currencyUSDCoin, balances.currencyUSDAlttext)
    balances.verifyAssetNameHasExplorerLink(balances.currencyUSDCoin, ASSET_NAME_COLUMN)
    balances.verifyBalance(balances.currencyUSDCoin, TOKEN_AMOUNT_COLUMN, balances.currencyUSDAlttext)
  })

  it('Verify Token and Fiat balances formatted as per specification [C56077]', () => {
    balances.verifyTokenBalanceFormat(
      balances.currencyDai,
      balances.currentcyDaiFormat,
      TOKEN_AMOUNT_COLUMN,
      FIAT_AMOUNT_COLUMN,
      fiatRegex,
    )

    balances.verifyTokenBalanceFormat(
      balances.currencyEther,
      balances.currentcyEtherFormat,
      TOKEN_AMOUNT_COLUMN,
      FIAT_AMOUNT_COLUMN,
      fiatRegex,
    )

    balances.verifyTokenBalanceFormat(
      balances.currencyGörliEther,
      balances.currentcyGörliEtherFormat,
      TOKEN_AMOUNT_COLUMN,
      FIAT_AMOUNT_COLUMN,
      fiatRegex,
    )

    balances.verifyTokenBalanceFormat(
      balances.currencyUniswap,
      balances.currentcyUniswapFormat,
      TOKEN_AMOUNT_COLUMN,
      FIAT_AMOUNT_COLUMN,
      fiatRegex,
    )

    balances.verifyTokenBalanceFormat(
      balances.currencyUSDCoin,
      balances.currentcyUSDFormat,
      TOKEN_AMOUNT_COLUMN,
      FIAT_AMOUNT_COLUMN,
      fiatRegex,
    )

    balances.verifyTokenBalanceFormat(
      balances.currencyGnosis,
      balances.currentcyGnosisFormat,
      TOKEN_AMOUNT_COLUMN,
      FIAT_AMOUNT_COLUMN,
      fiatRegex,
    )

    balances.verifyTokenBalanceFormat(
      balances.currencyOx,
      balances.currentcyOxFormat,
      TOKEN_AMOUNT_COLUMN,
      FIAT_AMOUNT_COLUMN,
      fiatRegex,
    )
  })

  it('Verify USD is default currency [C56078]', () => {
    balances.verifyFirstRowDoesNotContainCurrency(balances.currencyEUR, FIAT_AMOUNT_COLUMN)
    balances.verifyFirstRowContainsCurrency(balances.currencyUSD, FIAT_AMOUNT_COLUMN)
  })

  it('Verify currency can be changed to EUR [C56079]', () => {
    balances.clickOnCurrencyDropdown()
    balances.selectCurrency(balances.currencyEUR)
    balances.verifyFirstRowDoesNotContainCurrency(balances.currencyUSD, FIAT_AMOUNT_COLUMN)
    balances.verifyFirstRowContainsCurrency(balances.currencyEUR, FIAT_AMOUNT_COLUMN)
  })

  it('Verify a token can be hidden [C56080]', () => {
    balances.hideAsset(balances.currencyDai)
  })

  it('Verify a token can be unhidden [C56081]', () => {
    balances.openHideTokenMenu()
    balances.clickOnTokenCheckbox(balances.currencyDai)
    balances.saveHiddenTokenSelection()
    balances.verifyTokenIsVisible(balances.currencyDai)
    balances.verifyMenuButtonLabelIsDefault()
  })
})
