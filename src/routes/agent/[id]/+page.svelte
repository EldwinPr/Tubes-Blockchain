<script lang="ts">
    import { page } from '$app/stores';
    import TransactionModal from './TransactionModal.svelte';

    interface Wallet {
        name: string;
        wallet_Address: string;
        role: string;
    }

    interface TransactionDetail {
        item: { name: string };
        qty: number;
    }

    interface Transaction {
        transaction_Id: string;
        details: TransactionDetail[];
        total_Amt: number;
        status: string;
        hash: string;
    }

    let agentId = $derived($page.params.id);
    let wallet: Wallet = $state({ name: 'Loading...', wallet_Address: '0x...', role: 'Agent' });
    let transactions: Transaction[] = $state([]);
    let message = $state({ text: '', type: '' });
    let isModalOpen = $state(false);

    async function fetchData() {
        if (!agentId) return;

        try {
            // Load Wallet
            const walletRes = await fetch(`/api/agents/${agentId}/wallet`);
            if (walletRes.ok) {
                const res = await walletRes.json();
                if (res.success && res.data) Object.assign(wallet, res.data);
            }

            // Load Transactions
            const txRes = await fetch(`/api/agents/${agentId}/transactions`);
            if (txRes.ok) {
                const res = await txRes.json();
                transactions = res.success ? res.data : [];
            }
        } catch (e) {
            console.error("Error fetching data:", e);
            message = { text: 'Failed to load data', type: 'error' };
        }
    }

    $effect(() => {
        if (agentId) fetchData();
    });

    function formatCurrency(amt: number) {
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR',
            maximumFractionDigits: 0 
        }).format(amt);
    }
</script>

<div class="min-h-screen bg-gray-50 p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <header class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div class="flex items-center gap-4">
                <div class="h-14 w-14 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-inner">
                    {wallet.name?.charAt(0) || 'A'}
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">{wallet.name || 'Agent Dashboard'}</h1>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {wallet.role}
                    </span>
                </div>
            </div>
            
            <div class="text-right">
                <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Registered Wallet</div>
                <div class="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                    <code class="text-sm font-mono text-gray-600">{wallet.wallet_Address || '0x...'}</code>
                </div>
            </div>
        </header>

        <!-- Actions -->
        <div class="flex justify-end mb-6">
            <button onclick={() => isModalOpen = true} class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/xl h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                New Transaction
            </button>
        </div>

        <!-- Transactions Table -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                <h2 class="font-bold text-gray-900">Transaction History</h2>
            </div>
            
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                        <tr>
                            <th class="px-6 py-4">Transaction ID</th>
                            <th class="px-6 py-4">Items</th>
                            <th class="px-6 py-4">Total Amount</th>
                            <th class="px-6 py-4">Status</th>
                            <th class="px-6 py-4">Hash</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        {#each transactions as tx}
                            <tr class="hover:bg-gray-50 transition-colors">
                                <td class="px-6 py-4 font-mono text-xs text-gray-400">{tx.transaction_Id?.slice(0, 8)}...</td>
                                <td class="px-6 py-4">
                                    {#if tx.details}
                                        {#each tx.details as detail}
                                            <div class="text-sm font-bold text-gray-800">{detail.item?.name} (x{detail.qty})</div>
                                        {/each}
                                    {/if}
                                </td>
                                <td class="px-6 py-4 text-sm font-bold text-gray-900">{formatCurrency(tx.total_Amt)}</td>
                                <td class="px-6 py-4">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold 
                                        {tx.status === 'unverified' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}">
                                        {tx.status}
                                    </span>
                                </td>
                                <td class="px-6 py-4 font-mono text-[10px] text-gray-400" title={tx.hash || 'N/A'}>
                                    {tx.hash ? tx.hash.slice(0, 10) + '...' : '-'}
                                </td>
                            </tr>
                        {:else}
                            <tr><td colspan="5" class="px-6 py-10 text-center text-gray-400 italic">No records found.</td></tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<TransactionModal 
    agentId={agentId} 
    isOpen={isModalOpen} 
    onClose={() => isModalOpen = false} 
    onSuccess={fetchData} 
/>
