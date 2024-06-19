import * as constants from '../../support/constants.js'
import * as main from '../pages/main.page.js'

// Incoming from CowSwap
export const inputCurrencyInput = '[id="input-currency-input"]'
export const outputurrencyInput = '[id="output-currency-input"]'
const tokenList = '[id="tokens-list"]'
export const swapBtn = '[id="swap-button"]'
const exceedFeesChkbox = 'input[id="fees-exceed-checkbox"]'
const settingsBtn = 'button[id="open-settings-dialog-button"]'
export const assetsSwapBtn = '[data-testid="swap-btn"]'
export const dashboardSwapBtn = '[data-testid="overview-swap-btn"]'
const confirmSwapStr = 'Confirm Swap'
const swapBtnStr = /Confirm Swap|Swap|Confirm (Approve COW and Swap)|Confirm/
const orderSubmittedStr = 'Order Submitted'

export const swapTokens = {
  cow: 'COW',
  dai: 'DAI',
  eth: 'ETH',
}

const swapOrders = '**/api/v1/orders/*'
const surplus = '**/users/*/total_surplus'
const nativePrice = '**/native_price'
const quote = '**/quote/*'

export function clickOnAssetSwapBtn(index) {
  cy.get(assetsSwapBtn).eq(index).as('btn')
  cy.get('@btn').click()
}

export function verifyOrderSubmittedConfirmation() {
  cy.get('div').contains(orderSubmittedStr).should('exist')
}

export function clickOnSettingsBtn() {
  cy.get(settingsBtn).click()
}

export function setExpiry(value) {
  cy.get('div').contains('Swap deadline').parent().next().find('input').clear().type(value)
}

export function setSlippage(value) {
  cy.contains('button', 'Auto').next('button').find('input').clear().type(value)
}
export function waitForOrdersCallToComplete() {
  cy.intercept('GET', swapOrders).as('Orders')
  cy.wait('@Orders')
}

export function waitForSurplusCallToComplete() {
  cy.intercept('GET', surplus).as('Surplus')
  cy.wait('@Surplus')
}

export function waitFornativePriceCallToComplete() {
  cy.intercept('GET', nativePrice).as('Price')
  cy.wait('@Price')
}

export function waitForQuoteCallToComplete() {
  cy.intercept('GET', quote).as('Quote')
  cy.wait('@Quote')
}

export function clickOnConfirmSwapBtn() {
  cy.get('button').contains(confirmSwapStr).click()
}

export function clickOnExceeFeeChkbox() {
  cy.wait(1000)
  cy.get(exceedFeesChkbox)
    .should(() => {})
    .then(($button) => {
      if (!$button.length) {
        return
      }
      cy.wrap($button).click()
    })
}

export function clickOnSwapBtn() {
  cy.get('button').contains(swapBtnStr).as('swapBtn')

  cy.get('@swapBtn').should('exist').click()
}

export function checkSwapBtnIsVisible() {
  cy.get('button').contains(swapBtnStr).should('be.visible')
}

export const currencyDirectionOptions = {
  input: 'input',
  output: 'output',
}

export function acceptLegalDisclaimer() {
  cy.get('button').contains('Continue').click()
}

export function checkTokenBalance(safe, tokenSymbol) {
  cy.get(inputCurrencyInput)
    .invoke('text')
    .then((text) => {
      main.getSafeBalance(safe, constants.networkKeys.sepolia).then((response) => {
        const targetToken = response.body.items.find((token) => token.tokenInfo.symbol === tokenSymbol)
        const tokenBalance = targetToken.balance.toString()
        let formattedBalance

        if (tokenBalance.length > 4) {
          formattedBalance = `${tokenBalance[0]},${tokenBalance.slice(1, 4)}`
        } else {
          formattedBalance = tokenBalance
        }

        expect(text).to.include(`${formattedBalance} ${tokenSymbol}`)
      })
    })
}

export function verifySelectedInputCurrancy(option) {
  cy.get(inputCurrencyInput).within(() => {
    cy.get('span').contains(option).should('be.visible')
  })
}
export function selectInputCurrency(option) {
  cy.get(inputCurrencyInput).within(() => {
    cy.get('button').trigger('mouseover').trigger('click')
  })
  cy.get(tokenList).find('span').contains(option).click()
}

export function selectOutputCurrency(option) {
  cy.get(outputurrencyInput).within(() => {
    cy.get('button').trigger('mouseover').trigger('click')
  })
  cy.get(tokenList).find('span').contains(option).click()
}

export function setInputValue(value) {
  cy.get(inputCurrencyInput).within(() => {
    cy.get('input').type(value)
  })
}

export function setOutputValue(value) {
  cy.get(outputurrencyInput).within(() => {
    cy.get('input').type(value)
  })
}

export function isInputGreaterZero(inputSelector) {
  return cy
    .get(inputSelector)
    .find('input')
    .invoke('val')
    .then((val) => {
      const n = parseFloat(val)
      return n > 0
    })
}
