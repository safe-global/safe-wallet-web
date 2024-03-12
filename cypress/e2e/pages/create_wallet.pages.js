import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import { connectedWalletExecMethod } from '../pages/create_tx.pages'
import * as sidebar from '../pages/sidebar.pages'

const welcomeLoginScreen = '[data-testid="welcome-login"]'
const expandMoreIcon = 'svg[data-testid="ExpandMoreIcon"]'
const nameInput = 'input[name="name"]'
const ownerInput = 'input[name^="owners"][name$="name"]'
const ownerAddress = 'input[name^="owners"][name$="address"]'
const thresholdInput = 'input[name="threshold"]'
export const removeOwnerBtn = 'button[aria-label="Remove signer"]'
const connectingContainer = 'div[class*="connecting-container"]'
const createNewSafeBtn = '[data-testid="create-safe-btn"]'
const connectWalletBtn = 'Connect wallet'
const continueWithWalletBtn = 'Continue with E2E Wallet'
const googleConnectBtn = '[data-testid="google-connect-btn"]'
const googleSignedinBtn = '[data-testid="signed-in-account-btn"]'
export const accountInfoHeader = '[data-testid="open-account-center"]'
export const reviewStepOwnerInfo = '[data-testid="review-step-owner-info"]'
const reviewStepNextBtn = '[data-testid="review-step-next-btn"]'
const safeCreationStatusInfo = '[data-testid="safe-status-info"]'
const startUsingSafeBtn = '[data-testid="start-using-safe-btn"]'
const sponsorIcon = '[data-testid="sponsor-icon"]'
const networkFeeSection = '[data-tetid="network-fee-section"]'
const nextBtn = '[data-testid="next-btn"]'
const backBtn = '[data-testid="back-btn"]'
const cancelBtn = '[data-testid="cancel-btn"]'
const safeBackupAlert = '[data-testid="safe-backup-alert"]'
const dialogConfirmBtn = '[data-testid="dialog-confirm-btn"]'
const safeActivationSection = '[data-testid="activation-section"]'

const sponsorStr = 'Your account is sponsored by Goerli'
const safeCreationProcessing = 'Transaction is being executed'
const safeCreationComplete = 'Your Safe Account is being indexed'
const changeNetworkWarningStr = 'Change your wallet network'
const policy1_2 = '1/1 policy'
export const walletName = 'test1-sepolia-safe'
export const defaultSepoliaPlaceholder = 'Sepolia Safe'
const welcomeToSafeStr = 'Welcome to Safe'

export function verifyNewSafeDialogModal() {
  main.verifyElementsIsVisible([safeBackupAlert, dialogConfirmBtn])
}
//
export function verifyCFSafeCreated() {
  main.verifyElementsIsVisible([sidebar.pendingActivationIcon, safeActivationSection])
}

export function clickOnGotitBtn() {
  cy.get(dialogConfirmBtn).click()
  main.verifyElementsCount(connectedWalletExecMethod, 0)
}

export function selectPayLaterOption() {
  cy.get(connectedWalletExecMethod).click()
}
export function cancelWalletCreation() {
  cy.get(cancelBtn).click()
  cy.get('button').contains(continueWithWalletBtn).should('be.visible')
}

export function clickOnBackBtn() {
  cy.get(backBtn).should('be.enabled').click()
}
export function verifySafeIsBeingCreated() {
  cy.get(safeCreationStatusInfo).should('have.text', safeCreationProcessing)
}

export function verifySafeCreationIsComplete() {
  cy.get(safeCreationStatusInfo).should('exist').and('have.text', safeCreationComplete)
  cy.get(startUsingSafeBtn).should('exist').click()
  cy.get(welcomeToSafeStr).should('exist')
}

export function clickOnReviewStepNextBtn() {
  cy.get(reviewStepNextBtn).click()
  cy.get(reviewStepNextBtn, { timeout: 60000 }).should('not.exist')
}
export function verifyOwnerInfoIsPresent() {
  return cy.get(reviewStepOwnerInfo).shoul('exist')
}

export function verifySponsorMessageIsPresent() {
  main.verifyElementsExist([sponsorIcon, networkFeeSection])
  // Goerli is generated
  cy.get(networkFeeSection).contains(sponsorStr).should('exist')
}

export function verifyGoogleConnectBtnIsDisabled() {
  cy.get(googleConnectBtn).should('be.disabled')
}

export function verifyGoogleConnectBtnIsEnabled() {
  cy.get(googleConnectBtn).should('not.be.disabled')
}

