import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as nfts from '../pages/nfts.pages'

const nftsName = 'CatFactory'
const nftsAddress = '0x373B...866c'
const nftsTokenID = 'CF'

describe('NFTs tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.balanceNftsUrl + constants.SEPOLIA_TEST_SAFE_5)
    main.acceptCookies()
    nfts.waitForNftItems(2)
  })

  // TODO: Add Sign action
  it('Verify multipls NFTs can be selected and reviewed', () => {
    nfts.verifyInitialNFTData()
    nfts.selectNFTs(3)
    nfts.deselectNFTs([2], 3)
    nfts.sendNFT()
    nfts.verifyNFTModalData()
    nfts.typeRecipientAddress(constants.SEPOLIA_TEST_SAFE_4)
    nfts.clikOnNextBtn()
    nfts.verifyReviewModalData(2)
  })
})
