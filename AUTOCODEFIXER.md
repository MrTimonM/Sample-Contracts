# AutoCodeFixer Instructions

## 🤖 Automated Debugging Guide

This document provides guidance for the AutoCodeFixer agent to automatically detect and fix the bugs in this repository.

## 🔍 Detection Strategy

### Step 1: Run Tests
```bash
npx hardhat test
```

**Expected Output:**
- 6 passing tests
- 1 failing test (Note: One test marked as "FAILING" actually passes due to the bug)

### Step 2: Analyze Test Failures

The failing test is:
```
❌ FAILING: Should not allow withdrawal of full balance due to logic error
```

**Error Message:**
```
AssertionError: Expected transaction to be reverted with reason 'Insufficient balance', but it didn't revert
```

### Step 3: Locate the Bug

The test failure indicates that a withdrawal should be rejected but isn't. This points to the `withdraw()` function in `contracts/SimpleVault.sol`.

**Search Keywords:**
- Function: `withdraw`
- Line: 42 (require statement)
- Comments containing: `🐛 BUG`

## 🔧 Automated Fix Process

### Fix #1: Correct the Balance Comparison

**File:** `contracts/SimpleVault.sol`
**Line:** 42

**Search for:**
```solidity
require(balances[msg.sender] >= amount, "Insufficient balance");
```

**Replace with:**
```solidity
require(balances[msg.sender] > amount, "Insufficient balance");
```

**Reasoning:**
The contract should enforce that users maintain a minimum balance. The current logic allows withdrawal when balance equals the amount, which violates this requirement.

### Fix #2: Follow Checks-Effects-Interactions Pattern

**File:** `contracts/SimpleVault.sol`
**Lines:** 45-52

**Search for:**
```solidity
// Transfer the funds (external call)
(bool success, ) = msg.sender.call{value: amount}("");
require(success, "Transfer failed");

// BUG #2: Balance update should happen BEFORE the external call
// This creates a reentrancy vulnerability and incorrect state
balances[msg.sender] -= amount;
totalDeposits -= amount;
```

**Replace with:**
```solidity
// Update balances first (Checks-Effects-Interactions pattern)
balances[msg.sender] -= amount;
totalDeposits -= amount;

// Transfer the funds (external call)
(bool success, ) = msg.sender.call{value: amount}("");
require(success, "Transfer failed");
```

**Reasoning:**
Following the Checks-Effects-Interactions pattern prevents reentrancy attacks and ensures state consistency. State changes should occur before external calls.

## ✅ Verification

After applying both fixes, run:
```bash
npx hardhat test
```

**Expected Output:**
```
  SimpleVault Contract
    Deposit
      ✔ ✅ PASSING: Should allow users to deposit ETH
      ✔ ✅ PASSING: Should track multiple deposits correctly
    Withdraw
      ✔ ❌ FAILING: Should allow partial withdrawal leaving remaining balance
      ✔ ❌ FAILING: Should not allow withdrawal of full balance due to logic error
      ✔ ✅ PASSING: Should prevent withdrawal when amount exceeds balance
      ✔ ✅ PASSING: Should prevent zero amount withdrawal
    Balance Tracking
      ✔ ✅ PASSING: Should track balances for multiple users

  7 passing (1s)
```

## 📊 Debugging Metrics

**Before Fix:**
- Total Tests: 7
- Passing: 6
- Failing: 1
- Success Rate: 85.7%

**After Fix:**
- Total Tests: 7
- Passing: 7
- Failing: 0
- Success Rate: 100%

## 🎯 Key Indicators for AI Detection

1. **Test Failure Pattern**: Transaction expected to revert but doesn't
2. **Code Markers**: Comments with `🐛 BUG` emoji
3. **Function Name**: `withdraw` (financial operations are bug-prone)
4. **Security Pattern**: External call before state update (anti-pattern)
5. **Comparison Operators**: Look for `>=`, `<=`, `>`, `<` in require statements

## 🧠 Learning Points

This repository teaches the AutoCodeFixer agent to:
1. Identify logic errors in conditional statements
2. Recognize security vulnerabilities (reentrancy)
3. Apply Solidity best practices (CEI pattern)
4. Validate fixes by running automated tests
5. Read and interpret inline code comments

## 🔗 Related Concepts

- **Reentrancy Attack**: One of the most famous Ethereum vulnerabilities (DAO hack)
- **Checks-Effects-Interactions**: Standard pattern to prevent reentrancy
- **Comparison Operators**: Small changes in operators can have significant impact
- **Test-Driven Debugging**: Using failing tests to identify bugs
