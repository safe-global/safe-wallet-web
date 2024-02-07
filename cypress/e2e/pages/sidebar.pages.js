import * as constants from '../../support/constants'
import * as main from './main.page'
import * as modal from '../pages/modals.page'
import * as navigation from './navigation.page'
import { safeHeaderInfo } from './import_export.pages'

const chainLogo = '[data-testid="chain-logo"]'
const safeIcon = '[data-testid="safe-icon"]'
const sidebarContainer = '[data-testid="sidebar-container"]'
const openSafesIcon = '[data-testid="open-safes-icon"]'
const qrModalBtn = '[data-testid="qr-modal-btn"]'
const copyAddressBtn = '[data-testid="copy-address-btn"]'
const explorerBtn = '[data-testid="explorer-btn"]'
const sideBarListItem = '[data-testid="sidebar-list-item"]'
const sideBarListItemWhatsNew = '[data-testid="list-item-whats-new"]'
const sideBarListItemNeedHelp = '[data-testid="list-item-need-help"]'
const sideSafeListItem = '[data-testid="safe-list-item"]'
const sidebarSafeHeader = '[data-testid="safe-header-info"]'
const sidebarSafeContainer = '[data-testid="sidebar-safe-container"]'
const safeItemOptionsBtn = '[data-testid="safe-options-btn"]'
const safeItemOptionsRenameBtn = '[data-testid="rename-btn"]'
const safeItemOptionsRemoveBtn = '[data-testid="remove-btn"]'
const nameInput = '[data-testid="name-input"]'
const saveBtn = '[data-testid="save-btn"]'
const cancelBtn = '[data-testid="cancel-btn"]'
const deleteBtn = '[data-testid="delete-btn"]'
const readOnlyVisibility = '[data-testid="read-only-visibility"]'
const currencySection = '[data-testid="currency-section"]'
const missingSignatureInfo = '[data-testid="missing-signature-info"]'
const queuedTxInfo = '[data-testid="queued-tx-info"]'

export const addedSafesGnosis = ['0x17b3...98C8', '0x11A6...F1BB', '0xB8d7...642A']
export const addedSafesSepolia = ['0x6d0b...6dC1', '0x5912...fFdb', '0x0637...708e', '0xD157...DE9a']
export const sideBarListItems = ['Home', 'Assets', 'Transactions', 'Address book', 'Apps', 'Settings']
export const testSafeHeaderDetails = ['2/2', constants.SEPOLIA_TEST_SAFE_13_SHORT]
const receiveAssetsStr = 'Receive assets'

export function verifyNetworkIsDisplayed(netwrok) {
  cy.get(sidebarContainer)
    .should('be.visible')
    .within(() => {
      cy.get(chainLogo).should('contain', netwrok)
    })
}

export function verifySafeHeaderDetails(details) {
  main.checkTextsExistWithinElement(safeHeaderInfo, details)
  main.verifyElementsExist([safeIcon, currencySection])
}

export function clickOnQRCodeBtn() {
  cy.get(sidebarContainer)
    .should('be.visible')
    .within(() => {
      cy.get(qrModalBtn).click()
    })
}

export function verifyQRModalDisplayed() {
  cy.get(modal.modal).should('be.visible')
  cy.get(modal.modalTitle).should('contain', receiveAssetsStr)
}

export function verifyCopyAddressBtn(data) {
  cy.get(sidebarContainer)
    .should('be.visible')
    .within(() => {
      cy.get(copyAddressBtn)
        .click()
        .then(() =>
          cy.window().then((win) => {
            win.navigator.clipboard.readText().then((text) => {
              expect(text).to.contain(data)
            })
          }),
        )
    })
}

export function verifyEtherscanLinkExists() {
  cy.get(sidebarContainer)
    .should('be.visible')
    .within(() => {
      cy.get(explorerBtn).should('have.attr', 'href').and('include', constants.sepoliaEtherscanlLink)
    })
}

export function verifyNewTxBtnStatus(status) {
  main.verifyElementsStatus([navigation.newTxBtn], status)
}

export function verifySideListItems() {
  main.verifyValuesExist(sideBarListItem, sideBarListItems)
  main.verifyElementsExist([sideBarListItemWhatsNew, sideBarListItemNeedHelp])
}

export function verifyTxCounter(counter) {
  cy.get(sideBarListItem).contains(sideBarListItems[2]).should('contain', counter)
}

export function verifySafeCount(count) {
  main.verifyMinimumElementsCount(sideSafeListItem, count)
}

export function openSidebar() {
  cy.get(openSafesIcon).click()
  main.verifyElementsExist([sidebarSafeContainer])
}

export function verifyAddedSafesExist(safes) {
  main.verifyValuesExist(sideSafeListItem, safes)
}

export function verifySafesByNetwork(netwrok, safes) {
  cy.get(sidebarSafeContainer).within(() => {
    cy.get(chainLogo)
      .contains(netwrok)
      .next()
      .within(() => {
        main.verifyValuesExist(sideSafeListItem, safes)
      })
  })
}

function getSafeItemByName(name) {
  return cy.get(sidebarSafeContainer).find(sideSafeListItem).contains(name).parents('li')
}

export function verifySafeReadOnlyState(safe) {
  getSafeItemByName(safe).find(readOnlyVisibility).should('exist')
}

export function verifyMissingSignature(safe) {
  getSafeItemByName(safe).find(missingSignatureInfo).should('exist')
}

export function verifyQueuedTx(safe) {
  return getSafeItemByName(safe).find(queuedTxInfo).should('exist')
}

function clickOnSafeItemOptionsBtn(name) {
  getSafeItemByName(name).find(safeItemOptionsBtn).click()
}

export function renameSafeItem(oldName, newName) {
  clickOnSafeItemOptionsBtn(oldName)
  clickOnRenameBtn()
  typeSafeName(newName)
}

export function removeSafeItem(name) {
  clickOnSafeItemOptionsBtn(name)
  clickOnRemoveBtn()
  confirmSafeItemRemoval()
  verifyModalRemoved()
}

function typeSafeName(name) {
  cy.get(nameInput).find('input').clear().type(name)
}

function clickOnRenameBtn() {
  cy.get(safeItemOptionsRenameBtn).click()
}

function clickOnRemoveBtn() {
  cy.get(safeItemOptionsRemoveBtn).click()
}

function confirmSafeItemRemoval() {
  cy.get(deleteBtn).click()
}

export function verifySafeNameExists(name) {
  cy.get(sidebarSafeContainer).within(() => {
    cy.get(sideSafeListItem).contains(name)
  })
}

export function verifySafeRemoved(name) {
  main.verifyValuesDoNotExist(sidebarSafeContainer, [name])
}

export function clickOnSaveBtn() {
  cy.get(saveBtn).click()
  verifyModalRemoved()
}

function verifyModalRemoved() {
  main.verifyElementsCount(modal.modalTitle, 0)
}

export function checkCurrencyInHeader(currency) {
  cy.get(sidebarSafeHeader).within(() => {
    cy.get(currencySection).contains(currency)
  })
}
