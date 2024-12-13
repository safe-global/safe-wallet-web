import ProxyFactory130 from '../assets/v1.3.0/proxy_factory.json';
import ProxyFactory141 from '../assets/v1.4.1/safe_proxy_factory.json';
import { getProxyFactoryDeployment } from '../factories';

describe('factories.ts', () => {
  describe('getProxyFactoryDeployment', () => {
    it('should find the latest deployment first', () => {
      const result = getProxyFactoryDeployment();
      expect(result).toBe(ProxyFactory141);
      expect(result).not.toBe(ProxyFactory130);
    });
  });
});
