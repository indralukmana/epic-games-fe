export const CONTRACT_ADDRESS = '0x050808338090Ff4afD5b2D1fEdc7bf97540DF111';

export const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
    characterType: characterData.characterType,
  };
};
