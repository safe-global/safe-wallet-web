import * as constants from '../../support/constants.js'
import * as main from '../pages/main.page.js'
import * as modal from '../pages/modals.page.js'
import * as apps from '../pages/safeapps.pages.js'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'
import * as ls from '../../support/localstorage_data.js'

let staticSafes = []
const safeApp = 'Safe Test App'
const onchainMessage = 'Message 1'
const appPort = 'http://localhost:8081'
let iframeSelector

describe('Messages popup window tests', () => {
  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
  })

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.appsCustomUrl + staticSafes.SEP_STATIC_SAFE_10)
    main.acceptCookies()
    iframeSelector = `iframe[id="iframe-${appPort}"]`
  })

  it('Verify popup window shows up for off-chain message', () => {
    main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__customSafeApps_11155111, ls.customApps.safeTestApp)
    main.addToLocalStorage(
      constants.localStorageKeys.SAFE_v2__SafeApps__browserPermissions,
      ls.appPermissions.grantedPermissions,
    )
    main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__SafeApps__infoModal, ls.appPermissions.infoModalAccepted)
    cy.reload()
    apps.clickOnApp(safeApp)
    main.getIframeBody(iframeSelector).within(() => {
      apps.triggetOffChainTx()
    })
    apps.verifyPopupWindowTitle(modal.modalTitiles.confirmTx)
    apps.verifySafeAppInPopupWindow(safeApp)
  })

  it('Verify popup window shows up for on-chain message', () => {
    main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__customSafeApps_11155111, ls.customApps.safeTestApp)
    main.addToLocalStorage(
      constants.localStorageKeys.SAFE_v2__SafeApps__browserPermissions,
      ls.appPermissions.grantedPermissions,
    )
    main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__SafeApps__infoModal, ls.appPermissions.infoModalAccepted)
    cy.reload()
    apps.clickOnApp(safeApp)
    main.getIframeBody(iframeSelector).within(() => {
      apps.enterOnchainMessage(onchainMessage)
      apps.triggetOnChainTx()
    })
    apps.verifyPopupWindowTitle(modal.modalTitiles.confirmMsg)
    apps.verifySafeAppInPopupWindow(safeApp)
    apps.verifyMessagePresent(onchainMessage)
  })
})
