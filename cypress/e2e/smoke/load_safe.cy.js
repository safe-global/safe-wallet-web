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

describe('Load Safe tests', () => {
  before(() => {
    cy.clearLocalStorage()
    cy.visit(constants.welcomeUrl)
    main.acceptCookies()
    safe.openLoadSafeForm()
    cy.wait(2000)
  })

  it('Verify a network can be selected in the Safe [C56117]', () => {
    safe.clickNetworkSelector(constants.networks.goerli)
    safe.selectPolygon()
    cy.wait(2000)
    safe.clickNetworkSelector(constants.networks.polygon)
    safe.selectGoerli()
  })

  it('Verify only valid Safe name can be accepted [C56118]', () => {
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

  it('Verify custom name in the first owner an be set [C56120]', () => {
    createwallet.typeOwnerName(testOwnerName, 0)
    safe.clickOnNextBtn()
  })

  it('Verify Safe and owner names are displayed in the Review step [C56121]', () => {
    safe.verifyDataInReviewSection(testSafeName, testOwnerName)
    safe.clickOnAddBtn()
  })

  it('Verify the custom Safe name is successfully loaded [C56122]', () => {
    main.verifyHomeSafeUrl(constants.GOERLI_TEST_SAFE)
    safe.veriySidebarSafeNameIsVisible(testSafeName)
    safe.verifyOwnerNamePresentInSettings(testOwnerName)
  })
})
