import { describe, it, expect } from 'vitest';
import { Hashing_Service } from '../Hashing_Service';

describe('Hashing_Service', () => {
  it('should generate the same hash for the same input', () => {
    const data = { foo: 'bar', num: 42 };
    const hash1 = Hashing_Service.generate_Transaction_Hash(data);
    const hash2 = Hashing_Service.generate_Transaction_Hash(data);
    expect(hash1).toBe(hash2);
  });

  it('should generate different hashes for different input', () => {
    const data1 = { foo: 'bar' };
    const data2 = { foo: 'baz' };
    const hash1 = Hashing_Service.generate_Transaction_Hash(data1);
    const hash2 = Hashing_Service.generate_Transaction_Hash(data2);
    expect(hash1).not.toBe(hash2);
  });

  it('should compare hashes correctly', () => {
    const data = 'test';
    const hash = Hashing_Service.generate_Transaction_Hash(data);
    expect(Hashing_Service.compare_Hash(hash, hash)).toBe(true);
    expect(Hashing_Service.compare_Hash(hash, 'differenthash')).toBe(false);
  });
});
