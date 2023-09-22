import * as constants from '../../support/constants'
import * as balances from '../pages/balances.pages'
import * as main from '../../e2e/pages/main.page'

const ASSETS_LENGTH = 8
const ASSET_NAME_COLUMN = 0
const TOKEN_AMOUNT_COLUMN = 1
const FIAT_AMOUNT_COLUMN = 2

describe('Assets > Coins', () => {
  // Fiat balance regex
  const fiatRegex = new RegExp(`([0-9]{1,3},)*[0-9]{1,3}.[0-9]{2}`)

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

  describe('should have different tokens', () => {
    it('should have Dai', () => {
      balances.verityTokenAltImageIsVisible(balances.currencyDai, balances.currencyDaiAlttext)
      balances.verifyAssetNameHasExplorerLink(balances.currencyDai, ASSET_NAME_COLUMN)
      balances.verifyBalance(balances.currencyDai, TOKEN_AMOUNT_COLUMN, balances.currencyDaiAlttext)
    })

    it('should have Wrapped Ether', () => {
      balances.verityTokenAltImageIsVisible(balances.currencyEther, balances.currencyEtherAlttext)
      balances.verifyAssetNameHasExplorerLink(balances.currencyEther, ASSET_NAME_COLUMN)
      balances.verifyBalance(balances.currencyEther, TOKEN_AMOUNT_COLUMN, balances.currencyEtherAlttext)
    })

    it('should have USD Coin', () => {
      balances.verityTokenAltImageIsVisible(balances.currencyUSDCoin, balances.currencyUSDAlttext)
      balances.verifyAssetNameHasExplorerLink(balances.currencyUSDCoin, ASSET_NAME_COLUMN)
      balances.verifyBalance(balances.currencyUSDCoin, TOKEN_AMOUNT_COLUMN, balances.currencyUSDAlttext)
    })
  })

  describe('values should be formatted as per locale', () => {
    it('should have Token and Fiat balances formated as per specification', () => {
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
  })

  describe('fiat currency can be changed', () => {
    it('should have USD as default currency', () => {
      balances.verifyFirstRowDoesNotContainCurrency(balances.currencyEUR, FIAT_AMOUNT_COLUMN)
      balances.verifyFirstRowContainsCurrency(balances.currencyUSD, FIAT_AMOUNT_COLUMN)
    })

    it('should allow changing the currency to EUR', () => {
      balances.clickOnCurrencyDropdown()
      balances.selectCurrency(balances.currencyEUR)
      balances.verifyFirstRowDoesNotContainCurrency(balances.currencyUSD, FIAT_AMOUNT_COLUMN)
      balances.verifyFirstRowContainsCurrency(balances.currencyEUR, FIAT_AMOUNT_COLUMN)
    })
  })

  describe('tokens can be manually hidden', () => {
    it('hide single token', () => {
      balances.hideAsset(balances.currencyDai)
    })

    it('unhide hidden token', () => {
      balances.openHideTokenMenu()
      balances.clickOnTokenCheckbox(balances.currencyDai)
      balances.saveHiddenTokenSelection()
      balances.verifyTokenIsVisible(balances.currencyDai)
      balances.verifyMenuButtonLabelIsDefault()
    })
  })
})
