const { ethers } = require("hardhat");

async function main() {
  console.log("💰 Token Splitter Payout Script");
  
  // Configuration - Update these values
  const TOKEN_SPLITTER_ADDRESS = "YOUR_TOKEN_SPLITTER_ADDRESS";
  const PAYOUT_AMOUNT = ethers.utils.parseEther("10000"); // 10,000 tokens
  const PAYOUT_DESCRIPTION = "Q4 2024 revenue distribution";
  
  try {
    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log("📝 Using account:", deployer.address);
    
    // Get contract instances
    const tokenSplitter = await ethers.getContractAt("TokenSplitter", TOKEN_SPLITTER_ADDRESS);
    const token = await ethers.getContractAt("TetherUSDBridgedZED20", await tokenSplitter.token());
    
    console.log("🔍 Checking splitter configuration...");
    
    // Get current recipients
    const recipients = await tokenSplitter.getActiveRecipients();
    console.log("👥 Active recipients:", recipients.length);
    
    if (recipients.length === 0) {
      throw new Error("No active recipients configured in splitter");
    }
    
    // Get total percentage
    const totalPercentage = await tokenSplitter.totalPercentage();
    console.log("📊 Total percentage configured:", totalPercentage.toString(), "basis points");
    
    if (totalPercentage === 0) {
      throw new Error("No percentage configured in splitter");
    }
    
    // Check minimum distribution amount
    const minDistributionAmount = await tokenSplitter.minDistributionAmount();
    console.log("💰 Minimum distribution amount:", ethers.utils.formatEther(minDistributionAmount));
    
    if (PAYOUT_AMOUNT.lt(minDistributionAmount)) {
      throw new Error(`Payout amount below minimum. Need at least ${ethers.utils.formatEther(minDistributionAmount)} tokens`);
    }
    
    // Check token balance
    const balance = await token.balanceOf(deployer.address);
    console.log("💰 Current token balance:", ethers.utils.formatEther(balance));
    
    if (balance.lt(PAYOUT_AMOUNT)) {
      throw new Error(`Insufficient token balance. Need ${ethers.utils.formatEther(PAYOUT_AMOUNT)}, have ${ethers.utils.formatEther(balance)}`);
    }
    
    // Check allowance
    const allowance = await token.allowance(deployer.address, TOKEN_SPLITTER_ADDRESS);
    console.log("✅ Current allowance:", ethers.utils.formatEther(allowance));
    
    if (allowance.lt(PAYOUT_AMOUNT)) {
      console.log("🔐 Approving tokens for splitter contract...");
      const approveTx = await token.approve(TOKEN_SPLITTER_ADDRESS, PAYOUT_AMOUNT);
      await approveTx.wait();
      console.log("✅ Tokens approved");
    }
    
    console.log("\n📋 Payout Details:");
    console.log("   Amount:", ethers.utils.formatEther(PAYOUT_AMOUNT), "tokens");
    console.log("   Description:", PAYOUT_DESCRIPTION);
    console.log("   Recipients:", recipients.length);
    
    console.log("\n👥 Recipient Breakdown:");
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      const recipientAmount = PAYOUT_AMOUNT.mul(recipient.percentage).div(10000);
      console.log(`   ${i + 1}. ${recipient.wallet}`);
      console.log(`      Percentage: ${recipient.percentage / 100}%`);
      console.log(`      Amount: ${ethers.utils.formatEther(recipientAmount)} tokens`);
      console.log(`      Description: ${recipient.description}`);
    }
    
    console.log("\n🚀 Executing payout...");
    
    // Execute distribution
    const payoutTx = await tokenSplitter.executeDistribution(PAYOUT_AMOUNT, PAYOUT_DESCRIPTION);
    
    console.log("⏳ Waiting for transaction confirmation...");
    const receipt = await payoutTx.wait();
    
    // Find the DistributionExecuted event
    const distributionEvent = receipt.events?.find(e => e.event === 'DistributionExecuted');
    if (distributionEvent) {
      const distributionId = distributionEvent.args.distributionId;
      const totalAmount = distributionEvent.args.totalAmount;
      const recipientCount = distributionEvent.args.recipientCount;
      
      console.log("✅ Payout executed successfully!");
      console.log("   Distribution ID:", distributionId.toString());
      console.log("   Total amount:", ethers.utils.formatEther(totalAmount));
      console.log("   Recipients:", recipientCount);
      console.log("   Transaction hash:", receipt.transactionHash);
      
      // Get distribution details
      const distribution = await tokenSplitter.getDistribution(distributionId);
      console.log("\n📋 Distribution Details:");
      console.log("   ID:", distribution.id.toString());
      console.log("   Total Amount:", ethers.utils.formatEther(distribution.totalAmount));
      console.log("   Timestamp:", new Date(distribution.timestamp.toNumber() * 1000).toISOString());
      console.log("   Recipient Count:", distribution.recipientCount);
      console.log("   Description:", distribution.description);
      
      // Verify recipient payments
      console.log("\n🔍 Verifying recipient payments...");
      for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];
        const distributionAmount = await tokenSplitter.getDistributionAmount(distributionId, recipient.id);
        const recipientBalance = await token.balanceOf(recipient.wallet);
        
        console.log(`   ${i + 1}. ${recipient.wallet}`);
        console.log(`      Received: ${ethers.utils.formatEther(distributionAmount)} tokens`);
        console.log(`      New Balance: ${ethers.utils.formatEther(recipientBalance)} tokens`);
      }
      
      // Get updated sender balance
      const updatedBalance = await token.balanceOf(deployer.address);
      console.log("\n💰 Updated sender balance:", ethers.utils.formatEther(updatedBalance));
      
      // Get updated splitter stats
      const updatedRecipients = await tokenSplitter.getActiveRecipients();
      console.log("\n📊 Updated Splitter Statistics:");
      for (let i = 0; i < updatedRecipients.length; i++) {
        const recipient = updatedRecipients[i];
        console.log(`   ${i + 1}. ${recipient.wallet}`);
        console.log(`      Total Received: ${ethers.utils.formatEther(recipient.totalReceived)} tokens`);
        console.log(`      Last Distribution: ${recipient.lastDistribution > 0 ? new Date(recipient.lastDistribution.toNumber() * 1000).toISOString() : 'Never'}`);
      }
    }
    
  } catch (error) {
    console.error("❌ Error executing payout:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
