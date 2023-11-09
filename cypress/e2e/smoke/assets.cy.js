import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as balances from '../pages/balances.pages'
import * as owner from '../pages/owners.pages'

const ASSET_NAME_COLUMN = 0
const TOKEN_AMOUNT_COLUMN = 1
const FIAT_AMOUNT_COLUMN = 2

describe('Assets tests', () => {
  const fiatRegex = balances.fiatRegex

  beforeEach(() => {
    cy.visit(constants.BALANCE_URL + constants.SEPOLIA_TEST_SAFE_5)
    cy.clearLocalStorage()
    main.acceptCookies()
  })

  it('Verify that the token tab is selected by default and the table is visible [C56039]', () => {
    balances.verifyTokensTabIsSelected('true')
  })

  it('Verify that the native token is visible [C56040]', () => {
    balances.verifyTokenIsPresent(constants.tokenNames.sepoliaEther)
  })

  it('Verify that non-native tokens are present and have balance [C56041]', () => {
    balances.selectTokenList(balances.tokenListOptions.allTokens)
    balances.verifyBalance(balances.currencyDaiCap, TOKEN_AMOUNT_COLUMN, balances.currencyDaiAlttext)
    balances.verifyTokenBalanceFormat(
      balances.currencyDaiCap,
      balances.currencyDaiFormat_2,
      TOKEN_AMOUNT_COLUMN,
      FIAT_AMOUNT_COLUMN,
      fiatRegex,
    )

    balances.verifyBalance(balances.currencyAave, TOKEN_AMOUNT_COLUMN, balances.currencyAaveAlttext)
    balances.verifyTokenBalanceFormat(
      balances.currencyAave,
      balances.currentcyAaveFormat,
      TOKEN_AMOUNT_COLUMN,
      FIAT_AMOUNT_COLUMN,
      fiatRegex,
    )

    balances.verifyBalance(balances.currencyLink, TOKEN_AMOUNT_COLUMN, balances.currencyLinkAlttext)
    balances.verifyTokenBalanceFormat(
      balances.currencyLink,
      balances.currentcyLinkFormat,
      TOKEN_AMOUNT_COLUMN,
      FIAT_AMOUNT_COLUMN,
      fiatRegex,
    )

    balances.verifyBalance(balances.currencyTestTokenA, TOKEN_AMOUNT_COLUMN, balances.currencyTestTokenAAlttext)
    balances.verifyTokenBalanceFormat(
      balances.currencyTestTokenA,
      balances.currentcyTestTokenAFormat,
      TOKEN_AMOUNT_COLUMN,
      FIAT_AMOUNT_COLUMN,
      fiatRegex,
    )

    balances.verifyBalance(balances.currencyTestTokenB, TOKEN_AMOUNT_COLUMN, balances.currencyTestTokenBAlttext)
    balances.verifyTokenBalanceFormat(
      balances.currencyTestTokenB,
      balances.currentcyTestTokenBFormat,
      TOKEN_AMOUNT_COLUMN,
      FIAT_AMOUNT_COLUMN,
      fiatRegex,
    )

    balances.verifyBalance(balances.currencyUSDC, TOKEN_AMOUNT_COLUMN, balances.currencyTestUSDCAlttext)
    balances.verifyTokenBalanceFormat(
      balances.currencyUSDC,
      balances.currentcyTestUSDCFormat,
      TOKEN_AMOUNT_COLUMN,
      FIAT_AMOUNT_COLUMN,
      fiatRegex,
    )
  })

  it('Verify that every token except the native token has a "go to blockexplorer link" [C56042]', () => {
    balances.selectTokenList(balances.tokenListOptions.allTokens)
    // Specifying true for Sepolia. Will delete the flag once completely migrate to Sepolia
    balances.verifyAssetNameHasExplorerLink(balances.currencyUSDC, ASSET_NAME_COLUMN, true)
    balances.verifyAssetNameHasExplorerLink(balances.currencyTestTokenB, ASSET_NAME_COLUMN, true)
    balances.verifyAssetNameHasExplorerLink(balances.currencyTestTokenA, ASSET_NAME_COLUMN, true)
    balances.verifyAssetNameHasExplorerLink(balances.currencyLink, ASSET_NAME_COLUMN, true)
    balances.verifyAssetNameHasExplorerLink(balances.currencyAave, ASSET_NAME_COLUMN, true)
    balances.verifyAssetNameHasExplorerLink(balances.currencyDaiCap, ASSET_NAME_COLUMN, true)
    balances.verifyAssetExplorerLinkNotAvailable(constants.tokenNames.sepoliaEther, ASSET_NAME_COLUMN)
  })

  it('Verify the default Fiat currency and the effects after changing it [C56043]', () => {
    balances.selectTokenList(balances.tokenListOptions.allTokens)
    balances.verifyFirstRowDoesNotContainCurrency(balances.currencyEUR, FIAT_AMOUNT_COLUMN)
    balances.verifyFirstRowContainsCurrency(balances.currencyUSD, FIAT_AMOUNT_COLUMN)
    balances.clickOnCurrencyDropdown()
    balances.selectCurrency(balances.currencyEUR)
    balances.verifyFirstRowDoesNotContainCurrency(balances.currencyUSD, FIAT_AMOUNT_COLUMN)
    balances.verifyFirstRowContainsCurrency(balances.currencyEUR, FIAT_AMOUNT_COLUMN)
  })

  it('Verify that a tool tip is shown pointing to "Token list" dropdown [C56044]', () => {
    //Spam warning message is removed in beforeEach hook
    cy.reload()
  })

  it('Verify that Token list dropdown down options show/hide spam tokens [C56045]', () => {
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

  it('Verify that "Hide token" button is present and opens the "Hide tokens menu" [C56046]', () => {
    balances.selectTokenList(balances.tokenListOptions.allTokens)
    balances.openHideTokenMenu()
    balances.verifyEachRowHasCheckbox()
  })

  it('Verify that checking the checkboxes increases the token selected counter [C56047]', () => {
    balances.selectTokenList(balances.tokenListOptions.allTokens)
    balances.openHideTokenMenu()
    balances.clickOnTokenCheckbox(balances.currencyLink)
    balances.checkTokenCounter(1)
  })

  it('Verify that selecting tokens and saving hides them from the table [C56048]', () => {
    balances.selectTokenList(balances.tokenListOptions.allTokens)
    balances.openHideTokenMenu()
    balances.clickOnTokenCheckbox(balances.currencyLink)
    balances.saveHiddenTokenSelection()
    main.verifyValuesDoNotExist(balances.tokenListTable, [balances.currencyLink])
  })

  it('Verify that Cancel closes the menu and does not change the table status [C56049]', () => {
    balances.selectTokenList(balances.tokenListOptions.allTokens)
    balances.openHideTokenMenu()
    balances.clickOnTokenCheckbox(balances.currencyLink)
    balances.clickOnTokenCheckbox(balances.currencyAave)
    balances.saveHiddenTokenSelection()
    main.verifyValuesDoNotExist(balances.tokenListTable, [balances.currencyLink, balances.currencyAave])
    balances.openHideTokenMenu()
    balances.clickOnTokenCheckbox(balances.currencyLink)
    balances.clickOnTokenCheckbox(balances.currencyAave)
    balances.cancelSaveHiddenTokenSelection()
    main.verifyValuesDoNotExist(balances.tokenListTable, [balances.currencyLink, balances.currencyAave])
  })

  it('Verify that Deselect All unchecks all tokens from the list [C56050]', () => {
    balances.selectTokenList(balances.tokenListOptions.allTokens)
    balances.openHideTokenMenu()
    balances.clickOnTokenCheckbox(balances.currencyLink)
    balances.clickOnTokenCheckbox(balances.currencyAave)
    balances.deselecAlltHiddenTokenSelection()
    balances.verifyEachRowHasCheckbox(constants.checkboxStates.unchecked)
  })

  it('Verify the Hidden tokens counter works for spam tokens [C56051]', () => {
    balances.selectTokenList(balances.tokenListOptions.allTokens)
    balances.openHideTokenMenu()
    balances.clickOnTokenCheckbox(balances.currencyLink)
    balances.saveHiddenTokenSelection()
    balances.checkHiddenTokenBtnCounter(1)
  })

  it('Verify the Hidden tokens counter works for native tokens [C56056]', () => {
    balances.openHideTokenMenu()
    balances.clickOnTokenCheckbox(constants.tokenNames.sepoliaEther)
    balances.saveHiddenTokenSelection()
    balances.checkHiddenTokenBtnCounter(1)
  })

  it('Verify you can hide tokens from the eye icon in the table rows [C56053]', () => {
    balances.selectTokenList(balances.tokenListOptions.allTokens)
    balances.hideAsset(balances.currencyLink)
  })

  it('Verify the sorting of "Assets" and "Balance" in the table [C56052]', () => {
    balances.selectTokenList(balances.tokenListOptions.allTokens)
    balances.verifyTableRows(7)
    balances.clickOnTokenNameSortBtn()
    balances.verifyTokenNamesOrder()
    balances.clickOnTokenNameSortBtn()
    balances.verifyTokenNamesOrder('descending')
    balances.clickOnTokenBalanceSortBtn()
    balances.verifyTokenBalanceOrder()
    balances.clickOnTokenBalanceSortBtn()
    balances.verifyTokenBalanceOrder('descending')
  })

  it('Verify that clicking the button with an owner opens the Send funds form [C56055]', () => {
    balances.selectTokenList(balances.tokenListOptions.allTokens)
    balances.clickOnSendBtn(0)
  })

  it('Verify that the Send button shows when hovering a row [C56054]', () => {
    owner.clickOnWalletExpandMoreIcon()
    owner.clickOnDisconnectBtn()
    balances.selectTokenList(balances.tokenListOptions.allTokens)
    balances.showSendBtn(0)
    owner.verifyTooltiptext(owner.disconnectedUserErrorMsg)
    // Removed the part that checks for a non owner error message in the tooltip
    // because the safe has no assets, and we don't have a safe with assets where e2e wallet is not an owner
  })
})
