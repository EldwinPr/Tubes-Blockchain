<script lang="ts">
    interface Transaction {
        transaction_Id: string;
        total_Amt: number;
        hash: string;
        status: string;
    }

    let { isOpen, onClose, transaction } = $props<{
        isOpen: boolean;
        onClose: () => void;
        transaction: Transaction;
    }>();

    let isVerifying = $state(false);
    let auditResult: any = $state(null);

    async function checkIntegrity() {
        isVerifying = true;
        try {
            // Placeholder for API call
            // const res = await fetch(`/api/auditors/integrity/${transaction.transaction_Id}`);
            // auditResult = await res.json();
            
            // Simulation
            await new Promise(r => setTimeout(r, 1500));
            auditResult = {
                matches: true,
                blockchain: {
                    hash: transaction.hash,
                    isVerified: true,
                    isPaid: transaction.status === 'paid'
                }
            };
        } catch (e) {
            console.error(e);
        } finally {
            isVerifying = false;
        }
    }

    function formatCurrency(amt: number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amt);
    }
</script>

{#if isOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <div class="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
            <div class="p-6 flex justify-between items-center border-b border-slate-100">
                <h3 class="text-xl font-black text-slate-900">Integrity Inspection</h3>
                <button onclick={onClose} class="text-slate-400 hover:text-slate-600" aria-label="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div class="p-8">
                <div class="mb-8 space-y-4">
                    <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p class="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Local Record (Database)</p>
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-bold text-slate-700">{transaction.transaction_Id.slice(0,13)}...</span>
                            <span class="text-lg font-black text-indigo-600">{formatCurrency(transaction.total_Amt)}</span>
                        </div>
                        <p class="font-mono text-[10px] text-slate-400 break-all mt-2">{transaction.hash}</p>
                    </div>

                    {#if isVerifying}
                        <div class="py-10 text-center space-y-4">
                            <span class="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full inline-block"></span>
                            <p class="text-slate-500 font-bold text-sm">Querying Blockchain Nodes...</p>
                        </div>
                    {:else if auditResult}
                        <div class="p-6 rounded-2xl border-2 {auditResult.matches ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-red-200'}">
                            <div class="flex items-center gap-3 mb-4">
                                <div class="h-8 w-8 rounded-full flex items-center justify-center {auditResult.matches ? 'bg-emerald-500' : 'bg-rose-500'} text-white">
                                    {#if auditResult.matches}
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                                    {:else}
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                                    {/if}
                                </div>
                                <span class="font-black uppercase tracking-tight text-lg {auditResult.matches ? 'text-emerald-700' : 'text-rose-700'}">
                                    {auditResult.matches ? 'Integrity Verified' : 'Data Tampering Detected'}
                                </span>
                            </div>
                            
                            <div class="space-y-2 text-xs font-bold text-slate-600">
                                <div class="flex justify-between">
                                    <span>Blockchain Status</span>
                                    <span>{auditResult.blockchain.isVerified ? 'Verified' : 'Pending'}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Payment Status</span>
                                    <span>{auditResult.blockchain.isPaid ? 'Paid' : 'Unpaid'}</span>
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>

                <button onclick={checkIntegrity} disabled={isVerifying} 
                    class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2">
                    {#if isVerifying}
                        Querying...
                    {:else}
                        Compare with Blockchain
                    {/if}
                </button>
            </div>
        </div>
    </div>
{/if}
