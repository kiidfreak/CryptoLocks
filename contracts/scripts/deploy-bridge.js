const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting FlashVault Bridge Deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.utils.formatEther(await deployer.getBalance()));

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network ID:", network.chainId);

  // Deploy Token Contract
  console.log("📦 Deploying TetherUSDBridgedZED20 contract...");
  const Token = await ethers.getContractFactory("TetherUSDBridgedZED20");
  const token = await Token.deploy();
  await token.deployed();
  console.log("✅ Token deployed to:", token.address);

  // Deploy Bridge Contract
  console.log("🌉 Deploying TokenBridge contract...");
  const Bridge = await ethers.getContractFactory("TokenBridge");
  const bridge = await Bridge.deploy(token.address);
  await bridge.deployed();
  console.log("✅ Bridge deployed to:", bridge.address);

  // Deploy LockManager with new token
  console.log("🔒 Deploying LockManager with new token...");
  const LockManager = await ethers.getContractFactory("LockManager");
  const lockManager = await LockManager.deploy(token.address);
  await lockManager.deployed();
  console.log("✅ LockManager deployed to:", lockManager.address);

  // Verify contract deployment
  console.log("🔍 Verifying contract deployment...");
  const tokenCode = await ethers.provider.getCode(token.address);
  const bridgeCode = await ethers.provider.getCode(bridge.address);
  const lockManagerCode = await ethers.provider.getCode(lockManager.address);
  
  if (tokenCode === "0x" || bridgeCode === "0x" || lockManagerCode === "0x") {
    console.log("❌ Contract deployment failed - no code at address");
    return;
  }
  console.log("✅ All contracts verified successfully");

  // Get initial contract state
  console.log("📊 Getting initial contract state...");
  
  // Token info
  const tokenName = await token.name();
  const tokenSymbol = await token.symbol();
  const tokenDecimals = await token.decimals();
  
  // Bridge info
  const bridgeOwner = await bridge.owner();
  const bridgeToken = await bridge.token();
  
  // LockManager info
  const lockManagerToken = await lockManager.usdtToken();
  const minAmount = await lockManager.minLockAmount();
  const maxAmount = await lockManager.maxLockAmount();
  const platformFee = await lockManager.platformFee();

  console.log("📋 Contract Configuration:");
  console.log("   Token Name:", tokenName);
  console.log("   Token Symbol:", tokenSymbol);
  console.log("   Token Decimals:", tokenDecimals.toString());
  console.log("   Bridge Owner:", bridgeOwner);
  console.log("   Bridge Token:", bridgeToken);
  console.log("   LockManager Token:", lockManagerToken);
  console.log("   Min Lock Amount:", ethers.utils.formatUnits(minAmount, 6), "USDT");
  console.log("   Max Lock Amount:", ethers.utils.formatUnits(maxAmount, 6), "USDT");
  console.log("   Platform Fee:", platformFee.toString(), "basis points");

  // Save deployment info
  const deploymentInfo = {
    network: network.chainId === 97 ? "BSC Testnet" : network.chainId === 56 ? "BSC Mainnet" : "Unknown",
    chainId: network.chainId,
    deployer: deployer.address,
    contracts: {
      token: token.address,
      bridge: bridge.address,
      lockManager: lockManager.address
    },
    deploymentTime: new Date().toISOString(),
    configuration: {
      token: {
        name: tokenName,
        symbol: tokenSymbol,
        decimals: tokenDecimals.toString()
      },
      lockManager: {
        minLockAmount: minAmount.toString(),
        maxLockAmount: maxAmount.toString(),
        platformFee: platformFee.toString()
      }
    },
  };

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📄 Deployment Summary:");
  console.log("   Network:", deploymentInfo.network);
  console.log("   Token:", deploymentInfo.contracts.token);
  console.log("   Bridge:", deploymentInfo.contracts.bridge);
  console.log("   LockManager:", deploymentInfo.contracts.lockManager);
  console.log("   Deployer:", deploymentInfo.deployer);

  // Save to file for frontend integration
  const fs = require("fs");
  const path = require("path");
  
  const deploymentPath = path.join(__dirname, "..", "bridge-deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentPath);

  // Instructions for next steps
  console.log("\n📋 Next Steps:");
  console.log("1. Update frontend constants with new contract addresses");
  console.log("2. Test bridge functionality on", deploymentInfo.network);
  console.log("3. Test LockManager with new token");
  console.log("4. Verify contracts on BSCScan");
  console.log("5. Integrate with frontend application");

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
