import * as constants from '../../support/constants'

const acceptSelection = 'Save settings'
const executeStr = 'Execute'
const connectedOwnerBlock = '[data-testid="open-account-center"]'
export const modalDialogCloseBtn = '[data-testid="modal-dialog-close-btn"]'

export function checkElementBackgroundColor(element, color) {
  cy.get(element).should('have.css', 'background-color', color)
}

export function clickOnExecuteBtn() {
  cy.get('button').contains(executeStr).click()
}
export function clickOnSideMenuItem(item) {
  cy.get('p').contains(item).click()
}

export function waitForHistoryCallToComplete() {
  cy.intercept('GET', constants.transactionHistoryEndpoint).as('History')
  cy.wait('@History')
}

export const fetchSafeData = (safeAddress) => {
  return cy
    .request({
      method: 'GET',
      url: `${constants.stagingTxServiceUrl}/v1${constants.stagingTxServiceSafesUrl}${safeAddress}`,
      headers: {
        accept: 'application/json',
      },
    })
    .then((response) => {
      expect(response.status).to.eq(200)
    })
}

export const getSafeBalance = (safeAddress, chain) => {
  return cy
    .request({
      method: 'GET',
      url: `${constants.stagingCGWUrlv1}${constants.stagingCGWChains}${chain}${constants.stagingCGWSafes}${safeAddress}${constants.stagingCGWAllTokensBalances}`,
      headers: {
        accept: 'application/json',
      },
    })
    .then((response) => {
      expect(response.status).to.eq(200)
    })
}

export const getSafeNFTs = (safeAddress, chain) => {
  return cy
    .request({
      method: 'GET',
      url: `${constants.stagingCGWUrlv2}${constants.stagingCGWChains}${chain}${constants.stagingCGWSafes}${safeAddress}${constants.stagingCGWCollectibles}`,
      headers: {
        accept: 'application/json',
      },
    })
    .then((response) => {
      expect(response.status).to.eq(200)
      return response
    })
}

export const getSafeNonce = (safeAddress, chain) => {
  return cy
    .request({
      method: 'GET',
      url: `${constants.stagingCGWUrlv1}${constants.stagingCGWChains}${chain}${constants.stagingCGWSafes}${safeAddress}${constants.stagingCGWNone}`,
      headers: {
        accept: 'application/json',
      },
    })
    .then((response) => {
      expect(response.status).to.eq(200)
    })
}

export function fetchCurrentNonce(safeAddress) {
  return getSafeNonce(safeAddress.substring(4), constants.networkKeys.sepolia).then(
    (response) => response.body.currentNonce,
  )
}

export function verifyNonceChange(safeAddress, expectedNonce) {
  fetchCurrentNonce(safeAddress).then((newNonce) => {
    expect(newNonce).to.equal(expectedNonce)
  })
}

export function checkTokenBalance(safeAddress, tokenSymbol, expectedBalance) {
  getSafeBalance(safeAddress.substring(4), constants.networkKeys.sepolia).then((response) => {
    const targetToken = response.body.items.find((token) => token.tokenInfo.symbol === tokenSymbol)
    console.log(targetToken)
    expect(targetToken.balance).to.include(expectedBalance)
  })
}

export function checkNFTBalance(safeAddress, tokenSymbol, expectedBalance) {
  getSafeNFTs(safeAddress.substring(4), constants.networkKeys.sepolia).then((response) => {
    const targetToken = response.body.results.find((token) => token.tokenSymbol === tokenSymbol)
    expect(targetToken.tokenName).to.equal(expectedBalance)
  })
}

export function checkTokenBalanceIsNull(safeAddress, tokenSymbol) {
  let pollCount = 0

  function poll() {
    getSafeNFTs(safeAddress.substring(4), constants.networkKeys.sepolia).then((response) => {
      const targetToken = response.body.results.find((token) => token.tokenSymbol === tokenSymbol)
      if (targetToken === undefined) {
        console.log('Token is undefined as expected. Stopping polling.')
        return true
      } else if (pollCount < 9) {
        pollCount++
        console.log('Token is not undefined, retrying...')
        cy.wait(1000)
        poll()
      } else {
        throw new Error('Failed to validate token status -undefined- within the allowed polling attempts.')
      }
    })
  }
  cy.wrap(null).then(poll).should('be.true')
}

