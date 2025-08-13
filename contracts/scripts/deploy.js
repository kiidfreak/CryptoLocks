const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting FlashVault deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.utils.formatEther(await deployer.getBalance()));

  // USDT Token Addresses
  const USDT_ADDRESSES = {
    bscTestnet: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", // BSC Testnet USDT
    bscMainnet: "0x55d398326f99059fF775485246999027B3197955", // BSC Mainnet USDT
  };

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network ID:", network.chainId);

  let usdtAddress;
  if (network.chainId === 97) {
    usdtAddress = USDT_ADDRESSES.bscTestnet;
    console.log("🔗 Using BSC Testnet USDT:", usdtAddress);
  } else if (network.chainId === 56) {
    usdtAddress = USDT_ADDRESSES.bscMainnet;
    console.log("🔗 Using BSC Mainnet USDT:", usdtAddress);
  } else {
    console.log("⚠️  Unknown network, using test USDT address");
    usdtAddress = USDT_ADDRESSES.bscTestnet;
  }

  // Deploy LockManager contract
  console.log("📦 Deploying LockManager contract...");
  const LockManager = await ethers.getContractFactory("LockManager");
  const lockManager = await LockManager.deploy(usdtAddress);
  await lockManager.deployed();

  console.log("✅ LockManager deployed to:", lockManager.address);



  

  // Verify contract deployment
  console.log("🔍 Verifying contract deployment...");
  const deployedCode = await ethers.provider.getCode(lockManager.address);
  if (deployedCode === "0x") {
    console.log("❌ Contract deployment failed - no code at address");
    return;
  }
  console.log("✅ Contract code verified successfully");

  // Get initial contract state
  console.log("📊 Getting initial contract state...");
  const minAmount = await lockManager.minLockAmount();
  const maxAmount = await lockManager.maxLockAmount();
  const minDuration = await lockManager.minLockDuration();
  const maxDuration = await lockManager.maxLockDuration();
  const platformFee = await lockManager.platformFee();
  const feeDenominator = await lockManager.feeDenominator();

  console.log("📋 Contract Configuration:");
  console.log("   Min Lock Amount:", ethers.utils.formatUnits(minAmount, 6), "USDT");
  console.log("   Max Lock Amount:", ethers.utils.formatUnits(maxAmount, 6), "USDT");
  console.log("   Min Lock Duration:", minDuration.toString(), "seconds");
  console.log("   Max Lock Duration:", maxDuration.toString(), "seconds");
  console.log("   Platform Fee:", platformFee.toString(), "basis points");
  console.log("   Fee Denominator:", feeDenominator.toString());

  // Save deployment info
  const deploymentInfo = {
    network: network.chainId === 97 ? "BSC Testnet" : network.chainId === 56 ? "BSC Mainnet" : "Unknown",
    chainId: network.chainId,
    deployer: deployer.address,
    lockManager: lockManager.address,
    usdtToken: usdtAddress,
    deploymentTime: new Date().toISOString(),
    configuration: {
      minLockAmount: minAmount.toString(),
      maxLockAmount: maxAmount.toString(),
      minLockDuration: minDuration.toString(),
      maxLockDuration: maxDuration.toString(),
      platformFee: platformFee.toString(),
      feeDenominator: feeDenominator.toString(),
    },
  };

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📄 Deployment Summary:");
  console.log("   Network:", deploymentInfo.network);
  console.log("   LockManager:", deploymentInfo.lockManager);
  console.log("   USDT Token:", deploymentInfo.usdtToken);
  console.log("   Deployer:", deploymentInfo.deployer);

  // Save to file for frontend integration
  const fs = require("fs");
  const path = require("path");
  
  const deploymentPath = path.join(__dirname, "..", "deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentPath);

  // Instructions for next steps
  console.log("\n📋 Next Steps:");
  console.log("1. Update frontend constants with new contract address");
  console.log("2. Test contract functions on", deploymentInfo.network);
  console.log("3. Verify contract on BSCScan");
  console.log("4. Integrate with frontend application");

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
