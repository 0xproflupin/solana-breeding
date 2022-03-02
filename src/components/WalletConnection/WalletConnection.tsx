import React from 'react';
import {
    ConnectionProvider,
    useAnchorWallet,
    useConnection,
    useWallet,
} from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';

const MyWallet: React.FC = () => {
    const { connection } = useConnection();
    let walletAddress = "";
    const endpoint = 'https://psytrbhymqlkfrhudd.dev.genesysgo.net:8899/';
    // if you use anchor, use the anchor hook instead
    // const wallet = useAnchorWallet();
    // const walletAddress = wallet?.publicKey.toString();

    const wallet = useWallet();
    if (wallet.connected && wallet.publicKey) {
        walletAddress = wallet.publicKey.toString()
    }

    return (
        <>
            <div className="multi-wrapper">
                <span className="button-wrapper">
                    <ConnectionProvider endpoint={endpoint}>
                        <WalletModalProvider>
                            <WalletMultiButton />
                        </WalletModalProvider>
                    </ConnectionProvider>
                </span>
                {wallet.connected && <WalletDisconnectButton />}
            </div>
        </>
    );
};

export default MyWallet;
