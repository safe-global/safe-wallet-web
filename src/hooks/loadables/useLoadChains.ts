import { useEffect } from 'react';
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk';
import useAsync, { type AsyncResult } from '../useAsync';
import { logError, Errors } from '@/services/exceptions';
import { bitlayerConfig } from '@/bitlayer/bitlayerConfig';

const getConfigs = async (): Promise<ChainInfo[]> => {
  const data = {
    "count": 1,
    "next": 1,
    "previous": 1,
    "results": [
      bitlayerConfig
    ]
  };
  return data.results || [];
};

export const useLoadChains = (): AsyncResult<ChainInfo[]> => {
  const [data, error, loading] = useAsync<ChainInfo[]>(getConfigs, []);

  // Log errors
  useEffect(() => {
    if (error) {
      logError(Errors._620, error.message);
    }
  }, [error]);

  return [data, error, loading];
};

export default useLoadChains;
