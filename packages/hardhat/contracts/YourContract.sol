pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ICallable {
    function tokenCallback(address _from, uint256 _tokens, bytes calldata _data) external returns (bool);
}

contract Acid is ERC20, Ownable {
    uint256 private constant FLOAT_SCALAR = 2**64;
    uint256 private _stakeFee = 2; // 2% per transaction
    uint256 private _minStakeAmount = 1e19; // 10

    address[] private _stakingUsers;
    mapping(address => uint256) private _userArrayIndex;

    struct User {
        bool whitelisted;
        uint256 staked;
        int256 scaledPayout;
    }

struct Info {
    uint256 totalStaked;
    mapping(address => User) users;
    uint256 scaledPayoutPerToken;
    address[] _stakingUsers;
    mapping(address => uint256) userArrayIndex;
}

    Info private info;

    event Whitelist(address indexed user, bool status);
    event Stake(address indexed owner, uint256 tokens);
    event Unstake(address indexed owner, uint256 tokens);
    event Collect(address indexed owner, uint256 tokens);
    event Fee(uint256 tokens);

constructor(uint256 initialSupply) ERC20("ACID", "ACID") {
    _mint(msg.sender, initialSupply);
    emit Transfer(address(0x0), msg.sender, initialSupply);
     info._stakingUsers = new address[](0);
}

    function whitelist(address _user, bool _status) public {
        require(msg.sender == _user || msg.sender == owner(), "Invalid whitelist caller");
        info.users[_user].whitelisted = _status;
        emit Whitelist(_user, _status);
    }

function stake(uint256 _tokens) external returns (bool) {
    require(_tokens >= _minStakeAmount, "Stake amount is too low");
    require(balanceOf(msg.sender) >= _tokens, "Insufficient balance for stake");
    User storage user = info.users[msg.sender];
    if (!user.whitelisted) {
        user.whitelisted = true;
        emit Whitelist(msg.sender, true);
    }
if (user.staked == 0) {
    uint256 length = info._stakingUsers.length;
    info._stakingUsers.push(msg.sender);
    info.userArrayIndex[msg.sender] = length;
}
    require(super.transfer(address(this), _applyStakeFee(msg.sender, _tokens)), "Stake transfer failed");
    user.staked += _tokens;
    info.totalStaked += _tokens;
    user.scaledPayout += int256(info.scaledPayoutPerToken * _tokens);
    emit Stake(msg.sender, _tokens);
    return true;
}

function unstake(uint256 _tokens) external returns (bool) {
require(_tokens <= balanceOfStaked(msg.sender), "Insufficient staked balance for unstake");
User storage user = info.users[msg.sender];
user.staked -= _tokens;
info.totalStaked -= _tokens;
user.scaledPayout -= int256(info.scaledPayoutPerToken * _tokens);
uint256 withdrawAmount = _tokens;
if (_stakeFee > 0) {
uint256 fee = (_tokens * _stakeFee) / 100;
withdrawAmount -= fee;
super.transfer(owner(), fee);
emit Fee(fee);
}
require(super.transfer(msg.sender, withdrawAmount), "Unstake transfer failed");
emit Unstake(msg.sender, _tokens);
return true;
}

function collect() external returns (bool) {
    User storage user = info.users[msg.sender];
    require(user.staked > 0, "No staked balance to collect");
    uint256 payout = uint256(int256(info.scaledPayoutPerToken * user.staked) - user.scaledPayout) / FLOAT_SCALAR;
    user.scaledPayout = int256(info.scaledPayoutPerToken * user.staked);
    require(super.transfer(msg.sender, payout), "Collect transfer failed");
    emit Collect(msg.sender, payout);
    return true;
}

function balanceOfStaked(address _user) public view returns (uint256) {
    return info.users[_user].staked;
}

function setStakeFee(uint256 _fee) external onlyOwner {
    require(_fee <= 10, "Stake fee is too high");
    _stakeFee = _fee;
}

function setMinStakeAmount(uint256 _amount) external onlyOwner {
    _minStakeAmount = _amount;
}

function _applyStakeFee(address _from, uint256 _tokens) private returns (uint256) {
    if (_stakeFee == 0) {
        return _tokens;
    }
    uint256 fee = (_tokens * _stakeFee) / 100;
    super.transfer(owner(), fee);
    emit Fee(fee);
    return _tokens - fee;
}

function _updateScaledPayoutPerToken(uint256 _stakedDelta, bool _add) private {
    if (info.totalStaked == 0) {
        return;
    }
    uint256 poolPayoutDelta = (_stakedDelta * FLOAT_SCALAR) / info.totalStaked;
    if (_add) {
        info.scaledPayoutPerToken += poolPayoutDelta;
    } else {
        info.scaledPayoutPerToken -= poolPayoutDelta;
    }
}

function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
    _updateScaledPayoutPerToken(0, true);
    return super.transfer(recipient, amount);
}

function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
    _updateScaledPayoutPerToken(0, true);
    return super.transferFrom(sender, recipient, amount);
}

function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
    _updateScaledPayoutPerToken(info.users[from].staked + info.users[to].staked, false);
}

}