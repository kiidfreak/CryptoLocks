const { ethers } = require("hardhat");

async function main() {
  console.log("✂️ Token Splitter Setup Script");
  
  // Configuration - Update these values
  const TOKEN_SPLITTER_ADDRESS = "YOUR_TOKEN_SPLITTER_ADDRESS";
  const RECIPIENTS = [
    {
      address: "RECIPIENT_ADDRESS_1",
      percentage: 4000, // 40% (4000 basis points)
      description: "Team allocation"
    },
    {
      address: "RECIPIENT_ADDRESS_2", 
      percentage: 3000, // 30% (3000 basis points)
      description: "Development fund"
    },
    {
      address: "RECIPIENT_ADDRESS_3",
      percentage: 2000, // 20% (2000 basis points)
      description: "Marketing fund"
    },
    {
      address: "RECIPIENT_ADDRESS_4",
      percentage: 1000, // 10% (1000 basis points)
      description: "Treasury"
    }
  ];
  
  try {
    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log("📝 Using account:", deployer.address);
    
    // Get contract instance
    const tokenSplitter = await ethers.getContractAt("TokenSplitter", TOKEN_SPLITTER_ADDRESS);
    
    console.log("🔍 Checking current splitter configuration...");
    
    // Get current total percentage
    const currentTotalPercentage = await tokenSplitter.totalPercentage();
    console.log("📊 Current total percentage:", currentTotalPercentage.toString(), "basis points");
    
    // Get current recipients
    const currentRecipients = await tokenSplitter.getActiveRecipients();
    console.log("👥 Current active recipients:", currentRecipients.length);
    
    if (currentRecipients.length > 0) {
      console.log("⚠️  Warning: Splitter already has recipients configured");
      console.log("   This script will add new recipients to existing ones");
    }
    
    // Calculate total percentage from new recipients
    const totalNewPercentage = RECIPIENTS.reduce((sum, recipient) => sum + recipient.percentage, 0);
    console.log("📊 Total new percentage:", totalNewPercentage, "basis points");
    
    if (totalNewPercentage > 10000) {
      throw new Error(`Total percentage exceeds 100%. Got ${totalNewPercentage} basis points`);
    }
    
    console.log("\n📋 Recipient Configuration:");
    for (let i = 0; i < RECIPIENTS.length; i++) {
      const recipient = RECIPIENTS[i];
      console.log(`   ${i + 1}. ${recipient.address}`);
      console.log(`      Percentage: ${recipient.percentage / 100}%`);
      console.log(`      Description: ${recipient.description}`);
    }
    
    console.log("\n🚀 Setting up recipients...");
    
    // Add each recipient
    for (let i = 0; i < RECIPIENTS.length; i++) {
      const recipient = RECIPIENTS[i];
      console.log(`\n   📝 Adding recipient ${i + 1}/${RECIPIENTS.length}...`);
      console.log(`      Address: ${recipient.address}`);
      console.log(`      Percentage: ${recipient.percentage / 100}%`);
      
      const addRecipientTx = await tokenSplitter.addRecipient(
        recipient.address,
        recipient.percentage,
        recipient.description
      );
      
      console.log("      ⏳ Waiting for transaction confirmation...");
      await addRecipientTx.wait();
      console.log("      ✅ Recipient added successfully");
    }
    
    console.log("\n🔍 Verifying setup...");
    
    // Get updated configuration
    const updatedTotalPercentage = await tokenSplitter.totalPercentage();
    const updatedRecipients = await tokenSplitter.getActiveRecipients();
    
    console.log("📊 Updated total percentage:", updatedTotalPercentage.toString(), "basis points");
    console.log("👥 Total active recipients:", updatedRecipients.length);
    
    console.log("\n📋 Final Recipient List:");
    for (let i = 0; i < updatedRecipients.length; i++) {
      const recipient = updatedRecipients[i];
      console.log(`   ${i + 1}. ${recipient.wallet}`);
      console.log(`      Percentage: ${recipient.percentage / 100}%`);
      console.log(`      Description: ${recipient.description}`);
      console.log(`      Total Received: ${ethers.utils.formatEther(recipient.totalReceived)} tokens`);
      console.log(`      Last Distribution: ${recipient.lastDistribution > 0 ? new Date(recipient.lastDistribution.toNumber() * 1000).toISOString() : 'Never'}`);
    }
    
    console.log("\n✅ Token Splitter setup completed successfully!");
    
  } catch (error) {
    console.error("❌ Error setting up token splitter:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
