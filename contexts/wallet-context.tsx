'use client';

import { FC, ReactNode, useMemo, createContext, useContext, useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Adapter } from '@solana/wallet-adapter-base';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface WalletContextState {
  connected: boolean;
  connecting: boolean;
  publicKey: string | null;
  balance: number | null;
  balanceLoading: boolean;
  walletName: string | null;
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const WalletStateContext = createContext<WalletContextState>({
  connected: false,
  connecting: false,
  publicKey: null,
  balance: null,
  balanceLoading: false,
  walletName: null,
  disconnect: async () => {},
  refreshBalance: async () => {},
});

export const useWalletState = () => useContext(WalletStateContext);

function WalletStateProvider({ children }: { children: ReactNode }) {
  const { connected, connecting, publicKey, disconnect, wallet } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const refreshBalance = async () => {
    if (!publicKey || !connection) {
      setBalance(null);
      return;
    }

    try {
      setBalanceLoading(true);
      const bal = await connection.getBalance(publicKey);
      setBalance(bal / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      refreshBalance();
      const interval = setInterval(refreshBalance, 30000);
      return () => clearInterval(interval);
    } else {
      setBalance(null);
    }
  }, [connected, publicKey, connection]);

  const value: WalletContextState = {
    connected,
    connecting,
    publicKey: publicKey?.toBase58() || null,
    balance,
    balanceLoading,
    walletName: wallet?.adapter.name || null,
    disconnect,
    refreshBalance,
  };

  return (
    <WalletStateContext.Provider value={value}>
      {children}
    </WalletStateContext.Provider>
  );
}

interface WalletContextProviderProps {
  children: ReactNode;
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  const endpoint = useMemo(() => 'https://api.devnet.xandeum.com:8899', []);
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletStateProvider>
          {children}
        </WalletStateProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
