import * as constants from '../../support/constants'

const acceptSelection = 'Accept selection'
const executeStr = 'Execute'
export const modalDialogCloseBtn = '[data-testid="modal-dialog-close-btn"]'

export function clickOnExecuteBtn() {
  cy.get('button').contains(executeStr).click()
}
export function clickOnSideMenuItem(item) {
  cy.get('p').contains(item).click()
}

export function waitForTrnsactionHistoryToComplete() {
  cy.intercept('GET', constants.transactionHistoryEndpoint).as('History')
  cy.wait('@History')
}

export function waitForSafeListRequestToComplete() {
  cy.intercept('GET', constants.safeListEndpoint).as('Safes')
  cy.wait('@Safes')
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

export function verifyGoerliWalletHeader() {
  cy.contains(constants.goerlyE2EWallet)
}

export function verifyHomeSafeUrl(safe) {
  cy.location('href', { timeout: 10000 }).should('include', constants.homeUrl + safe)
}

export function checkTextsExistWithinElement(element, texts) {
  texts.forEach((text) => {
    cy.wrap(element).findByText(text).should('exist')
  })
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
        cy.log('Item retrieved from local storage successfully')
        resolve()
      } else if (attempts < maxAttempts) {
        setTimeout(isItemInLocalstorage, delay)
      } else {
        cy.log('Error: Key does not equal the expected value in local storage')
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
