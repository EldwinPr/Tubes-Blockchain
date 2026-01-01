<script lang="ts">
    import { onMount } from 'svelte';

    interface Item {
        name: string;
        price: number;
    }

    interface TransactionDetail {
        item: Item;
        qty: number;
        price_At_Time: number;
    }

    interface Transaction {
        transaction_Id: string;
        total_Amt: number;
        total_Qty: number;
        created_At: string; // Prisma adds this if mapped, or we use timestamp from payload if available
        details: TransactionDetail[];
    }

    let pendingTransactions: Transaction[] = $state([]);
    let isLoading = $state(true);
    let processingId = $state<string | null>(null);
    let message = $state({ text: '', type: '' });

    async function fetchPending() {
        isLoading = true;
        try {
            const res = await fetch('/api/customer');
            const result = await res.json();
            if (result.success) {
                pendingTransactions = result.data;
            }
        } catch (e) {
            console.error(e);
        } finally {
            isLoading = false;
        }
    }

    onMount(fetchPending);

    async function handlePayment(id: string) {
        if (!confirm("Confirm payment for this invoice?")) return;
        
        processingId = id;
        message = { text: 'Processing Payment on Blockchain...', type: 'info' };

        try {
            const res = await fetch('/api/customer', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transaction_Id: id })
            });

            const result = await res.json();

            if (result.success) {
                message = { text: 'Payment Successful! Invoice Closed.', type: 'success' };
                await fetchPending(); // Refresh list
            } else {
                message = { text: 'Payment Failed: ' + result.error, type: 'error' };
            }
        } catch (e) {
            message = { text: 'Network Error', type: 'error' };
        } finally {
            processingId = null;
            setTimeout(() => { if(message.type === 'success') message = { text: '', type: '' } }, 3000);
        }
    }

    function formatCurrency(amt: number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amt);
    }
</script>

<div class="min-h-screen bg-gray-50 p-6 md:p-12">
    <div class="max-w-5xl mx-auto">
        <div class="mb-10 text-center">
            <h1 class="text-3xl font-extrabold text-gray-900">Customer Invoice Portal</h1>
            <p class="text-gray-500 mt-2">View and pay verified invoices.</p>
        </div>

        {#if message.text}
            <div class="mb-6 p-4 rounded-xl text-center font-bold shadow-sm transition-all
                {message.type === 'success' ? 'bg-green-100 text-green-800' : 
                 message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800 animate-pulse'}">
                {message.text}
            </div>
        {/if}

        {#if isLoading}
            <div class="text-center py-20">
                <span class="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full inline-block"></span>
                <p class="mt-4 text-gray-400">Loading pending invoices...</p>
            </div>
        {:else if pendingTransactions.length === 0}
            <div class="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="text-xl font-bold text-gray-700">All Caught Up!</h3>
                <p class="text-gray-400">No pending invoices found.</p>
            </div>
        {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                {#each pendingTransactions as tx}
                    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow relative">
                        <!-- Header -->
                        <div class="bg-blue-600 p-6 text-white flex justify-between items-start">
                            <div>
                                <p class="text-blue-200 text-xs font-mono uppercase tracking-wider mb-1">Invoice ID</p>
                                <p class="font-mono font-bold text-sm">{tx.transaction_Id.slice(0, 13)}...</p>
                            </div>
                            <span class="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                                Verified
                            </span>
                        </div>

                        <!-- Body -->
                        <div class="p-6">
                            <div class="space-y-3 mb-6">
                                {#each tx.details as detail}
                                    <div class="flex justify-between items-center text-sm">
                                        <span class="text-gray-600 font-medium">{detail.item.name} <span class="text-gray-400">x{detail.qty}</span></span>
                                        <span class="font-bold text-gray-900">{formatCurrency(detail.price_At_Time * detail.qty)}</span>
                                    </div>
                                {/each}
                            </div>

                            <div class="border-t border-gray-100 pt-4 flex justify-between items-center mb-6">
                                <span class="text-gray-500 font-bold uppercase text-xs">Total Due</span>
                                <span class="text-2xl font-extrabold text-blue-900">{formatCurrency(tx.total_Amt)}</span>
                            </div>

                            <button onclick={() => handlePayment(tx.transaction_Id)} disabled={!!processingId} 
                                class="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                                {#if processingId === tx.transaction_Id}
                                    <span class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                    Processing...
                                {:else}
                                    Pay Now
                                {/if}
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>
