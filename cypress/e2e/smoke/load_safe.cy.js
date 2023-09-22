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

describe('Load existing Safe', () => {
  before(() => {
    cy.clearLocalStorage()
    cy.visit(constants.welcomeUrl)
    main.acceptCookies()
    safe.openLoadSafeForm()
    cy.wait(2000)
  })

  it('should allow choosing the network where the Safe exists', () => {
    safe.clickNetworkSelector(constants.networks.goerli)
    safe.selectPolygon()
    cy.wait(2000)
    safe.clickNetworkSelector(constants.networks.polygon)
    safe.selectGoerli()
  })

  it('should accept name the Safe', () => {
    // alias the address input label
    cy.get('input[name="address"]').parent().prev('label').as('addressLabel')

    safe.verifyNameInputHasPlceholder(testSafeName)
    safe.inputName(testSafeName)
    safe.verifyIncorrectAddressErrorMessage()
    safe.inputAddress(constants.GOERLI_TEST_SAFE)

    // Type an invalid address
    // cy.get('input[name="address"]').clear().type(EOA_ADDRESS)
    // cy.get('@addressLabel').contains(INVALID_ADDRESS_ERROR_MSG)

    // Type a ENS name
    // TODO: register a goerli ENS name for the test Safe
    // cy.get('input[name="address"]').clear().type(SAFE_ENS_NAME)
    // giving time to the ENS name to be translated
    // cy.get('input[name="address"]', { timeout: 10000 }).should('have.value', `rin:${SAFE_ENS_NAME_TRANSLATED}`)

    // Uploading a QR code
    // TODO: fix this
    // cy.findByTestId('QrCodeIcon').click()
    // cy.contains('Upload an image').click()
    // cy.get('[type="file"]').attachFile('../fixtures/goerli_safe_QR.png')

    safe.verifyAddressInputValue()
    safe.clickOnNextBtn()
  })

  // TODO: register the goerli ENS for the Safe owner when possible
  it.skip('should resolve ENS names for Safe owners', () => {
    // Finds ENS name as one of the owners (give some time to the resolver)
    cy.findByPlaceholderText(OWNER_ENS_DEFAULT_NAME, { timeout: 20000 })
      .parents('.MuiGrid-container')
      // Name is matched by the correct address
      .contains(OWNER_ADDRESS)
  })

  it('should set custom name in the first owner', () => {
    createwallet.typeOwnerName(testOwnerName, 0)
    safe.clickOnNextBtn()
  })

  it('should have Safe and owner names in the Review step', () => {
    safe.verifyDataInReviewSection(testSafeName, testOwnerName)
    safe.clickOnAddBtn()
  })

  it('should load successfully the custom Safe name', () => {
    main.verifyHomeSafeUrl(constants.GOERLI_TEST_SAFE)
    safe.veriySidebarSafeNameIsVisible(testSafeName)
    safe.verifyOwnerNamePresentInSettings(testOwnerName)
  })
})
