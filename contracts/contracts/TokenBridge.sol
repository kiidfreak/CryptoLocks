// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TokenBridge is ReentrancyGuard, AccessControl, Pausable {
    using SafeERC20 for IERC20;
    using Counters for Counters.Counter;
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    
    IERC20 public immutable token;
    
    struct BridgeRequest {
        uint256 id;
        address sender;
        uint256 amount;
        uint256 targetChainId;
        address targetRecipient;
        bool isProcessed;
        bool isCancelled;
        uint256 createdAt;
        uint256 processedAt;
        string description;
    }
    
    struct BatchBridgeRequest {
        uint256 id;
        address sender;
        uint256[] amounts;
        address[] recipients;
        uint256 targetChainId;
        bool isProcessed;
        bool isCancelled;
        uint256 createdAt;
        uint256 processedAt;
        string description;
    }
    
    Counters.Counter private _bridgeRequestIds;
    Counters.Counter private _batchBridgeRequestIds;
    
    mapping(uint256 => BridgeRequest) public bridgeRequests;
    mapping(uint256 => BatchBridgeRequest) public batchBridgeRequests;
    mapping(address => uint256[]) public userBridgeRequests;
    mapping(address => uint256[]) public userBatchBridgeRequests;
    mapping(uint256 => bool) public supportedChainIds;
    
    // Bridge configuration
    uint256 public minBridgeAmount;
    uint256 public maxBridgeAmount;
    uint256 public bridgeFee;
    uint256 public feeDenominator;
    bool public emergencyMode;
    
    // Integration with other contracts
    address public lockManager;
    address public tokenTimelock;
    
    event BridgeRequestCreated(uint256 indexed requestId, address indexed sender, uint256 amount, uint256 targetChainId, address targetRecipient);
    event BridgeRequestProcessed(uint256 indexed requestId, address indexed sender, uint256 amount, uint256 targetChainId);
    event BridgeRequestCancelled(uint256 indexed requestId, address indexed sender, uint256 amount);
    event BatchBridgeRequestCreated(uint256 indexed requestId, address indexed sender, uint256[] amounts, uint256 targetChainId, address[] recipients);
    event BatchBridgeRequestProcessed(uint256 indexed requestId, address indexed sender, uint256[] amounts, uint256 targetChainId);
    event BatchBridgeRequestCancelled(uint256 indexed requestId, address indexed sender, uint256[] amounts);
    event ChainSupported(uint256 chainId, bool supported);
    event BridgeConfigUpdated(uint256 minAmount, uint256 maxAmount, uint256 fee);
    event EmergencyModeActivated();
    event EmergencyModeDeactivated();
    event ContractIntegrated(string indexed contractType, address indexed contractAddress);
    
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "TokenBridge: must have admin role");
        _;
    }
    
    modifier onlyOperator() {
        require(hasRole(ADMIN_ROLE, msg.sender) || hasRole(OPERATOR_ROLE, msg.sender), "TokenBridge: must have operator role");
        _;
    }
    
    modifier onlyEmergency() {
        require(hasRole(EMERGENCY_ROLE, msg.sender), "TokenBridge: must have emergency role");
        _;
    }
    
    modifier whenNotEmergency() {
        require(!emergencyMode, "TokenBridge: emergency mode is active");
        _;
    }
    
    modifier bridgeRequestExists(uint256 requestId) {
        require(bridgeRequests[requestId].id != 0, "TokenBridge: bridge request does not exist");
        _;
    }
    
    modifier batchBridgeRequestExists(uint256 requestId) {
        require(batchBridgeRequests[requestId].id != 0, "TokenBridge: batch bridge request does not exist");
        _;
    }
    
    constructor(address _token) {
        require(_token != address(0), "TokenBridge: invalid token address");
        token = IERC20(_token);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        
        // Initialize bridge configuration
        minBridgeAmount = 100 * 10**18; // 100 tokens
        maxBridgeAmount = 1000000 * 10**18; // 1M tokens
        bridgeFee = 25; // 0.25% (basis points)
        feeDenominator = 10000;
        
        // Support BSC mainnet and testnet by default
        supportedChainIds[56] = true; // BSC Mainnet
        supportedChainIds[97] = true; // BSC Testnet
    }
    
    function createBridgeRequest(
        uint256 amount,
        uint256 targetChainId,
        address targetRecipient,
        string memory description
    ) external whenNotPaused whenNotEmergency nonReentrant {
        require(amount >= minBridgeAmount, "TokenBridge: amount below minimum");
        require(amount <= maxBridgeAmount, "TokenBridge: amount above maximum");
        require(supportedChainIds[targetChainId], "TokenBridge: unsupported target chain");
        require(targetRecipient != address(0), "TokenBridge: invalid target recipient");
        require(token.balanceOf(msg.sender) >= amount, "TokenBridge: insufficient balance");
        require(token.allowance(msg.sender, address(this)) >= amount, "TokenBridge: insufficient allowance");
        
        _bridgeRequestIds.increment();
        uint256 requestId = _bridgeRequestIds.current();
        
        bridgeRequests[requestId] = BridgeRequest({
            id: requestId,
            sender: msg.sender,
            amount: amount,
            targetChainId: targetChainId,
            targetRecipient: targetRecipient,
            isProcessed: false,
            isCancelled: false,
            createdAt: block.timestamp,
            processedAt: 0,
            description: description
        });
        
        userBridgeRequests[msg.sender].push(requestId);
        
        // Transfer tokens to bridge contract
        token.safeTransferFrom(msg.sender, address(this), amount);
        
        emit BridgeRequestCreated(requestId, msg.sender, amount, targetChainId, targetRecipient);
    }
    
    function createBatchBridgeRequest(
        uint256[] calldata amounts,
        address[] calldata recipients,
        uint256 targetChainId,
        string memory description
    ) external whenNotPaused whenNotEmergency nonReentrant {
        require(amounts.length > 0, "TokenBridge: amounts array cannot be empty");
        require(amounts.length <= 50, "TokenBridge: too many amounts");
        require(amounts.length == recipients.length, "TokenBridge: arrays length mismatch");
        require(supportedChainIds[targetChainId], "TokenBridge: unsupported target chain");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            require(amounts[i] >= minBridgeAmount, "TokenBridge: amount below minimum");
            require(amounts[i] <= maxBridgeAmount, "TokenBridge: amount above maximum");
            require(recipients[i] != address(0), "TokenBridge: invalid recipient");
            totalAmount += amounts[i];
        }
        
        require(token.balanceOf(msg.sender) >= totalAmount, "TokenBridge: insufficient balance");
        require(token.allowance(msg.sender, address(this)) >= totalAmount, "TokenBridge: insufficient allowance");
        
        _batchBridgeRequestIds.increment();
        uint256 requestId = _batchBridgeRequestIds.current();
        
        batchBridgeRequests[requestId] = BatchBridgeRequest({
            id: requestId,
            sender: msg.sender,
            amounts: amounts,
            recipients: recipients,
            targetChainId: targetChainId,
            isProcessed: false,
            isCancelled: false,
            createdAt: block.timestamp,
            processedAt: 0,
            description: description
        });
        
        userBatchBridgeRequests[msg.sender].push(requestId);
        
        // Transfer tokens to bridge contract
        token.safeTransferFrom(msg.sender, address(this), totalAmount);
        
        emit BatchBridgeRequestCreated(requestId, msg.sender, amounts, targetChainId, recipients);
    }
    
    function processBridgeRequest(uint256 requestId) external onlyOperator {
        BridgeRequest storage request = bridgeRequests[requestId];
        require(request.id != 0, "TokenBridge: bridge request does not exist");
        require(!request.isProcessed, "TokenBridge: request already processed");
        require(!request.isCancelled, "TokenBridge: request is cancelled");
        
        request.isProcessed = true;
        request.processedAt = block.timestamp;
        
        // In a real implementation, this would trigger cross-chain communication
        // For now, we just mark it as processed
        
        emit BridgeRequestProcessed(requestId, request.sender, request.amount, request.targetChainId);
    }
    
    function processBatchBridgeRequest(uint256 requestId) external onlyOperator {
        BatchBridgeRequest storage request = batchBridgeRequests[requestId];
        require(request.id != 0, "TokenBridge: batch bridge request does not exist");
        require(!request.isProcessed, "TokenBridge: request already processed");
        require(!request.isCancelled, "TokenBridge: request is cancelled");
        
        request.isProcessed = true;
        request.processedAt = block.timestamp;
        
        // In a real implementation, this would trigger cross-chain communication
        // For now, we just mark it as processed
        
        emit BatchBridgeRequestProcessed(requestId, request.sender, request.amounts, request.targetChainId);
    }
    
    function cancelBridgeRequest(uint256 requestId) external {
        BridgeRequest storage request = bridgeRequests[requestId];
        require(request.id != 0, "TokenBridge: bridge request does not exist");
        require(!request.isProcessed, "TokenBridge: request already processed");
        require(!request.isCancelled, "TokenBridge: request is cancelled");
        require(request.sender == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "TokenBridge: not authorized");
        
        request.isCancelled = true;
        
        // Return tokens to sender
        token.safeTransfer(request.sender, request.amount);
        
        emit BridgeRequestCancelled(requestId, request.sender, request.amount);
    }
    
    function cancelBatchBridgeRequest(uint256 requestId) external {
        BatchBridgeRequest storage request = batchBridgeRequests[requestId];
        require(request.id != 0, "TokenBridge: batch bridge request does not exist");
        require(!request.isProcessed, "TokenBridge: request already processed");
        require(!request.isCancelled, "TokenBridge: request is cancelled");
        require(request.sender == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "TokenBridge: not authorized");
        
        request.isCancelled = true;
        
        // Calculate total amount and return to sender
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < request.amounts.length; i++) {
            totalAmount += request.amounts[i];
        }
        
        token.safeTransfer(request.sender, totalAmount);
        
        emit BatchBridgeRequestCancelled(requestId, request.sender, request.amounts);
    }
    
    function setChainSupport(uint256 chainId, bool supported) external onlyAdmin {
        supportedChainIds[chainId] = supported;
        emit ChainSupported(chainId, supported);
    }
    
    function updateBridgeConfig(
        uint256 _minAmount,
        uint256 _maxAmount,
        uint256 _fee
    ) external onlyAdmin {
        require(_minAmount < _maxAmount, "TokenBridge: invalid amount range");
        require(_fee <= 1000, "TokenBridge: fee too high"); // Max 10%
        
        minBridgeAmount = _minAmount;
        maxBridgeAmount = _maxAmount;
        bridgeFee = _fee;
        
        emit BridgeConfigUpdated(_minAmount, _maxAmount, _fee);
    }
    
    function activateEmergencyMode() external onlyEmergency {
        emergencyMode = true;
        emit EmergencyModeActivated();
    }
    
    function deactivateEmergencyMode() external onlyEmergency {
        emergencyMode = false;
        emit EmergencyModeDeactivated();
    }
    
    function integrateContract(address contractAddress, string memory contractType) external onlyAdmin {
        require(contractAddress != address(0), "TokenBridge: invalid contract address");
        
        if (keccak256(abi.encodePacked(contractType)) == keccak256(abi.encodePacked("LockManager"))) {
            lockManager = contractAddress;
        } else if (keccak256(abi.encodePacked(contractType)) == keccak256(abi.encodePacked("TokenTimelock"))) {
            tokenTimelock = contractAddress;
        }
        
        emit ContractIntegrated(contractType, contractAddress);
    }
    
    function pause() external onlyAdmin {
        _pause();
    }
    
    function unpause() external onlyAdmin {
        _unpause();
    }
    
    function getBridgeRequest(uint256 requestId) external view returns (BridgeRequest memory) {
        return bridgeRequests[requestId];
    }
    
    function getBatchBridgeRequest(uint256 requestId) external view returns (BatchBridgeRequest memory) {
        return batchBridgeRequests[requestId];
    }
    
    function getUserBridgeRequests(address user) external view returns (uint256[] memory) {
        return userBridgeRequests[user];
    }
    
    function getUserBatchBridgeRequests(address user) external view returns (uint256[] memory) {
        return userBatchBridgeRequests[user];
    }
    
    function getTotalBridgeRequests() external view returns (uint256) {
        return _bridgeRequestIds.current();
    }
    
    function getTotalBatchBridgeRequests() external view returns (uint256) {
        return _batchBridgeRequestIds.current();
    }
    
    function getTotalLockedInBridge() external view returns (uint256) {
        uint256 total = 0;
        
        // Sum unprocessed bridge requests
        for (uint256 i = 1; i <= _bridgeRequestIds.current(); i++) {
            BridgeRequest memory request = bridgeRequests[i];
            if (!request.isProcessed && !request.isCancelled) {
                total += request.amount;
            }
        }
        
        // Sum unprocessed batch bridge requests
        for (uint256 i = 1; i <= _batchBridgeRequestIds.current(); i++) {
            BatchBridgeRequest memory request = batchBridgeRequests[i];
            if (!request.isProcessed && !request.isCancelled) {
                for (uint256 j = 0; j < request.amounts.length; j++) {
                    total += request.amounts[j];
                }
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
