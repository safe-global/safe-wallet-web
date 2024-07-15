import * as constants from '../../support/constants.js'
import * as main from '../pages/main.page.js'
import * as create_tx from '../pages/create_tx.pages.js'

export const inputCurrencyInput = '[id="input-currency-input"]'
export const outputurrencyInput = '[id="output-currency-input"]'
const tokenList = '[id="tokens-list"]'
export const swapBtn = '[id="swap-button"]'
const exceedFeesChkbox = 'input[id="fees-exceed-checkbox"]'
const settingsBtn = 'button[id="open-settings-dialog-button"]'
export const assetsSwapBtn = '[data-testid="swap-btn"]'
export const dashboardSwapBtn = '[data-testid="overview-swap-btn"]'
export const customRecipient = 'div[id="recipient"]'
const recipientToggle = 'button[id="toggle-recipient-mode-button"]'
const orderTypeMenuItem = 'div[class*="MenuItem"]'
const explorerBtn = '[data-testid="explorer-btn"]'
const limitPriceFld = '[data-testid="limit-price"]'
const expiryFld = '[data-testid="expiry"]'
const slippageFld = '[data-testid="slippage"]'
const orderIDFld = '[data-testid="order-id"]'
const widgetFeeFld = '[data-testid="widget-fee"]'
const interactWithFld = '[data-testid="interact-wth"]'
const recipientAlert = '[data-testid="recipient-alert"]'
const confirmSwapStr = 'Confirm Swap'

const swapBtnStr = /Confirm Swap|Swap|Confirm (Approve COW and Swap)|Confirm/
const orderSubmittedStr = 'Order Submitted'
const orderIdStr = 'Order ID'
const cowOrdersUrl = 'https://explorer.cow.fi/orders'

export const blockedAddress = '0x8576acc5c05d6ce88f4e49bf65bdf0c62f91353c'
export const blockedAddressStr = 'Blocked address'

const swapStr = 'Swap'
const limitStr = 'Limit'

export const swapTokens = {
  cow: 'COW',
  dai: 'DAI',
  eth: 'ETH',
}

export const orderTypes = {
  swap: 'Swap',
  limit: 'Limit',
}

const swapOrders = '**/api/v1/orders/*'
const surplus = '**/users/*/total_surplus'
const nativePrice = '**/native_price'
const quote = '**/quote/*'

export const limitOrderSafe = 'sep:0x8f4A19C85b39032A37f7a6dCc65234f966F72551'

export const swapTxs = {
  sell1Action:
    '&id=multisig_0x03042B890b99552b60A073F808100517fb148F60_0xd033466000a40227fba7a7deb1a668371c213fec90bac9f2583096be2e0fd959',
  buy2actions:
    '&id=multisig_0x03042B890b99552b60A073F808100517fb148F60_0x135ff0282653d4c2a62c76cd247764b1abd4c0daa9201a72964feac2acaa7b44',
  sellCancelled:
    '&id=multisig_0x2a73e61bd15b25B6958b4DA3bfc759ca4db249b9_0xbe159adaa7fb0f7e80ad4bab33a2bb341043818478c96916cfa3877303d22a3d',
  sell3Actions:
    '&id=multisig_0x140663Cb76e4c4e97621395fc118912fa674150B_0x9f3d2c9c9879fb7eee7005d57b2b5c9006d7c8b98241aa49a0b9e769411c58ef',
  sellLimitOrder:
    '&id=multisig_0x03042B890b99552b60A073F808100517fb148F60_0xf7093c3e87e3b703a0df4d9360cd38254ed69d0dc4f7ff5399a194bd92e9014c',
  sellLimitOrderFilled:
    '&id=multisig_0x8f4A19C85b39032A37f7a6dCc65234f966F72551_0xd3d13db9fc438d0674819f81be62fcd9c74a8ed7c101a8249b8895e55ee80d76',
  safeAppSwapOrder:
    '&id=multisig_0x03042B890b99552b60A073F808100517fb148F60_0x5f08e05edb210a8990791e9df2f287a5311a8137815ec85856a2477a36552f1e',
}

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

export function enterRecipient(address) {
  cy.get(customRecipient).find('input').clear().type(address)
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
    cy.get('button').eq(0).trigger('mouseover').trigger('click')
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

export function enableCustomRecipient(option) {
  if (!option) cy.get(recipientToggle).click()
}

export function disableCustomRecipient(option) {
  if (option) cy.get(recipientToggle).click()
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

export function selectOrderType(type) {
  cy.get('a').contains(swapStr).click()
  cy.get(orderTypeMenuItem).contains(type).click()
}

export function createRegex(pattern, placeholder) {
  const pattern_ = pattern.replace(placeholder, `\\s*\\d*\\.?\\d*\\s*${placeholder}`)
  return new RegExp(pattern_, 'i')
}

export function getOrderID() {
  return new RegExp(`[a-fA-F0-9]{8}`, 'i')
}

export function getWidgetFee() {
  return new RegExp(`\\s*\\d*\\.?\\d+\\s*%\\s*`, 'i')
}

export function checkTokenOrder(regexPattern, option) {
  cy.get(create_tx.txRowTitle)
    .filter(`:contains("${option}")`)
    .parent('div')
    .then(($div) => {
      const text = $div.text()
      const regex = new RegExp(regexPattern, 'i')

      cy.wrap($div).should(($div) => {
        expect(text).to.match(regex)
      })
    })
}

export function verifyOrderIDUrl() {
  cy.get(create_tx.txRowTitle)
    .contains(orderIdStr)
    .parent()
    .within(() => {
      cy.get(explorerBtn).should('have.attr', 'href').and('include', cowOrdersUrl)
    })
}

export function verifyOrderDetails(limitPrice, expiry, slippage, interactWith, oderID, widgetFee) {
  cy.get(limitPriceFld).contains(limitPrice)
  cy.get(expiryFld).contains(expiry)
  cy.get(slippageFld).contains(slippage)
  cy.get(orderIDFld).contains(oderID)
  cy.get(widgetFeeFld).contains(widgetFee)
  cy.get(interactWithFld).contains(interactWith)
}

export function verifyRecipientAlertIsDisplayed() {
  main.verifyElementsIsVisible([recipientAlert])
}
