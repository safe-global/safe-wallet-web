import 'cypress-file-upload'
import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as safe from '../pages/load_safe.pages'
import * as ls from '../../support/localstorage_data.js'
import * as owner from '../pages/owners.pages'

const ownerNames = ['Automation owner']
const ownerSepolia = ['Automation owner Sepolia']
const ownerEth = ['Automation owner Eth']

describe('Load Safe tests 2', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.loadNewSafeSepoliaUrl)
    main.acceptCookies()
    cy.wait(2000)
  })

  it('Verify names in address book are filled by default from address book', () => {
    main
      .addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.sameOwnerName)
      .then(() => {
        cy.reload()
        safe.inputAddress(constants.SEPOLIA_TEST_SAFE_20_LOAD_SAFE)
        safe.clickOnNextBtn()
        safe.verifyOwnerNames(ownerNames)
        safe.verifyOnwerInputIsNotEmpty(0)
      })
  })

  it('Verify Safe address checksum', () => {
    safe.verifyAddressCheckSum(constants.SEPOLIA_TEST_SAFE_20_LOAD_SAFE)
    safe.verifyAddressInputValue(constants.SEPOLIA_TEST_SAFE_20_LOAD_SAFE)
    safe.inputAddress(constants.SEPOLIA_TEST_SAFE_20_LOAD_SAFE.split(':')[1].toLowerCase())
    safe.verifyAddressInputValue(constants.SEPOLIA_TEST_SAFE_20_LOAD_SAFE)
  })

  it('Verify owner name cannot be longer than 50 characters', () => {
    safe.inputAddress(constants.SEPOLIA_TEST_SAFE_20_LOAD_SAFE)
    safe.clickOnNextBtn()
    safe.inputOwnerName(0, main.generateRandomString(51))
    owner.verifyErrorMsgInvalidAddress(constants.addressBookErrrMsg.exceedChars)
  })

  it('Verify names with primary ENS name are filled by default', () => {
    safe.inputAddress(constants.SEPOLIA_TEST_SAFE_20_LOAD_SAFE)
    safe.clickOnNextBtn()
    safe.verifyOnwerNameENS(1, constants.ENS_TEST_SEPOLIA_VALID)
  })

  it('Verify correct owner names are displayed for certain networks', () => {
    main
      .addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.sameOwnerName)
      .then(() => {
        cy.reload()
        safe.clickNetworkSelector(constants.networks.sepolia)
        safe.selectEth()
        safe.inputAddress(constants.SEPOLIA_TEST_SAFE_21_LOAD_SAFE)
        safe.clickOnNextBtn()
        safe.verifyOwnerNames(ownerEth)
        safe.clickOnBackBtn()
        safe.clickNetworkSelector(constants.networks.ethereum)
        safe.selectSepolia()
        safe.inputAddress(constants.SEPOLIA_TEST_SAFE_20_LOAD_SAFE)
        safe.clickOnNextBtn()
        safe.verifyOwnerNames(ownerSepolia)
      })
  })

  it('Verify random text is in the safe address input is not allowed', () => {
    safe.inputAddress(main.generateRandomString(10))
    owner.verifyErrorMsgInvalidAddress(constants.addressBookErrrMsg.invalidFormat)
  })

  it('Verify a valid address can be entered', () => {
    safe.inputAddress(constants.SEPOLIA_TEST_SAFE_20_LOAD_SAFE)
    safe.verifyAddresFormatIsValid()
  })

  it('Verify that safes already added to the watchlist cannot be added again', () => {
    main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__addedSafes, ls.addedSafes.set1).then(() => {
      cy.reload()
      safe.inputAddress(constants.SEPOLIA_TEST_SAFE_3)
      owner.verifyErrorMsgInvalidAddress(constants.addressBookErrrMsg.safeAlreadyAdded)
      safe.verifyNextButtonStatus(constants.enabledStates.disabled)
    })
  })

  it('Verify that the wrong prefix is not allowed', () => {
    safe.inputAddress(constants.SEPOLIA_TEST_SAFE_21_LOAD_SAFE)
    owner.verifyErrorMsgInvalidAddress(constants.addressBookErrrMsg.prefixMismatch)
    safe.verifyNextButtonStatus(constants.enabledStates.disabled)
  })
})
