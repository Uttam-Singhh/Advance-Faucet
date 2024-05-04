// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// ============ Imports ============Z
import "../lib/openzeppelin-contracts/contracts/interfaces/IERC20.sol"; // ERC20 minified interface

/// @title AdvanceFaucet
/// @author Uttam Singh
/// @notice airdrops CFLR, testUSDC, WETH
contract AdvanceFaucet {
    /// ============ storage ============

    /// @notice wETH ERC20 token
    IERC20 public immutable WETH;
    /// @notice USDC ERC20 token
    IERC20 public immutable testUSDC;

    /// @notice Address of Owner
    address public owner;
    /// @notice wETH to disperse
    uint256 public WETH_AMOUNT = 1e18;
    /// @notice USDC to disperse
    uint256 public testUSDC_AMOUNT = 10e6;
    /// @notice Amount allowed to recieve
    uint256 public CFLR_AMOUNT = 5e18;

    /// ============ Modifiers ============

    /// @notice Requires sender to be contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    /// ============ Events ============

    /// @notice Emitted after faucet drips to a recipient
    /// @param recipient address dripped to
    event FaucetAlert(address indexed recipient);

    /// @notice Emitted after faucet drained to a recipient
    /// @param recipient address drained to
    event FaucetDrained(address indexed recipient);

    /// @notice Emitted after owner updates
    /// @param owner address being updated
    event OwnerUpdated(address indexed owner);

    /// ============ Constructor ============

    /// @notice Sets deployer address as Owner
    /// @param _testUSDC address of testUSDC contract
    /// @param _WETH address of wETH contract
    constructor(address _WETH, address _testUSDC) payable {
        WETH = IERC20(_WETH);
        testUSDC = IERC20(_testUSDC);
        owner = msg.sender;
    }

    /// ============ Functions ============

    /// @notice Allows owner to update owner
    /// @param newOwner address to update
    function setOwner(address newOwner) public onlyOwner {
        owner = newOwner;
        emit OwnerUpdated(newOwner);
    }

    /// @notice Allows owner to update the amount allowable to be claimed
    /// @param _WETHamount amount of weth to be claimed
    /// @param _CFLRamount amount for cflr to be claimed
    /// @param _testUSDCamount amount for usdc to be claimed
    function updateAmountallowed(uint256 _WETHamount, uint256 _CFLRamount, uint256 _testUSDCamount) external onlyOwner {
        
        WETH_AMOUNT = _WETHamount;
        CFLR_AMOUNT = _CFLRamount;
        testUSDC_AMOUNT = _testUSDCamount;
    }

    /// @notice owner can transfer tokens to recipient
    /// @param recipient to send tokens to
    function requestTokens(address recipient) public onlyOwner {

        //transfer cflr
        (bool sent, ) = recipient.call{value: CFLR_AMOUNT}("");
        require(sent, "Failed sending CFLR");

        //tranfer testusdc
        require(testUSDC.transfer(recipient, testUSDC_AMOUNT), "Failed sending USDC");

        //transfer weth
        require(WETH.transfer(recipient, WETH_AMOUNT), "Failed sending wETH");

        emit FaucetAlert(recipient);
    }

    /// @notice Allows owner to drain contract of tokens
    /// @param _recipient to send drained tokens to
    function drain(address _recipient) external onlyOwner {
        // Drain all CFLR
        (bool sent, ) = _recipient.call{value: address(this).balance}("");
        require(sent, "Failed draining CFLR");

        // Drain all testUSDC
        uint256 testUSDCBalance = testUSDC.balanceOf(address(this));
        require(testUSDC.transfer(_recipient, testUSDCBalance), "Failed draining USDC");

        // Drain all wETH
        uint256 wethBalance = WETH.balanceOf(address(this));
        require(WETH.transfer(_recipient, wethBalance), "Failed draining wETH");

        emit FaucetDrained(_recipient);
    }

    /// @notice Allows receiving ETH
    receive() external payable {}
}
