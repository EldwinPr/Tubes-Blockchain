# Dokumentasi API Blockchain Sales Management

## 1. Agent API

### a. Get Agent Items
*   **URL:** `/api/agents/items`
*   **Method:** `GET`
*   **File Location:** `src/routes/api/agents/items/+server.ts`
*   **Response Structure (JSON):**
    ```json
    {
      "success": true,
      "data": [
        {
          "item_Id": "uuid-string",
          "name": "Item Name",
          "price": 10000,
          "stock": 50
        }
      ]
    }
    ```

### b. Get Agent Transactions
*   **URL:** `/api/agents/[id]/transactions`
*   **Method:** `GET`
*   **File Location:** `src/routes/api/agents/[id]/transactions/+server.ts`
*   **Response Structure (JSON):**
    ```json
    {
      "success": true,
      "data": [
        {
          "transaction_Id": "uuid-string",
          "agent_Id": "uuid-string",
          "total_Amt": 50000,
          "status": "Pending",
          "suspicion_Flag": false
        }
      ]
    }
    ```

### c. Get Agent Commissions
*   **URL:** `/api/agents/[id]/commissions`
*   **Method:** `GET`
*   **File Location:** `src/routes/api/agents/[id]/commissions/+server.ts`
*   **Response Structure (JSON):**
    ```json
    {
      "success": true,
      "data": [
        {
          "transaction_Id": "uuid-string",
          "commission_Amt": 5000,
          "is_Given": false
        }
      ]
    }
    ```

### d. Get Agent Wallet
*   **URL:** `/api/agents/[id]/wallet`
*   **Method:** `GET`
*   **File Location:** `src/routes/api/agents/[id]/wallet/+server.ts`
*   **Response Structure (JSON):**
    ```json
    {
      "success": true,
      "data": "0xWalletAddressString..."
    }
    ```

### e. Input Transaction (Create Sale)
*   **URL:** `/api/agents/[id]/transaction`
*   **Method:** `POST`
*   **File Location:** `src/routes/api/agents/[id]/transaction/+server.ts`
*   **Request Body (JSON):**
    ```json
    {
      "items": [
        { "item_Id": "uuid-item-1", "qty": 2 },
        { "item_Id": "uuid-item-2", "qty": 1 }
      ],
      "total_Amt": 150000
    }
    ```
*   **Response Structure (JSON):**
    ```json
    {
      "success": true,
      "data": {
        "transaction_Id": "new-uuid",
        "metadata_Hash": "hash-string-for-blockchain"
      }
    }
    ```

### f. Finalize Transaction (After Blockchain Sign)
*   **URL:** `/api/agents/[id]/transaction`
*   **Method:** `PUT`
*   **File Location:** `src/routes/api/agents/[id]/transaction/+server.ts`
*   **Request Body (JSON):**
    ```json
    {
      "tx_Hash": "0xBlockchainTransactionHash..."
    }
    ```
*   **Response Structure (JSON):**
    ```json
    {
      "success": true,
      "message": "Transaction finalized"
    }
    ```

---

## 2. Auditor API

### a. Get Transactions to Audit
*   **URL:** `/api/auditors/[id]/transactions`
*   **Method:** `GET`
*   **File Location:** `src/routes/api/auditors/[id]/transactions/+server.ts`
*   **Response Structure (JSON):**
    ```json
    {
      "success": true,
      "data": [
        {
          "transaction_Id": "uuid-string",
          "agent_Id": "uuid-string",
          "total_Amt": 100000,
          "status": "Paid"
        }
      ]
    }
    ```

### b. Check Transaction Integrity
*   **URL:** `/api/auditors/[id]/integrity/[tx_id]`
*   **Method:** `GET`
*   **File Location:** `src/routes/api/auditors/[id]/integrity/[tx_id]/+server.ts`
*   **Response Structure (JSON):**
    ```json
    {
      "success": true,
      "data": {
        "isValid": true
      }
    }
    ```

### c. Flag Suspicious Transaction
*   **URL:** `/api/auditors/[id]/flag/[tx_id]`
*   **Method:** `PUT`
*   **File Location:** `src/routes/api/auditors/[id]/flag/[tx_id]/+server.ts`
*   **Response Structure (JSON):**
    ```json
    {
      "success": true,
      "message": "Transaction flagged as suspicious"
    }
    ```

### d. Give Commission
*   **URL:** `/api/auditors/[id]/commission/[tx_id]`
*   **Method:** `PUT`
*   **File Location:** `src/routes/api/auditors/[id]/commission/[tx_id]/+server.ts`
*   **Response Structure (JSON):**
    ```json
    {
      "success": true,
      "message": "Commission given successfully"
    }
    ```

---

## 3. Customer API

### a. Update Payment Status
*   **URL:** `/api/customer`
*   **Method:** `PUT`
*   **File Location:** `src/routes/api/customer/+server.ts`
*   **Request Body (JSON):**
    ```json
    {
      "uuid": "transaction-uuid-string"
    }
    ```
*   **Response Structure (JSON):**
    ```json
    {
      "success": true,
      "message": "Payment updated"
    }
    ```
