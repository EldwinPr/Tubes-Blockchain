/*
  Warnings:

  - You are about to drop the `Commission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaction_Metadata` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Commission";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Transaction_Metadata";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "transaction_Id" TEXT NOT NULL PRIMARY KEY,
    "agent_Id" TEXT NOT NULL,
    "auditor_Id" TEXT,
    "total_Amt" REAL NOT NULL,
    "total_Qty" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "suspicion_Flag" BOOLEAN NOT NULL DEFAULT false,
    "commission_Amt" REAL NOT NULL DEFAULT 0,
    "is_Commission_Paid" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Transaction_agent_Id_fkey" FOREIGN KEY ("agent_Id") REFERENCES "User" ("user_Id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_auditor_Id_fkey" FOREIGN KEY ("auditor_Id") REFERENCES "User" ("user_Id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("agent_Id", "auditor_Id", "hash", "status", "suspicion_Flag", "total_Amt", "total_Qty", "transaction_Id") SELECT "agent_Id", "auditor_Id", "hash", "status", "suspicion_Flag", "total_Amt", "total_Qty", "transaction_Id" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
