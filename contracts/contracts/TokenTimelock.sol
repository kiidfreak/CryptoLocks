// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TokenTimelock is ReentrancyGuard, AccessControl {
    using SafeERC20 for IERC20;
    using Counters for Counters.Counter;
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    IERC20 public immutable token;
    
    struct Lock {
        uint256 id;
        address beneficiary;
        uint256 amount;
        uint256 releaseTime;
        uint256 claimedAmount;
        bool isRevocable;
        bool isRevoked;
        string description;
        uint256 createdAt;
    }
    
    struct VestingSchedule {
        uint256 id;
        address beneficiary;
        uint256 totalAmount;
        uint256 startTime;
        uint256 duration;
        uint256 claimedAmount;
        bool isActive;
        string description;
        uint256 createdAt;
    }
    
    Counters.Counter private _lockIds;
    Counters.Counter private _vestingIds;
    
    mapping(uint256 => Lock) public locks;
    mapping(uint256 => VestingSchedule) public vestingSchedules;
    mapping(address => uint256[]) public beneficiaryLocks;
    mapping(address => uint256[]) public beneficiaryVestings;
    
    event LockCreated(uint256 indexed lockId, address indexed beneficiary, uint256 amount, uint256 releaseTime);
    event LockReleased(uint256 indexed lockId, address indexed beneficiary, uint256 amount);
    event LockRevoked(uint256 indexed lockId, address indexed beneficiary, uint256 amount);
    event VestingCreated(uint256 indexed vestingId, address indexed beneficiary, uint256 totalAmount, uint256 startTime, uint256 duration);
    event VestingClaimed(uint256 indexed vestingId, address indexed beneficiary, uint256 amount);
    event VestingRevoked(uint256 indexed vestingId, address indexed beneficiary, uint256 remainingAmount);
    
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "TokenTimelock: must have admin role");
        _;
    }
    
    modifier onlyOperator() {
        require(hasRole(ADMIN_ROLE, msg.sender) || hasRole(OPERATOR_ROLE, msg.sender), "TokenTimelock: must have operator role");
        _;
    }
    
    modifier lockExists(uint256 lockId) {
        require(locks[lockId].id != 0, "TokenTimelock: lock does not exist");
        _;
    }
    
    modifier vestingExists(uint256 vestingId) {
        require(vestingSchedules[vestingId].id != 0, "TokenTimelock: vesting does not exist");
        _;
    }
    
    constructor(address _token) {
        require(_token != address(0), "TokenTimelock: invalid token address");
        token = IERC20(_token);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }
    
    function createLock(
        address beneficiary,
        uint256 amount,
        uint256 releaseTime,
        bool isRevocable,
        string memory description
    ) external onlyOperator nonReentrant {
        require(beneficiary != address(0), "TokenTimelock: invalid beneficiary");
        require(amount > 0, "TokenTimelock: amount must be greater than 0");
        require(releaseTime > block.timestamp, "TokenTimelock: release time must be in the future");
        require(token.balanceOf(msg.sender) >= amount, "TokenTimelock: insufficient balance");
        require(token.allowance(msg.sender, address(this)) >= amount, "TokenTimelock: insufficient allowance");
        
        _lockIds.increment();
        uint256 lockId = _lockIds.current();
        
        locks[lockId] = Lock({
            id: lockId,
            beneficiary: beneficiary,
            amount: amount,
            releaseTime: releaseTime,
            claimedAmount: 0,
            isRevocable: isRevocable,
            isRevoked: false,
            description: description,
            createdAt: block.timestamp
        });
        
        beneficiaryLocks[beneficiary].push(lockId);
        
        token.safeTransferFrom(msg.sender, address(this), amount);
        
        emit LockCreated(lockId, beneficiary, amount, releaseTime);
    }
    
    function createVestingSchedule(
        address beneficiary,
        uint256 totalAmount,
        uint256 startTime,
        uint256 duration,
        string memory description
    ) external onlyOperator nonReentrant {
        require(beneficiary != address(0), "TokenTimelock: invalid beneficiary");
        require(totalAmount > 0, "TokenTimelock: amount must be greater than 0");
        require(startTime >= block.timestamp, "TokenTimelock: start time must be now or in the future");
        require(duration > 0, "TokenTimelock: duration must be greater than 0");
        require(token.balanceOf(msg.sender) >= totalAmount, "TokenTimelock: insufficient balance");
        require(token.allowance(msg.sender, address(this)) >= totalAmount, "TokenTimelock: insufficient allowance");
        
        _vestingIds.increment();
        uint256 vestingId = _vestingIds.current();
        
        vestingSchedules[vestingId] = VestingSchedule({
            id: vestingId,
            beneficiary: beneficiary,
            totalAmount: totalAmount,
            startTime: startTime,
            duration: duration,
            claimedAmount: 0,
            isActive: true,
            description: description,
            createdAt: block.timestamp
        });
        
        beneficiaryVestings[beneficiary].push(vestingId);
        
        token.safeTransferFrom(msg.sender, address(this), totalAmount);
        
        emit VestingCreated(vestingId, beneficiary, totalAmount, startTime, duration);
    }
    
    function releaseLock(uint256 lockId) external nonReentrant {
        Lock storage lock = locks[lockId];
        require(lock.id != 0, "TokenTimelock: lock does not exist");
        require(lock.beneficiary == msg.sender, "TokenTimelock: only beneficiary can release");
        require(!lock.isRevoked, "TokenTimelock: lock is revoked");
        require(block.timestamp >= lock.releaseTime, "TokenTimelock: lock not yet releasable");
        require(lock.claimedAmount < lock.amount, "TokenTimelock: lock already fully claimed");
        
        uint256 claimableAmount = lock.amount - lock.claimedAmount;
        lock.claimedAmount = lock.amount;
        
        token.safeTransfer(msg.sender, claimableAmount);
        
        emit LockReleased(lockId, msg.sender, claimableAmount);
    }
    
    function claimVesting(uint256 vestingId) external nonReentrant {
        VestingSchedule storage vesting = vestingSchedules[vestingId];
        require(vesting.id != 0, "TokenTimelock: vesting does not exist");
        require(vesting.beneficiary == msg.sender, "TokenTimelock: only beneficiary can claim");
        require(vesting.isActive, "TokenTimelock: vesting is not active");
        require(block.timestamp >= vesting.startTime, "TokenTimelock: vesting not yet started");
        
        uint256 claimableAmount = _calculateVestingClaim(vesting);
        require(claimableAmount > 0, "TokenTimelock: nothing to claim");
        
        vesting.claimedAmount += claimableAmount;
        
        if (vesting.claimedAmount >= vesting.totalAmount) {
            vesting.isActive = false;
        }
        
        token.safeTransfer(msg.sender, claimableAmount);
        
        emit VestingClaimed(vestingId, msg.sender, claimableAmount);
    }
    
    function revokeLock(uint256 lockId) external onlyAdmin lockExists(lockId) {
        Lock storage lock = locks[lockId];
        require(lock.isRevocable, "TokenTimelock: lock is not revocable");
        require(!lock.isRevoked, "TokenTimelock: lock already revoked");
        require(block.timestamp < lock.releaseTime, "TokenTimelock: lock already releasable");
        
        lock.isRevoked = true;
        uint256 remainingAmount = lock.amount - lock.claimedAmount;
        
        if (remainingAmount > 0) {
            token.safeTransfer(msg.sender, remainingAmount);
        }
        
        emit LockRevoked(lockId, lock.beneficiary, remainingAmount);
    }
    
    function revokeVesting(uint256 vestingId) external onlyAdmin vestingExists(vestingId) {
        VestingSchedule storage vesting = vestingSchedules[vestingId];
        require(vesting.isActive, "TokenTimelock: vesting already inactive");
        
        vesting.isActive = false;
        uint256 remainingAmount = vesting.totalAmount - vesting.claimedAmount;
        
        if (remainingAmount > 0) {
            token.safeTransfer(msg.sender, remainingAmount);
        }
        
        emit VestingRevoked(vestingId, vesting.beneficiary, remainingAmount);
    }
    
    function _calculateVestingClaim(VestingSchedule storage vesting) internal view returns (uint256) {
        if (block.timestamp < vesting.startTime) {
            return 0;
        }
        
        uint256 elapsed = block.timestamp - vesting.startTime;
        uint256 totalVestingTime = vesting.duration;
        
        if (elapsed >= totalVestingTime) {
            return vesting.totalAmount - vesting.claimedAmount;
        }
        
        uint256 vestedAmount = (vesting.totalAmount * elapsed) / totalVestingTime;
        uint256 claimableAmount = vestedAmount - vesting.claimedAmount;
        
        return claimableAmount;
    }
    
    function getLock(uint256 lockId) external view returns (Lock memory) {
        return locks[lockId];
    }
    
    function getVestingSchedule(uint256 vestingId) external view returns (VestingSchedule memory) {
        return vestingSchedules[vestingId];
    }
    
    function getBeneficiaryLocks(address beneficiary) external view returns (uint256[] memory) {
        return beneficiaryLocks[beneficiary];
    }
    
    function getBeneficiaryVestings(address beneficiary) external view returns (uint256[] memory) {
        return beneficiaryVestings[beneficiary];
    }
    
    function getTotalLockedAmount() external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 1; i <= _lockIds.current(); i++) {
            if (locks[i].id != 0 && !locks[i].isRevoked) {
                total += locks[i].amount - locks[i].claimedAmount;
            }
        }
        return total;
    }
    
    function getTotalVestingAmount() external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 1; i <= _vestingIds.current(); i++) {
            if (vestingSchedules[i].id != 0 && vestingSchedules[i].isActive) {
                total += vestingSchedules[i].totalAmount - vestingSchedules[i].claimedAmount;
            }
        }
        return total;
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
