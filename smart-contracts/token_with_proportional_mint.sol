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
    uint private initialInvestorsTotalSupply;


    event UpgradeFromOldToken(uint indexed _balance, address indexed _tokenHolder);
    event Transfer(address indexed _from, address indexed _to, uint _value);
    event Approval(address indexed _owner, address indexed _spender, uint _value);

    mapping(address => uint) public balances;
    mapping(address => uint) public validAdditionalTokenSupply;
    mapping(address => mapping(address => uint)) allowed;

    function Token(string _name, string _symbol, uint8 _decimals) public {
      owner = msg.sender;
      name = _name;
      symbol = _symbol;
      decimals = _decimals;
        totalSupply = 0;
    }

    /// @notice Generete tokens on initial investors balances
    /// @param _initialInvestors Addresses of initial investors
    /// @param _initialBalances Balances of initial investors
    function generateTokens(address[] _initialInvestors, uint[] _initialBalances) public onlyOwner {
        require(_initialInvestors.length == _initialBalances.length);
        require(totalSupply == 0);

      for (uint i = 0; i < _initialBalances.length; i++) {
        totalSupply += _initialBalances[i];
        balances[_initialInvestors[i]] = _initialBalances[i];
      }

      initialInvestorsTotalSupply = totalSupply;
    }

    /// @notice Show total supply of all tokens
    /// @return Total supply of all tokens
    // function totalSupply() public constant returns (uint supply) {
    //     return totalSupply;
    // }

    /// @notice Show token balance of `_wallet` address
    /// @param _wallet The address from which the balance will be retrieved
    /// @return The balance
    function balanceOf(address _wallet) public constant returns (uint balance) {
        return balances[_wallet];
    }

    /// @notice send `_value` token to `_to` from msg.sender
    /// @param _to The address of the recipient
    /// @param _value The amount of token to be transferred
    /// @return Whether the transfer was successful or not
    function transfer(address _to, uint _value) public returns (bool success) {
      require(checkIfdividendsGeted(msg.sender));
      require(checkIfdividendsGeted(_to));
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
    function transferFrom(address _from, address _to, uint _value) public returns (bool success) {
      require(checkIfdividendsGeted(_from));
      require(checkIfdividendsGeted(_to));
      require(allowed[_from][_to] >= _value && balances[_from] >= _value);
      if (balances[_to] + _value > balances[_to]) {
          balances[_to] += _value;
          balances[_from] -= _value;
          allowed[_from][_to] -= _value;
          Transfer(_from, _to, _value);
          return true;
      } else {return false;}
    }

    /// @notice `msg.sender` approves `_addr` to spend `_value` tokens
    /// @param _spender The address of the account able to transfer the tokens
    /// @param _value The amount of tokens to be approved for transfer
    /// @return Whether the approval was successful or not
    function approve(address _spender, uint _value) public returns (bool success) {
      require(balances[msg.sender] >= _value);
      allowed[msg.sender][_spender] = _value;
      Approval(msg.sender, _spender, _value);
      return true;
    }

    /// @notice Show how much allowed to transfer from `_from` to `_to`
    /// @param _owner The address of the account owning tokens
    /// @param _spender The address of the account able to transfer the tokens
    /// @return Amount of remaining tokens allowed to spent
    function allowance(address _owner, address _spender) public constant returns (uint remaining) {
      return allowed[_owner][_spender];
    }

    /// @notice Mint `_amount` of tokens and add them to owner balance
    /// @param _amount Number of tokens to mint
    function mint(uint _amount) public onlyOwner {
      require(totalSupply > 0);
      totalSupply += _amount;
      balances[this] += _amount;
    }

    /// @notice Update token balance if there is not received
    function getDividends() external {
      require(!checkIfdividendsGeted(msg.sender));
      uint userActuallsupply = safeAdd(initialInvestorsTotalSupply, validAdditionalTokenSupply[msg.sender]);
      uint absoluteUserDiff = safeSub(totalSupply, userActuallsupply);
      uint currentUserDiff = safeMul(absoluteUserDiff, balances[msg.sender]);
      uint mintedValue = safeDiv(currentUserDiff, userActuallsupply);
      validAdditionalTokenSupply[msg.sender] = totalSupply;
      balances[this] -= mintedValue;
      balances[msg.sender] += mintedValue;
      Transfer(this, msg.sender, mintedValue);
    }

    /// @dev Check if current token holder has updated balance after additional token generation
    /// @param _tokenHolder address of token holder that should be checked
    function checkIfdividendsGeted(address _tokenHolder)  internal constant returns (bool isGeted) {
      uint currentDiff = safeSub(totalSupply, initialInvestorsTotalSupply);
      uint holderDiff = validAdditionalTokenSupply[_tokenHolder];
      isGeted = (currentDiff == holderDiff);
    }

}
