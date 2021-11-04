import classNames from 'classnames';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import { CONTRACT_ADDRESS, transformCharacterData } from '../utils/constants';
import myEpicGame from '../utils/MyEpicGame.json';
import CharacterSelector from '../components/character-selector';
import Arena from '../components/arena';

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState(null);

  const [isConnectingAccount, setIsConnectingAccount] = useState(false);

  const [characterNFT, setCharacterNFT] = useState(null);

  /*
   * Start by creating a new action that we will run on component load
   */
  // Actions
  const checkIfWalletIsConnected = async () => {
    try {
      setIsConnectingAccount(true);
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);

        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length !== 0) {
          setCurrentAccount(accounts[0]);
        } else {
          console.log('No authorized account found');
        }
      }
    } catch (error) {
      console.log({ error });
    } finally {
      setIsConnectingAccount(false);
    }
  };

  const connectWalletAction = async () => {
    try {
      setIsConnectingAccount(true);
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get metamask!');
      } else {
        const accounts = await ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (accounts.length !== 0) {
          setCurrentAccount(accounts[0]);
        } else {
          console.log('No authorized account found');
        }
      }
    } catch (error) {
      console.log({ error });
    } finally {
      setIsConnectingAccount(false);
    }
  };

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  /*
   * Add this useEffect right under the other useEffect where you are calling checkIfWalletIsConnected
   */
  useEffect(() => {
    /*
     * The function we will call that interacts with out smart contract
     */
    const fetchNFTMetadata = async () => {
      try {
        console.log('Checking for Character NFT on address:', currentAccount);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const gameContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicGame.abi,
          signer
        );

        console.log({ gameContract });

        const characterNFT = await gameContract.checkIfUserHasNFT();
        if (characterNFT.name) {
          console.log('User has character NFT');
          setCharacterNFT(transformCharacterData(characterNFT));
        } else {
          console.log('User has no character NFT');
        }
      } catch (error) {
        console.log({ error });
        alert('Please check that you are in Rinkeby test network');
      }
    };

    /*
     * We only want to run this, if we have a connected wallet
     */
    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  return (
    <>
      <Head>
        <title>Epic Pokemon NFT Battle</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='flex flex-col items-center justify-center min-h-screen py-2'>
        <main className='flex flex-col items-center justify-center w-full flex-1 px-20 text-center'>
          <h1 className='text-6xl font-bold'>Epic Pokemon NFT Battle</h1>

          <div className='container flex justify-center mt-5 p-3'>
            {!currentAccount && (
              <div className='space-y-5'>
                <p>⚠️Current this dApp only work in Rinkeby test network⚠️</p>
                <p>Please use metamask extension for playing</p>
                <button
                  className={classNames('btn btn-primary', {
                    loading: isConnectingAccount,
                  })}
                  onClick={() => connectWalletAction()}
                >
                  {isConnectingAccount
                    ? 'Connecting'
                    : !currentAccount
                    ? 'Connect Wallet'
                    : 'Connected'}
                </button>
              </div>
            )}

            {!!currentAccount && !characterNFT && (
              <CharacterSelector setCharacterNFT={setCharacterNFT} />
            )}

            {!!currentAccount && !!characterNFT && (
              <Arena
                characterNFT={characterNFT}
                setCharacterNFT={setCharacterNFT}
              />
            )}
          </div>
        </main>

        <footer className='flex items-center justify-center w-full h-24 border-t'>
          <p>Made by Indra </p>
        </footer>
      </div>
    </>
  );
}
