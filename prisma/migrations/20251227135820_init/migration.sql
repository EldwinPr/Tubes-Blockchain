-- CreateTable
CREATE TABLE "User" (
    "user_Id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "wallet_Address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Transaction" (
    "transaction_Id" TEXT NOT NULL PRIMARY KEY,
    "agent_Id" TEXT NOT NULL,
    "auditor_Id" TEXT,
    "total_Amt" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "suspicion_Flag" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Transaction_agent_Id_fkey" FOREIGN KEY ("agent_Id") REFERENCES "User" ("user_Id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_auditor_Id_fkey" FOREIGN KEY ("auditor_Id") REFERENCES "User" ("user_Id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction_Details" (
    "transaction_Details_Id" TEXT NOT NULL PRIMARY KEY,
    "transaction_Id" TEXT NOT NULL,
    "item_Id" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "price_At_Time" REAL NOT NULL,
    CONSTRAINT "Transaction_Details_transaction_Id_fkey" FOREIGN KEY ("transaction_Id") REFERENCES "Transaction" ("transaction_Id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_Details_item_Id_fkey" FOREIGN KEY ("item_Id") REFERENCES "Item" ("item_Id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Item" (
    "item_Id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "stock" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Commission" (
    "transaction_Id" TEXT NOT NULL PRIMARY KEY,
    "commission_Amt" REAL NOT NULL,
    "is_Given" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Commission_transaction_Id_fkey" FOREIGN KEY ("transaction_Id") REFERENCES "Transaction" ("transaction_Id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction_Metadata" (
    "transaction_Id" TEXT NOT NULL PRIMARY KEY,
    "agent_Address" TEXT NOT NULL,
    "stored_Hash" TEXT NOT NULL,
    "total_Amt" REAL NOT NULL,
    "is_Paid" BOOLEAN NOT NULL DEFAULT false,
    "commission_Amt" REAL NOT NULL,
    CONSTRAINT "Transaction_Metadata_transaction_Id_fkey" FOREIGN KEY ("transaction_Id") REFERENCES "Transaction" ("transaction_Id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
