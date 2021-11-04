import React from 'react';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import { CONTRACT_ADDRESS, transformCharacterData } from '../utils/constants';
import myEpicGame from '../utils/MyEpicGame.json';

const CharacterSelector = ({ setCharacterNFT }) => {
  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);

  const [isMinting, setIsMinting] = useState(false);

  // UseEffect
  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      /*
       * This is the big difference. Set our gameContract in state.
       */
      setGameContract(gameContract);
    } else {
      console.log('Ethereum object not found');
    }
  }, []);

  useEffect(() => {
    const getCharacters = async () => {
      try {
        console.log('Getting contract characters to mint');

        /*
         * Call contract to get all mint-able characters
         */
        const charactersTxn = await gameContract.getAllDefaultCharacters();
        console.log('charactersTxn:', charactersTxn);

        /*
         * Go through all of our characters and transform the data
         */
        const characters = charactersTxn.map((characterData) =>
          transformCharacterData(characterData)
        );

        /*
         * Set all mint-able characters in state
         */
        setCharacters(characters);
      } catch (error) {
        console.error('Something went wrong fetching characters:', error);
      }
    };

    /*
     * Add a callback method that will fire when this event is received
     */
    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      console.log(
        `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
      );

      /*
       * Once our character NFT is minted we can fetch the metadata from our contract
       * and set it in state to move onto the Arena
       */
      if (gameContract) {
        const characterNFT = await gameContract.checkIfUserHasNFT();
        console.log('CharacterNFT: ', characterNFT);
        setCharacterNFT(transformCharacterData(characterNFT));
      }
    };

    /*
     * If our gameContract is ready, let's get characters!
     */
    if (gameContract) {
      getCharacters();

      gameContract.on('CharacterNFTMinted', onCharacterMint);
    }

    return () => {
      /*
       * When your component unmounts, let;s make sure to clean up this listener
       */
      if (gameContract) {
        gameContract.off('CharacterNFTMinted', onCharacterMint);
      }
    };
  }, [gameContract]);

  // Actions
  const mintCharacterNFTAction = async (characterId) => {
    try {
      setIsMinting(true);
      console.log({ gameContract });
      if (gameContract) {
        console.log('Minting character in progress...');
        const mintTxn = await gameContract.mintCharacterNFT(characterId);
        await mintTxn.wait();
        console.log('mintTxn:', mintTxn);
      }
    } catch (error) {
      console.warn('MintCharacterAction Error:', error);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className='space-y-4'>
      <h2 className='text-4xl font-bold'>Mint your character</h2>
      <ul className='list-disc text-left'>
        <li>minting will take sometime</li>
        <li>only one Pokemon allowed for one account</li>
        <li>
          you can check the Rinkeby Opensea collection for the character NFT
          after minting (your Pokemon will have the link to the NFT collection)
        </li>
      </ul>
      <div className='space-x-2 flex'>
        {characters.map((character, index) => {
          return (
            <div
              key={character.name}
              className='card  border border-white hover:bg-gray-700'
            >
              <figure className='max-w-md'>
                <img src={character.imageURI} />
              </figure>
              <div className='card-body'>
                <h2 className='card-title'>{character.name}</h2>
                <p>HP: {character.hp}</p>
                <p>Attack: {character.attackDamage}</p>
                <p>Type: {character.characterType}</p>
                <div className={classNames('card-actions flex justify-center')}>
                  <button
                    className={classNames('btn btn-primary', {
                      loading: isMinting,
                    })}
                    onClick={() => {
                      console.log('mint');
                      mintCharacterNFTAction(index);
                    }}
                  >
                    {isMinting ? 'Minting' : `Mint ${character.name}`}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CharacterSelector;
