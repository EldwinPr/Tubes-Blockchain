import { describe, it, expect, beforeAll } from 'vitest';
import { Agent_Service } from '../Agent_Service';
import { prisma } from '../../prisma';

describe('Agent_Service', () => {
  let TEST_AGENT_ID: string;
  let TEST_ITEM_ID: string;
  let agentService: Agent_Service;
  let expectedWallet: string;

  beforeAll(async () => {
    agentService = new Agent_Service();

    // Fetch a valid Agent
    const agent = await prisma.user.findFirst({
        where: { role: 'Agent' }
    });
    
    if (!agent) {
        throw new Error("No Agent found in DB. Run seed first.");
    }
    TEST_AGENT_ID = agent.user_Id;
    expectedWallet = agent.wallet_Address;

    // Fetch a valid Item
    const item = await prisma.item.findFirst();
    if (!item) {
        throw new Error("No Item found in DB. Run seed first.");
    }
    TEST_ITEM_ID = item.item_Id;
  });

  it('input_Transaction should create a transaction and return the correct response structure', async () => {
    const payload = {
      agent_Id: TEST_AGENT_ID,
      items: [
        {
          item_Id: TEST_ITEM_ID,
          qty: 2
        }
      ]
    };

    let result;
    try {
      result = await agentService.input_Transaction(payload);
    } catch (e) {
      console.error(e);
      throw e;
    }

    expect(result).toHaveProperty('payload');
    expect(result).toHaveProperty('hash');
    expect(result.payload).toHaveProperty('transaction_Id');
    expect(result.payload).toHaveProperty('total_Amt');
    expect(result.payload).toHaveProperty('total_Qty');
    expect(result.payload).toHaveProperty('timestamp');
  });

  it('get_Items should return the correct item for a valid item_Id', async () => {
    const item = await agentService.get_Items(TEST_ITEM_ID);
    expect(item).toBeDefined();
    // When fetching a single item, it shouldn't be an array
    expect(Array.isArray(item)).toBe(false); 
    expect(item).toHaveProperty('item_Id', TEST_ITEM_ID);
  });

  it('get_Items should return null for an invalid item_Id', async () => {
    const item = await agentService.get_Items('00000000-0000-0000-0000-000000000000'); // Valid UUID format but non-existent
    expect(item).toBeNull();
  });

  it('get_Items should return a list of items when called without item_Id', async () => {
    const items = await agentService.get_Items();
    expect(Array.isArray(items)).toBe(true);
    // @ts-ignore
    expect(items.length).toBeGreaterThan(0);
    // @ts-ignore
    expect(items[0]).toHaveProperty('item_Id');
  });

  it('get_Transactions should return a list of transactions for a valid agent_Id', async () => {
    const transactions = await agentService.get_Transactions(TEST_AGENT_ID);
    expect(Array.isArray(transactions)).toBe(true);
    // Note: We just created a transaction in the first test, so this should at least have one.
    expect(transactions.length).toBeGreaterThan(0);
    expect(transactions[0]).toHaveProperty('transaction_Id');
    expect(transactions[0]).toHaveProperty('agent_Id', TEST_AGENT_ID);
  });

  it('get_Wallet should return the correct wallet object for a valid user_Id', async () => {
    const walletData = await agentService.get_Wallet(TEST_AGENT_ID);
    
    expect(walletData).not.toBeNull();
    expect(walletData).toHaveProperty('wallet_Address');
    expect(walletData?.wallet_Address).toBe(expectedWallet);
    expect(walletData).toHaveProperty('name');
    expect(walletData).toHaveProperty('role', 'Agent');
  });
});
