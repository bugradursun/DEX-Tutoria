//getAmountOfTokenReceivedFromSwap and swapTokens functions
//swapTokens swaps certain amount of ETH/CD tokens with CD/ETH tokens
//if eth has been seelcted in UI:user has ETH and wants to transfer it with CD
//if eth isnt selected in UI:user has CD and wants to swap CD tokens with ETH

//getAmountOfTokenReceivedFromSwap is a fnc that calculates given a certain amount of ETH/CD tokens,how many ETH/CD tokens
//would be sent back to the user

import { Contract } from "ethers";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";

//getAmountOfTokenReceivedFromSwap:returns the number of eth/cd tokens that
//can be received when user swaps eth/cd tokens

//getAmountOfTokensReceivedFromSwap BU FONKSİYON ICERI COIN ATTIGIMIZDA
//DONUSUNDE NE ALACAGIMIZ CONTRACTAKİ GETAMOUNTOFTOKENS FNKSYN KULLANARAK
//HESAPLIYOR !!!!!!!!

export const getAmountOfTokensReceivedFromSwap = async (
  _swapAmountWei,
  provider,
  ethSelected,
  ethBalance,
  reservedCD
) => {
  const exchangeContract = new Contract(
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    provider
  );
  let amountOfTokens;
  //If 'eth' is selected=>our input is eth which means our input amount would
  //be _swapAmountwei and input reserve is ethBalance of the contract and output reserve is
  //CD token reserve

  if (ethSelected) {
    amountOfTokens = await exchangeContract.getAmountOfTokens(
      _swapAmountWei,
      ethBalance,
      reservedCD
    );
  } else {
    //that means our input value is CD so our input is _swapamountwei and input reserve is CD token reserve of
    //contract and output reserve is ethbalance,
    amountOfTokens = await exchangeContract.getAmountOfTokens(
      _swapAmountWei,
      reservedCD,
      ethBalance
    );
  }
  return amountOfTokens;
};

export const swapTokens = async (
  signer,
  swapAmountWei,
  tokenToBeReceivedAfterSwap,
  ethSelected
) => {
  const exchangeContract = new Contract(
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    signer
  );
  const tokenContract = new Contract(
    TOKEN_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI,
    signer
  );
  let tx;
  //if eth is selected call ethtocryptodevtoken fnc
  //if cd is selected call cryptodevtokentoeth fnc
  if (ethSelected) {
    tx = await exchangeContract.ethToCryptoDevToken(
      tokenToBeReceivedAfterSwap,
      {
        value: swapAmountWei,
      }
    );
  } else {
    //first, approve the erc20 swapamountwei
    tx = await tokenContract.approve(
      EXCHANGE_CONTRACT_ADDRESS,
      swapAmountWei.toString()
    );
    await tx.wait();
    tx = await exchangeContract.cryptoDevTokenToEth(
      swapAmountWei,
      tokenToBeReceivedAfterSwap
    );
  }
  await tx.wait();
};
