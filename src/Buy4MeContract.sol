pragma solidity ^0.4.0;

//TODO KO + incomplet
contract Buy4MeContract {

  /* sender lors de la création du contrat, wallet applicatif : */
  address buy4me;
  /* vendeur : */
  address vendeur;
  /* acheteur : */
  address acheteur;
  bool vendeurApprove;
  bool acheteurApprove;

  /* constructeur */
  function Buy4MeContract() {
    buy4me = msg.sender;
  }

  /* permissions */
  modifier estBuy4me() {
    if(buy4me != mmsg.sender) {
      throw;
    } else {
      -;
    }
  }
  modifier estVendeur() {
    if(vendeur != mmsg.sender) {
      throw;
    } else {
      -;
    }
  }
  modifier estAcheteur() {
    if(acheteur != mmsg.sender) {
      throw;
    } else {
      -;
    }
  }

  /* getters */
  function getvendeur() public constant returns(address) {
    return vendeur;
  }
  function getacheteur() public constant returns(address) {
    return acheteur;
  }

  event SetupEvent();
  /* C'est le wallet applicatif qui doit appeler cette méthode */
  function setup(address vendeurParam, address acheteurParam) estBuy4me {
    vendeur = vendeurParam;
    acheteur = acheteurParam;
    SetupEvent();
  }
  
  event DepositEvent();
  /* l'acheteur dépose les fonds */
  function deposit() estAcheteur {
    this.balance += msg.value;//TODO KO
    DepositEvent();
  }

  /* commission (fee) dés que les deux parties ont approuvé */
  function acheteurApprouve() estAcheteur {
      acheteurApprove = true;
      if(vendeurApprove && acheteurApprove) {
        feeAndPayout();
      } 
  }
  function vendeurApprouve() estVendeur {
      vendeurApprove = true;
      if(vendeurApprove && acheteurApprove) {
        feeAndPayout();
      } 
  }

  /* commission puis transfert au vendeur */
  function feeAndPayout() private {  
    //0.1% fee
    if(buy4me.send(this.balance / 1000)) {
      this.balance -= this.balance / 1000; 
    }
    //paye
    payOut();
  }

  /* transfert au vendeur */
  function payOut() private {
    if(seller.send(this.balance)) {
      this.balance = 0;
    }
  }

  function abort(){
      if(msg.sender == acheteur) {
        acheteurApprove = false;
        if(!vendeurApprove && !acheteurApprove) {
          refund();
        } 
      } 
      else if (msg.sender == vendeur) {
        vendeurApprove = false;
        if(!vendeurApprove && !acheteurApprove) {
          refund();
        } 
      } 
  }

  function refund() private {
    if(acheteurApprove == false && vendeurApprove == false) selfdestruct(acheteur);
    //send money back to recipient if both parties agree contract is void
  }

  function killContract() internal {
      selfdestruct(buy4me);
      //kills contract and returns funds to acheteur
  }

}
