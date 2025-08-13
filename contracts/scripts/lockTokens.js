const { ethers } = require("hardhat");

async function main() {
  console.log("🔒 Token Locking Script");
  
  // Configuration - Update these values
  const TOKEN_TIMELOCK_ADDRESS = "YOUR_TOKEN_TIMELOCK_ADDRESS";
  const BENEFICIARY_ADDRESS = "BENEFICIARY_WALLET_ADDRESS";
  const LOCK_AMOUNT = ethers.utils.parseEther("1000"); // 1000 tokens
  const UNLOCK_TIME = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days from now
  const DESCRIPTION = "Team vesting schedule";
  
  try {
    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log("📝 Using account:", deployer.address);
    
    // Get contract instances
    const tokenTimelock = await ethers.getContractAt("TokenTimelock", TOKEN_TIMELOCK_ADDRESS);
    const token = await ethers.getContractAt("TetherUSDBridgedZED20", await tokenTimelock.token());
    
    console.log("🔍 Checking balances and allowances...");
    
    // Check token balance
    const balance = await token.balanceOf(deployer.address);
    console.log("💰 Token balance:", ethers.utils.formatEther(balance));
    
    if (balance.lt(LOCK_AMOUNT)) {
      throw new Error(`Insufficient token balance. Need ${ethers.utils.formatEther(LOCK_AMOUNT)}, have ${ethers.utils.formatEther(balance)}`);
    }
    
    // Check allowance
    const allowance = await token.allowance(deployer.address, TOKEN_TIMELOCK_ADDRESS);
    console.log("✅ Current allowance:", ethers.utils.formatEther(allowance));
    
    if (allowance.lt(LOCK_AMOUNT)) {
      console.log("🔐 Approving tokens for timelock contract...");
      const approveTx = await token.approve(TOKEN_TIMELOCK_ADDRESS, LOCK_AMOUNT);
      await approveTx.wait();
      console.log("✅ Tokens approved");
    }
    
    console.log("\n🔒 Creating token lock...");
    console.log("   Beneficiary:", BENEFICIARY_ADDRESS);
    console.log("   Amount:", ethers.utils.formatEther(LOCK_AMOUNT));
    console.log("   Unlock time:", new Date(UNLOCK_TIME * 1000).toISOString());
    console.log("   Description:", DESCRIPTION);
    
    // Create the lock
    const lockTx = await tokenTimelock.createLock(
      BENEFICIARY_ADDRESS,
      LOCK_AMOUNT,
      UNLOCK_TIME,
      true, // isRevocable
      DESCRIPTION
    );
    
    console.log("⏳ Waiting for transaction confirmation...");
    const receipt = await lockTx.wait();
    
    // Find the LockCreated event
    const lockCreatedEvent = receipt.events?.find(e => e.event === 'LockCreated');
    if (lockCreatedEvent) {
      const lockId = lockCreatedEvent.args.lockId;
      console.log("✅ Lock created successfully!");
      console.log("   Lock ID:", lockId.toString());
      console.log("   Transaction hash:", receipt.transactionHash);
      
      // Get lock details
      const lock = await tokenTimelock.getLock(lockId);
      console.log("\n📋 Lock Details:");
      console.log("   ID:", lock.id.toString());
      console.log("   Beneficiary:", lock.beneficiary);
      console.log("   Amount:", ethers.utils.formatEther(lock.amount));
      console.log("   Release Time:", new Date(lock.releaseTime.toNumber() * 1000).toISOString());
      console.log("   Is Revocable:", lock.isRevocable);
      console.log("   Description:", lock.description);
      console.log("   Created At:", new Date(lock.createdAt.toNumber() * 1000).toISOString());
    }
    
  } catch (error) {
    console.error("❌ Error creating lock:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
