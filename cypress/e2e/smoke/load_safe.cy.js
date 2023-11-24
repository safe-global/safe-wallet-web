import 'cypress-file-upload'
import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as safe from '../pages/load_safe.pages'
import * as createwallet from '../pages/create_wallet.pages'

const testSafeName = 'Test safe name'
const testOwnerName = 'Test Owner Name'
// TODO
const SAFE_ENS_NAME = 'test20.eth'
const SAFE_ENS_NAME_TRANSLATED = constants.EOA

const EOA_ADDRESS = constants.EOA

const INVALID_ADDRESS_ERROR_MSG = 'Address given is not a valid Safe address'

// TODO
const OWNER_ENS_DEFAULT_NAME = 'test20.eth'
const OWNER_ADDRESS = constants.EOA

describe('[SMOKE] Load Safe tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.loadNewSafeSepoliaUrl)
    main.acceptCookies()
    cy.wait(2000)
  })

  it('Verify a network can be selected in the Safe', () => {
    safe.clickNetworkSelector(constants.networks.sepolia)
    safe.selectPolygon()
    cy.wait(2000)
    safe.clickNetworkSelector(constants.networks.polygon)
    safe.selectSepolia()
  })

  it('Verify only valid Safe name can be accepted', () => {
    // alias the address input label
    cy.get('input[name="address"]').parent().prev('label').as('addressLabel')

    createwallet.verifyDefaultWalletName(createwallet.defaltSepoliaPlaceholder)
    safe.verifyIncorrectAddressErrorMessage()
    safe.inputNameAndAddress(testSafeName, constants.SEPOLIA_TEST_SAFE_1)

    safe.verifyAddressInputValue(constants.SEPOLIA_TEST_SAFE_1)
    safe.verifyNextButtonStatus('be.enabled')
    safe.clickOnNextBtn()
  })

  it('Verify names cannot have more than 50 characters', () => {
    safe.inputName(main.generateRandomString(51))
    safe.verifyNameLengthErrorMessage()
  })

  it('Verify ENS name is translated to a valid address', () => {
    cy.visit(constants.loadNewSafeEthUrl)
    safe.inputAddress(constants.ENS_TEST_ETH)
    safe.verifyAddressInputValue(constants.ETH_ENS_SAFE_ADDRESS_1)
    safe.verifyNextButtonStatus('be.enabled')
    safe.clickOnNextBtn()
  })

  it('Verify a valid QR code is accepted', () => {
    safe.scanQRCode(constants.VALID_QR_CODE_PATH)
    safe.verifyAddressInputValue(constants.SEPOLIA_TEST_SAFE_6)
    safe.verifyNextButtonStatus('be.enabled')
    safe.clickOnNextBtn()
  })

  it.only('Verify a non QR code is not accepted', () => {
    safe.scanQRCode(constants.INVALID_QR_CODE_PATH)
    safe.verifyQRErrorMsgDisplayed()
  })

  it('Verify custom name in the first owner an be set', () => {
    safe.inputNameAndAddress(testSafeName, constants.SEPOLIA_TEST_SAFE_1)
    safe.clickOnNextBtn()
    createwallet.typeOwnerName(testOwnerName, 0)
    safe.clickOnNextBtn()
  })

  it('Verify Safe and owner names are displayed in the Review step', () => {
    safe.inputNameAndAddress(testSafeName, constants.SEPOLIA_TEST_SAFE_1)
    safe.clickOnNextBtn()
    createwallet.typeOwnerName(testOwnerName, 0)
    safe.clickOnNextBtn()
    safe.verifyDataInReviewSection(testSafeName, testOwnerName)
    safe.clickOnAddBtn()
  })

  it('[SMOKE] Verify the custom Safe name is successfully loaded', () => {
    safe.inputNameAndAddress(testSafeName, constants.SEPOLIA_TEST_SAFE_2)
    safe.clickOnNextBtn()
    createwallet.typeOwnerName(testOwnerName, 0)
    safe.clickOnNextBtn()
    safe.verifyDataInReviewSection(testSafeName, testOwnerName)
    safe.clickOnAddBtn()
    main.verifyHomeSafeUrl(constants.SEPOLIA_TEST_SAFE_2)
    safe.veriySidebarSafeNameIsVisible(testSafeName)
    safe.verifyOwnerNamePresentInSettings(testOwnerName)
  })
})
