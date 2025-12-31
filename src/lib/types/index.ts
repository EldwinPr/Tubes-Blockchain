export interface TransactionPayload {
    transaction_Id: string;
    total_Amt: number;
    total_Qty: number;
    timestamp: number;
}

export interface TransactionResult {
    payload: TransactionPayload;
    hash: string;
}

export interface TransactionInputItem {
    item_Id: string;
    qty: number;
}

export interface TransactionInput {
    agent_Id: string;
    items: TransactionInputItem[];
}
