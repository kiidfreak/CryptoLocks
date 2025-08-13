const { ethers } = require("hardhat");

async function main() {
  console.log("🔥 Token Burning Script");
  
  // Configuration - Update these values
  const TOKEN_ADDRESS = "YOUR_TOKEN_ADDRESS";
  const BURN_FROM_ADDRESS = "ADDRESS_TO_BURN_FROM";
  const BURN_AMOUNT = ethers.utils.parseEther("1000"); // 1,000 tokens
  const BURN_REASON = "Excess supply reduction";
  
  try {
    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log("📝 Using account:", deployer.address);
    
    // Get contract instance
    const token = await ethers.getContractAt("TetherUSDBridgedZED20", TOKEN_ADDRESS);
    
    console.log("🔍 Checking burning permissions...");
    
    // Check if deployer has BURNER_ROLE
    const BURNER_ROLE = await token.BURNER_ROLE();
    const hasBurnerRole = await token.hasRole(BURNER_ROLE, deployer.address);
    
    if (!hasBurnerRole) {
      throw new Error("Deployer does not have BURNER_ROLE");
    }
    
    console.log("✅ Deployer has BURNER_ROLE");
    
    // Check current supply
    const currentSupply = await token.totalSupply();
    console.log("📊 Current supply:", ethers.utils.formatEther(currentSupply));
    
    // Check if burning would reduce supply below 0
    if (currentSupply.lt(BURN_AMOUNT)) {
      throw new Error(`Cannot burn more tokens than current supply. Current: ${ethers.utils.formatEther(currentSupply)}, Attempting: ${ethers.utils.formatEther(BURN_AMOUNT)}`);
    }
    
    // Check if contract is paused
    const isPaused = await token.paused();
    if (isPaused) {
      throw new Error("Token contract is paused");
    }
    
    console.log("✅ Contract is not paused");
    
    // Check balance of address to burn from
    const balanceToBurnFrom = await token.balanceOf(BURN_FROM_ADDRESS);
    console.log("💰 Balance of address to burn from:", ethers.utils.formatEther(balanceToBurnFrom));
    
    if (balanceToBurnFrom.lt(BURN_AMOUNT)) {
      throw new Error(`Insufficient balance to burn. Address has ${ethers.utils.formatEther(balanceToBurnFrom)}, attempting to burn ${ethers.utils.formatEther(BURN_AMOUNT)}`);
    }
    
    console.log("\n🔥 Burning Details:");
    console.log("   Address to burn from:", BURN_FROM_ADDRESS);
    console.log("   Amount:", ethers.utils.formatEther(BURN_AMOUNT));
    console.log("   Reason:", BURN_REASON);
    
    console.log("\n🚀 Executing burn...");
    
    // Burn tokens
    const burnTx = await token.burn(BURN_FROM_ADDRESS, BURN_AMOUNT, BURN_REASON);
    
    console.log("⏳ Waiting for transaction confirmation...");
    const receipt = await burnTx.wait();
    
    // Find the TokensBurned event
    const burnedEvent = receipt.events?.find(e => e.event === 'TokensBurned');
    if (burnedEvent) {
      const from = burnedEvent.args.from;
      const amount = burnedEvent.args.amount;
      const reason = burnedEvent.args.reason;
      
      console.log("✅ Tokens burned successfully!");
      console.log("   From address:", from);
      console.log("   Amount:", ethers.utils.formatEther(amount));
      console.log("   Reason:", reason);
      console.log("   Transaction hash:", receipt.transactionHash);
      
      // Verify burning
      console.log("\n🔍 Verifying burn...");
      
      // Check updated supply
      const updatedSupply = await token.totalSupply();
      console.log("📊 Updated total supply:", ethers.utils.formatEther(updatedSupply));
      console.log("💸 Supply decrease:", ethers.utils.formatEther(currentSupply.sub(updatedSupply)));
      
      // Check updated balance of burned address
      const updatedBalanceToBurnFrom = await token.balanceOf(BURN_FROM_ADDRESS);
      console.log("💰 Updated balance of burned address:", ethers.utils.formatEther(updatedBalanceToBurnFrom));
      console.log("💸 Balance decrease:", ethers.utils.formatEther(balanceToBurnFrom.sub(updatedBalanceToBurnFrom)));
      
      // Verify the amounts match
      if (currentSupply.sub(updatedSupply).eq(BURN_AMOUNT) && 
          balanceToBurnFrom.sub(updatedBalanceToBurnFrom).eq(BURN_AMOUNT)) {
        console.log("✅ Burn verification successful - all amounts match!");
      } else {
        console.log("⚠️  Burn verification failed - amounts don't match!");
      }
      
      // Check remaining supply capacity
      const maxSupply = await token.maxSupply();
      const remainingCapacity = maxSupply.sub(updatedSupply);
      console.log("📊 Remaining supply capacity:", ethers.utils.formatEther(remainingCapacity));
      
      // Calculate percentage of supply burned
      const burnPercentage = BURN_AMOUNT.mul(10000).div(currentSupply);
      console.log("📊 Burn percentage of total supply:", burnPercentage.toNumber() / 100, "%");
      
    } else {
      console.log("⚠️  TokensBurned event not found in transaction receipt");
    }
    
  } catch (error) {
    console.error("❌ Error burning tokens:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
