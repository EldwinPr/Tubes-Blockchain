# Dokumentasi API Blockchain Sales Management

## 1. Agent API

### a. Get Agent Items
*   **URL:** `/api/agents/items`
*   **Method:** `GET`
*   **Desc:** Mengambil daftar barang sebagai referensi harga bagi Agen.

### b. Input Transaction (Sign Payload)
*   **URL:** `/api/agents/[id]/transaction`
*   **Method:** `POST`
*   **Proses (Sequence):** 
    1. Generate Hash.
    2. Server Sign Hash.
    3. Insert ke DB Lokal (Status: Pending).
*   **Response:**
    ```json
    {
      "success": true,
      "data": {
        "transaction_Id": "uuid",
        "payload": { 
            "items": [{ "itemId": "uuid-1", "qty": 2, "price": 10000 }], 
            "total_Amt": 20000
        },
        "signature": "0xServerSignature..."
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