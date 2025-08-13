const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Enhanced FlashVault System Deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.utils.formatEther(await deployer.getBalance()));
  
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network ID:", network.chainId);
  
  try {
    // Step 1: Deploy Enhanced Token Contract
    console.log("\n📦 Step 1: Deploying Enhanced TetherUSDBridgedZED20 contract...");
    const Token = await ethers.getContractFactory("TetherUSDBridgedZED20");
    const token = await Token.deploy();
    await token.deployed();
    console.log("✅ Enhanced Token deployed to:", token.address);
    
    const balanceAfterToken = await deployer.getBalance();
    console.log("💰 Balance after token deployment:", ethers.utils.formatEther(balanceAfterToken));
    
    // Step 2: Deploy Token Timelock Contract
    console.log("\n🔒 Step 2: Deploying TokenTimelock contract...");
    const TokenTimelock = await ethers.getContractFactory("TokenTimelock");
    const tokenTimelock = await TokenTimelock.deploy(token.address);
    await tokenTimelock.deployed();
    console.log("✅ TokenTimelock deployed to:", tokenTimelock.address);
    
    const balanceAfterTimelock = await deployer.getBalance();
    console.log("💰 Balance after timelock deployment:", ethers.utils.formatEther(balanceAfterTimelock));
    
    // Step 3: Deploy Token Splitter Contract
    console.log("\n✂️ Step 3: Deploying TokenSplitter contract...");
    const TokenSplitter = await ethers.getContractFactory("TokenSplitter");
    const tokenSplitter = await TokenSplitter.deploy(token.address);
    await tokenSplitter.deployed();
    console.log("✅ TokenSplitter deployed to:", tokenSplitter.address);
    
    const balanceAfterSplitter = await deployer.getBalance();
    console.log("💰 Balance after splitter deployment:", ethers.utils.formatEther(balanceAfterSplitter));
    
    // Step 4: Deploy Enhanced TokenBridge Contract
    console.log("\n🌉 Step 4: Deploying Enhanced TokenBridge contract...");
    const Bridge = await ethers.getContractFactory("TokenBridge");
    const bridge = await Bridge.deploy(token.address);
    await bridge.deployed();
    console.log("✅ Enhanced TokenBridge deployed to:", bridge.address);
    
    const balanceAfterBridge = await deployer.getBalance();
    console.log("💰 Balance after bridge deployment:", ethers.utils.formatEther(balanceAfterBridge));
    
    // Step 5: Deploy Enhanced LockManager Contract
    console.log("\n🔐 Step 5: Deploying Enhanced LockManager contract...");
    const LockManager = await ethers.getContractFactory("LockManager");
    const lockManager = await LockManager.deploy(token.address);
    await lockManager.deployed();
    console.log("✅ Enhanced LockManager deployed to:", lockManager.address);
    
    const balanceAfterLockManager = await deployer.getBalance();
    console.log("💰 Balance after lock manager deployment:", ethers.utils.formatEther(balanceAfterLockManager));
    
    // Step 6: Integrate Contracts
    console.log("\n🔗 Step 6: Integrating contracts...");
    
    // Integrate TokenTimelock with LockManager
    console.log("   🔗 Integrating TokenTimelock with LockManager...");
    const lockManagerContract = await ethers.getContractAt("LockManager", lockManager.address);
    await lockManagerContract.integrateContract(tokenTimelock.address, "TokenTimelock");
    console.log("   ✅ TokenTimelock integrated with LockManager");
    
    // Integrate TokenSplitter with LockManager
    console.log("   🔗 Integrating TokenSplitter with LockManager...");
    await lockManagerContract.integrateContract(tokenSplitter.address, "TokenSplitter");
    console.log("   ✅ TokenSplitter integrated with LockManager");
    
    // Integrate LockManager with TokenBridge
    console.log("   🔗 Integrating LockManager with TokenBridge...");
    const bridgeContract = await ethers.getContractAt("TokenBridge", bridge.address);
    await bridgeContract.integrateContract(lockManager.address, "LockManager");
    console.log("   ✅ LockManager integrated with TokenBridge");
    
    // Integrate TokenTimelock with TokenBridge
    console.log("   🔗 Integrating TokenTimelock with TokenBridge...");
    await bridgeContract.integrateContract(tokenTimelock.address, "TokenTimelock");
    console.log("   ✅ TokenTimelock integrated with TokenBridge");
    
    // Step 7: Setup Initial Roles and Configuration
    console.log("\n⚙️ Step 7: Setting up initial configuration...");
    
    // Grant MINTER_ROLE to LockManager for bridge operations
    console.log("   🔑 Granting MINTER_ROLE to LockManager...");
    const tokenContract = await ethers.getContractAt("TetherUSDBridgedZED20", token.address);
    await tokenContract.grantRole(await tokenContract.MINTER_ROLE(), lockManager.address);
    console.log("   ✅ MINTER_ROLE granted to LockManager");
    
    // Grant MINTER_ROLE to TokenBridge for cross-chain operations
    console.log("   🔑 Granting MINTER_ROLE to TokenBridge...");
    await tokenContract.grantRole(await tokenContract.MINTER_ROLE(), bridge.address);
    console.log("   ✅ MINTER_ROLE granted to TokenBridge");
    
    // Grant OPERATOR_ROLE to deployer for management
    console.log("   🔑 Granting OPERATOR_ROLE to deployer...");
    await tokenContract.grantRole(await tokenContract.OPERATOR_ROLE(), deployer.address);
    console.log("   ✅ OPERATOR_ROLE granted to deployer");
    
    // Grant OPERATOR_ROLE to deployer in LockManager
    console.log("   🔑 Granting OPERATOR_ROLE to deployer in LockManager...");
    await lockManagerContract.grantRole(await lockManagerContract.OPERATOR_ROLE(), deployer.address);
    console.log("   ✅ OPERATOR_ROLE granted to deployer in LockManager");
    
    // Grant OPERATOR_ROLE to deployer in TokenBridge
    console.log("   🔑 Granting OPERATOR_ROLE to deployer in TokenBridge...");
    await bridgeContract.grantRole(await bridgeContract.OPERATOR_ROLE(), deployer.address);
    console.log("   ✅ OPERATOR_ROLE granted to deployer in TokenBridge");
    
    // Grant OPERATOR_ROLE to deployer in TokenTimelock
    console.log("   🔑 Granting OPERATOR_ROLE to deployer in TokenTimelock...");
    const timelockContract = await ethers.getContractAt("TokenTimelock", tokenTimelock.address);
    await timelockContract.grantRole(await timelockContract.OPERATOR_ROLE(), deployer.address);
    console.log("   ✅ OPERATOR_ROLE granted to deployer in TokenTimelock");
    
    // Grant OPERATOR_ROLE to deployer in TokenSplitter
    console.log("   🔑 Granting OPERATOR_ROLE to deployer in TokenSplitter...");
    const splitterContract = await ethers.getContractAt("TokenSplitter", tokenSplitter.address);
    await splitterContract.grantRole(await splitterContract.OPERATOR_ROLE(), deployer.address);
    console.log("   ✅ OPERATOR_ROLE granted to deployer in TokenSplitter");
    
    console.log("\n🎉 All Enhanced Contracts Deployed and Integrated Successfully!");
    
    // Deployment Summary
    console.log("\n📄 Deployment Summary:");
    console.log("   Enhanced Token:", token.address);
    console.log("   TokenTimelock:", tokenTimelock.address);
    console.log("   TokenSplitter:", tokenSplitter.address);
    console.log("   Enhanced TokenBridge:", bridge.address);
    console.log("   Enhanced LockManager:", lockManager.address);
    
    // Save deployment info
    const deploymentInfo = {
      network: network.chainId,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: {
        token: token.address,
        tokenTimelock: tokenTimelock.address,
        tokenSplitter: tokenSplitter.address,
        tokenBridge: bridge.address,
        lockManager: lockManager.address
      },
      integration: {
        lockManagerTokenTimelock: true,
        lockManagerTokenSplitter: true,
        tokenBridgeLockManager: true,
        tokenBridgeTokenTimelock: true,
        tokenMinterRoles: [lockManager.address, bridge.address],
        operatorRoles: [deployer.address]
      }
    };
    
    const fs = require("fs");
    const path = require("path");
    const deploymentPath = path.join(__dirname, "..", "enhanced-deployment.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Enhanced deployment info saved to:", deploymentPath);
    
    // Final balance
    const finalBalance = await deployer.getBalance();
    console.log("\n💰 Final deployer balance:", ethers.utils.formatEther(finalBalance));
    console.log("💸 Total gas used:", ethers.utils.formatEther(balanceAfterToken.sub(finalBalance)));
    
  } catch (error) {
    console.error("❌ Enhanced deployment failed:", error.message);
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log("💡 Tip: You need more BNB for gas fees. Try a testnet faucet.");
    }
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
