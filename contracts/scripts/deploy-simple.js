const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Simple Bridge Deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.utils.formatEther(await deployer.getBalance()));

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network ID:", network.chainId);

  try {
    // Deploy Token Contract First
    console.log("📦 Deploying TetherUSDBridgedZED20 contract...");
    const Token = await ethers.getContractFactory("TetherUSDBridgedZED20");
    const token = await Token.deploy();
    await token.deployed();
    console.log("✅ Token deployed to:", token.address);

    // Check balance before next deployment
    const balanceAfterToken = await deployer.getBalance();
    console.log("💰 Balance after token deployment:", ethers.utils.formatEther(balanceAfterToken));

    // Deploy Bridge Contract
    console.log("🌉 Deploying TokenBridge contract...");
    const Bridge = await ethers.getContractFactory("TokenBridge");
    const bridge = await Bridge.deploy(token.address);
    await bridge.deployed();
    console.log("✅ Bridge deployed to:", bridge.address);

    // Check balance before final deployment
    const balanceAfterBridge = await deployer.getBalance();
    console.log("💰 Balance after bridge deployment:", ethers.utils.formatEther(balanceAfterBridge));

    // Deploy LockManager with new token
    console.log("🔒 Deploying LockManager with new token...");
    const LockManager = await ethers.getContractFactory("LockManager");
    const lockManager = await LockManager.deploy(token.address);
    await lockManager.deployed();
    console.log("✅ LockManager deployed to:", lockManager.address);

    console.log("\n🎉 All contracts deployed successfully!");
    console.log("📄 Deployment Summary:");
    console.log("   Token:", token.address);
    console.log("   Bridge:", bridge.address);
    console.log("   LockManager:", lockManager.address);

    // Save deployment info
    const deploymentInfo = {
      network: network.chainId === 97 ? "BSC Testnet" : "Unknown",
      chainId: network.chainId,
      deployer: deployer.address,
      contracts: {
        token: token.address,
        bridge: bridge.address,
        lockManager: lockManager.address
      },
      deploymentTime: new Date().toISOString(),
    };

    const fs = require("fs");
    const path = require("path");
    const deploymentPath = path.join(__dirname, "..", "simple-deployment.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info saved to:", deploymentPath);

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log("💡 Tip: You need more BNB for gas fees. Try a testnet faucet.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
