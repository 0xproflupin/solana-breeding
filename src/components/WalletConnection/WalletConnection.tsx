import React from 'react';
import {
    useAnchorWallet,
    useConnection,
} from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';

const MyWallet: React.FC = () => {
    const { connection } = useConnection();

    return (
        <>
            <div className="multi-wrapper">
                <span className="button-wrapper">
                    <WalletModalProvider>
                        <WalletMultiButton />
                    </WalletModalProvider>
                </span>
            </div>
        </>
    );
};

export default MyWallet;
