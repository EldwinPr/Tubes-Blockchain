# Dokumentasi API Blockchain Sales Management

## 1. Agent API (Sales Input)

### a. Get Items
*   **URL:** `/api/agents/items`
*   **Method:** `GET`
*   **Desc:** Mengambil daftar barang dan harga untuk dropdown input.

### b. Input Transaction
*   **URL:** `/api/agents/[id]/transaction`
*   **Method:** `POST`
*   **Body:**
    ```json
    {
      "items": [
        { "item_Id": "uuid-1", "qty": 2 }
      ]
    }
    ```
*   **Logic:** 
    1. Server menghitung Total Amount & Quantity dari DB.
    2. Generate Hash (Keccak-256) dari payload (ID, Amt, Qty, Time).
    3. Simpan transaksi ke DB dengan status `unverified`.
*   **Response:**
    ```json
    {
      "success": true,
      "data": {
        "payload": { "transaction_Id": "...", "total_Amt": 100, ... },
        "hash": "0x..."
      }
    }
    ```

### c. Get Transaction History
*   **URL:** `/api/agents/[id]/transactions`
*   **Method:** `GET`
*   **Desc:** Mengambil riwayat transaksi agen beserta statusnya (unverified/pending/paid).

---

## 2. Auditor API (Integrity Check)

### a. Verify Integrity
*   **URL:** `/api/auditors/[id]/integrity/[tx_id]`
*   **Method:** `GET`
*   **Logic:** 
    1. Mengambil data transaksi dari DB Lokal.
    2. Mengambil data "Truth" dari Smart Contract Storage via `Blockchain_Service`.
    3. Membandingkan Hash, Amount, dan Status Verifikasi.
*   **Response:**
    ```json
    {
      "success": true,
      "isIntegrityVerified": true,
      "blockchainData": { "isVerified": true, "isPaid": false, ... }
    }
    ```

### b. Flag Suspicious Transaction
*   **URL:** `/api/auditors/flag/[tx_id]`
*   **Method:** `PUT`
*   **Desc:** Menandai transaksi sebagai mencurigakan di database lokal (flag internal).

---

## 3. Customer API (Payment)

### a. Get Pending Invoices
*   **URL:** `/api/customer`
*   **Method:** `GET`
*   **Desc:** Mengambil semua transaksi dengan status `pending` (Sudah diverifikasi Oracle, Belum dibayar).

### b. Make Payment
*   **URL:** `/api/customer`
*   **Method:** `PUT`
*   **Body:** `{ "transaction_Id": "uuid" }`
*   **Logic:**
    1. Backend (Oracle Wallet) memanggil Smart Contract `update_payment()`.
    2. Menunggu konfirmasi Blockchain.
    3. Mengupdate status DB menjadi `paid`.

---

## 4. System Components (Background Processes)

### a. Oracle Service (`scripts/oracle.ts`)
*   **Role:** Bridge otomatis antara Blockchain dan Database.
*   **Flow:**
    1. Listen to `SaleRecorded` event on-chain.
    2. Compare Chain Hash vs Database Hash.
    3. Call `verify_transaction(true/false)` on Smart Contract.
    4. If Verified, update Database status to `pending`.

### b. Blockchain Service (`Blockchain_Service.ts`)
*   **Role:** Interface tunggal ke Smart Contract (via `ethers.js`).
*   **Key Functions:** `get_HashWallet`, `verify_Transaction_OnChain`, `update_Payment_Status`.
