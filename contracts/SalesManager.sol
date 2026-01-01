// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SalesManager {
    // Owner of the contract (Admin)
    address public owner;
    
    // Trusted Oracle Address
    address public oracle;

    struct Payload {
        string transactionId;
        uint256 totalAmt;
        uint256 totalQty;
        uint256 timestamp;
    }

    struct Sale {
        address agent;
        Payload payload;
        string txHash; // The hash calculated by backend
        bool isVerified;
        bool isPaid;
    }

    // Mapping from Backend UUID to Sale Data
    mapping(string => Sale) public sales;
    
    // Events
    event SaleRecorded(string transactionId, address indexed agent, string hash);
    event SaleVerificationResult(string transactionId, bool success, string reason);
    event PaymentUpdated(string indexed transactionId, bool isPaid);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can call this");
        _;
    }

    constructor(address _oracle) {
        owner = msg.sender;
        oracle = _oracle;
    }

    function setOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
    }

    /**
     * @dev Called by Agent (Frontend) to record a sale.
     * @param _payload - The struct containing transaction details.
     * @param _hash - The payload hash from the backend.
     */
    function record_sale(
        Payload memory _payload, 
        string memory _hash
    ) external {
        // Prevent duplicate recording
        require(sales[_payload.transactionId].payload.timestamp == 0, "Transaction already recorded");

        sales[_payload.transactionId] = Sale({
            agent: msg.sender,
            payload: _payload,
            txHash: _hash,
            isVerified: false,
            isPaid: false
        });

        emit SaleRecorded(_payload.transactionId, msg.sender, _hash);
    }

    /**
     * @dev Called by Oracle (Backend) to provide "Truth" data.
     * The Contract compares the stored data with the Oracle's data.
     * 
     * @param transactionId - The UUID to verify.
     * @param oracleHash - The Hash from the Database.
     * @param oracleWallet - The Agent Wallet from the Database.
     */
    function verify_transaction(
        string memory transactionId, 
        string memory oracleHash, 
        address oracleWallet
    ) external onlyOracle {
        Sale storage s = sales[transactionId];
        require(s.payload.timestamp != 0, "Transaction not found");
        
        // Compare Hash (Strings must be hashed to compare)
        bool hashMatch = keccak256(bytes(s.txHash)) == keccak256(bytes(oracleHash));
        // Compare Wallet
        bool walletMatch = s.agent == oracleWallet;

        if (hashMatch && walletMatch) {
            s.isVerified = true;
            emit SaleVerificationResult(transactionId, true, "Verified");
        } else {
            // delete sales[transactionId]; 
            
            string memory reason = "";
            if (!hashMatch && !walletMatch) reason = "Hash and Wallet Mismatch";
            else if (!hashMatch) reason = "Hash Mismatch";
            else reason = "Wallet Mismatch";

            emit SaleVerificationResult(transactionId, false, reason);
        }
    }

    /**
     * @dev Called by Oracle/Finance to mark as paid.
     */
    function update_payment(string memory transactionId) external onlyOracle {
        require(sales[transactionId].isVerified, "Transaction must be verified first");
        sales[transactionId].isPaid = true;
        emit PaymentUpdated(transactionId, true);
    }
}