export function verifyGoogleSignin() {
  return cy.get(googleSignedinBtn).should('exist')
}

export function verifyGoogleAccountInfoInHeader() {
  return cy.get(accountInfoHeader).should('exist')
}

export function verifyPolicy1_1() {
  cy.contains(policy1_2).should('exist')
  // TOD: Need data-cy for containers
}

export function verifyDefaultWalletName(name) {
  cy.get(nameInput).invoke('attr', 'placeholder').should('include', name)
}

export function verifyNextBtnIsDisabled() {
  cy.get('button').contains('Next').should('be.disabled')
}

export function verifyNextBtnIsEnabled() {
  cy.get('button').contains('Next').should('not.be.disabled')
}

export function checkNetworkChangeWarningMsg() {
  cy.get('div').contains(changeNetworkWarningStr).should('exist')
}

export function connectWallet() {
  cy.get('onboard-v2')
    .shadow()
    .within(($modal) => {
      cy.wrap($modal).contains('div', constants.connectWalletNames.e2e).click()
      cy.wrap($modal).get(connectingContainer).should('exist')
    })
}

export function clickOnCreateNewSafeBtn() {
  cy.get(createNewSafeBtn).click().wait(1000)
}

export function clickOnContinueWithWalletBtn() {
  cy.get('button').contains(continueWithWalletBtn).click().wait(1000)
}

export function clickOnConnectWalletBtn() {
  cy.get(welcomeLoginScreen).within(() => {
    cy.get('button').contains(connectWalletBtn).should('be.visible').should('be.enabled').click().wait(1000)
  })
}

export function typeWalletName(name) {
  cy.get(nameInput).type(name).should('have.value', name)
}

export function clearWalletName() {
  cy.get(nameInput).clear()
}

export function selectNetwork(network) {
  cy.wait(1000)
  cy.get(expandMoreIcon).eq(1).parents('div').eq(1).click()
  cy.wait(1000)
  let regex = new RegExp(`^${network}$`)
  cy.get('li').contains(regex).click()
}

export function clickOnNextBtn() {
  cy.get(nextBtn).should('be.enabled').click()
}

export function verifyOwnerName(name, index) {
  cy.get(ownerInput).eq(index).should('have.value', name)
}

export function verifyOwnerAddress(address, index) {
  cy.get(ownerAddress).eq(index).should('have.value', address)
}

export function verifyThreshold(number) {
  cy.get(thresholdInput).should('have.value', number)
}

export function typeOwnerName(name, index) {
  cy.get(getOwnerNameInput(index)).type(name).should('have.value', name)
}

export function typeOwnerAddress(address, index, clearOnly = false) {
  if (clearOnly) {
    cy.get(getOwnerAddressInput(index)).clear()
    cy.get('body').click()
    return
  }
  cy.get(getOwnerAddressInput(index)).clear().type(address).should('have.value', address)
}

export function clickOnAddNewOwnerBtn() {
  cy.contains('button', 'Add new signer').click().wait(700)
}

export function addNewOwner(name, address, index) {
  clickOnAddNewOwnerBtn()
  typeOwnerName(name, index)
  typeOwnerAddress(address, index)
}

export function updateThreshold(number) {
  cy.get(thresholdInput).parent().click()
  cy.contains('li', number).click()
}

export function removeOwner(index) {
  // Index for remove owner btn which does not equal to number of owners
  cy.get(removeOwnerBtn).eq(index).click()
}

export function verifySafeNameInSummaryStep(name) {
  cy.contains(name)
}

export function verifyOwnerNameInSummaryStep(name) {
  cy.contains(name)
}

export function verifyOwnerAddressInSummaryStep(address) {
  cy.contains(address)
}

export function verifyThresholdStringInSummaryStep(startThreshold, endThreshold) {
  cy.contains(`${startThreshold} out of ${endThreshold}`)
}

export function verifyNetworkInSummaryStep(network) {
  cy.get('div').contains('Name').parent().parent().contains(network)
}

export function verifyEstimatedFeeInSummaryStep() {
  cy.get('b')
    .contains('ETH')
    .parent()
    .should(($element) => {
      const text = 'a' + $element.text()
      const pattern = /\d/
      expect(/\d/.test(text)).to.equal(true)
    })
}

function getOwnerNameInput(index) {
  return `input[name="owners.${index}.name"]`
}

function getOwnerAddressInput(index) {
  return `input[name="owners.${index}.address"]`
}
