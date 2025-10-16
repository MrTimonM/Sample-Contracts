# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Run Tests (See the Bugs)
```bash
npx hardhat test
```

**You should see:**
- ✅ 6 tests passing
- ❌ 1 test failing

### 3️⃣ Fix the Bugs

The bugs are in `contracts/SimpleVault.sol`:

**Bug #1 (Line 42):** Change `>=` to `>`
```solidity
// Before
require(balances[msg.sender] >= amount, "Insufficient balance");

// After
require(balances[msg.sender] > amount, "Insufficient balance");
```

**Bug #2 (Lines 45-52):** Move balance updates before external call
```solidity
// Before
(bool success, ) = msg.sender.call{value: amount}("");
require(success, "Transfer failed");
balances[msg.sender] -= amount;
totalDeposits -= amount;

// After
balances[msg.sender] -= amount;
totalDeposits -= amount;
(bool success, ) = msg.sender.call{value: amount}("");
require(success, "Transfer failed");
```

### 4️⃣ Verify Fixes
```bash
npx hardhat test
```

**You should see:**
- ✅ All 7 tests passing
- ❌ 0 tests failing

---

## 📁 File Structure

```
├── contracts/
│   └── SimpleVault.sol          ← THE BUGGY CONTRACT
├── test/
│   └── SimpleVaultTest.js       ← TEST SUITE
├── hardhat.config.js
├── package.json
├── README.md                    ← FULL DOCUMENTATION
├── AUTOCODEFIXER.md            ← AI AGENT INSTRUCTIONS
└── QUICKSTART.md               ← THIS FILE
```

## 🎯 For AutoCodeFixer Agent

This repository is designed for automated debugging. The agent should:

1. ✅ Clone/open the repository
2. ✅ Run `npm install`
3. ✅ Run `npx hardhat test` to identify failures
4. ✅ Read the contract code and comments (marked with 🐛)
5. ✅ Apply the fixes described above
6. ✅ Re-run tests to verify all pass

## 📚 Documentation

- **README.md** - Complete project documentation
- **AUTOCODEFIXER.md** - Detailed AI debugging instructions
- **This file** - Quick reference guide

## 💡 What You'll Learn

- Smart contract debugging
- Solidity security patterns
- Test-driven development
- Automated code fixing

---

**Ready to debug? Start with:** `npx hardhat test`
