import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as createwallet from '../pages/create_wallet.pages'
import * as owner from '../pages/owners.pages'
import * as ls from '../../support/localstorage_data.js'
import * as safe from '../pages/load_safe.pages'

const ownerSepolia = ['Automation owner Sepolia']
const ownerName = 'Owner name'
const owner1 = 'Owner1'

describe('Safe creation tests 2', () => {
  beforeEach(() => {
    cy.visit(constants.welcomeUrl + '?chain=sep')
    cy.clearLocalStorage()
    main.acceptCookies()
  })

  it('Cancel button cancels safe creation', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnCreateNewSafeBtn()
    safe.clickOnNextBtn()
    createwallet.clickOnBackBtn()
    createwallet.cancelWalletCreation()
  })

  // Owners and confirmation step
  it('Verify Next button is disabled when address is empty', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnCreateNewSafeBtn()
    safe.clickOnNextBtn()
    safe.clearOwnerAddress(0)
    createwallet.verifyNextBtnIsDisabled()
  })

  it('Verify owner names are autocompleted if they are present in the Address book ', () => {
    owner.waitForConnectionStatus()
    main
      .addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.sameOwnerName)
      .then(() => {
        cy.visit(constants.welcomeUrl + '?chain=sep')
        createwallet.clickOnContinueWithWalletBtn()
        createwallet.clickOnCreateNewSafeBtn()
        safe.clickOnNextBtn()
        safe.verifyOwnerNamesInConfirmationStep(ownerSepolia)
      })
  })

  it("Verify names don't autofill if they are added to another chain's Address book", () => {
    owner.waitForConnectionStatus()
    main
      .addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.sameOwnerName[1])
      .then(() => {
        cy.visit(constants.welcomeUrl + '?chain=sep')
        createwallet.clickOnContinueWithWalletBtn()
        createwallet.clickOnCreateNewSafeBtn()
        safe.clickOnNextBtn()
        safe.verifyDataDoesNotExist(ownerSepolia)
      })
  })

  it('Verify an valid name for owner can be inputed', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnCreateNewSafeBtn()
    safe.clickOnNextBtn()
    safe.inputOwnerName(0, ownerName)
    safe.verifyownerNameFormatIsValid()
  })

  it('Verify Threshold matching required confirmations max with amount of owners', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnCreateNewSafeBtn()
    safe.clickOnNextBtn()
    safe.clickOnAddNewOwnerBtn()
    owner.verifyThreshold(1, 2)
  })

  it('Verify deleting owner rows updates the currenlty set policies value', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnCreateNewSafeBtn()
    safe.clickOnNextBtn()
    safe.clickOnAddNewOwnerBtn()
    owner.verifyThreshold(1, 2)
    safe.clickOnRemoveOwnerBtn(0)
    owner.verifyThreshold(1, 1)
  })

  it('Verify ENS name in the address and name fields is resolved', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnCreateNewSafeBtn()
    safe.clickOnNextBtn()
    safe.inputOwnerAddress(0, constants.ENS_TEST_SEPOLIA_VALID)
    safe.verifyOwnerAddress(0, constants.DEFAULT_OWNER_ADDRESS)
    safe.verifyOnwerNameENS(0, constants.ENS_TEST_SEPOLIA_VALID)
  })

  it('Verify deleting owner rows is possible', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnCreateNewSafeBtn()
    safe.clickOnNextBtn()
    safe.clickOnAddNewOwnerBtn()
    safe.verifyNumberOfOwners(2)
    safe.clickOnRemoveOwnerBtn(0)
    safe.verifyNumberOfOwners(1)
  })

  it('Verify existing owner in address book will have their names filled when their address is pasted', () => {
    main
      .addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.sepoliaAddress1)
      .then(() => {
        owner.waitForConnectionStatus()
        cy.visit(constants.welcomeUrl + '?chain=sep')
        createwallet.clickOnContinueWithWalletBtn()
        createwallet.clickOnCreateNewSafeBtn()
        safe.clickOnNextBtn()
        safe.inputOwnerAddress(0, constants.RECIPIENT_ADDRESS)
        safe.verifyOnwerName(0, owner1)
      })
  })
})
