# Smart Contract Debug Repo for AutoCodeFixer

## 🎯 Overview

This is a sample Ethereum smart contract project designed specifically for testing and debugging by the **AutoCodeFixer** agent. It contains a `SimpleVault` contract with intentional bugs that cause test failures.

### Contract: SimpleVault.sol

The `SimpleVault` contract is a basic ETH vault that allows users to:
- Deposit ETH into their account
- Withdraw ETH from their account
- Check their balance
- View total deposits in the vault

## 🐛 The Bugs

This contract contains **two intentional bugs** for debugging practice:

### Bug #1: Incorrect Balance Comparison (Line 42)
**Location:** `contracts/SimpleVault.sol:42`

**Current Code:**
```solidity
require(balances[msg.sender] >= amount, "Insufficient balance");
```

**Issue:** The comparison operator allows users to withdraw when their balance equals the withdrawal amount. According to the contract's intended logic, users should only be able to withdraw if they have MORE than the withdrawal amount (to keep a minimum balance).

**Fix:** Change `>=` to `>`
```solidity
require(balances[msg.sender] > amount, "Insufficient balance");
```

### Bug #2: Balance Updated After External Call (Line 48-49)
**Location:** `contracts/SimpleVault.sol:48-49`

**Current Code:**
```solidity
(bool success, ) = msg.sender.call{value: amount}("");
require(success, "Transfer failed");

balances[msg.sender] -= amount;  // Updated AFTER external call
totalDeposits -= amount;
```

**Issue:** The balance is updated after making an external call. This creates:
1. A reentrancy vulnerability (attacker could call back before state is updated)
2. Incorrect state if the external call succeeds but something else fails

**Fix:** Update balances BEFORE making the external call (Checks-Effects-Interactions pattern)
```solidity
balances[msg.sender] -= amount;
totalDeposits -= amount;

(bool success, ) = msg.sender.call{value: amount}("");
require(success, "Transfer failed");
```

## 📦 Project Structure

```
smart-contract-debug-repo/
├── contracts/
│   └── SimpleVault.sol          # Buggy smart contract
├── test/
│   └── SimpleVaultTest.js       # Test suite (2 failing, 5 passing)
├── hardhat.config.js            # Hardhat configuration
├── package.json                 # NPM dependencies
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- NPM or Yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Compile the contracts:
```bash
npx hardhat compile
```

3. Run the tests:
```bash
npx hardhat test
```

## 📊 Expected Test Results

When you run `npx hardhat test`, you should see:

- **✅ 5 Passing Tests** - Basic functionality works correctly
- **❌ 2 Failing Tests** - These fail due to the bugs described above

### Failing Tests:

1. **"Should allow partial withdrawal leaving remaining balance"**
   - Fails due to Bug #1 (incorrect comparison operator)
   
2. **"Should not allow withdrawal of full balance due to logic error"**
   - Fails due to Bug #1 (should revert but doesn't)


## 🔗 Technology Stack

- **Solidity:** ^0.8.0
- **Hardhat:** ^2.19.0
- **Testing Framework:** Mocha + Chai
- **Network:** Hardhat local network

## 📜 License

MIT
