import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as nfts from '../pages/nfts.pages'
import * as navigation from '../pages/navigation.page'

const singleNFT = ['safeTransferFrom']
const multipleNFT = ['multiSend']
const multipleNFTAction = 'safeTransferFrom'

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

  it('Verify that when 1 NFTs is selected, there is no Actions block in Review step', () => {
    nfts.verifyInitialNFTData()
    nfts.selectNFTs(1)
    nfts.sendNFT()
    nfts.typeRecipientAddress(constants.SEPOLIA_TEST_SAFE_4)
    nfts.clikOnNextBtn()
    nfts.verifyTxDetails(singleNFT)
    nfts.verifyCountOfActions(0)
  })

  it('Verify that when 2 NFTs are selected, actions and tx details are correct in Review step', () => {
    nfts.verifyInitialNFTData()
    nfts.selectNFTs(2)
    nfts.sendNFT()
    nfts.typeRecipientAddress(constants.SEPOLIA_TEST_SAFE_4)
    nfts.clikOnNextBtn()
    nfts.verifyTxDetails(multipleNFT)
    nfts.verifyCountOfActions(2)
    nfts.verifyActionName(0, multipleNFTAction)
    nfts.verifyActionName(1, multipleNFTAction)
  })

  it('Verify Send button is disabled for non-owner', () => {
    cy.visit(constants.balanceNftsUrl + constants.SEPOLIA_TEST_SAFE_19_NONOWNER_NFT)
    nfts.verifyInitialNFTData()
    nfts.selectNFTs(1)
    nfts.verifySendNFTBtnDisabled()
  })

  it('Verify Send button is disabled for disconnected wallet', () => {
    navigation.clickOnWalletExpandMoreIcon()
    navigation.clickOnDisconnectBtn()
    nfts.selectNFTs(1)
    nfts.verifySendNFTBtnDisabled()
  })
})
