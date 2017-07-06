var express = require("express");

var app = express();

const contractCompiled =
  "0x6060604052604051602080610432833981016040528080519060200190919050505b33600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550346002819055505b505b610376806100bc6000396000f30060606040523615610081576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806318394a561461008a5780633ccfd60b146100b05780636c7f1696146100c25780637563c660146101145780638da5cb5b1461013a5780639a2caedc1461018c578063cea2266a146101de575b6100885b5b565b005b341561009257fe5b61009a610230565b6040518082815260200191505060405180910390f35b34156100b857fe5b6100c061023b565b005b34156100ca57fe5b6100d26102a2565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b341561011c57fe5b6101246102cd565b6040518082815260200191505060405180910390f35b341561014257fe5b61014a6102d3565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b341561019457fe5b61019c6102f9565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34156101e657fe5b6101ee61031f565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b600060025490505b90565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc6002549081150290604051809050600060405180830381858888f19350505050151561029f57fe5b5b565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690505b90565b60025481565b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690505b905600a165627a7a7230582026ba5fe4abc50b58865a72ddc3ba76b582e129b9ac60367bb33112c76b6d4def0029";

app.get("/api/initData", function(req, res) {
  res.setHeader("Content-Type", "text/json");
  res.json(
    {
      initData: {contractCompiled , version:1.0},
    }
  );
});

app.get("/api/compte", function(req, res) {
  res.setHeader("Content-Type", "text/json");
  res.json(
    {
      compte: {
        id: 'id',
        inactive: false,
        login: 'dirakkk',
        nom: 'serra',
        prenom: 'yannick',
        role: 'admin',
        sites: ['knocklezout'],
        telephone: '0880503630'
      }
    }
  );
});

app.post("/api/login", function(req, res) {
  res.setHeader("Content-Type", "text/json");
  res.json({ isAllowed:true });
});

app.listen(8080);
