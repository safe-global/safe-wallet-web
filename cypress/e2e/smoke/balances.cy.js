import * as constants from '../../support/constants'
import * as balances from '../pages/balances.pages'
import * as main from '../../e2e/pages/main.page'

const ASSETS_LENGTH = 7
const ASSET_NAME_COLUMN = 0
const TOKEN_AMOUNT_COLUMN = 1
const FIAT_AMOUNT_COLUMN = 2

describe('Balance tests', () => {
  // Fiat balance regex
  const fiatRegex = balances.fiatRegex

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.BALANCE_URL + constants.SEPOLIA_TEST_SAFE_5)
    main.acceptCookies(2)
    cy.contains('Assets')
    cy.get(balances.balanceSingleRow).should('have.length.lessThan', ASSETS_LENGTH)
    balances.selectTokenList(balances.tokenListOptions.allTokens)
    cy.get(balances.balanceSingleRow).should('have.length', ASSETS_LENGTH)
  })

  it('Verify that token is present: Dai', () => {
    balances.verityTokenAltImageIsVisible(balances.currencyDaiCap, balances.currencyDaiAlttext)
    balances.verifyAssetNameHasExplorerLink(balances.currencyDaiCap, ASSET_NAME_COLUMN)
    balances.verifyBalance(balances.currencyDaiCap, TOKEN_AMOUNT_COLUMN, balances.currencyDaiAlttext)
  })

  it('Verify that token is present: AAVE', () => {
    balances.verityTokenAltImageIsVisible(balances.currencyAave, balances.currencyAaveAlttext)
    balances.verifyAssetNameHasExplorerLink(balances.currencyAave, ASSET_NAME_COLUMN)
    balances.verifyBalance(balances.currencyAave, TOKEN_AMOUNT_COLUMN, balances.currencyAaveAlttext)
  })

  it('Verify that token is present: LINK', () => {
    balances.verityTokenAltImageIsVisible(balances.currencyLink, balances.currencyLinkAlttext)
    balances.verifyAssetNameHasExplorerLink(balances.currencyLink, ASSET_NAME_COLUMN)
    balances.verifyBalance(balances.currencyLink, TOKEN_AMOUNT_COLUMN, balances.currencyLinkAlttext)
  })

  it('Verify Token and Fiat balances formatted as per specification', () => {
    balances.verifyTokenBalanceFormat(
      balances.currencyDaiCap,
      balances.currentcyDaiFormat,
      TOKEN_AMOUNT_COLUMN,
      FIAT_AMOUNT_COLUMN,
      fiatRegex,
    )

    balances.verifyTokenBalanceFormat(
      balances.currencyAave,
      balances.currentcyAaveFormat,
      TOKEN_AMOUNT_COLUMN,
      FIAT_AMOUNT_COLUMN,
      fiatRegex,
    )

    balances.verifyTokenBalanceFormat(
      balances.currencyLink,
      balances.currentcyLinkFormat,
      TOKEN_AMOUNT_COLUMN,
      FIAT_AMOUNT_COLUMN,
      fiatRegex,
    )

    balances.verifyTokenBalanceFormat(
      balances.currencyTestTokenA,
      balances.currentcyTestTokenAFormat,
      TOKEN_AMOUNT_COLUMN,
      FIAT_AMOUNT_COLUMN,
      fiatRegex,
    )

    balances.verifyTokenBalanceFormat(
      balances.currencyTestTokenB,
      balances.currentcyTestTokenBFormat,
      TOKEN_AMOUNT_COLUMN,
      FIAT_AMOUNT_COLUMN,
      fiatRegex,
    )

    balances.verifyTokenBalanceFormat(
      balances.currencyUSDC,
      balances.currentcyTestUSDCFormat,
      TOKEN_AMOUNT_COLUMN,
      FIAT_AMOUNT_COLUMN,
      fiatRegex,
    )

    balances.verifyTokenBalanceFormat(
      constants.tokenNames.sepoliaEther,
      balances.currentcySepoliaFormat,
      TOKEN_AMOUNT_COLUMN,
      FIAT_AMOUNT_COLUMN,
      fiatRegex,
    )
  })

  it('Verify USD is default currency', () => {
    balances.verifyFirstRowDoesNotContainCurrency(balances.currencyEUR, FIAT_AMOUNT_COLUMN)
    balances.verifyFirstRowContainsCurrency(balances.currencyUSD, FIAT_AMOUNT_COLUMN)
  })

  it('Verify currency can be changed to EUR', () => {
    balances.clickOnCurrencyDropdown()
    balances.selectCurrency(balances.currencyEUR)
    balances.verifyFirstRowDoesNotContainCurrency(balances.currencyUSD, FIAT_AMOUNT_COLUMN)
    balances.verifyFirstRowContainsCurrency(balances.currencyEUR, FIAT_AMOUNT_COLUMN)
  })

  it('Verify a token can be hidden', () => {
    balances.hideAsset(balances.currencyDaiCap)
  })

  it('Verify a token can be unhidden', () => {
    balances.hideAsset(balances.currencyDaiCap)
    balances.openHideTokenMenu()
    balances.clickOnTokenCheckbox(balances.currencyDaiCap)
    balances.saveHiddenTokenSelection()
    balances.verifyTokenIsVisible(balances.currencyDaiCap)
    balances.verifyMenuButtonLabelIsDefault()
  })
})
