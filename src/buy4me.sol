pragma solidity ^0.4.0;

contract greeter {

    address public owner;
    address public vendeur;
    uint public montant;

    function greeter(address _vendeur) payable {
        owner = msg.sender;
        vendeur = _vendeur;
        montant = msg.value;
    }

    function() payable {
    }

    function getVendeur() constant returns (address) {
        return vendeur;
    }

    function getAcheteur() constant returns (address) {
        return owner;
    }

    function getMontant() constant returns (uint) {
        return montant;
    }

    function withdraw() {
        vendeur.transfer(montant);
    }

}
