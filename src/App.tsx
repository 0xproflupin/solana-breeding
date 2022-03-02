import React, { FC } from 'react';
require('@solana/wallet-adapter-react-ui/styles.css');

import './App.css';
import { NavAppBar } from './components/Navbar/Navbar';
import { Context } from './components/WalletConnection/WalletConnection';
import { SendTokens } from './components/SendTokens/SendTokens';
import twitterLogo from './assets/twitter-logo.svg';
import discordLogo from './assets/discord.png';
import BG from 'url:./assets/bg.png';

const HANDLE = ['https://twitter.com/0xprof_lupin', 'https://github.com/anvitmangal'];

export const App: FC = () => {
    return (
        <div className="top-wrapper">
            <img className="bg-image" src={BG} alt="" />
            <Context>
                <NavAppBar />
                <div className="inner-container">
                    <SendTokens />
                </div>
                </Context>
            
            <div className="footer">
                <a href="#">
                    <img src={twitterLogo} alt="" />
                </a>
                <a href="#">
                    <img src={discordLogo} alt="" />
                </a>
            </div>
        </div>
    );
};
