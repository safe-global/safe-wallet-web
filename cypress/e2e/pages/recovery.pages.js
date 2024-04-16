import * as constants from '../../support/constants'
import * as main from './main.page'
import * as safe from '../pages/load_safe.pages'
import * as tx from '../pages/transactions.page'
import { tableContainer } from '../pages/address_book.page'
import { txDate } from '../pages/create_tx.pages'

const setupRecoveryBtn = '[data-testid="setup-recovery-btn"]'
const setupRecoveryModalBtn = '[data-testid="setup-btn"]'
const recoveryNextBtn = '[data-testid="next-btn"]'
const warningSection = '[data-testid="warning-section"]'
const termsCheckbox = 'input[type="checkbox"]'
const removeRecovererBtn = '[data-testid="remove-recoverer-btn"]'
const removeRecovererSection = '[data-testid="remove-recoverer-section"]'
const startRecoveryBtn = '[data-testid="start-recovery-btn"]'
const recoveryDelaySelect = '[data-testid="recovery-delay-select"]'
const postponeRecoveryBtn = '[data-testid="postpone-recovery-btn"]'
const goToQueueBtn = '[data-testid="queue-btn"]'
const executeBtn = '[data-testid="execute-btn"]'
const cancelRecoveryBtn = '[data-testid="cancel-recovery-btn"]'
const cancelProposalBtn = '[data-testid="cancel-proposal-btn"]'
const executeFormBtn = '[data-testid="execute-form-btn"]'

export function clickOnExecuteRecoveryCancelBtn() {
  cy.get(executeFormBtn).click()
}
export function cancelRecoveryTx() {
  cy.get(txDate).click()
  cy.get(cancelRecoveryBtn).scrollIntoView().click()
  cy.get(cancelProposalBtn).scrollIntoView().click()
}
export function clickOnRecoveryExecuteBtn() {
  cy.get(executeBtn).eq(0).should('be.enabled', { timeout: 300000 })
  cy.wait(1000)
  cy.get(executeBtn).eq(0).click()
}
export function verifyTxNotInQueue() {
  cy.get(txDate).should('have.length', 0)
}
export const recoveryDelayOptions = {
  one_minute: '1 minute',
}

export function setRecoveryDelay(option) {
  cy.get(recoveryDelaySelect).click()
  cy.contains(option).click()
}

export function getSetupRecoveryBtn() {
  return cy.get(setupRecoveryBtn)
}

export function clickOnSetupRecoveryBtn() {
  getSetupRecoveryBtn().click()
  cy.get(setupRecoveryModalBtn).should('be.visible')
}

export function clickOnSetupRecoveryModalBtn() {
  cy.get(setupRecoveryModalBtn).click()
}

export function clickOnNextBtn() {
  cy.get(recoveryNextBtn).click()
}

export function clickOnGoToQueueBtn() {
  cy.get(goToQueueBtn).click()
  cy.get(goToQueueBtn).should('not.exist')
}

export function enterRecovererAddress(address) {
  safe.inputOwnerAddress(0, address)
}

export function agreeToTerms() {
  cy.get(warningSection).within(() => {
    main.verifyCheckboxeState(termsCheckbox, 0, constants.checkboxStates.unchecked)
    cy.get(termsCheckbox).click()
    main.verifyCheckboxeState(termsCheckbox, 0, constants.checkboxStates.checked)
  })
}

export function verifyRecovererAdded(address) {
  main.verifyValuesExist(tableContainer, address)
}

export function clearRecoverers() {
  cy.get('body').then(($body) => {
    if ($body.find(removeRecovererBtn).length) {
      cy.get(removeRecovererBtn).each(($btn) => {
        cy.wrap($btn).click()
        clickOnNextBtn()
        tx.executeFlow_1()
      })
    }
  })
}

export function clickOnStartRecoveryBtn() {
  cy.get(startRecoveryBtn).click()
}

export function enterOwnerAddress(address) {
  safe.inputOwnerAddress(0, address)
}

export function postponeRecovery() {
  cy.wait(7000)
  cy.get(postponeRecoveryBtn)
    .should(() => {})
    .then(($button) => {
      if (!$button.length) {
        return
      }
      cy.wrap($button).click()
      cy.get(postponeRecoveryBtn).should('not.exist')
    })
}
