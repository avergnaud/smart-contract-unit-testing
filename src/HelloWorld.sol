pragma solidity ^0.4.0;

contract HelloWorld {

    string public word = "first word";

    event ReturnValue(address indexed _from, string _value);

    /*
    pas de "constant", donc setter
    */
    function set(string newWord) {
        word = newWord;
        ReturnValue(msg.sender, word);  
    }

    function get() constant returns (string retVal) {
        return word;
    }
}
