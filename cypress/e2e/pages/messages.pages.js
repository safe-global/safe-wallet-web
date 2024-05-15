import { messageItem } from './create_tx.pages'
const onchainMsgInput = 'input[placeholder*="Message"]'

export function enterOnchainMessage(msg) {
  cy.get(onchainMsgInput).type(msg)
}

export function clickOnMessageSignBtn(index) {
  cy.get(messageItem)
    .eq(index)
    .within(() => {
      cy.get('button').contains('Sign').click()
    })
}
