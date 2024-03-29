import SafeL2141 from '../assets/v1.4.1/safe_l2.json';
import Safe141 from '../assets/v1.4.1/safe.json';
import GnosisSafe130 from '../assets/v1.3.0/gnosis_safe.json';
import GnosisSafe120 from '../assets/v1.2.0/gnosis_safe.json';
import GnosisSafe111 from '../assets/v1.1.1/gnosis_safe.json';
import GnosisSafe100 from '../assets/v1.0.0/gnosis_safe.json';
import {
  getSafeSingletonDeployment,
  getSafeL2SingletonDeployment,
} from '../safes';

describe('safes.ts', () => {
  describe('getSafeSingletonDeployment', () => {
    it('should find the latest deployment first', () => {
      const result = getSafeSingletonDeployment();
      expect(result).toBe(Safe141);
      [GnosisSafe130, GnosisSafe120, GnosisSafe111, GnosisSafe100].forEach((version) => {
        expect(result).not.toBe(version);
      });
    });
  });
  describe('getSafeL2SingletonDeployment', () => {
    it('should find the latest deployment first', () => {
      const result = getSafeL2SingletonDeployment();
      expect(result).toBe(SafeL2141);
    });
  });
});
