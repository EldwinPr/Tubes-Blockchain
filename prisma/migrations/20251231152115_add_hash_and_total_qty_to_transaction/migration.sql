/*
  Warnings:

  - Added the required column `hash` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_Qty` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
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
    CONSTRAINT "Transaction_agent_Id_fkey" FOREIGN KEY ("agent_Id") REFERENCES "User" ("user_Id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_auditor_Id_fkey" FOREIGN KEY ("auditor_Id") REFERENCES "User" ("user_Id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("agent_Id", "auditor_Id", "status", "suspicion_Flag", "total_Amt", "transaction_Id") SELECT "agent_Id", "auditor_Id", "status", "suspicion_Flag", "total_Amt", "transaction_Id" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
