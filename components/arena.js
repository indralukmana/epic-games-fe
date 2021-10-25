import React from 'react';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import { CONTRACT_ADDRESS, transformCharacterData } from '../utils/constants';
import myEpicGame from '../utils/MyEpicGame.json';

const Arena = ({ characterNFT, setCharacterNFT }) => {
  const [gameContract, setGameContract] = useState(null);

  const [boss, setBoss] = useState(null);

  // UseEffects
  useEffect(() => {
    /*
     * Setup async function that will get the boss from our contract and sets in state
     */
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBigBoss();
      console.log('Boss:', bossTxn);
      setBoss(transformCharacterData(bossTxn));
    };

    /*
     * Setup logic when this event is fired off
     */
    const onAttackComplete = (newBossHp, newPlayerHp) => {
      const bossHp = newBossHp.toNumber();
      const playerHp = newPlayerHp.toNumber();

      console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

      /*
       * Update both player and boss Hp
       */
      setBoss((prevState) => {
        return { ...prevState, hp: bossHp };
      });

      setCharacterNFT((prevState) => {
        return { ...prevState, hp: playerHp };
      });
    };

    if (gameContract) {
      fetchBoss();
      gameContract.on('AttackComplete', onAttackComplete);
    }

    if (gameContract) {
      /*
       * gameContract is ready to go! Let's fetch our boss
       */
      fetchBoss();
    }

    return () => {
      if (gameContract) {
        gameContract.off('AttackComplete', onAttackComplete);
      }
    };
  }, [gameContract]);

  // UseEffects
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

      setGameContract(gameContract);
    } else {
      console.log('Ethereum object not found');
    }
  }, []);

  const [attackState, setAttackState] = useState('');

  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState('attacking');
        console.log('Attacking boss...');
        const attackTxn = await gameContract.attackBoss();
        await attackTxn.wait();
        console.log('attackTxn:', attackTxn);
        setAttackState('hit');
      }
    } catch (error) {
      console.error('Error attacking boss:', error);
    } finally {
      setAttackState('');
    }
  };

  return (
    <div className='flex-1 flex flex-col justify-center items-center space-y-4'>
      {!!boss && (
        <div className=' card border border-white hover:bg-gray-700'>
          <figure className='max-w-xs'>
            <img src={boss.imageURI} />
          </figure>
          <div className='card-body'>
            <div className='flex space-x-2 items-center max-w-md'>
              <span className=''>
                HP: {boss.hp}/{boss.maxHp}
              </span>
              <progress
                className=' flex-1 progress progress-accent'
                value={boss.hp}
                max={boss.maxHp}
              />
            </div>
          </div>
        </div>
      )}

      {!!characterNFT && (
        <div className=' card border border-white hover:bg-gray-700'>
          <figure className='max-w-xs'>
            <img src={characterNFT.imageURI} />
          </figure>
          <div className='card-body space-y-2'>
            <div className='flex space-x-2 items-center max-w-md'>
              <span className=''>
                HP: {characterNFT.hp}/{characterNFT.maxHp}
              </span>
              <progress
                className=' flex-1 progress progress-accent'
                value={characterNFT.hp}
                max={characterNFT.maxHp}
              />
            </div>
            <button
              className={classNames('btn btn-primary', {
                loading: attackState === 'attacking',
              })}
              onClick={() => runAttackAction()}
            >
              Attack
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Arena;
