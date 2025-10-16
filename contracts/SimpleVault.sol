// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleVault
 * @dev A simple vault contract that allows users to deposit and withdraw ETH
 * 
 * 🐛 BUG LOCATION: This contract contains intentional bugs for AutoCodeFixer testing
 * 
 * Bug #1: Line 42 - The withdraw function has a logic error in the balance check
 * Bug #2: Line 48 - The balance is not updated before the external call (reentrancy risk + logic error)
 * 
 * Expected Fix:
 * - Change the comparison operator from ">=" to ">" on line 42
 * - Update the user's balance BEFORE making the external call on line 48
 */
contract SimpleVault {
    mapping(address => uint256) public balances;
    uint256 public totalDeposits;
    
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    
    /**
     * @dev Allows users to deposit ETH into the vault
     */
    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        
        balances[msg.sender] += msg.value;
        totalDeposits += msg.value;
        
        emit Deposit(msg.sender, msg.value);
    }
    
    /**
     * @dev Allows users to withdraw their deposited ETH
     * @param amount The amount to withdraw
     * 
     * 🐛 BUG #1: The require statement uses ">=" instead of ">"
     * This allows users to withdraw even when amount equals balance,
     * but the logic should only allow withdrawal when balance is strictly greater.
     * 
     * 🐛 BUG #2: Balance is updated AFTER the external call
     * This creates both a reentrancy vulnerability and a logic error.
     * The balance should be updated BEFORE transferring funds.
     */
    function withdraw(uint256 amount) public {
        // BUG #1: Should be "balances[msg.sender] > amount" not ">="
        require(balances[msg.sender] >= amount, "Insufficient balance");
        require(amount > 0, "Withdrawal amount must be greater than 0");
        
        // Transfer the funds (external call)
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        // BUG #2: Balance update should happen BEFORE the external call
        // This creates a reentrancy vulnerability and incorrect state
        balances[msg.sender] -= amount;
        totalDeposits -= amount;
        
        emit Withdrawal(msg.sender, amount);
    }
    
    /**
     * @dev Returns the balance of a specific user
     * @param user The address to query
     * @return The balance of the user
     */
    function getBalance(address user) public view returns (uint256) {
        return balances[user];
    }
    
    /**
     * @dev Returns the total deposits in the vault
     * @return The total amount of ETH deposited
     */
    function getTotalDeposits() public view returns (uint256) {
        return totalDeposits;
    }
}
