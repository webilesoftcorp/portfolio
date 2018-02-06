pragma solidity ^0.4.15;

import './Ownable.sol';
import './SafeMath.sol';
import './Interfaces/ERC20.sol';
import './Interfaces/Mintable.sol';

/// @title Contract of ownable ERC20 token with possibility to mint
contract Token is Ownable, ERC20, Mintable, SafeMath {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint public totalSupply;
    uint public migrationToNewTokenStartedAt;
    uint256 public totalMigratedSupply;
    Token public newToken;
    Token public oldToken;

    event UpgradeFromOldToken(uint indexed _balance, address indexed _tokenHolder);
    event Transfer(address indexed _from, address indexed _to, uint _value);
    event Approval(address indexed _owner, address indexed _spender, uint _value);

    mapping(address => uint) public balances;
    mapping(address => mapping(address => uint)) allowed;

    function Token(string _name, string _symbol, uint8 _decimals) {
        owner = msg.sender;
        totalSupply = 0;
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalMigratedSupply = 0;
    }

    /// @notice Show total supply of all tokens
    /// @return Total supply of all tokens
    function totalSupply() constant returns (uint supply) {
        return totalSupply;
    }

    /// @notice Show token balance of `_wallet` address
    /// @param _wallet The address from which the balance will be retrieved
    /// @return The balance
    function balanceOf(address _wallet) constant returns (uint balance) {
        return balances[_wallet];
    }

    /// @notice send `_value` token to `_to` from msg.sender
    /// @param _to The address of the recipient
    /// @param _value The amount of token to be transferred
    /// @return Whether the transfer was successful or not
    function transfer(address _to, uint _value) returns (bool success) {
        require(migrationToNewTokenStartedAt == 0);
        require(balances[msg.sender] >= _value);
        if (balances[_to] + _value > balances[_to]) {
            balances[msg.sender] -= _value;
            balances[_to] += _value;
            Transfer(msg.sender, _to, _value);
            return true;
        } else {return false;}
    }

    /// @notice send `_value` token to `_to` from `_from` on the condition it is approved by `_from`
    /// @param _from The address of the sender
    /// @param _to The address of the recipient
    /// @param _value The amount of token to be transferred
    /// @return Whether the transfer was successful or not
    function transferFrom(address _from, address _to, uint _value) returns (bool success) {
        require(migrationToNewTokenStartedAt == 0);
        require(allowed[_from][_to] >= _value && balances[_from] >= _value);
        if (balances[_to] + _value > balances[_to]) {
            balances[_to] += _value;
            balances[_from] -= _value;
            allowed[_from][_to] -= _value;
            Transfer(_from, _to, _value);
            return true;
        } else { return false; }
    }

    /// @notice `msg.sender` approves `_addr` to spend `_value` tokens
    /// @param _spender The address of the account able to transfer the tokens
    /// @param _value The amount of tokens to be approved for transfer
    /// @return Whether the approval was successful or not
    function approve(address _spender, uint _value) returns (bool success) {
        require(migrationToNewTokenStartedAt == 0);
        require(balances[msg.sender] >= _value);
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    /// @notice Show how much allowed to transfer from `_from` to `_to`
    /// @param _owner The address of the account owning tokens
    /// @param _spender The address of the account able to transfer the tokens
    /// @return Amount of remaining tokens allowed to spent
    function allowance(address _owner, address _spender) constant returns (uint remaining) {
        return allowed[_owner][_spender];
    }

    /// @notice Mint `_amount` of tokens and add them to owner balance
    /// @param _amount Number of tokens to mint
    function mint(uint _amount) onlyOwner {
        require(migrationToNewTokenStartedAt == 0);
        totalSupply += _amount;
        balances[owner] += _amount;
    }

    /// @notice Sets address of token migrate to
    /// @param _newTokenAddress address of new token
    function prepareMigrationTo(address _newTokenAddress) external onlyOwner {
      require(migrationToNewTokenStartedAt == 0);
      require(_newTokenAddress != 0x0);
      newToken = Token(_newTokenAddress);
    }

    /// @notice Sets address of token migrate form
    /// @param _oldTokenAddress address of old token
    function prepareMigrationFrom(address _oldTokenAddress) external onlyOwner {
      require(migrationToNewTokenStartedAt == 0);
      require(_oldTokenAddress != 0x0);
      require(Token(_oldTokenAddress).migrationToNewTokenStartedAt() == 0);
      oldToken = Token(_oldTokenAddress);
    }

    /// @notice Starts migration process by changing `migrationToNewTokenStartedAt` value
    function enableMigrationToNewToken() external onlyOwner {
      require(address(newToken) != 0x0);
      require(address(newToken.oldToken()) == address(this));
      migrationToNewTokenStartedAt = now;
    }

    /// @notice Migrates all tokens of `msg.sender` to new token
    function migrateToNewToken() external {
      require(migrationToNewTokenStartedAt != 0);
      uint balance = balances[msg.sender];
      totalMigratedSupply = safeAdd(balances[msg.sender], totalMigratedSupply);
      totalSupply = safeSub(totalSupply, balances[msg.sender]);
      balances[msg.sender] = 0;
      newToken.migrateFromOldToken(balance, msg.sender);
    }

    /// @notice Migrate amount of tokens form old token to current
    /// @param _balance Amount of tokens to migrate
    /// @param _tokenHolder Address of old tokens holder
    function migrateFromOldToken(uint _balance, address _tokenHolder) external {
      require(oldToken.migrationToNewTokenStartedAt() != 0);
      require(msg.sender == address(oldToken));
      totalSupply = safeAdd(totalSupply, _balance);
      balances[_tokenHolder] = safeAdd(balances[_tokenHolder], _balance);
      UpgradeFromOldToken(_balance, _tokenHolder);
    }
}
