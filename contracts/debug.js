const path = require("path");
const fs = require("fs");

console.log("🔍 Debugging environment setup...");
console.log("Current working directory:", process.cwd());
console.log(".env file path:", path.join(process.cwd(), ".env"));
console.log(".env file exists:", fs.existsSync(path.join(process.cwd(), ".env")));

require("dotenv").config();

// Manually set the private key if not loaded from .env
if (!process.env.PRIVATE_KEY) {
  console.log("⚠️  PRIVATE_KEY not loaded from .env, setting manually...");
  process.env.PRIVATE_KEY = "6ac9ee802d80a14718583af1d880236a8fa2b09749d9007752232f6ca931fd50";
}

// Ensure private key has 0x prefix
if (process.env.PRIVATE_KEY && !process.env.PRIVATE_KEY.startsWith('0x')) {
  console.log("🔧 Adding 0x prefix to private key...");
  process.env.PRIVATE_KEY = "0x" + process.env.PRIVATE_KEY;
}

const { ethers } = require("hardhat");

async function debug() {
  console.log("🔍 Debugging Hardhat configuration...");
  
  console.log("📋 Environment variables:");
  console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY ? "Set" : "Not set");
  console.log("PRIVATE_KEY length:", process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.length : 0);
  
  try {
    console.log("🔑 Testing ethers.getSigners()...");
    const signers = await ethers.getSigners();
    console.log("Signers length:", signers.length);
    
    if (signers.length > 0) {
      const deployer = signers[0];
      console.log("Deployer address:", deployer.address);
      console.log("Deployer balance:", ethers.utils.formatEther(await deployer.getBalance()));
    } else {
      console.log("❌ No signers found");
    }
  } catch (error) {
    console.error("❌ Error getting signers:", error.message);
  }
  
  try {
    console.log("🌐 Testing network connection...");
    const network = await ethers.provider.getNetwork();
    console.log("Network chainId:", network.chainId);
  } catch (error) {
    console.error("❌ Error getting network:", error.message);
  }
}

debug()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Debug failed:", error);
    process.exit(1);
  });
