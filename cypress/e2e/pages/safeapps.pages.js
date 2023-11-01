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
export const transactionBuilderStr = 'Transaction Builder'
export const logoWalletConnect = /logo.*walletconnect/i
export const walletConnectHeadlinePreview = /walletconnect/i
export const transactiobUilderHeadlinePreview = 'Transaction Builder'
export const availableNetworksPreview = 'Available networks'
export const connecttextPreview = 'Compose custom contract interactions and batch them into a single transaction'
const warningDefaultAppStr = 'The application you are trying to access is not in the default Safe Apps list'
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

export function verifyWarningDefaultAppMsgIsDisplayed() {
  cy.get('p').contains(warningDefaultAppStr).should('be.visible')
  cy.wait(1000)
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
  cy.contains(app).click()
}

export function verifyNoAppsTextPresent() {
  cy.contains(noAppsStr).should('exist')
}

export function pinApp(app, pin = true) {
  const option = pin ? 'Pin' : 'Unpin'
  cy.get(`[aria-label="${option} ${app}"]`).click()
}

export function clickOnBookmarkedAppsTab() {
  cy.findByText(bookmarkedAppsStr).click()
}

export function verifyAppCount(count) {
  cy.findByText(`All apps (${count})`).should('be.visible')
}

export function verifyCustomAppCount(count) {
  cy.findByText(`Custom apps (${count})`).should('be.visible')
}

export function verifyPinnedAppCount(count) {
  cy.findByText(`My pinned apps (${count})`).should(count ? 'be.visible' : 'not.exist')
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
        expect(storedInfoModal['11155111'].consentsAccepted).to.eq(true)
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
