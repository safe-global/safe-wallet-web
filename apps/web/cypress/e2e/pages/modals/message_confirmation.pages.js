import * as modal from '../modals.page'
import * as checkers from '../../../support/utils/checkers'
import * as main from '../main.page'

const messageHash = '[data-testid="message-hash"]'
const messageDetails = '[data-testid="message-details"]'
const messageInfobox = '[data-testid="message-infobox"]'

const messageInfoBoxData = [
  'Collect all the confirmations',
  'Confirmations (1 of 2)',
  'The signature will be submitted to the requesting app when the message is fully signed',
]

export function verifyConfirmationWindowTitle(title) {
  cy.get(modal.modalTitle).should('contain', title)
}

export function verifyMessagePresent(msg) {
  cy.get('textarea').should('contain', msg)
}

export function verifySafeAppInPopupWindow(safeApp) {
  cy.contains(safeApp)
}

export function verifyOffchainMessageHash(index) {
  cy.get(messageHash)
    .eq(index)
    .invoke('text')
    .then((text) => {
      if (!checkers.startsWith0x(text)) {
        throw new Error(`Message at index ${index} does not start with '0x': ${text}`)
      }
    })
}

export function checkMessageInfobox() {
  cy.get(messageInfobox)
    .first()
    .within(() => {
      main.verifyTextVisibility(messageInfoBoxData)
    })
}

export function clickOnMessageDetails() {
  cy.get(messageDetails).click()
}
