const axios = require('axios');
const ethers = require('ethers');

class TokenHoldersFetcher {
  constructor(etherscanApiKey) {
    if (!etherscanApiKey) {
      throw new Error('Etherscan API key is required');
    }
    this.apiKey = etherscanApiKey;
    this.baseUrl = 'https://api.etherscan.io/api';
  }

  async getTokenHolders(tokenAddress, startBlock = 0, endBlock = 99999999) {
    try {
      // Validate token address
      if (!ethers.utils.isAddress(tokenAddress)) {
        throw new Error('Invalid token address');
      }

      const params = {
        module: 'token',
        action: 'tokenholderlist',
        contractaddress: tokenAddress,
        startblock: startBlock,
        endblock: endBlock,
        sort: 'asc',
        apikey: this.apiKey
      };

      const response = await axios.get(this.baseUrl, { params });

      if (response.data.status !== '1') {
        throw new Error(`API Error: ${response.data.message}`);
      }

      // Process and return token holders with their balances
      return response.data.result.map(holder => ({
        address: holder.TokenHolderAddress,
        balance: ethers.utils.formatUnits(holder.TokenHolderQuantity, 18) // Assumes 18 decimals, adjust if different
      }));
    } catch (error) {
      console.error('Error fetching token holders:', error.message);
      throw error;
    }
  }

  // Optional method to filter holders by minimum balance
  filterHoldersByMinBalance(holders, minBalance = 0) {
    return holders.filter(holder => parseFloat(holder.balance) >= minBalance);
  }
}

// Example usage
async function main() {
  const API_KEY = 'FGWEUDHV58HJ1ZYA8HV22G7PAJD9M2V9PN'; // Replace with your Etherscan API key
  const TOKEN_ADDRESS = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'; // Uniswap token as example

  try {
    const fetcher = new TokenHoldersFetcher(API_KEY);
    const holders = await fetcher.getTokenHolders(TOKEN_ADDRESS);
    
    console.log('Total Holders:', holders.length);
    console.log('Top 5 Holders:', holders.slice(0, 5));

    // Optional: Filter holders with balance > 100 tokens
    const majorHolders = fetcher.filterHoldersByMinBalance(holders, 100);
    console.log('Major Holders (>100 tokens):', majorHolders.length);
  } catch (error) {
    console.error('Execution failed:', error);
  }
}

// Uncomment to run
main();

module.exports = TokenHoldersFetcher;
