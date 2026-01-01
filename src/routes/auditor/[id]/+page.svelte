<script lang="ts">
    import { page } from '$app/stores';
    import AuditModal from './AuditModal.svelte';

    interface Transaction {
        transaction_Id: string;
        agent_Id: string;
        total_Amt: number;
        status: string;
        hash: string;
        details: any[];
    }

    let auditorId = $derived($page.params.id);
    let transactions: Transaction[] = $state([]);
    let isLoading = $state(true);
    let isModalOpen = $state(false);
    let selectedTransaction: Transaction | null = $state(null);

    async function fetchTransactions() {
        isLoading = true;
        try {
            const res = await fetch(`/api/auditors/${auditorId}/transactions`);
            const result = await res.json();
            if (result.success) {
                transactions = result.data;
            } else {
                console.error('Failed to fetch transactions:', result.error);
            }
        } catch (e) {
            console.error('Error fetching transactions:', e);
        } finally {
            isLoading = false;
        }
    }

    $effect(() => {
        if (auditorId) fetchTransactions();
    });

    function openAudit(tx: Transaction) {
        selectedTransaction = tx;
        isModalOpen = true;
    }

    function formatCurrency(amt: number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amt);
    }
</script>

<div class="min-h-screen bg-slate-50 p-6 md:p-12">
    <div class="max-w-6xl mx-auto">
        <header class="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 class="text-3xl font-black text-slate-900 tracking-tight">Auditor Control Panel</h1>
                <p class="text-slate-500">Integrity check and compliance monitoring</p>
            </div>
            <div class="bg-indigo-600 px-4 py-2 rounded-lg text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-200">
                Auditor: {auditorId.slice(0,8)}...
            </div>
        </header>

        <div class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 class="font-bold text-slate-800">All Network Transactions</h2>
                <button onclick={fetchTransactions} class="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                            <th class="px-6 py-4">Status</th>
                            <th class="px-6 py-4">Transaction ID</th>
                            <th class="px-6 py-4">Total Amount</th>
                            <th class="px-6 py-4">Local Hash</th>
                            <th class="px-6 py-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        {#each transactions as tx}
                            <tr class="hover:bg-slate-50/80 transition-colors">
                                <td class="px-6 py-4">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase
                                        {tx.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                                         tx.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}">
                                        {tx.status}
                                    </span>
                                </td>
                                <td class="px-6 py-4 font-mono text-xs font-bold text-slate-600">{tx.transaction_Id.slice(0,13)}...</td>
                                <td class="px-6 py-4 font-bold text-slate-900">{formatCurrency(tx.total_Amt)}</td>
                                <td class="px-6 py-4 font-mono text-[10px] text-slate-400" title={tx.hash}>{tx.hash.slice(0,12)}...</td>
                                <td class="px-6 py-4 text-center">
                                    <button onclick={() => openAudit(tx)} class="bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-bold py-2 px-4 rounded-xl text-xs transition-all active:scale-95">
                                        Inspect Integrity
                                    </button>
                                </td>
                            </tr>
                        {:else}
                            <tr>
                                <td colspan="5" class="px-6 py-20 text-center text-slate-400 italic">
                                    No transactions found in the network.
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

{#if selectedTransaction}
    <AuditModal 
        isOpen={isModalOpen} 
        onClose={() => isModalOpen = false} 
        transaction={selectedTransaction} 
    />
{/if}
