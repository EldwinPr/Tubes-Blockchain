import { Blockchain_Service } from '../src/lib/server/services/Blockchain_Service';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    console.log("Starting Oracle Worker...");
    
    const bcService = new Blockchain_Service();
    
    // Start the real-time listener
    await bcService.start_Oracle_Listener();

    // Keep the process alive
    process.on('SIGINT', () => {
        console.log("Shutting down Oracle Worker...");
        process.exit();
    });
}

main().catch(err => {
    console.error("Oracle Worker crashed:", err);
});
