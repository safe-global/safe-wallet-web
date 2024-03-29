import CreateCall141 from '../assets/v1.4.1/create_call.json';
import MultiSend111 from '../assets/v1.1.1/multi_send.json';
import MultiSend141 from '../assets/v1.4.1/multi_send.json';
import MultiSendCallOnly141 from '../assets/v1.4.1/multi_send_call_only.json';
import SignMessageLib141 from '../assets/v1.4.1/sign_message_lib.json';
import {
  getMultiSendDeployment,
  getMultiSendCallOnlyDeployment,
  getCreateCallDeployment,
  getSignMessageLibDeployment,
} from '../libs';

describe('libs.ts', () => {
  describe('getMultiSendDeployment', () => {
    it('should find the preferred deployment first', () => {
      const result = getMultiSendDeployment();
      expect(result).toBe(MultiSend141);
      expect(result).not.toBe(MultiSend111);
    });
  });
  describe('getMultiSendCallOnlyDeployment', () => {
    it('should find the preferred deployment first', () => {
      const result = getMultiSendCallOnlyDeployment();
      expect(result).toBe(MultiSendCallOnly141);
    });
  });
  describe('getCreateCallDeployment', () => {
    it('should find the preferred deployment first', () => {
      const result = getCreateCallDeployment();
      expect(result).toBe(CreateCall141);
    });
  });
  describe('getSignMessageLibDeployment', () => {
    it('should find the preferred deployment first', () => {
      const result = getSignMessageLibDeployment();
      expect(result).toBe(SignMessageLib141);
    });
  });
});
