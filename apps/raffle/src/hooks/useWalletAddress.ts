import { useEffect, useState } from 'react';

import { useWallet } from './useWallet';

export const useWalletAddress = () => {
  const [address, setAddress] = useState<string>();
  const wallet = useWallet();

  useEffect(() => {
    const walletAddress = wallet.addresses?.ergo?.main || wallet.addresses?.bitcoin?.nativeSegWit;
    if (!wallet.connecting && walletAddress) {
      setAddress(walletAddress);
    }
  }, [wallet.addresses, wallet.connecting]);

  return address;
};
