//SDPX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
    address public cryptoDevTokenAddress;

    constructor(address _CryptoDevtoken) ERC20("CryptoDev LP Token", "CLDP") {
        require(
            _CryptoDevtoken != address(0),
            "Token address passed is a null address"
        );
        cryptoDevTokenAddress = _CryptoDevtoken;
    }

    //ETH reserve is equal to address(this).balance,it is equal to balance of the contract

    /**
     * returns the amount of Crypto Dev Tokens held by the contract
     * returns CD !!!!!!!!!!!!
     */

    function getReserve() public view returns (uint) {
        return ERC20(cryptoDevTokenAddress).balanceOf(address(this));
    }

    // MAIN LOGIC => x * y = constant
    // if cryptodevtokenreserve = 0 it means that it is the first time someone is adding
    // cryptodev tokens and eth to the contact. since it is the first time we dont have to maintain a ratio btw
    // the tokens since we dont have any liquidty
    //!!!!!!!!!!!!!!!!!!
    // if cryptodevtokenreserve !=0 it means that we have to make sure that when someone adds
    // the liquidty it does not impact the price which the market currently has.
    //to ensure this we have a ratio: cryptoDevTokenAmount = ETH sent by user / ETH reserve in contract
    //when user adds liquidity,we provide them LP that is proportional to the ETH supplied by the user

    //if there is no initial liquidty => amount of LP tokens that would be minted to user
    // is equal to ETH Balace of the contract

    // if there is initial liquidity => we have a formula for that
    // LP tokens to be sent to the user (liquidity) / total supply op LP = ETH sent by user / ETH resever in contract
    /**
     * adds liquidty to exchange
     */

    //_amount how many
    //cryptoDevTokenAmount how many CD will be given in return

    function addLiquidity(uint _amount) public payable returns (uint) {
        uint liquidity;
        uint ethBalance = address(this).balance;
        uint cryptoDevTokenReserve = getReserve();
        ERC20 cryptoDevToken = ERC20(cryptoDevTokenAddress);

        //If the reserve is empty intake any user supply
        //LIQUDITY LP BALANCE=>iceride CD=0 iken gondeirlen eth kadar lp olur
        //icerde CD!=0 iken proportional to eth oranında lp olur !!

        if (cryptoDevTokenReserve == 0) {
            //liquidity is equal to ethbalance because it is the first time uer is adding eth to contract
            cryptoDevToken.transferFrom(msg.sender, address(this), _amount);
            liquidity = ethBalance;
            _mint(msg.sender, liquidity);
        } else {
            //If the reserve is not empty,intake any user supplied value for ether
            //and determine according to the ratio how many crypto dev tokens need to be supplied
            uint ethReserve = ethBalance - msg.value;
            uint cryptoDevTokenAmount = (msg.value * cryptoDevTokenReserve) /
                (ethReserve);
            require(
                _amount >= cryptoDevTokenAmount,
                "Amount of tokens sent is les than the minimum tokens required"
            );
            cryptoDevToken.transferFrom(
                msg.sender,
                address(this),
                cryptoDevTokenAmount
            );
            liquidity = (totalSupply() * msg.value) / ethReserve;
            _mint(msg.sender, liquidity);
        }
        return liquidity;
    }

    /**
     *
     * @param _amount burdaki kullanıcıya gonderilecek ve yakılacak LP miktari
     * @return the amount eth/cryptodevtoken that would be returned to the user
     * in swap
     * KULLANICIYA GERİ GONDERİLECEK ETH YA DA CD İCİN BU FONKSİYON
     * ETHRESERVE BU CONTRACTAKİ BALANCE
     *
     */
    function removeLiquidity(uint _amount) public returns (uint, uint) {
        require(_amount > 0, "_amount should be greater than zero");
        uint ethReserve = address(this).balance;
        uint _totalSupply = totalSupply();

        // amount of eth is based on a ratio and
        // = eth sent back to user / current eth reserve = amount of LP tokens user want to withdraw / total LP supply

        uint ethAmount = ((ethReserve) * _amount) / _totalSupply;

        //amount of CD token that would sent back to user is:
        // CD sent back to user / CD reserve  = amount of LP tokens that user wants to withdraw / total supply of LP

        uint cryptoDevTokenAmount = (getReserve() * _amount) / _totalSupply;

        //burn the sent LP tokens from users wallet because they are already sent
        // to remove liquidity
        _burn(msg.sender, _amount);
        payable(msg.sender).transfer(ethAmount); // transfer ethamount of eth to users wallet from cntrct
        ERC20(cryptoDevTokenAddress).transfer(msg.sender, cryptoDevTokenAmount); // transfer CD amount of CD to user from contract
        return (ethAmount, cryptoDevTokenAmount);
    }

    /**
     * @dev returns the amount Eth/CD tokens that would be returned to the user in the swap
     * will return output amount(delta Y)
     */

    function getAmountOfTokens(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) public pure returns (uint256) {
        require(inputReserve > 0 && outputReserve > 0, "invalid reserves");
        //since we are charging with 1% fee
        uint256 inputAmountWithFee = inputAmount * 99;
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = inputReserve * 100 + inputAmountWithFee;
        return numerator / denominator;
    }

    /**
     * ETH TO CD
     */
    function ethToCryptoDevToken(uint _minTokens) public payable {
        uint256 tokenReserve = getReserve(); // output reserve
        uint256 tokensBought = getAmountOfTokens(
            msg.value,
            address(this).balance - msg.value, //for input reserve,we substracted msg.value bcs address(this).balance already contains msg.value
            tokenReserve
        );
        require(tokensBought >= _minTokens, "insufficient output amount");
        ERC20(cryptoDevTokenAddress).transfer(msg.sender, tokensBought);
    }

    /**
     * CD TO ETH
     */

    function cryptoDevTokenToEth(uint _tokensSold, uint _minEth) public {
        require(_tokensSold > 0, "Not enough CryptoDevToken");
        uint256 tokenReserve = getReserve();
        uint256 ethBought = getAmountOfTokens(
            _tokensSold,
            tokenReserve,
            address(this).balance
        );
        require(ethBought > _minEth, "insufficient output amount");
        ERC20(cryptoDevTokenAddress).transferFrom(
            msg.sender,
            address(this),
            _tokensSold
        ); //contracta CD gonderdi
        payable(msg.sender).transfer(ethBought); //contract ona eth gonderdi !!
    }
}
