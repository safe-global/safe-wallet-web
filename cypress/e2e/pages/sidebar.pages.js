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

export const sideBarListItems = ['Home', 'Assets', 'Transactions', 'Address book', 'Apps', 'Settings']
export const testSafeHeaderDetails = ['2.04 USD', '2/2', constants.SEPOLIA_TEST_SAFE_13_SHORT]
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
  main.verifyElementsExist([safeIcon])
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
