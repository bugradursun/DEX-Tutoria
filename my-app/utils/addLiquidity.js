//addLiquidity and calculateCD functions
//addLiquidity calls the addLiquidity fnc in the contract
//It also approves the CD Tokens because since it is ERC20 token
//it needs to be approved from users acc to withdraw

//calculateCD tells us how many CD can be added for a given amount of ETH
//ratio is amount of CD added/CD tokens balance = ETH added amount / ETH reserve in cntrct
//so amount of CD added = eth added * Cd token balance / eth reserve in contract

import { Contract, utils } from "ethers";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";

export const addLiquidity = async (
  signer,
  addCDAmountWei,
  addEtherAmountWei
) => {
  try {
    const tokenContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      signer
    );
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      signer
    );
    //since CD tokens are ERC20,we need to give contract alowance

    let tx = await tokenContract.approve(
      EXCHANGE_CONTRACT_ADDRESS,
      addCDAmountWei.toString()
    );
    await tx.wait();
    //after the approval add ether and cd tokens in liquidity
    tx = await exchangeContract.addLiquidity(addCDAmountWei, {
      value: addEtherAmountWei,
    });
    await tx.wait();
  } catch (err) {
    console.error(err);
  }
};

//calculateCD calculates the cd that need to be added to the liquidty given addetheramountwei of ether
export const calculateCD = async (
  _addEther = "0",
  etherBalanceContract,
  cdTokenReserve
) => {
  const _addEtherAmountWei = utils.parseEther(_addEther);
  const cryptoDevTokenAmount = _addEtherAmountWei
    .mul(cdTokenReserve)
    .div(etherBalanceContract);
  return cryptoDevTokenAmount;
};
