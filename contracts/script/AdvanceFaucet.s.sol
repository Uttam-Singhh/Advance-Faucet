// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {Script} from "../lib/forge-std/src/Script.sol";
import {AdvanceFaucet} from "../src/AdvanceFaucet.sol";

contract DeploySimpleStorage is Script {
    function run() external returns (AdvanceFaucet) {
        vm.startBroadcast();

        AdvanceFaucet advanceFaucet = new AdvanceFaucet(
            0xc778417E063141139Fce010982780140Aa0cD5Ab,
            0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
        );

        vm.stopBroadcast();
        return advanceFaucet;
    }
}
