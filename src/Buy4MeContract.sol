pragma solidity ^0.4.0;

/*
http://solidity.readthedocs.io/en/develop/security-considerations.html
https://github.com/ConsenSys/smart-contract-best-practices
*/
contract Buy4MeContract {

  /* commission en wei */
  uint commissionBuy4Me;
  /* pénalité en cas d'annulation pour l'acheteur final en wei */
  uint penaliteAnnulationAcheteurFinal;
  /* caution miniamle pour le prestataire en wei */
  uint cautionMinimalePrestataire;

  /* sender lors de la création du contrat, wallet applicatif : */
  address buy4me;
  /* Le wallet du prestataire, la personne qui rend service : */
  address prestataire;
  /* Le wallet de l'acheteur final, la personne qui paye le service : */
  address acheteurFinal;
  /* qui a mis combien : */
  mapping(address => uint) funds;
  /* (the default value for a bool is false) : */
  bool validationAcheteurFinal;
  /* settlement done : */
  bool settlementDone;

  /* description à valeur contractuelle - code civil */
  string description;

  /* constructeur */
  function Buy4MeContract() {
    buy4me = msg.sender;
  }

  /* permissions */
  modifier estBuy4me() {
    require(buy4me == msg.sender);
    _;
  }
  modifier estPrestataire() {
    require(prestataire == msg.sender);
    _;
  }
  modifier estAcheteurFinal() {
    require(acheteurFinal == msg.sender);
    _;
  }
  modifier estPartiePrenante() {
    require(prestataire == msg.sender || acheteurFinal == msg.sender);
    _;
  }

  /* getters pour les paramètres du contrat */
  function getCommissionBuy4Me() public constant returns(uint returnValue) {
    return commissionBuy4Me;
  }
  function getPenaliteAnnulationAcheteurFinal() public constant returns(uint returnValue) {
    return penaliteAnnulationAcheteurFinal;
  }
  function getCautionMinimalePrestataire() public constant returns(uint returnValue) {
    return cautionMinimalePrestataire;
  }

  /* getters pour les fonds présents */
  function getFunds(address adresse) public constant returns(uint returnValue) {
    return funds[adresse];
  }

  event SetupEvent();
  /* C'est le wallet applicatif qui doit appeler cette méthode */
  function setup(address prestataireParam, address acheteurFinalParam,
                  uint comissionBuy4MeParam, uint penaliteAnnulationAcheteurFinalParam,
                  uint cautionMinimalePrestataireParam) estBuy4me {
    prestataire = prestataireParam;
    acheteurFinal = acheteurFinalParam;
    commissionBuy4Me = comissionBuy4MeParam;
    penaliteAnnulationAcheteurFinal = penaliteAnnulationAcheteurFinalParam;
    cautionMinimalePrestataire = cautionMinimalePrestataireParam;
    SetupEvent();
  }

  event SetDescriptionEvent();
  function setDescription(string nouvelleDescription) public estPartiePrenante {
    /* si l'acheteur final a déjà validé, on ne peut plus modifier la description */
    if(validationAcheteurFinal) throw;

    description = nouvelleDescription;
    SetDescriptionEvent();
  }

  function getDescription() public constant returns(string returnValue) {
    return description;
  }

  /* 1. Chaque partie prenante dépose son argent */
  event DepositEvent();
  function deposit() estPartiePrenante payable {
    /* msg.value is in wei */
    if (msg.value <= 0) throw;
    if (prestataire == msg.sender && msg.value < cautionMinimalePrestataire) throw;

    funds[msg.sender] += msg.value;
    DepositEvent();
  }

  /* 2. La transaction physique a eu lieu. L'acheteur final valide ou pas */
  event ValidateEvent();
  function validate() estAcheteurFinal {
    validationAcheteurFinal = true;
    ValidateEvent();
  }

  /* 3. utile pour le prestataire qui veut vérifier la validation */
  function getValidationAcheteurFinal() public constant returns(bool returnValue) {
    return validationAcheteurFinal;
  }

  /* 4. settlement */
  event SettleEvent(uint sentAmount, address recipient);
  function settle() estPartiePrenante {

    if(settlementDone) throw;

    /* pour l'event : */
    uint sentAmount;
    address recipient;

    /* utilisé dans les deux cas : */
    uint montantTransaction = funds[acheteurFinal];
    settlementDone = true;

    if(validationAcheteurFinal) {
      /* cas où l'acheteur final a validé */
      uint cautionPrestataire = funds[prestataire];
      uint montantApresCommission = cautionPrestataire + montantTransaction - commissionBuy4Me;
      funds[prestataire] = 0;
      funds[acheteurFinal] = 0;
      sentAmount = montantApresCommission;
      recipient = prestataire;
      if (!prestataire.send(montantApresCommission)) {
        // reverting state because send failed
        funds[prestataire] = cautionPrestataire;
        funds[acheteurFinal] = montantTransaction;
        settlementDone = false;
        sentAmount = 0;
      }
    } else {
      /* cas où l'acheteur final n'a pas validé */
      uint refund = montantTransaction - penaliteAnnulationAcheteurFinal;
      funds[acheteurFinal] = penaliteAnnulationAcheteurFinal;
      sentAmount = refund;
      recipient = acheteurFinal;
      if(!acheteurFinal.send(refund)) {
        // reverting state because send failed
        funds[acheteurFinal] = montantTransaction;
        settlementDone = false;
        sentAmount = 0;
      }
    }

    SettleEvent(sentAmount, recipient);
  }

  event RetrieveBalanceEvent();
  /* 5. Buy4Me solde le compte */
  function retrieveBalance() estBuy4me {
      buy4me.transfer(this.balance);
      RetrieveBalanceEvent();
  }

  /* 6. Buy4Me solde le compte */
  function killContract() estBuy4me {
      //pays buy4me :
      selfdestruct(buy4me);
  }

}
