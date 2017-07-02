const assert = require('chai').assert
const Test = require('./Test');

Test.getInstance('HelloWorld')
    .then(function(helloWorld) {

        assert.equal(helloWorld.get(), 'first word', 'HelloWorld contract insertion');
        // console.log('1. helloWorld.get(): ' + helloWorld.get());

        return new Test.transactionBuilder()
            .contract(helloWorld)
            .method(helloWorld.set)
            .params('Totochabo')
            .eventToWatch(helloWorld.ReturnValue)
            .build();

    })
    .then(function(contract){

        assert.equal(contract.get(), 'Totochabo', 'HelloWorld contract transaction');
        // console.log('2. helloWorld.get(): ' + contract.get());

    })
    .catch(error => console.log(error));