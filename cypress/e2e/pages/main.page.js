import * as constants from '../../support/constants'

const acceptSelection = 'Accept selection'

export function clickOnSideMenuItem(item) {
  cy.get('p').contains(item).click()
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
