const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Force compiling contracts...');

try {
  // Clean everything first
  console.log('🧹 Cleaning previous artifacts...');
  execSync('npx hardhat clean', { stdio: 'inherit' });
  
  // Force compile
  console.log('⚡ Compiling contracts...');
  execSync('npx hardhat compile --force', { stdio: 'inherit' });
  
  // Verify artifacts were created
  const artifactsPath = path.join(__dirname, 'artifacts');
  if (fs.existsSync(artifactsPath)) {
    console.log('✅ Artifacts created successfully!');
    
    // List created artifacts
    const contractsPath = path.join(artifactsPath, 'contracts');
    if (fs.existsSync(contractsPath)) {
      const contracts = fs.readdirSync(contractsPath);
      console.log('📁 Contracts compiled:');
      contracts.forEach(contract => {
        console.log(`   - ${contract}`);
      });
    }
  } else {
    console.log('❌ No artifacts found after compilation');
  }
  
} catch (error) {
  console.error('❌ Compilation failed:', error.message);
  process.exit(1);
}
