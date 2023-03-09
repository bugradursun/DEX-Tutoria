// removeLiquidity fnc from the contract to remove amount of LP tokens specified by user
//gettokensafterremove calculates the amount of ether and cd tokens that would be sent back
//to the user after he removes certain amount of lp tokens from pool

//Ratio is -> (amount of Eth that would be sent back to the user / Eth reserve) = (LP tokens withdrawn) / (total supply of LP tokens
//Ratio is -> (amount of CD tokens sent back to the user / CD Token reserve) = (LP tokens withdrawn) / (total supply of LP tokens

import { Contract, providers, utils, BigNumber } from "ethers";
import { EXCHANGE_CONTRACT_ABI, EXCHANGE_CONTRACT_ADDRESS } from "../constants";

/**
 * removeLiquidity fnc removes the 'removeLPTokensWei' amount of LP tokens from
 * liquidity and also the caluclated amount of ether and CD tokens
 */

export const removeLiquidity = async (signer, removeLPTokensWei) => {
  const exchangeContract = new Contract(
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    signer
  );
  const tx = await exchangeContract.removeLiquidity(removeLPTokensWei);
  await tx.wait();
};

/**
 * getTokensAfterRemove:calculates the amount of ETH and CD tokens that
 * would be returned back to user after he removes removeLPTokenWEi amount of LP
 * from the contract
 */

export const getTokensAfterRemove = async (
  provider,
  removeLPTokenWei,
  _ethBalance,
  cryptoDevTokenReserve
) => {
  //removeLPTokenWei :LP tokens that will be withdrawn!!!
  try {
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      provider
    );
    const _totalSupply = await exchangeContract.totalsupply();
    const _removeEther = _ethBalance.mul(removeLPTokenWei).div(_totalSupply);
    const _removeCD = cryptoDevTokenReserve
      .mul(removeLPTokenWei)
      .div(_totalSupply);
    return { _removeEther, _removeCD };
  } catch (err) {
    console.error(err);
  }
};
