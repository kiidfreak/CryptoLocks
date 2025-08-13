const { ethers } = require("hardhat");

async function main() {
  console.log("📦 Batch Token Transfer Script");
  
  // Configuration - Update these values
  const TOKEN_ADDRESS = "YOUR_TOKEN_ADDRESS";
  const RECIPIENTS = [
    "RECIPIENT_ADDRESS_1",
    "RECIPIENT_ADDRESS_2",
    "RECIPIENT_ADDRESS_3"
  ];
  const AMOUNTS = [
    ethers.utils.parseEther("100"),  // 100 tokens
    ethers.utils.parseEther("200"),  // 200 tokens
    ethers.utils.parseEther("300")   // 300 tokens
  ];
  
  try {
    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log("📝 Using account:", deployer.address);
    
    // Get contract instance
    const token = await ethers.getContractAt("TetherUSDBridgedZED20", TOKEN_ADDRESS);
    
    console.log("🔍 Checking balances and allowances...");
    
    // Calculate total amount needed
    const totalAmount = AMOUNTS.reduce((sum, amount) => sum.add(amount), ethers.BigNumber.from(0));
    console.log("💰 Total amount needed:", ethers.utils.formatEther(totalAmount));
    
    // Check token balance
    const balance = await token.balanceOf(deployer.address);
    console.log("💰 Current token balance:", ethers.utils.formatEther(balance));
    
    if (balance.lt(totalAmount)) {
      throw new Error(`Insufficient token balance. Need ${ethers.utils.formatEther(totalAmount)}, have ${ethers.utils.formatEther(balance)}`);
    }
    
    console.log("\n📋 Transfer Details:");
    for (let i = 0; i < RECIPIENTS.length; i++) {
      console.log(`   ${i + 1}. ${RECIPIENTS[i]} -> ${ethers.utils.formatEther(AMOUNTS[i])} tokens`);
    }
    
    console.log("\n🚀 Executing batch transfer...");
    
    // Execute batch transfer
    const batchTransferTx = await token.batchTransfer(RECIPIENTS, AMOUNTS);
    
    console.log("⏳ Waiting for transaction confirmation...");
    const receipt = await batchTransferTx.wait();
    
    console.log("✅ Batch transfer completed successfully!");
    console.log("   Transaction hash:", receipt.transactionHash);
    console.log("   Gas used:", receipt.gasUsed.toString());
    
    // Verify transfers
    console.log("\n🔍 Verifying transfers...");
    for (let i = 0; i < RECIPIENTS.length; i++) {
      const recipientBalance = await token.balanceOf(RECIPIENTS[i]);
      console.log(`   ${RECIPIENTS[i]}: ${ethers.utils.formatEther(recipientBalance)} tokens`);
    }
    
    // Get updated sender balance
    const updatedBalance = await token.balanceOf(deployer.address);
    console.log("💰 Updated sender balance:", ethers.utils.formatEther(updatedBalance));
    
  } catch (error) {
    console.error("❌ Error executing batch transfer:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
