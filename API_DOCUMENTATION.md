# Dokumentasi API Blockchain Sales Management

## 1. Agent API

### a. Get Agent Items
*   **URL:** `/api/agents/items`
*   **Method:** `GET`
*   **Desc:** Mengambil daftar barang sebagai referensi harga bagi Agen.

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
*   **Proses (Sequence):** 
    1. Server mengambil harga terbaru dari DB.
    2. Server menghitung `total_Amt` dan `total_Qty`.
    3. Generate `transaction_Id` (UUID) & `timestamp`.
    4. Generate Keccak-256 `hash` dari payload.
    5. Simpan ke DB lokal dengan status `unverified`.
*   **Response:**
    ```json
    {
      "success": true,
      "data": {
        "payload": { 
            "transaction_Id": "uuid",
            "total_Amt": 20000,
            "total_Qty": 2,
            "timestamp": 1735651200000
        },
        "hash": "0x..."
      }
    }
    ```

### c. Finalize Transaction
*   **URL:** `/api/agents/[id]/transaction`
*   **Method:** `PUT`
*   **Desc:** Sinkronisasi status di DB Lokal menjadi "Committed" setelah transaksi Blockchain sukses.

---

## 2. Auditor API

### a. Check Transaction Integrity
*   **URL:** `/api/auditors/[id]/integrity/[tx_id]`
*   **Method:** `GET`
*   **Logic:** Audit Service membandingkan data DB lokal dengan Metadata dari Smart Contract (via Blockchain Service).

---

## 3. Customer API (Finance)

### a. Update Payment
*   **URL:** `/api/customer`
*   **Method:** `PUT`
*   **Logic:** Memicu `Oracle_Service` untuk mengupdate status pembayaran di Smart Contract.

---

## 4. Blockchain & Oracle Interface (Berdasarkan Sequence Diagram)

### a. Smart Contract: `record_sale()`
*   **Pemicu:** Frontend (setelah mendapat signature dari Backend).
*   **Internal Call:** `VerifySignature()`
*   **Internal Call:** `Blockchain_Service.get_Price(array_of_uuids)`
*   **Logic:** Memastikan harga yang dikirim Agen sesuai dengan harga resmi dari Blockchain Service.

### b. Blockchain Service: `get_Price(array)`
*   **Input:** `Array of UUIDs`
*   **Output:** `Map<UUID, Price>`
*   **Logic:** Mengambil data harga terbaru dari entitas **Items** (Oracle Data Source) untuk dikembalikan ke Smart Contract.

### c. Smart Contract: `update_Payment()`
*   **Pemicu:** `Blockchain_Service` (atas perintah `Oracle_Service`).
*   **Action:** Mengupdate status `isPaid` di Blockchain Storage dan sinkronisasi status transaksi di database lokal.