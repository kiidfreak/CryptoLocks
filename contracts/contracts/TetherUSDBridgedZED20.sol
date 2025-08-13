// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TetherUSDBridgedZED20 is ERC20, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    uint256 public maxSupply;
    bool public maxSupplyLocked;
    
    event MaxSupplyUpdated(uint256 oldMaxSupply, uint256 newMaxSupply);
    event MaxSupplyLocked();
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(address indexed from, uint256 amount, string reason);
    
    constructor() ERC20("Tether USD Bridged", "USDT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        
        maxSupply = 1000000000 * 10**decimals(); // 1 billion USDT
    }
    
    modifier onlyMinter() {
        require(hasRole(MINTER_ROLE, msg.sender), "TetherUSDBridgedZED20: must have minter role");
        _;
    }
    
    modifier onlyBurner() {
        require(hasRole(BURNER_ROLE, msg.sender), "TetherUSDBridgedZED20: must have burner role");
        _;
    }
    
    modifier onlyPauser() {
        require(hasRole(PAUSER_ROLE, msg.sender), "TetherUSDBridgedZED20: must have pauser role");
        _;
    }
    
    function mint(address to, uint256 amount, string memory reason) 
        external 
        onlyMinter 
        whenNotPaused 
        nonReentrant 
    {
        require(to != address(0), "TetherUSDBridgedZED20: cannot mint to zero address");
        require(amount > 0, "TetherUSDBridgedZED20: amount must be greater than 0");
        require(totalSupply() + amount <= maxSupply, "TetherUSDBridgedZED20: would exceed max supply");
        
        _mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }
    
    function burn(address from, uint256 amount, string memory reason) 
        external 
        onlyBurner 
        whenNotPaused 
        nonReentrant 
    {
        require(from != address(0), "TetherUSDBridgedZED20: cannot burn from zero address");
        require(amount > 0, "TetherUSDBridgedZED20: amount must be greater than 0");
        require(balanceOf(from) >= amount, "TetherUSDBridgedZED20: insufficient balance to burn");
        
        _burn(from, amount);
        emit TokensBurned(from, amount, reason);
    }
    
    function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) 
        external 
        whenNotPaused 
        nonReentrant 
    {
        require(recipients.length == amounts.length, "TetherUSDBridgedZED20: arrays length mismatch");
        require(recipients.length > 0, "TetherUSDBridgedZED20: empty arrays");
        require(recipients.length <= 100, "TetherUSDBridgedZED20: too many recipients");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(balanceOf(msg.sender) >= totalAmount, "TetherUSDBridgedZED20: insufficient balance");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "TetherUSDBridgedZED20: cannot transfer to zero address");
            require(amounts[i] > 0, "TetherUSDBridgedZED20: amount must be greater than 0");
            
            _transfer(msg.sender, recipients[i], amounts[i]);
        }
    }
    
    function setMaxSupply(uint256 newMaxSupply) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!maxSupplyLocked, "TetherUSDBridgedZED20: max supply is locked");
        require(newMaxSupply >= totalSupply(), "TetherUSDBridgedZED20: new max supply too low");
        
        uint256 oldMaxSupply = maxSupply;
        maxSupply = newMaxSupply;
        
        emit MaxSupplyUpdated(oldMaxSupply, newMaxSupply);
    }
    
    function lockMaxSupply() external onlyRole(DEFAULT_ADMIN_ROLE) {
        maxSupplyLocked = true;
        emit MaxSupplyLocked();
    }
    
    function pause() external onlyPauser {
        _pause();
    }
    
    function unpause() external onlyPauser {
        _unpause();
    }
    
    function grantRole(bytes32 role, address account) 
        public 
        override 
        onlyRole(getRoleAdmin(role)) 
    {
        super.grantRole(role, account);
    }
    
    function revokeRole(bytes32 role, address account) 
        public 
        override 
        onlyRole(getRoleAdmin(role)) 
    {
        super.revokeRole(role, account);
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
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
