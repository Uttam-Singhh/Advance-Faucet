// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/AdvanceFaucet.sol";
import "../lib/openzeppelin-contracts/contracts/interfaces/IERC20.sol";

contract AdvanceFaucetTest is Test {
    AdvanceFaucet public faucet;
    IERC20 public weth;
    IERC20 public testUSDC;
    address public owner;
    address public recipient;

    function setUp() public {
        // Deploy mock WETH and testUSDC contracts
        weth = IERC20(address(new MockERC20("WETH", "WETH", 18)));
        testUSDC = IERC20(address(new MockERC20("testUSDC", "USDC", 6)));

        // Deploy AdvanceFaucet contract
        faucet = new AdvanceFaucet(address(weth), address(testUSDC));
        owner = faucet.owner();
        recipient = address(0x1);
    }

    function testConstructor() public {
        assertEq(address(faucet.WETH()), address(weth));
        assertEq(address(faucet.testUSDC()), address(testUSDC));
        assertEq(faucet.owner(), owner);
    }

    function testSetOwner() public {
        address newOwner = address(0x2);
        faucet.setOwner(newOwner);
        assertEq(faucet.owner(), newOwner);
    }

    function testUpdateAmountAllowed() public {
        uint256 newWETHAmount = 2e18;
        uint256 newCFLRAmount = 10e18;
        uint256 newTestUSDCAmount = 20e6;
        faucet.updateAmountallowed(newWETHAmount, newCFLRAmount, newTestUSDCAmount);
        assertEq(faucet.WETH_AMOUNT(), newWETHAmount);
        assertEq(faucet.CFLR_AMOUNT(), newCFLRAmount);
        assertEq(faucet.testUSDC_AMOUNT(), newTestUSDCAmount);
    }

    function testRequestTokens() public {
        // Mint tokens to the faucet contract
        deal(address(weth), address(faucet), faucet.WETH_AMOUNT());
        deal(address(testUSDC), address(faucet), faucet.testUSDC_AMOUNT());
        deal(address(faucet), faucet.CFLR_AMOUNT());

        uint256 initialWETHBalance = weth.balanceOf(recipient);
        uint256 initialTestUSDCBalance = testUSDC.balanceOf(recipient);
        uint256 initialCFLRBalance = recipient.balance;

        faucet.requestTokens(recipient);

        assertEq(weth.balanceOf(recipient), initialWETHBalance + faucet.WETH_AMOUNT());
        assertEq(testUSDC.balanceOf(recipient), initialTestUSDCBalance + faucet.testUSDC_AMOUNT());
        assertEq(recipient.balance, initialCFLRBalance + faucet.CFLR_AMOUNT());
    }

    function testDrain() public {
        // Mint tokens to the faucet contract
        deal(address(weth), address(faucet), 1000e18);
        deal(address(testUSDC), address(faucet), 1000e6);
        deal(address(faucet), 1000e18);

        uint256 initialWETHBalance = weth.balanceOf(recipient);
        uint256 initialTestUSDCBalance = testUSDC.balanceOf(recipient);
        uint256 initialCFLRBalance = recipient.balance;

        faucet.drain(recipient);

        assertEq(weth.balanceOf(recipient), initialWETHBalance + 1000e18);
        assertEq(testUSDC.balanceOf(recipient), initialTestUSDCBalance + 1000e6);
        assertEq(recipient.balance, initialCFLRBalance + 1000e18);
    }

    function testReceive() public {
        payable(address(faucet)).transfer(1e18);
        assertEq(address(faucet).balance, 1e18);
    }

    function testOnlyOwner() public {
        vm.expectRevert("Only owner can call this function.");
        vm.prank(recipient);
        faucet.setOwner(recipient);
    }
}

contract MockERC20 is IERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    function transfer(address recipient, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool) {
        require(balanceOf[sender] >= amount, "Insufficient balance");
        require(allowance[sender][msg.sender] >= amount, "Insufficient allowance");
        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;
        allowance[sender][msg.sender] -= amount;
        emit Transfer(sender, recipient, amount);
        return true;
    }

    function mint(address account, uint256 amount) external {
        balanceOf[account] += amount;
        totalSupply += amount;
        emit Transfer(address(0), account, amount);
    }

    function burn(address account, uint256 amount) external {
        require(balanceOf[account] >= amount, "Insufficient balance");
        balanceOf[account] -= amount;
        totalSupply -= amount;
        emit Transfer(account, address(0), amount);
    }
}
