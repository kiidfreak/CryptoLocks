const { ethers } = require("hardhat");

async function main() {
  console.log("🔓 Token Lock Release Script");
  
  // Configuration - Update these values
  const TOKEN_TIMELOCK_ADDRESS = "YOUR_TOKEN_TIMELOCK_ADDRESS";
  const LOCK_ID = 1; // The ID of the lock to release
  
  try {
    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log("📝 Using account:", deployer.address);
    
    // Get contract instance
    const tokenTimelock = await ethers.getContractAt("TokenTimelock", TOKEN_TIMELOCK_ADDRESS);
    
    console.log("🔍 Getting lock details...");
    
    // Get lock details
    const lock = await tokenTimelock.getLock(LOCK_ID);
    
    if (lock.id.toString() === "0") {
      throw new Error(`Lock with ID ${LOCK_ID} does not exist`);
    }
    
    console.log("📋 Lock Details:");
    console.log("   ID:", lock.id.toString());
    console.log("   Beneficiary:", lock.beneficiary);
    console.log("   Amount:", ethers.utils.formatEther(lock.amount));
    console.log("   Release Time:", new Date(lock.releaseTime.toNumber() * 1000).toISOString());
    console.log("   Claimed Amount:", ethers.utils.formatEther(lock.claimedAmount));
    console.log("   Is Revoked:", lock.isRevoked);
    console.log("   Description:", lock.description);
    
    // Check if lock can be released
    if (lock.isRevoked) {
      throw new Error("Lock has been revoked and cannot be released");
    }
    
    if (lock.claimedAmount.gte(lock.amount)) {
      throw new Error("Lock has already been fully claimed");
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime < lock.releaseTime.toNumber()) {
      const timeRemaining = lock.releaseTime.toNumber() - currentTime;
      const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60));
      throw new Error(`Lock cannot be released yet. ${daysRemaining} days remaining.`);
    }
    
    // Check if caller is the beneficiary
    if (lock.beneficiary !== deployer.address) {
      throw new Error(`Only the beneficiary (${lock.beneficiary}) can release this lock`);
    }
    
    console.log("\n🔓 Releasing lock...");
    
    // Get balance before release
    const token = await ethers.getContractAt("TetherUSDBridgedZED20", await tokenTimelock.token());
    const balanceBefore = await token.balanceOf(deployer.address);
    console.log("💰 Balance before release:", ethers.utils.formatEther(balanceBefore));
    
    // Release the lock
    const releaseTx = await tokenTimelock.releaseLock(LOCK_ID);
    
    console.log("⏳ Waiting for transaction confirmation...");
    const receipt = await releaseTx.wait();
    
    // Find the LockReleased event
    const lockReleasedEvent = receipt.events?.find(e => e.event === 'LockReleased');
    if (lockReleasedEvent) {
      const releasedAmount = lockReleasedEvent.args.amount;
      console.log("✅ Lock released successfully!");
      console.log("   Released amount:", ethers.utils.formatEther(releasedAmount));
      console.log("   Transaction hash:", receipt.transactionHash);
      
      // Get updated balance
      const balanceAfter = await token.balanceOf(deployer.address);
      console.log("💰 Balance after release:", ethers.utils.formatEther(balanceAfter));
      console.log("💸 Tokens received:", ethers.utils.formatEther(balanceAfter.sub(balanceBefore)));
      
      // Get updated lock details
      const updatedLock = await tokenTimelock.getLock(LOCK_ID);
      console.log("\n📋 Updated Lock Details:");
      console.log("   Claimed Amount:", ethers.utils.formatEther(updatedLock.claimedAmount));
      console.log("   Is Fully Claimed:", updatedLock.claimedAmount.gte(updatedLock.amount));
    }
    
  } catch (error) {
    console.error("❌ Error releasing lock:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
