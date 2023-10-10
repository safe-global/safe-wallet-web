import * as constants from '../../support/constants'

const searchAppInput = 'input[id="search-by-name"]'
const appUrlInput = 'input[name="appUrl"]'
const closePreviewWindowBtn = 'button[aria-label*="Close"][aria-label*="preview"]'

const addBtnStr = /add/i
const noAppsStr = /no Safe Apps found/i
const bookmarkedAppsStr = /bookmarked Apps/i
const customAppsStr = /my custom Apps/i
const addCustomAppBtnStr = /add custom Safe App/i
const openSafeAppBtnStr = /open Safe App/i
const disclaimerTtle = /disclaimer/i
const continueBtnStr = /continue/i
const cameraCheckBoxStr = /camera/i
const microfoneCheckBoxStr = /microphone/i
const permissionRequestStr = /permissions request/i
const accessToAddressBookStr = /access to your address book/i
const acceptBtnStr = /accept/i
const clearAllBtnStr = /clear all/i
const allowAllPermissions = /allow all/i

const appNotSupportedMsg = "The app doesn't support Safe App functionality"

export const pinWalletConnectStr = /pin walletconnect/i
export const transactionBuilderStr = /pin transaction builder/i
export const logoWalletConnect = /logo.*walletconnect/i
export const walletConnectHeadlinePreview = /walletconnect/i
export const availableNetworksPreview = /available networks/i
export const connecttextPreview = 'Connect your Safe to any dApp that supports WalletConnect'
export const localStorageItem =
  '{"https://safe-test-app.com":[{"feature":"camera","status":"granted"},{"feature":"microphone","status":"denied"}]}'
export const gridItem = 'main .MuiPaper-root > .MuiGrid-item'
export const linkNames = {
  logo: /logo/i,
}

export const permissionCheckboxes = {
  camera: 'input[name="camera"]',
  addressbook: 'input[name="requestAddressBook"]',
  microphone: 'input[name="microphone"]',
  geolocation: 'input[name="geolocation"]',
  fullscreen: 'input[name="fullscreen"]',
}

export const permissionCheckboxNames = {
  camera: 'Camera',
  addressbook: 'Address Book',
  microphone: 'Microphone',
  geolocation: 'Geolocation',
  fullscreen: 'Fullscreen',
}
export function typeAppName(name) {
  cy.get(searchAppInput).clear().type(name)
}

export function clearSearchAppInput() {
  cy.get(searchAppInput).clear()
}

export function verifyLinkName(name) {
  cy.findAllByRole('link', { name: name }).should('have.length', 1)
}

export function clickOnApp(app) {
  cy.findByRole('link', { name: app }).click()
}

export function verifyNoAppsTextPresent() {
  cy.contains(noAppsStr).should('exist')
}

export function pinApp(app, pin = true) {
  let str = 'Unpin'
  if (!pin) str = 'Pin'
  cy.findByLabelText(app)
    .click()
    .should(($el) => {
      const ariaLabel = $el.attr('aria-label')
      expect(ariaLabel).to.include(str)
    })
}

export function clickOnBookmarkedAppsTab() {
  cy.findByText(bookmarkedAppsStr).click()
}

export function verifyAppCount(count) {
  cy.findByText(`ALL (${count})`).should('be.visible')
}

export function clickOnCustomAppsTab() {
  cy.findByText(customAppsStr).click()
}

export function clickOnAddCustomApp() {
  cy.findByText(addCustomAppBtnStr).click()
}

export function typeCustomAppUrl(url) {
  cy.get(appUrlInput).clear().type(url)
}

export function verifyAppNotSupportedMsg() {
  cy.contains(appNotSupportedMsg).should('be.visible')
}

export function verifyAppTitle(title) {
  cy.findByRole('heading', { name: title }).should('exist')
}

export function acceptTC() {
  cy.findByRole('checkbox').click()
}

export function clickOnAddBtn() {
  cy.findByRole('button', { name: addBtnStr }).click()
}

export function verifyAppDescription(descr) {
  cy.findByText(descr).should('exist')
}

export function clickOnOpenSafeAppBtn() {
  cy.findByRole('link', { name: openSafeAppBtnStr }).click()
  cy.wait(500)
  verifyDisclaimerIsVisible()
  cy.wait(500)
}

function verifyDisclaimerIsVisible() {
  cy.findByRole('heading', { name: disclaimerTtle }).should('be.visible')
}

export function clickOnContinueBtn() {
  return cy.findByRole('button', { name: continueBtnStr }).click()
}

export function verifyCameraCheckBoxExists() {
  cy.findByRole('checkbox', { name: cameraCheckBoxStr }).should('exist')
}

export function verifyMicrofoneCheckBoxExists() {
  return cy.findByRole('checkbox', { name: microfoneCheckBoxStr }).should('exist')
}

export function storeAndVerifyPermissions() {
  cy.waitForSelector(() => {
    return cy
      .findByRole('button', { name: continueBtnStr })
      .click()
      .wait(500)
      .should(() => {
        const storedBrowserPermissions = JSON.parse(localStorage.getItem(constants.BROWSER_PERMISSIONS_KEY))
        const browserPermissions = Object.values(storedBrowserPermissions)[0][0]
        const storedInfoModal = JSON.parse(localStorage.getItem(constants.INFO_MODAL_KEY))

        expect(browserPermissions.feature).to.eq('camera')
        expect(browserPermissions.status).to.eq('granted')
        expect(storedInfoModal['5'].consentsAccepted).to.eq(true)
      })
  })
}

export function verifyPreviewWindow(str1, str2, str3) {
  cy.findByRole('heading', { name: str1 }).should('exist')
  cy.findByText(str2).should('exist')
  cy.findByText(str3).should('exist')
}

export function closePreviewWindow() {
  cy.get(closePreviewWindowBtn).click()
}

export function verifyPermissionsRequestExists() {
  cy.findByRole('heading', { name: permissionRequestStr }).should('exist')
}

export function verifyAccessToAddressBookExists() {
  cy.findByText(accessToAddressBookStr).should('exist')
}

export function clickOnAcceptBtn() {
  cy.findByRole('button', { name: acceptBtnStr }).click()
}

export function uncheckAllPermissions(element) {
  cy.wrap(element).findByText(clearAllBtnStr).click()
}

export function checkAllPermissions(element) {
  cy.wrap(element).findByText(allowAllPermissions).click()
}
