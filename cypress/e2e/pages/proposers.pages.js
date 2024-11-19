import * as constants from '../../support/constants'
import * as main from './main.page'
import * as createWallet from './create_wallet.pages'
import * as navigation from './navigation.page'
import * as addressBook from './address_book.page'
import * as batch from './batches.pages'
import * as create_tx from './create_tx.pages'

export const proposersSection = '[data-testid="proposer-section"]'
const addProposerBtn = '[data-testid="add-proposer-btn"]'

const deleteProposerBtn = '[data-testid="delete-proposer-btn"]'
const editProposerBtn = '[data-testid="edit-proposer-btn"]'
const confrimDeleteProposerBtn = '[data-testid="confirm-delete-proposer-btn"]'
const rejectDeleteProposerBtn = '[data-testid="reject-delete-proposer-btn"]'
const submitProposerBtn = '[data-testid="submit-proposer-btn"]'

const safeAsProposerMessage = 'Cannot add Safe Account itself as proposer'
const proposedTxMessage =
  'This transaction was created by a Proposer. Please review and either confirm or reject it. Once confirmed, it can be finalized and executed'

export function verifyPropsalStatusExists() {
  cy.get(create_tx.proposalStatus).should('exist')
}

export function verifyProposerInTxActionList(address) {
  cy.get(create_tx.txSigner).within(() => {
    cy.contains(address)
    cy.get('div[style]')
      .filter((index, element) => {
        return element.style.backgroundImage.includes('url')
      })
      .should('exist')
  })
}
export function verifyProposedTxMsgVisible() {
  cy.contains(proposedTxMessage).should('be.visible')
}

export function verifyDeleteProposerBtnIsDisabled() {
  cy.get(deleteProposerBtn).should('exist').and('be.disabled')
}

export function clickOnAddProposerBtn() {
  cy.get(addProposerBtn).click()
}

export function enterProposerName(name) {
  addressBook.typeInNameInput(name)
}
export function enterProposerData(address, name) {
  addressBook.typeInAddress(address)
  enterProposerName(name)
}

export function clickOnSubmitProposerBtn() {
  cy.get(submitProposerBtn).click()
}

export function checkCreatorAddress(index, data) {
  cy.get(proposersSection).within(() => {
    cy.get(addressBook.tableRow)
      .eq(index)
      .within(() => {
        Object.entries(data).forEach(([key, value], i) => {
          cy.get('td').eq(1).should('contain.text', value)
        })
      })
  })
}

export function checkProposerData(index, data) {
  cy.get(proposersSection).within(() => {
    cy.get(addressBook.tableRow)
      .eq(index)
      .within(() => {
        Object.entries(data).forEach(([key, value], i) => {
          cy.get('td').eq(0).should('contain.text', value)
        })
      })
  })
}

export function clickOnEditProposerBtn(address) {
  cy.get(proposersSection).within(() => {
    cy.get(addressBook.tableRow).contains(address).parents('tr').find(editProposerBtn).click()
  })
}

export function verifyEditProposerBtnDisabled(address) {
  cy.get(proposersSection).within(() => {
    cy.get(addressBook.tableRow).contains(address).parents('tr').find(editProposerBtn).should('be.disabled')
  })
}

export function confirmProposerDeletion(index) {
  cy.get(confrimDeleteProposerBtn).eq(index).click()
}

export function deleteAllProposers() {
  cy.get('body').then(($body) => {
    if ($body.find(deleteProposerBtn).length > 0) {
      cy.get(deleteProposerBtn).then(($items) => {
        for (let i = 0; i < $items.length; i++) {
          cy.wrap($items[i]).click({ force: true })
          confirmProposerDeletion(0)
        }
      })
    }
    main.verifyElementsCount(deleteProposerBtn, 0)
  })
}

export function verifyAddProposerBtnIsDisabled() {
  cy.get(addProposerBtn).should('exist').and('be.disabled')
}

export function checkSafeAsProposerErrorMessage() {
  cy.contains('label', safeAsProposerMessage).should('exist')
}

export function verifyBatchDoesNotExist() {
  main.verifyElementsCount(batch.batchTxTopBar, 0)
}
