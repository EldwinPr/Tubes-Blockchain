import { describe, it, expect } from 'vitest';
import { Agent_Service } from '../Agent_Service';

// NOTE: Replace these with actual IDs from seeded database
const TEST_AGENT_ID = '238ba57c-fd88-4917-b0af-d71b110782f3';
const TEST_ITEM_ID = '01896423-7eec-4b44-8230-89b881b37089';

describe('Agent_Service', () => {
  it('input_Transaction should create a transaction and return the correct response structure', async () => {
    const agentService = new Agent_Service();
    const payload = {
      agent_Id: TEST_AGENT_ID,
      item_Id: TEST_ITEM_ID,
      qty: 2
    };

    let result;
    try {
      result = await agentService.input_Transaction(payload);
    } catch (e) {
      // If the test fails due to missing data, print the error
      console.error(e);
      throw e;
    }

    expect(result).toHaveProperty('transaction_Id');
    expect(result).toHaveProperty('payload');
    expect(result).toHaveProperty('signature');
    expect(result.payload).toHaveProperty('items');
    expect(result.payload).toHaveProperty('total_Amt');
    expect(Array.isArray(result.payload.items)).toBe(true);
    expect(result.payload.items[0]).toHaveProperty('itemId');
    expect(result.payload.items[0]).toHaveProperty('qty');
    expect(result.payload.items[0]).toHaveProperty('price');
  });

  it('get_Items should return the correct item for a valid item_Id', async () => {
    const agentService = new Agent_Service();
    const item = await agentService.get_Items(TEST_ITEM_ID);
    expect(item).toBeDefined();
    expect(item).toHaveProperty('item_Id', TEST_ITEM_ID);
  });

  it('get_Items should return null for an invalid item_Id', async () => {
    const agentService = new Agent_Service();
    const item = await agentService.get_Items('non-existent-item-id');
    expect(item).toBeNull();
  });

  it('get_Items should return a list of items when called without item_Id', async () => {
    const agentService = new Agent_Service();
    const items = await agentService.get_Items();
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toHaveProperty('item_Id');
  });
  it('get_Transactions should return a list of transactions for a valid agent_Id', async () => {
    const agentService = new Agent_Service();
    const transactions = await agentService.get_Transactions(TEST_AGENT_ID);
    expect(Array.isArray(transactions)).toBe(true);
    // Optionally check structure if you expect at least one transaction
    if (transactions.length > 0) {
      expect(transactions[0]).toHaveProperty('transaction_Id');
      expect(transactions[0]).toHaveProperty('agent_Id', TEST_AGENT_ID);
    }
  });
  it('get_Wallet should return the correct wallet address for a valid user_Id', async () => {
    const agentService = new Agent_Service();
    // NOTE: Replace with a valid user_Id and expected wallet address from your seeded database
    const TEST_USER_ID = TEST_AGENT_ID;
    const expectedWallet = '0x1234567890123456789012345678901234567890'; // Example, update as needed
    const wallet = await agentService.get_Wallet(TEST_USER_ID);
    expect(typeof wallet).toBe('string');
    expect(wallet).toBe(expectedWallet);
  });
});
