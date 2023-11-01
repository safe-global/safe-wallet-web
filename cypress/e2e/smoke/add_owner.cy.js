import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as owner from '../pages/owners.pages'
import * as addressBook from '../pages/address_book.page'

describe('Add Owners tests', () => {
  beforeEach(() => {
    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_1)
    cy.clearLocalStorage()
    main.acceptCookies(1)
    cy.contains(owner.safeAccountNonceStr, { timeout: 10000 })
  })

  it('Verify the presence of "Add Owner" button [C56017]', () => {
    owner.verifyAddOwnerBtnIsEnabled()
  })

  it('Verify “Add new owner” button tooltip displays correct message for Non-Owner [C56018]', () => {
    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_2)
    owner.verifyAddOwnerBtnIsDisabled()
  })

  it('Verify Tooltip displays correct message for disconnected user [C56019]', () => {
    owner.waitForConnectionStatus()
    owner.clickOnWalletExpandMoreIcon()
    owner.clickOnDisconnectBtn()
    owner.verifyAddOwnerBtnIsDisabled()
  })

  it('Verify the Add New Owner Form can be opened [C56020]', () => {
    owner.waitForConnectionStatus()
    owner.openAddOwnerWindow()
  })

  it('Verify error message displayed if character limit is exceeded in Name input [C56022]', () => {
    owner.waitForConnectionStatus()
    owner.openAddOwnerWindow()
    owner.typeOwnerName(main.generateRandomString(51))
    owner.verifyErrorMsgInvalidAddress(constants.addressBookErrrMsg.exceedChars)
  })

  it('Verify that the "Name" field is auto-filled with the relevant name from Address Book [C56023]', () => {
    cy.visit(constants.addressBookUrl + constants.SEPOLIA_TEST_SAFE_1)
    addressBook.clickOnCreateEntryBtn()
    addressBook.typeInName(constants.addresBookContacts.user1.name)
    addressBook.typeInAddress(constants.addresBookContacts.user1.address)
    addressBook.clickOnSaveEntryBtn()
    addressBook.verifyNewEntryAdded(constants.addresBookContacts.user1.name, constants.addresBookContacts.user1.address)
    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_1)
    owner.waitForConnectionStatus()
    owner.openAddOwnerWindow()
    owner.typeOwnerAddress(constants.addresBookContacts.user1.address)
    owner.selectNewOwner(constants.addresBookContacts.user1.name)
    owner.verifyNewOwnerName(constants.addresBookContacts.user1.name)
  })

  it('Verify that Name field not mandatory [C56024]', () => {
    owner.waitForConnectionStatus()
    owner.openAddOwnerWindow()
    owner.typeOwnerAddress(constants.SEPOLIA_OWNER_2)
    owner.clickOnNextBtn()
    owner.verifyConfirmTransactionWindowDisplayed()
  })

  it('Verify relevant error messages are displayed in Address input [C56025]', () => {
    owner.waitForConnectionStatus()
    owner.openAddOwnerWindow()
    owner.typeOwnerAddress(main.generateRandomString(10))
    owner.verifyErrorMsgInvalidAddress(constants.addressBookErrrMsg.invalidFormat)

    owner.typeOwnerAddress(constants.addresBookContacts.user1.address.toUpperCase())
    owner.verifyErrorMsgInvalidAddress(constants.addressBookErrrMsg.invalidChecksum)

    owner.typeOwnerAddress(constants.SEPOLIA_TEST_SAFE_1)
    owner.verifyErrorMsgInvalidAddress(constants.addressBookErrrMsg.ownSafe)

    owner.typeOwnerAddress(constants.addresBookContacts.user1.address.replace('F', 'f'))
    owner.verifyErrorMsgInvalidAddress(constants.addressBookErrrMsg.invalidChecksum)

    owner.typeOwnerAddress(constants.DEFAULT_OWNER_ADDRESS)
    owner.verifyErrorMsgInvalidAddress(constants.addressBookErrrMsg.alreadyAdded)
  })

  it('Verify default threshold value. Verify correct threshold calculation [C56028]', () => {
    owner.waitForConnectionStatus()
    owner.openAddOwnerWindow()
    owner.typeOwnerAddress(constants.DEFAULT_OWNER_ADDRESS)
    owner.verifyThreshold(1, 2)
  })

  it('Verify valid Address validation [C56027]', () => {
    owner.waitForConnectionStatus()
    owner.openAddOwnerWindow()
    owner.typeOwnerAddress(constants.SEPOLIA_OWNER_2)
    owner.clickOnNextBtn()
    owner.verifyConfirmTransactionWindowDisplayed()
    cy.reload()
    owner.waitForConnectionStatus()
    owner.openAddOwnerWindow()
    owner.typeOwnerAddress(constants.SEPOLIA_TEST_SAFE_2)
    owner.clickOnNextBtn()
    owner.verifyConfirmTransactionWindowDisplayed()
  })
})
