const { ethers } = require("hardhat");

async function main() {
  console.log("🪙 Token Minting Script");
  
  // Configuration - Update these values
  const TOKEN_ADDRESS = "YOUR_TOKEN_ADDRESS";
  const RECIPIENT_ADDRESS = "RECIPIENT_WALLET_ADDRESS";
  const MINT_AMOUNT = ethers.utils.parseEther("50000"); // 50,000 tokens
  const MINT_REASON = "Initial team allocation";
  
  try {
    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log("📝 Using account:", deployer.address);
    
    // Get contract instance
    const token = await ethers.getContractAt("TetherUSDBridgedZED20", TOKEN_ADDRESS);
    
    console.log("🔍 Checking minting permissions...");
    
    // Check if deployer has MINTER_ROLE
    const MINTER_ROLE = await token.MINTER_ROLE();
    const hasMinterRole = await token.hasRole(MINTER_ROLE, deployer.address);
    
    if (!hasMinterRole) {
      throw new Error("Deployer does not have MINTER_ROLE");
    }
    
    console.log("✅ Deployer has MINTER_ROLE");
    
    // Check current supply
    const currentSupply = await token.totalSupply();
    const maxSupply = await token.maxSupply();
    console.log("📊 Current supply:", ethers.utils.formatEther(currentSupply));
    console.log("📊 Maximum supply:", ethers.utils.formatEther(maxSupply));
    
    // Check if minting would exceed max supply
    if (currentSupply.add(MINT_AMOUNT).gt(maxSupply)) {
      throw new Error(`Minting would exceed maximum supply. Current: ${ethers.utils.formatEther(currentSupply)}, Max: ${ethers.utils.formatEther(maxSupply)}, Attempting: ${ethers.utils.formatEther(MINT_AMOUNT)}`);
    }
    
    // Check if contract is paused
    const isPaused = await token.paused();
    if (isPaused) {
      throw new Error("Token contract is paused");
    }
    
    console.log("✅ Contract is not paused");
    
    // Get recipient balance before minting
    const recipientBalanceBefore = await token.balanceOf(RECIPIENT_ADDRESS);
    console.log("💰 Recipient balance before:", ethers.utils.formatEther(recipientBalanceBefore));
    
    console.log("\n🪙 Minting Details:");
    console.log("   Recipient:", RECIPIENT_ADDRESS);
    console.log("   Amount:", ethers.utils.formatEther(MINT_AMOUNT));
    console.log("   Reason:", MINT_REASON);
    
    console.log("\n🚀 Executing mint...");
    
    // Mint tokens
    const mintTx = await token.mint(RECIPIENT_ADDRESS, MINT_AMOUNT, MINT_REASON);
    
    console.log("⏳ Waiting for transaction confirmation...");
    const receipt = await mintTx.wait();
    
    // Find the TokensMinted event
    const mintedEvent = receipt.events?.find(e => e.event === 'TokensMinted');
    if (mintedEvent) {
      const to = mintedEvent.args.to;
      const amount = mintedEvent.args.amount;
      const reason = mintedEvent.args.reason;
      
      console.log("✅ Tokens minted successfully!");
      console.log("   Recipient:", to);
      console.log("   Amount:", ethers.utils.formatEther(amount));
      console.log("   Reason:", reason);
      console.log("   Transaction hash:", receipt.transactionHash);
      
      // Verify minting
      console.log("\n🔍 Verifying mint...");
      
      // Check updated supply
      const updatedSupply = await token.totalSupply();
      console.log("📊 Updated total supply:", ethers.utils.formatEther(updatedSupply));
      console.log("💸 Supply increase:", ethers.utils.formatEther(updatedSupply.sub(currentSupply)));
      
      // Check recipient balance
      const recipientBalanceAfter = await token.balanceOf(RECIPIENT_ADDRESS);
      console.log("💰 Recipient balance after:", ethers.utils.formatEther(recipientBalanceAfter));
      console.log("💸 Balance increase:", ethers.utils.formatEther(recipientBalanceAfter.sub(recipientBalanceBefore)));
      
      // Verify the amounts match
      if (updatedSupply.sub(currentSupply).eq(MINT_AMOUNT) && 
          recipientBalanceAfter.sub(recipientBalanceBefore).eq(MINT_AMOUNT)) {
        console.log("✅ Mint verification successful - all amounts match!");
      } else {
        console.log("⚠️  Mint verification failed - amounts don't match!");
      }
      
      // Check remaining supply capacity
      const remainingCapacity = maxSupply.sub(updatedSupply);
      console.log("📊 Remaining supply capacity:", ethers.utils.formatEther(remainingCapacity));
      
      // Check if max supply is locked
      const maxSupplyLocked = await token.maxSupplyLocked();
      console.log("🔒 Max supply locked:", maxSupplyLocked ? "Yes" : "No");
      
    } else {
      console.log("⚠️  TokensMinted event not found in transaction receipt");
    }
    
  } catch (error) {
    console.error("❌ Error minting tokens:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
