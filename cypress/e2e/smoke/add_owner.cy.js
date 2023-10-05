import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as owner from '../pages/owners.pages'
import * as addressBook from '../pages/address_book.page'

// TODO: Need to add tests to testRail
describe('Adding an owner', () => {
  beforeEach(() => {
    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_1)
    cy.clearLocalStorage()
    main.acceptCookies()
    cy.contains(owner.safeAccountNonceStr, { timeout: 10000 })
  })

  describe('Add new owner tests', () => {
    it('Verify the presence of "Add Owner" button', () => {
      owner.verifyAddOwnerBtnIsEnabled()
    })

    it('Verify “Add new owner” button tooltip displays correct message for Non-Owner', () => {
      cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_2)
      owner.hoverOverAddOwnerBtn()
      owner.verifyTooltiptext(owner.nonOwnerErrorMsg)
    })

    it('Verify Tooltip displays correct message for disconnected user', () => {
      owner.waitForConnectionStatus()
      owner.clickOnWalletExpandMoreIcon()
      owner.clickOnDisconnectBtn()
      owner.hoverOverAddOwnerBtn()
      owner.verifyTooltiptext(owner.disconnectedUserErrorMsg)
    })
    it('Verify the Add New Owner Form can be opened', () => {
      owner.waitForConnectionStatus()
      owner.openAddOwnerWindow()
    })

    it('Verify error message displayed if character limit is exceeded in Name input', () => {
      owner.waitForConnectionStatus()
      owner.openAddOwnerWindow()
      owner.typeOwnerName(main.generateRandomString(51))
      owner.verifyErrorMsgInvalidAddress(constants.addressBookErrrMsg.exceedChars)
    })

    it('Verify that the "Name" field is auto-filled with the relevant name from Address Book', () => {
      cy.visit(constants.addressBookUrl + constants.SEPOLIA_TEST_SAFE_1)
      addressBook.clickOnCreateEntryBtn()
      addressBook.typeInName(constants.addresBookContacts.user1.name)
      addressBook.typeInAddress(constants.addresBookContacts.user1.address)
      addressBook.clickOnSaveEntryBtn()
      addressBook.verifyNewEntryAdded(
        constants.addresBookContacts.user1.name,
        constants.addresBookContacts.user1.address,
      )
      cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_1)
      owner.waitForConnectionStatus()
      owner.openAddOwnerWindow()
      owner.typeOwnerAddress(constants.addresBookContacts.user1.address)
      owner.selectNewOwner(constants.addresBookContacts.user1.name)
      owner.verifyNewOwnerName(constants.addresBookContacts.user1.name)
    })

    it('Verify that Name field not mandatory', () => {
      owner.waitForConnectionStatus()
      owner.openAddOwnerWindow()
      owner.typeOwnerAddress(constants.SEPOLIA_OWNER_2)
      owner.clickOnNextBtn()
      owner.verifyConfirmTransactionWindowDisplayed()
    })

    it('Verify relevant error messages are displayed in Address input ', () => {
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

    it('Verify default threshold value. Verify correct threshold calculation', () => {
      owner.waitForConnectionStatus()
      owner.openAddOwnerWindow()
      owner.typeOwnerAddress(constants.DEFAULT_OWNER_ADDRESS)
      owner.verifyThreshold(1, 2)
    })

    it('Verify valid Address validation', () => {
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
})
