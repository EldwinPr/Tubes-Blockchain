// Hashing Service using Keccak256 (Ethereum Standard)
import { ethers } from 'ethers';

export class Hashing_Service {
    /**
     * @param set - Data set to be hashed (Object or String)
     * @returns string - The generated Keccak-256 hash (0x...)
     */
    static generate_Transaction_Hash(set: unknown): string {
        // 1. Serialize data to JSON string if it's an object
        // using 'json-stable-stringify' or similar is better for strict determinism,
        // but for now JSON.stringify is the standard we are using.
        const dataString = typeof set === 'string' ? set : JSON.stringify(set);
        
        // 2. Convert string to UTF-8 Bytes
        const bytes = ethers.toUtf8Bytes(dataString);

        // 3. Keccak-256 Hash
        return ethers.keccak256(bytes);
    }

    /**
     * @param hash1 - First hash string
     * @param hash2 - Second hash string
     * @returns boolean - True if hashes match
     */
    static compare_Hash(hash1: string, hash2: string): boolean {
        // Case-insensitive comparison for 0x hashes
        return hash1.toLowerCase() === hash2.toLowerCase();
    }
}
