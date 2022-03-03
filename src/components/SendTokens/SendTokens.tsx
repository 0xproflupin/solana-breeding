import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletError, WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { Keypair, SystemProgram, Transaction, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import React, { useCallback, FC, useState, useEffect } from 'react';
import './SendTokens.css';
import { addInstruction } from './MakeTransaction';
import { Button } from '@mui/material';
import {
  resolveToWalletAddress,
  getParsedNftAccountsByOwner,
} from "@nfteyez/sol-rayz";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { encodeURL, createQR, createTransaction } from '@solana/pay';
import BigNumber from 'bignumber.js';


export const SendTokens: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [checkNumber, setNumber] = useState(0);
    const [finalList, setfinalList] = useState([] as any);
    const burnPubkey = new PublicKey("4xRGFpvEfPF7NBZjZjAh8NMKtXkwNHBwvh3i2oWyNxdG");
    const API_URL = 'https://api.jsonbin.io/v3/b';
    const API_KEY = '$2b$10$vnig2X4ris7excSMWp.i3OZ1uF4lzVHhsvUMMxMCdKqAPy7ZNJFVK';
    const COLLECTION_ID = '6220050406182767436bc797';
    


    const getTokens = useCallback(async () => {
      if (!publicKey) {
        throw new WalletNotConnectedError();
      }

      const publickey = publicKey.toString();
      console.log(publickey);
      const nftArray = await getParsedNftAccountsByOwner({
        publicAddress: publickey,
        connection: connection
      });

      for(let i = 0; i < nftArray.length; i++ ) {
        try {
          if (nftArray[i].data.symbol === 'HSTYKE' && nftArray[i].data.creators[1].address === '9MTwA8aj42BJtN1X4vEEE8dETRFvpqNkkdXYLtSf95af' && nftArray[i].data.creators[1].verified === 1) {
            finalList.push({
                'mint': nftArray[i].mint,
                'wallet': publickey
            });
          } 
        } catch (error) {
          console.error(error);
        }
      }
      console.log(finalList.length);
      if (finalList.length < 3) {
        console.log('NOT OK')
      }
      setfinalList(finalList);
    }, [connection, publicKey]);

    useEffect(() => {
        getTokens();
        console.log('NFTs Extracted');
    }, [publicKey, connection]);

    const sentTokens = useCallback(async () => {
        // Create the transaction
        var transaction = new Transaction();
        if (!publicKey) {
          throw new WalletNotConnectedError();
        }
        for(let i = 0 ; i < 3 ; i++ ){
            transaction = await addInstruction(
                transaction,
                connection,
                publicKey, // public key
                burnPubkey, // recipient public key
                new BigNumber(1), // probably 1 here
                new PublicKey(finalList[i].mint)
            )
        }
        const signature = await sendTransaction(transaction, connection);
        console.log(`Signature: ${signature}`);
        const response = await fetch(API_URL, {method: 'POST', headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY,
          'X-Collection-Id': COLLECTION_ID
        }, body: JSON.stringify(finalList.slice(0, 3))});
        const data = await response.json();
        console.log(data);
        await connection.confirmTransaction(signature, 'processed');

        setNumber(finalList.length);

    }, [finalList, publicKey]);

    return (
        <Button className="sendTokenButton" onClick={sentTokens} variant= "contained" color="primary" >3cc sold out</Button>
    );
};
