pragma solidity ^0.4.0;

import "ds-test/test.sol";
import "./buy4me.sol";

contract AppTokenTest is DSTest {

    greeter token;

    // token will be instantiated before each test case
    function setUp() {
        token = new greeter(0x00);
        msg.value(1);
    }

    function testTokenTransfer() {

        // inflate the supply of AppTokens
        token.withdraw();
        assert(token.getMontant() == 0);
    }
}