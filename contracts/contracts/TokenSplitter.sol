// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TokenSplitter is ReentrancyGuard, AccessControl {
    using SafeERC20 for IERC20;
    using Counters for Counters.Counter;
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    IERC20 public immutable token;
    
    struct Recipient {
        uint256 id;
        address wallet;
        uint256 percentage; // Basis points (10000 = 100%)
        string description;
        bool isActive;
        uint256 totalReceived;
        uint256 lastDistribution;
    }
    
    struct Distribution {
        uint256 id;
        uint256 totalAmount;
        uint256 timestamp;
        uint256 recipientCount;
        string description;
    }
    
    Counters.Counter private _recipientIds;
    Counters.Counter private _distributionIds;
    
    mapping(uint256 => Recipient) public recipients;
    mapping(uint256 => Distribution) public distributions;
    mapping(uint256 => mapping(uint256 => uint256)) public distributionAmounts; // distributionId => recipientId => amount
    
    uint256 public totalPercentage;
    uint256 public minDistributionAmount;
    bool public distributionPaused;
    
    event RecipientAdded(uint256 indexed recipientId, address indexed wallet, uint256 percentage, string description);
    event RecipientUpdated(uint256 indexed recipientId, address indexed wallet, uint256 percentage, string description);
    event RecipientRemoved(uint256 indexed recipientId, address indexed wallet);
    event DistributionExecuted(uint256 indexed distributionId, uint256 totalAmount, uint256 recipientCount);
    event RecipientPaid(uint256 indexed distributionId, uint256 indexed recipientId, address indexed wallet, uint256 amount);
    event MinDistributionAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event DistributionPaused(bool paused);
    
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "TokenSplitter: must have admin role");
        _;
    }
    
    modifier onlyOperator() {
        require(hasRole(ADMIN_ROLE, msg.sender) || hasRole(OPERATOR_ROLE, msg.sender), "TokenSplitter: must have operator role");
        _;
    }
    
    modifier whenNotPaused() {
        require(!distributionPaused, "TokenSplitter: distribution is paused");
        _;
    }
    
    modifier recipientExists(uint256 recipientId) {
        require(recipients[recipientId].id != 0, "TokenSplitter: recipient does not exist");
        _;
    }
    
    constructor(address _token) {
        require(_token != address(0), "TokenSplitter: invalid token address");
        token = IERC20(_token);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        
        minDistributionAmount = 1000 * 10**18; // 1000 tokens minimum
    }
    
    function addRecipient(
        address wallet,
        uint256 percentage,
        string memory description
    ) external onlyAdmin {
        require(wallet != address(0), "TokenSplitter: invalid wallet address");
        require(percentage > 0, "TokenSplitter: percentage must be greater than 0");
        require(percentage <= 10000, "TokenSplitter: percentage cannot exceed 100%");
        require(totalPercentage + percentage <= 10000, "TokenSplitter: total percentage would exceed 100%");
        
        _recipientIds.increment();
        uint256 recipientId = _recipientIds.current();
        
        recipients[recipientId] = Recipient({
            id: recipientId,
            wallet: wallet,
            percentage: percentage,
            description: description,
            isActive: true,
            totalReceived: 0,
            lastDistribution: 0
        });
        
        totalPercentage += percentage;
        
        emit RecipientAdded(recipientId, wallet, percentage, description);
    }
    
    function updateRecipient(
        uint256 recipientId,
        address wallet,
        uint256 percentage,
        string memory description
    ) external onlyAdmin recipientExists(recipientId) {
        Recipient storage recipient = recipients[recipientId];
        require(wallet != address(0), "TokenSplitter: invalid wallet address");
        require(percentage > 0, "TokenSplitter: percentage must be greater than 0");
        require(percentage <= 10000, "TokenSplitter: percentage cannot exceed 100%");
        
        uint256 oldPercentage = recipient.percentage;
        uint256 newTotalPercentage = totalPercentage - oldPercentage + percentage;
        require(newTotalPercentage <= 10000, "TokenSplitter: total percentage would exceed 100%");
        
        recipient.wallet = wallet;
        recipient.percentage = percentage;
        recipient.description = description;
        
        totalPercentage = newTotalPercentage;
        
        emit RecipientUpdated(recipientId, wallet, percentage, description);
    }
    
    function removeRecipient(uint256 recipientId) external onlyAdmin recipientExists(recipientId) {
        Recipient storage recipient = recipients[recipientId];
        require(recipient.isActive, "TokenSplitter: recipient already inactive");
        
        recipient.isActive = false;
        totalPercentage -= recipient.percentage;
        
        emit RecipientRemoved(recipientId, recipient.wallet);
    }
    
    function executeDistribution(
        uint256 amount,
        string memory description
    ) external onlyOperator whenNotPaused nonReentrant {
        require(amount >= minDistributionAmount, "TokenSplitter: amount below minimum");
        require(amount > 0, "TokenSplitter: amount must be greater than 0");
        require(totalPercentage > 0, "TokenSplitter: no active recipients");
        require(token.balanceOf(msg.sender) >= amount, "TokenSplitter: insufficient balance");
        require(token.allowance(msg.sender, address(this)) >= amount, "TokenSplitter: insufficient allowance");
        
        // Transfer tokens to this contract
        token.safeTransferFrom(msg.sender, address(this), amount);
        
        _distributionIds.increment();
        uint256 distributionId = _distributionIds.current();
        
        uint256 activeRecipientCount = 0;
        uint256 totalDistributed = 0;
        
        // Create distribution record
        distributions[distributionId] = Distribution({
            id: distributionId,
            totalAmount: amount,
            timestamp: block.timestamp,
            recipientCount: 0,
            description: description
        });
        
        // Distribute to each active recipient
        for (uint256 i = 1; i <= _recipientIds.current(); i++) {
            Recipient storage recipient = recipients[i];
            if (recipient.isActive && recipient.percentage > 0) {
                uint256 recipientAmount = (amount * recipient.percentage) / 10000;
                if (recipientAmount > 0) {
                    token.safeTransfer(recipient.wallet, recipientAmount);
                    
                    recipient.totalReceived += recipientAmount;
                    recipient.lastDistribution = block.timestamp;
                    
                    distributionAmounts[distributionId][i] = recipientAmount;
                    totalDistributed += recipientAmount;
                    activeRecipientCount++;
                    
                    emit RecipientPaid(distributionId, i, recipient.wallet, recipientAmount);
                }
            }
        }
        
        distributions[distributionId].recipientCount = activeRecipientCount;
        
        emit DistributionExecuted(distributionId, amount, activeRecipientCount);
        
        // Return any remaining tokens due to rounding
        uint256 remaining = amount - totalDistributed;
        if (remaining > 0) {
            token.safeTransfer(msg.sender, remaining);
        }
    }
    
    function setMinDistributionAmount(uint256 newAmount) external onlyAdmin {
        require(newAmount > 0, "TokenSplitter: amount must be greater than 0");
        
        uint256 oldAmount = minDistributionAmount;
        minDistributionAmount = newAmount;
        
        emit MinDistributionAmountUpdated(oldAmount, newAmount);
    }
    
    function pauseDistribution() external onlyAdmin {
        distributionPaused = true;
        emit DistributionPaused(true);
    }
    
    function unpauseDistribution() external onlyAdmin {
        distributionPaused = false;
        emit DistributionPaused(false);
    }
    
    function getRecipient(uint256 recipientId) external view returns (Recipient memory) {
        return recipients[recipientId];
    }
    
    function getDistribution(uint256 distributionId) external view returns (Distribution memory) {
        return distributions[distributionId];
    }
    
    function getDistributionAmount(uint256 distributionId, uint256 recipientId) external view returns (uint256) {
        return distributionAmounts[distributionId][recipientId];
    }
    
    function getActiveRecipients() external view returns (Recipient[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= _recipientIds.current(); i++) {
            if (recipients[i].isActive) {
                activeCount++;
            }
        }
        
        Recipient[] memory activeRecipients = new Recipient[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= _recipientIds.current(); i++) {
            if (recipients[i].isActive) {
                activeRecipients[currentIndex] = recipients[i];
                currentIndex++;
            }
        }
        
        return activeRecipients;
    }
    
    function getTotalRecipients() external view returns (uint256) {
        return _recipientIds.current();
    }
    
    function getTotalDistributions() external view returns (uint256) {
        return _distributionIds.current();
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
