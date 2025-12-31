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
});
