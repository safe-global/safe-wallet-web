import * as constants from '../../support/constants.js'
import * as main from '../pages/main.page.js'
import * as sideBar from '../pages/sidebar.pages.js'
import * as ls from '../../support/localstorage_data.js'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'
import * as wallet from '../../support/utils/wallet.js'

let staticSafes = []
const walletCredentials = JSON.parse(Cypress.env('CYPRESS_WALLET_CREDENTIALS'))
const signer = walletCredentials.OWNER_4_PRIVATE_KEY

describe('Sidebar tests 4', () => {
  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
  })

  it('Verify that safes in the sidebar show the "bookmark" icon', () => {
    cy.visit(constants.BALANCE_URL + staticSafes.SEP_STATIC_SAFE_9)
    cy.intercept('GET', constants.safeListEndpoint, {
      11155111: [sideBar.sideBarSafes.safe1],
    })
    wallet.connectSigner(signer)
    sideBar.openSidebar()
    sideBar.verifySafeBookmarkBtnExists(sideBar.sideBarSafes.safe1short)
  })

  it('Verify a safe can be added and removed from the pinned list', () => {
    cy.visit(constants.BALANCE_URL + staticSafes.SEP_STATIC_SAFE_9)
    cy.intercept('GET', constants.safeListEndpoint, {
      11155111: [sideBar.sideBarSafes.safe1],
    })
    wallet.connectSigner(signer)
    sideBar.openSidebar()
    sideBar.clickOnBookmarkBtn(sideBar.sideBarSafes.safe1short)
    sideBar.verifyPinnedSafe(sideBar.sideBarSafes.safe1short)
    sideBar.clickOnBookmarkBtn(sideBar.sideBarSafes.safe1short)
    sideBar.verifyPinnedListIsEmpty()
  })

  it('Verify CF safe can be added and removed from the pinned list', () => {
    cy.visit(constants.BALANCE_URL + staticSafes.SEP_STATIC_SAFE_9)
    cy.intercept('GET', constants.safeListEndpoint, { 1: [], 100: [], 137: [], 11155111: [] })
    main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__undeployedSafes, ls.undeployedSafe.safe1)
    wallet.connectSigner(signer)
    sideBar.openSidebar()
    sideBar.clickOnBookmarkBtn(sideBar.sideBarSafes.safe4short)
    sideBar.verifyPinnedSafe(sideBar.sideBarSafes.safe4short)
    sideBar.clickOnBookmarkBtn(sideBar.sideBarSafes.safe4short)
    sideBar.verifyPinnedListIsEmpty()
  })

  it('Verify the "All account" list is always closed by whenever you open the sidebar', () => {
    cy.visit(constants.BALANCE_URL + staticSafes.SEP_STATIC_SAFE_9)
    cy.intercept('GET', constants.safeListEndpoint, {
      11155111: [sideBar.sideBarSafes.safe1],
    })
    wallet.connectSigner(signer)
    sideBar.clickOnOpenSidebarBtn()
    sideBar.verifyAccountsCollapsed()
  })

  it('Verify the empty state of Accounts shows "Connect" for a disconnected user', () => {
    cy.visit(constants.BALANCE_URL + staticSafes.SEP_STATIC_SAFE_9)
    sideBar.openSidebar()
    sideBar.verifyConnectBtnDisplayed()
  })
})
