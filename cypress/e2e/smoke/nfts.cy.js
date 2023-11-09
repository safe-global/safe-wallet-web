import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as nfts from '../pages/nfts.pages'

const nftsName = 'CatFactory'
const nftsAddress = '0x373B...866c'
const nftsTokenID = 'CF'

describe('NFTs tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.BALANCE_URL + constants.SEPOLIA_TEST_SAFE_5)
    main.acceptCookies(2)
    nfts.clickOnNftsTab()
  })

  it('Verify that NFTs exist in the table ', () => {
    nfts.verifyNFTNumber(20)
  })

  it('Verify NFT row contains data ', () => {
    nfts.verifyDataInTable(nftsName, nftsAddress, nftsTokenID)
  })

  it('Verify NFT preview window can be opened ', () => {
    nfts.openNFT(1)
    nfts.verifyNameInNFTModal(nftsTokenID)
    nfts.verifySelectedNetwrokSepolia()
    nfts.closeNFTModal()
  })

  it('Verify NFT open does not open if no NFT exits ', () => {
    nfts.clickOn6thNFT()
    nfts.verifyNFTModalDoesNotExist()
  })

  it('Verify multipls NFTs can be selected and reviewed ', () => {
    nfts.verifyInitialNFTData()
    nfts.selectNFTs(3)
    nfts.deselectNFTs([2], 3)
    nfts.sendNFT(2)
    nfts.verifyNFTModalData()
    nfts.typeRecipientAddress(constants.SEPOLIA_TEST_SAFE_4)
    nfts.clikOnNextBtn()
    nfts.verifyReviewModalData(2)
  })
})
