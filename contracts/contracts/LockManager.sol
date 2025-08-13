// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract LockManager is ReentrancyGuard, AccessControl, Pausable {
    using SafeERC20 for IERC20;
    using Counters for Counters.Counter;
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    
    IERC20 public immutable usdtToken;
    
    struct Lock {
        uint256 id;
        address owner;
        uint256 amount;
        uint256 unlockTime;
        bool isUnlocked;
        string description;
        uint256 createdAt;
        uint256 unlockedAt;
    }
    
    struct BatchLock {
        uint256 id;
        address owner;
        uint256 totalAmount;
        uint256 unlockTime;
        uint256 lockCount;
        bool isUnlocked;
        string description;
        uint256 createdAt;
        uint256 unlockedAt;
    }
    
    Counters.Counter private _lockIds;
    Counters.Counter private _batchLockIds;
    
    mapping(uint256 => Lock) public locks;
    mapping(uint256 => BatchLock) public batchLocks;
    mapping(address => uint256[]) public userLocks;
    mapping(address => uint256[]) public userBatchLocks;
    
    // Emergency controls
    bool public emergencyMode;
    uint256 public emergencyUnlockTime;
    
    // Integration with other contracts
    address public tokenTimelock;
    address public tokenSplitter;
    
    event LockCreated(uint256 indexed lockId, address indexed owner, uint256 amount, uint256 unlockTime, string description);
    event LockUnlocked(uint256 indexed lockId, address indexed owner, uint256 amount);
    event BatchLockCreated(uint256 indexed batchLockId, address indexed owner, uint256 totalAmount, uint256 unlockTime, uint256 lockCount, string description);
    event BatchLockUnlocked(uint256 indexed batchLockId, address indexed owner, uint256 totalAmount);
    event EmergencyModeActivated(uint256 unlockTime);
    event EmergencyModeDeactivated();
    event ContractIntegrated(string indexed contractType, address indexed contractAddress);
    
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "LockManager: must have admin role");
        _;
    }
    
    modifier onlyOperator() {
        require(hasRole(ADMIN_ROLE, msg.sender) || hasRole(OPERATOR_ROLE, msg.sender), "LockManager: must have operator role");
        _;
    }
    
    modifier onlyEmergency() {
        require(hasRole(EMERGENCY_ROLE, msg.sender), "LockManager: must have emergency role");
        _;
    }
    
    modifier whenNotEmergency() {
        require(!emergencyMode, "LockManager: emergency mode is active");
        _;
    }
    
    modifier lockExists(uint256 lockId) {
        require(locks[lockId].id != 0, "LockManager: lock does not exist");
        _;
    }
    
    modifier batchLockExists(uint256 batchLockId) {
        require(batchLocks[batchLockId].id != 0, "LockManager: batch lock does not exist");
        _;
    }
    
    constructor(address _usdtToken) {
        require(_usdtToken != address(0), "Invalid USDT address");
        usdtToken = IERC20(_usdtToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
    }
    
    function createLock(
        uint256 amount,
        uint256 unlockTime,
        string memory description
    ) external whenNotPaused whenNotEmergency nonReentrant {
        require(amount > 0, "LockManager: amount must be greater than 0");
        require(unlockTime > block.timestamp, "LockManager: unlock time must be in the future");
        require(usdtToken.balanceOf(msg.sender) >= amount, "LockManager: insufficient balance");
        require(usdtToken.allowance(msg.sender, address(this)) >= amount, "LockManager: insufficient allowance");
        
        _lockIds.increment();
        uint256 lockId = _lockIds.current();
        
        locks[lockId] = Lock({
            id: lockId,
            owner: msg.sender,
            amount: amount,
            unlockTime: unlockTime,
            isUnlocked: false,
            description: description,
            createdAt: block.timestamp,
            unlockedAt: 0
        });
        
        userLocks[msg.sender].push(lockId);
        
        usdtToken.safeTransferFrom(msg.sender, address(this), amount);
        
        emit LockCreated(lockId, msg.sender, amount, unlockTime, description);
    }
    
    function createBatchLock(
        uint256[] calldata amounts,
        uint256 unlockTime,
        string memory description
    ) external whenNotPaused whenNotEmergency nonReentrant {
        require(amounts.length > 0, "LockManager: amounts array cannot be empty");
        require(amounts.length <= 100, "LockManager: too many amounts");
        require(unlockTime > block.timestamp, "LockManager: unlock time must be in the future");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            require(amounts[i] > 0, "LockManager: amount must be greater than 0");
            totalAmount += amounts[i];
        }
        
        require(usdtToken.balanceOf(msg.sender) >= totalAmount, "LockManager: insufficient balance");
        require(usdtToken.allowance(msg.sender, address(this)) >= totalAmount, "LockManager: insufficient allowance");
        
        _batchLockIds.increment();
        uint256 batchLockId = _batchLockIds.current();
        
        batchLocks[batchLockId] = BatchLock({
            id: batchLockId,
            owner: msg.sender,
            totalAmount: totalAmount,
            unlockTime: unlockTime,
            lockCount: amounts.length,
            isUnlocked: false,
            description: description,
            createdAt: block.timestamp,
            unlockedAt: 0
        });
        
        userBatchLocks[msg.sender].push(batchLockId);
        
        usdtToken.safeTransferFrom(msg.sender, address(this), totalAmount);
        
        emit BatchLockCreated(batchLockId, msg.sender, totalAmount, unlockTime, amounts.length, description);
    }
    
    function unlockLock(uint256 lockId) external whenNotPaused nonReentrant {
        Lock storage lock = locks[lockId];
        require(lock.id != 0, "LockManager: lock does not exist");
        require(lock.owner == msg.sender, "LockManager: only owner can unlock");
        require(!lock.isUnlocked, "LockManager: lock already unlocked");
        require(block.timestamp >= lock.unlockTime || emergencyMode, "LockManager: lock not yet unlockable");
        
        lock.isUnlocked = true;
        lock.unlockedAt = block.timestamp;
        
        usdtToken.safeTransfer(msg.sender, lock.amount);
        
        emit LockUnlocked(lockId, msg.sender, lock.amount);
    }
    
    function unlockBatchLock(uint256 batchLockId) external whenNotPaused nonReentrant {
        BatchLock storage batchLock = batchLocks[batchLockId];
        require(batchLock.id != 0, "LockManager: batch lock does not exist");
        require(batchLock.owner == msg.sender, "LockManager: only owner can unlock");
        require(!batchLock.isUnlocked, "LockManager: batch lock already unlocked");
        require(block.timestamp >= batchLock.unlockTime || emergencyMode, "LockManager: batch lock not yet unlockable");
        
        batchLock.isUnlocked = true;
        batchLock.unlockedAt = block.timestamp;
        
        usdtToken.safeTransfer(msg.sender, batchLock.totalAmount);
        
        emit BatchLockUnlocked(batchLockId, msg.sender, batchLock.totalAmount);
    }
    
    function emergencyUnlock(uint256 lockId) external onlyEmergency {
        Lock storage lock = locks[lockId];
        require(lock.id != 0, "LockManager: lock does not exist");
        require(!lock.isUnlocked, "LockManager: lock already unlocked");
        
        lock.isUnlocked = true;
        lock.unlockedAt = block.timestamp;
        
        usdtToken.safeTransfer(lock.owner, lock.amount);
        
        emit LockUnlocked(lockId, lock.owner, lock.amount);
    }
    
    function emergencyUnlockBatch(uint256 batchLockId) external onlyEmergency {
        BatchLock storage batchLock = batchLocks[batchLockId];
        require(batchLock.id != 0, "LockManager: batch lock does not exist");
        require(!batchLock.isUnlocked, "LockManager: batch lock already unlocked");
        
        batchLock.isUnlocked = true;
        batchLock.unlockedAt = block.timestamp;
        
        usdtToken.safeTransfer(batchLock.owner, batchLock.totalAmount);
        
        emit BatchLockUnlocked(batchLockId, batchLock.owner, batchLock.totalAmount);
    }
    
    function activateEmergencyMode(uint256 unlockTime) external onlyEmergency {
        require(unlockTime > block.timestamp, "LockManager: unlock time must be in the future");
        emergencyMode = true;
        emergencyUnlockTime = unlockTime;
        emit EmergencyModeActivated(unlockTime);
    }
    
    function deactivateEmergencyMode() external onlyEmergency {
        emergencyMode = false;
        emergencyUnlockTime = 0;
        emit EmergencyModeDeactivated();
    }
    
    function integrateContract(address contractAddress, string memory contractType) external onlyAdmin {
        require(contractAddress != address(0), "LockManager: invalid contract address");
        
        if (keccak256(abi.encodePacked(contractType)) == keccak256(abi.encodePacked("TokenTimelock"))) {
            tokenTimelock = contractAddress;
        } else if (keccak256(abi.encodePacked(contractType)) == keccak256(abi.encodePacked("TokenSplitter"))) {
            tokenSplitter = contractAddress;
        }
        
        emit ContractIntegrated(contractType, contractAddress);
    }
    
    function pause() external onlyAdmin {
        _pause();
    }
    
    function unpause() external onlyAdmin {
        _unpause();
    }
    
    function getLock(uint256 lockId) external view returns (Lock memory) {
        return locks[lockId];
    }
    
    function getBatchLock(uint256 batchLockId) external view returns (BatchLock memory) {
        return batchLocks[batchLockId];
    }
    
    function getUserLocks(address user) external view returns (uint256[] memory) {
        return userLocks[user];
    }
    
    function getUserBatchLocks(address user) external view returns (uint256[] memory) {
        return userBatchLocks[user];
    }
    
    function getTotalLockedAmount() external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 1; i <= _lockIds.current(); i++) {
            if (locks[i].id != 0 && !locks[i].isUnlocked) {
                total += locks[i].amount;
            }
        }
        return total;
    }
    
    function getTotalBatchLockedAmount() external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 1; i <= _batchLockIds.current(); i++) {
            if (batchLocks[i].id != 0 && !batchLocks[i].isUnlocked) {
                total += batchLocks[i].totalAmount;
            }
        }
        return total;
    }
    
    function getTotalLocks() external view returns (uint256) {
        return _lockIds.current();
    }
    
    function getTotalBatchLocks() external view returns (uint256) {
        return _batchLockIds.current();
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
