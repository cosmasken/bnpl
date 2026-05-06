// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract BitPayTreasury {
    IERC20 public immutable musd;
    IERC20 public immutable fakeUsdc;
    
    mapping(address => uint256) public userLocked;
    uint256 public totalLocked;
    
    event Locked(address indexed user, uint256 musdAmount, uint256 usdcCredit);
    event Repaid(address indexed user, uint256 amount);
    
    constructor(address _musd, address _fakeUsdc) {
        musd = IERC20(_musd);
        fakeUsdc = IERC20(_fakeUsdc);
    }
    
    function lockMUSD(uint256 amount) external {
        musd.transferFrom(msg.sender, address(this), amount);
        userLocked[msg.sender] += amount;
        totalLocked += amount;
        fakeUsdc.transfer(msg.sender, amount);
        emit Locked(msg.sender, amount, amount);
    }
    
    function repayMUSD(uint256 amount) external {
        require(userLocked[msg.sender] >= amount, "Insufficient locked");
        musd.transferFrom(msg.sender, address(this), amount);
        userLocked[msg.sender] -= amount;
        totalLocked -= amount;
        emit Repaid(msg.sender, amount);
    }
}