export function acceptCookies(index = 0) {
  cy.wait(1000)

  cy.findAllByText('Got it!')
    .should('have.length.at.least', index)
    .each(($el) => $el.click())

  cy.get('button')
    .contains(acceptSelection)
    .should(() => {})
    .then(($button) => {
      if (!$button.length) {
        return
      }
      cy.wrap($button).click()
      cy.contains(acceptSelection).should('not.exist')
      cy.wait(500)
    })
}

export function verifyOwnerConnected(prefix = 'sep:') {
  cy.get(connectedOwnerBlock).should('contain', prefix)
}

export function verifyHomeSafeUrl(safe) {
  cy.location('href', { timeout: 10000 }).should('include', constants.homeUrl + safe)
}

export function checkTextsExistWithinElement(element, texts) {
  texts.forEach((text) => {
    cy.get(element)
      .should('be.visible')
      .within(() => {
        cy.get('div').contains(text).should('be.visible')
      })
  })
}

export function checkRadioButtonState(selector, state) {
  if (state === constants.checkboxStates.checked) {
    cy.get(selector).should('be.checked')
  } else state === constants.checkboxStates.unchecked
  cy.get(selector).should('not.be.checked')
}

export function verifyCheckboxeState(element, index, state) {
  cy.get(element).eq(index).should(state)
}

export function verifyInputValue(selector, value) {
  cy.get(selector).invoke('val').should('include', value)
}

export function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZz0123456789'
  let result = ''

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  return result
}

export function verifyElementsCount(element, count) {
  cy.get(element).should('have.length', count)
}

export function verifyMinimumElementsCount(element, count) {
  cy.get(element).should('have.length.at.least', count)
}

export function verifyValuesDoNotExist(element, values) {
  values.forEach((value) => {
    cy.get(element).should('not.contain', value)
  })
}

export function verifyValuesExist(element, values) {
  values.forEach((value) => {
    cy.get(element).should('contain', value)
  })
}

export function verifyElementsExist(elements) {
  elements.forEach((element) => {
    cy.get(element).should('exist')
  })
}

export function verifyElementsIsVisible(elements) {
  elements.forEach((element) => {
    cy.get(element).scrollIntoView().should('be.visible')
  })
}

export function getTextToArray(selector, textArray) {
  cy.get(selector).each(($element) => {
    textArray.push($element.text())
  })
}

export function extractDigitsToArray(selector, digitsArray) {
  cy.get(selector).each(($element) => {
    const text = $element.text()
    const digits = text.match(/\d+\.\d+|\d+\b/g)
    if (digits) {
      digitsArray.push(...digits)
    }
  })
}

export function isItemInLocalstorage(key, expectedValue, maxAttempts = 10, delay = 100) {
  return new Promise((resolve, reject) => {
    let attempts = 0

    const isItemInLocalstorage = () => {
      attempts++
      const storedValue = JSON.parse(window.localStorage.getItem(key))
      const keyEqualsValue = JSON.stringify(expectedValue) === JSON.stringify(storedValue)
      if (keyEqualsValue) {
        resolve()
      } else if (attempts < maxAttempts) {
        setTimeout(isItemInLocalstorage, delay)
      } else {
        reject(error)
      }
    }
    isItemInLocalstorage()
  })
}

export function addToLocalStorage(key, jsonValue) {
  return new Promise((resolve, reject) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(jsonValue))
      resolve('Item added to local storage successfully')
    } catch (error) {
      reject('Error adding item to local storage: ' + error)
    }
  })
}

export function checkTextOrder(selector, expectedTextArray) {
  cy.get(selector).each((element, index) => {
    const text = Cypress.$(element).text().trim()
    expect(text).to.eq(expectedTextArray[index])
  })
}

export function verifyElementsStatus(elements, status) {
  elements.forEach((element) => {
    cy.get(element).should(status)
  })
}

export function formatAddressInCaps(address) {
  if (address.startsWith('sep:0x')) {
    return '0x' + address.substring(6).toUpperCase()
  } else {
    return 'Invalid address format'
  }
}

export function getElementText(element) {
  return cy.get(element).invoke('text')
}

export function verifyTextVisibility(stringsArray) {
  stringsArray.forEach((string) => {
    cy.contains(string).should('be.visible')
  })
}
