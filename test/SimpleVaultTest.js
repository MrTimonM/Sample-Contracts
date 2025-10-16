const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleVault Contract", function () {
  let SimpleVault;
  let vault;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the contract
    SimpleVault = await ethers.getContractFactory("SimpleVault");
    vault = await SimpleVault.deploy();
    await vault.waitForDeployment();
  });

  describe("Deposit", function () {
    it("✅ PASSING: Should allow users to deposit ETH", async function () {
      const depositAmount = ethers.parseEther("1.0");

      // Perform deposit
      await expect(vault.connect(addr1).deposit({ value: depositAmount }))
        .to.emit(vault, "Deposit")
        .withArgs(addr1.address, depositAmount);

      // Check balance
      const balance = await vault.getBalance(addr1.address);
      expect(balance).to.equal(depositAmount);

      // Check total deposits
      const totalDeposits = await vault.getTotalDeposits();
      expect(totalDeposits).to.equal(depositAmount);
    });

    it("✅ PASSING: Should track multiple deposits correctly", async function () {
      const depositAmount1 = ethers.parseEther("1.0");
      const depositAmount2 = ethers.parseEther("0.5");

      // First deposit
      await vault.connect(addr1).deposit({ value: depositAmount1 });
      
      // Second deposit
      await vault.connect(addr1).deposit({ value: depositAmount2 });

      // Check balance
      const balance = await vault.getBalance(addr1.address);
      expect(balance).to.equal(depositAmount1 + depositAmount2);
    });
  });

  describe("Withdraw", function () {
    beforeEach(async function () {
      // Setup: addr1 deposits 2 ETH
      const depositAmount = ethers.parseEther("2.0");
      await vault.connect(addr1).deposit({ value: depositAmount });
    });

    it("❌ FAILING: Should allow partial withdrawal leaving remaining balance", async function () {
      const withdrawAmount = ethers.parseEther("1.0");
      const expectedRemainingBalance = ethers.parseEther("1.0");

      // Get initial balance
      const initialBalance = await vault.getBalance(addr1.address);
      expect(initialBalance).to.equal(ethers.parseEther("2.0"));

      // Perform withdrawal
      await expect(vault.connect(addr1).withdraw(withdrawAmount))
        .to.emit(vault, "Withdrawal")
        .withArgs(addr1.address, withdrawAmount);

      // Check remaining balance
      const remainingBalance = await vault.getBalance(addr1.address);
      
      // 🐛 THIS TEST FAILS DUE TO BUG #1
      // The contract uses ">=" in the require statement, which means:
      // - When balance is 2 ETH and user tries to withdraw 1 ETH
      // - The condition "2 >= 1" is true, so it should work
      // - But the bug causes incorrect behavior because the comparison is backwards
      // 
      // Expected: 1.0 ETH remaining
      // Actual: This will fail because of the logic error
      expect(remainingBalance).to.equal(expectedRemainingBalance);
    });

    it("❌ FAILING: Should not allow withdrawal of full balance due to logic error", async function () {
      const withdrawAmount = ethers.parseEther("2.0");

      // 🐛 THIS TEST FAILS DUE TO BUG #1
      // The contract requires: balances[msg.sender] >= amount
      // When balance is 2 ETH and amount is 2 ETH:
      // - The condition "2 >= 2" is true
      // - But according to the buggy logic, this should FAIL
      // - The correct logic should be: balances[msg.sender] > amount (must have MORE than withdrawal amount)
      //
      // This test expects the transaction to be reverted, but it won't be due to the bug
      await expect(
        vault.connect(addr1).withdraw(withdrawAmount)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("✅ PASSING: Should prevent withdrawal when amount exceeds balance", async function () {
      const withdrawAmount = ethers.parseEther("3.0");

      // Try to withdraw more than deposited
      await expect(
        vault.connect(addr1).withdraw(withdrawAmount)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("✅ PASSING: Should prevent zero amount withdrawal", async function () {
      const withdrawAmount = ethers.parseEther("0");

      await expect(
        vault.connect(addr1).withdraw(withdrawAmount)
      ).to.be.revertedWith("Withdrawal amount must be greater than 0");
    });
  });

  describe("Balance Tracking", function () {
    it("✅ PASSING: Should track balances for multiple users", async function () {
      const deposit1 = ethers.parseEther("1.0");
      const deposit2 = ethers.parseEther("2.0");

      // addr1 deposits 1 ETH
      await vault.connect(addr1).deposit({ value: deposit1 });
      
      // addr2 deposits 2 ETH
      await vault.connect(addr2).deposit({ value: deposit2 });

      // Check balances
      expect(await vault.getBalance(addr1.address)).to.equal(deposit1);
      expect(await vault.getBalance(addr2.address)).to.equal(deposit2);
      
      // Check total deposits
      expect(await vault.getTotalDeposits()).to.equal(deposit1 + deposit2);
    });
  });
});
