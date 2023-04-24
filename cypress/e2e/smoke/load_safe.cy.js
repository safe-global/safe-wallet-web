import 'cypress-file-upload'

// TODO
const SAFE_ENS_NAME = 'test20.eth'
const SAFE_ENS_NAME_TRANSLATED = '0xE297437d6b53890cbf004e401F3acc67c8b39665'

const SAFE_QR_CODE_ADDRESS = 'gor:0x97d314157727D517A706B5D08507A1f9B44AaaE9'
const EOA_ADDRESS = '0xE297437d6b53890cbf004e401F3acc67c8b39665'

const INVALID_INPUT_ERROR_MSG = 'Invalid address format'
const INVALID_ADDRESS_ERROR_MSG = 'Address given is not a valid Safe address'

// TODO
const OWNER_ENS_DEFAULT_NAME = 'test20.eth'
const OWNER_ADDRESS = '0xE297437d6b53890cbf004e401F3acc67c8b39665'

describe('Load existing Safe', () => {
  before(() => {
    cy.visit('/welcome?chain=matic')
    cy.contains('Accept selection').click()

    // Enters Loading Safe form
    cy.contains('button', 'Add existing Account').click()
    cy.contains('Connect wallet & select network')
  })

  it('should allow choosing the network where the Safe exists', () => {
    // Click the network selector inside the Stepper content
    cy.get('[data-testid=load-safe-form]').contains('Polygon').click()

    // Selects Goerli
    cy.get('ul li')
      .contains(/^G(ö|oe)rli$/)
      .click()
    cy.contains('span', /^G(ö|oe)rli$/)
  })

  it('should accept name the Safe', () => {
    // alias the address input label
    cy.get('input[name="address"]').parent().prev('label').as('addressLabel')

    // Name input should have a placeholder ending in 'goerli-safe'
    cy.get('input[name="name"]')
      .should('have.attr', 'placeholder')
      .should('match', /g(ö|oe)rli-safe/)
    // Input a custom name
    cy.get('input[name="name"]').type('Test safe name').should('have.value', 'Test safe name')

    // Input incorrect Safe address
    cy.get('input[name="address"]').type('RandomText')
    cy.get('@addressLabel').contains(INVALID_INPUT_ERROR_MSG)

    cy.get('input[name="address"]').clear().type(SAFE_QR_CODE_ADDRESS)

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

    // The address field should be filled with the "bare" QR code's address
    const [, address] = SAFE_QR_CODE_ADDRESS.split(':')
    cy.get('input[name="address"]').should('have.value', address)

    cy.contains('Next').click()
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
    // Sets a custom name for the first owner
    cy.get('input[name="owners.0.name"]').type('Test Owner Name').should('have.value', 'Test Owner Name')
    cy.contains('Next').click()
  })

  it('should have Safe and owner names in the Review step', () => {
    // Finds Safe name
    cy.findByText('Test safe name').should('exist')
    // Finds custom owner name
    cy.findByText('Test Owner Name').should('exist')

    cy.contains('button', 'Add').click()
  })

  it('should load successfully the custom Safe name', () => {
    // Safe loaded
    cy.location('href', { timeout: 10000 }).should('include', `/home?safe=${SAFE_QR_CODE_ADDRESS}`)

    // Finds Safe name in the sidebar
    cy.get('aside').contains('Test safe name')

    // Safe name is present in Settings
    cy.get('aside ul').contains('Settings').click()
    cy.contains('Test Owner Name').should('exist')
  })
})
