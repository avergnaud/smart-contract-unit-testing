pragma solidity ^0.4.0;

/* PAS SECURE */
contract SimpleBalanceContract {

    event DepositEvent();
    /* l'acheteur dépose les fonds */
    function deposit() payable {
        // this.balance = msg.value;
        DepositEvent();
    }

    function getBalance() constant returns(uint256) {
        return this.balance;
    }

    event PayEvent();
    /* transfert au vendeur */
    function payVendeur(address vendeur) {
        vendeur.transfer(this.balance);
        PayEvent();
    }
}