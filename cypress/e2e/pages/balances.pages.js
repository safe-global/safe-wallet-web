const etherscanLink = 'a[aria-label="View on goerli.etherscan.io"]'
export const balanceSingleRow = '[aria-labelledby="tableTitle"] > tbody tr'
const currencyDropdown = '[id="currency"]'
const currencyDropdownList = 'ul[role="listbox"]'
const currencyDropdownListSelected = 'ul[role="listbox"] li[aria-selected="true"]'
const hideAssetBtn = 'button[aria-label="Hide asset"]'
const hiddeTokensBtn = '[data-testid="toggle-hidden-assets"]'
const hiddenTokenCheckbox = 'input[type="checkbox"]'
const paginationPageList = 'ul[role="listbox"]'
const currencyDropDown = 'div[id="currency"]'
const hiddenTokenSaveBtn = 'Save'
const hideTokenDefaultString = 'Hide tokens'

const pageRowsDefault = '25'
const rowsPerPage10 = '10'
const nextPageBtn = 'button[aria-label="Go to next page"]'
const previousPageBtn = 'button[aria-label="Go to previous page"]'
const tablePageRage21to28 = '21–28 of'
const rowsPerPageString = 'Rows per page:'
const pageCountString1to25 = '1–25 of'
const pageCountString1to10 = '1–10 of'
const pageCountString10to20 = '11–20 of'

export const currencyEUR = 'EUR'
export const currencyUSD = 'USD'

export const currencyDai = 'Dai'
export const currencyDaiAlttext = 'DAI'
export const currentcyDaiFormat = '120,496.61 DAI'

export const currencyEther = 'Wrapped Ether'
export const currencyEtherAlttext = 'WETH'
export const currentcyEtherFormat = '0.05918 WETH'

export const currencyUSDCoin = 'USD Coin'
export const currencyUSDAlttext = 'USDC'
export const currentcyUSDFormat = '131,363 USDC'

export const currencyGörliEther = 'Görli Ether'
export const currentcyGörliEtherFormat = '0.14 GOR'

export const currencyUniswap = 'Uniswap'
export const currentcyUniswapFormat = '0.01828 UNI'

export const currencyGnosis = 'Gnosis'
export const currentcyGnosisFormat = '< 0.00001 GNO'

export const currencyOx = /^0x$/
export const currentcyOxFormat = '1.003 ZRX'

export function verityTokenAltImageIsVisible(currency, alttext) {
  cy.contains(currency)
    .parents('tr')
    .within(() => {
      cy.get(`img[alt=${alttext}]`).should('be.visible')
    })
}

export function verifyAssetNameHasExplorerLink(currency, columnName) {
  cy.contains(currency).parents('tr').find('td').eq(columnName).find(etherscanLink).should('be.visible')
}

export function verifyBalance(currency, tokenAmountColumn, alttext) {
  cy.contains(currency).parents('tr').find('td').eq(tokenAmountColumn).contains(alttext)
}

export function verifyTokenBalanceFormat(currency, formatString, tokenAmountColumn, fiatAmountColumn, fiatRegex) {
  cy.contains(currency)
    .parents('tr')
    .within(() => {
      cy.get('td').eq(tokenAmountColumn).contains(formatString)
      cy.get('td').eq(fiatAmountColumn).contains(fiatRegex)
    })
}

export function verifyFirstRowDoesNotContainCurrency(currency, fiatAmountColumn) {
  cy.get(balanceSingleRow).first().find('td').eq(fiatAmountColumn).should('not.contain', currency)
}

export function verifyFirstRowContainsCurrency(currency, fiatAmountColumn) {
  cy.get(balanceSingleRow).first().find('td').eq(fiatAmountColumn).contains(currency)
}

export function clickOnCurrencyDropdown() {
  cy.get(currencyDropdown).click()
}

export function selectCurrency(currency) {
  cy.get(currencyDropdownList).findByText(currency).click({ force: true })
  cy.get(currencyDropdownList)
    .findByText(currency)
    .click({ force: true })
    .then(() => {
      cy.get(currencyDropdownListSelected).should('contain', currency)
    })
}

export function hideAsset(asset) {
  cy.contains(asset).parents('tr').find('button[aria-label="Hide asset"]').click()
  cy.wait(350)
  cy.contains(asset).should('not.exist')
}

export function openHideTokenMenu() {
  cy.get(hiddeTokensBtn).click()
}

export function clickOnTokenCheckbox(token) {
  cy.contains(token).parents('tr').find(hiddenTokenCheckbox).click()
}

export function saveHiddenTokenSelection() {
  cy.contains(hiddenTokenSaveBtn).click()
}

export function verifyTokenIsVisible(token) {
  cy.contains(token)
}

export function verifyMenuButtonLabelIsDefault() {
  cy.contains(hideTokenDefaultString)
}

export function verifyInitialTableState() {
  cy.contains(rowsPerPageString).next().contains(pageRowsDefault)
  cy.contains(pageCountString1to25)
  cy.get(balanceSingleRow).should('have.length', 25)
}

export function changeTo10RowsPerPage() {
  cy.contains(rowsPerPageString).next().contains(pageRowsDefault).click({ force: true })
  cy.get(paginationPageList).contains(rowsPerPage10).click()
}

export function verifyTableHas10Rows() {
  cy.contains(rowsPerPageString).next().contains(rowsPerPage10)
  cy.contains(pageCountString1to10)
  cy.get(balanceSingleRow).should('have.length', 10)
}

export function navigateToNextPage() {
  cy.get(nextPageBtn).click({ force: true })
  cy.get(nextPageBtn).click({ force: true })
}

export function verifyTableHasNRows(assetsLength) {
  cy.contains(tablePageRage21to28)
  cy.get(balanceSingleRow).should('have.length', assetsLength)
}

export function navigateToPreviousPage() {
  cy.get(previousPageBtn).click({ force: true })
}

export function verifyTableHas10RowsAgain() {
  cy.contains(pageCountString10to20)
  cy.get(balanceSingleRow).should('have.length', 10)
}
