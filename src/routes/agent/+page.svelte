<script lang="ts">
    import { onMount } from 'svelte';
    import { ethers } from 'ethers';

    // Extend Window interface for MetaMask
    declare global {
        interface Window {
            ethereum: any;
        }
    }

    interface Wallet {
        name: string;
        wallet_Address: string;
        role: string;
    }

    interface Item {
        item_Id: string;
        name: string;
        price: number;
        stock: number;
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
    }

    // Data dari Page Loader (+page.server.ts)
    let { data } = $props();
    let agentId = $derived(data.agentId);

    // State untuk data API
    let wallet: Wallet = $state({ name: 'Loading...', wallet_Address: '0x...', role: 'Agent' });
    let items: Item[] = $state([]);
    let transactions: Transaction[] = $state([]);
    
    // State untuk Form & UI
    let selectedItemId = $state('');
    let quantity = $state(1);
    let isLoading = $state(false);
    let message = $state({ text: '', type: '' });

    // State untuk MetaMask
    let userAccount = $state('');
    let isMetaMaskConnected = $state(false);

    // Fungsi untuk mengambil data dari API
    async function fetchData() {
        console.log("fetchData called with Agent ID:", agentId);
        if (!agentId || agentId === 'agent-not-found') {
            console.error("Invalid Agent ID, skipping fetch.");
            wallet.name = 'Agent Not Found';
            return;
        }

        try {
            const walletRes = await fetch(`/api/agents/${agentId}/wallet`);
            if (walletRes.ok) {
                const res = await walletRes.json();
                if (res.success && res.data) {
                    Object.assign(wallet, res.data);
                    console.log("Wallet loaded:", res.data);
                }
            } else {
                console.error("Failed to load wallet:", walletRes.status);
            }

            const itemsRes = await fetch('/api/agents/items');
            if (itemsRes.ok) {
                const res = await itemsRes.json();
                // API returns { success: true, data: [...] }
                items = res.success ? res.data : [];
                console.log("Items loaded:", items);
            } else {
                console.error("Failed to load items:", itemsRes.status);
            }

            const txRes = await fetch(`/api/agents/${agentId}/transactions`);
            if (txRes.ok) {
                const res = await txRes.json();
                transactions = res.success ? res.data : [];
                console.log("Transactions loaded:", transactions);
            } else {
                 console.error("Failed to load transactions:", txRes.status);
            }
        } catch (e) {
            console.error("Error fetching data:", e);
        }
    }

    // Reactively fetch data when agentId is available
    $effect(() => {
        if (agentId) fetchData();
    });


    async function connectMetaMask() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                userAccount = accounts[0];
                isMetaMaskConnected = true;
                validateWalletConnection();
            } catch (error) {
                console.error("User denied account access", error);
            }
        } else {
            message = { text: 'Please install MetaMask to record sales on Blockchain!', type: 'error' };
        }
    }

    // Fungsi untuk memvalidasi wallet
    function validateWalletConnection() {
        if (!wallet.wallet_Address || !userAccount) return;

        if (userAccount.toLowerCase() !== wallet.wallet_Address.toLowerCase()) {
            message = { 
                text: `Warning: Connected MetaMask (${userAccount.slice(0,6)}...) DOES NOT MATCH registered Agent wallet (${wallet.wallet_Address.slice(0,6)}...). Transaction will fail.`, 
                type: 'error' 
            };
        } else {
            // Jika sebelumnya ada error wallet, bersihkan
            if (message.text.includes('DOES NOT MATCH')) message = { text: '', type: '' };
        }
    }

    onMount(async () => {
        // Cek koneksi MetaMask yang sudah ada
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                userAccount = accounts[0];
                isMetaMaskConnected = true;
                validateWalletConnection(); // Validasi segera setelah load
            }
        }
    });

    // Panggil validasi setiap kali wallet atau userAccount berubah
    $effect(() => {
        validateWalletConnection();
    });

    async function handleValidateRecord() {
        if (!selectedItemId || quantity <= 0) return;
        
        // Pastikan MetaMask terkoneksi sebelum lanjut
        if (!isMetaMaskConnected) {
            await connectMetaMask();
            if (!isMetaMaskConnected) return;
        }
        
        isLoading = true;
        message = { text: '1/3: Requesting Server Signature...', type: 'info' };

        try {
            // Find selected item to get price
            const selectedItem = items.find(i => i.item_Id === selectedItemId);
            if (!selectedItem) throw new Error("Item not found");
            
            const totalAmt = selectedItem.price * quantity;

            // LANGKAH 1: Validasi ke Backend
            const response = await fetch(`/api/agents/${agentId}/transaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item_Id: selectedItemId,  // For Service (CamelCase)
                    item_id: selectedItemId,  // For Validation (snake_case)
                    qty: quantity,
                    total_amt: totalAmt       // For Validation
                })
            });

            const result = await response.json();

            if (result.success) {
                const { payload, hash } = result.data;
                
                message = { text: '2/3: Signing with MetaMask & Sending to Blockchain...', type: 'info' };

                // LANGKAH 2: Kirim ke Smart Contract via MetaMask
                // CATATAN: Bagian ini akan diaktifkan setelah Smart Contract dideploy
                /*
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                
                const CONTRACT_ADDRESS = "0x..."; // Alamat kontrak dari teman
                const CONTRACT_ABI = ["function record_sale(...)"]; // ABI dari teman

                const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
                const tx = await contract.record_sale(payload, hash);
                await tx.wait();
                */
                
                // SIMULASI: Karena Smart Contract belum ada, kita lanjut ke finalisasi
                await new Promise(r => setTimeout(r, 2000)); 

                message = { text: '3/3: Finalizing in Database...', type: 'info' };

                // LANGKAH 3: Finalisasi di Backend
                await fetch(`/api/agents/${agentId}/transaction`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tx_Hash: "0x_mock_blockchain_hash" })
                });

                message = { text: 'Success! Record validated and staged for Blockchain.', type: 'success' };
                
                // Reset & Refresh
                selectedItemId = '';
                quantity = 1;
                await fetchData();
            } else {
                message = { text: 'Error: ' + result.error, type: 'error' };
            }
        } catch (e) {
            console.error(e);
            message = { text: 'Process failed. Check connection.', type: 'error' };
        } finally {
            isLoading = false;
            setTimeout(() => { if (message.type === 'success') message = { text: '', type: '' } }, 5000);
        }
    }

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
        <!-- Header / Wallet Section -->
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
            
            <div class="w-full md:w-auto text-right">
                <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Registered Wallet</div>
                <div class="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 mb-2">
                    <code class="text-sm font-mono text-gray-600">{wallet.wallet_Address || '0x...'}</code>
                </div>
                
                {#if isMetaMaskConnected}
                    <div class="flex items-center justify-end gap-2">
                        <span class="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span class="text-[10px] font-bold text-gray-500 uppercase">Connected: {userAccount.slice(0,6)}...{userAccount.slice(-4)}</span>
                    </div>
                {:else}
                    <button onclick={connectMetaMask} class="text-[10px] font-bold text-blue-600 uppercase hover:underline">
                        Connect MetaMask
                    </button>
                {/if}
            </div>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-1">
                <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-8">
                    <h2 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Record New Sale
                    </h2>

                    <form onsubmit={(e) => { e.preventDefault(); handleValidateRecord(); }} class="space-y-5">
                        <div>
                            <label for="item" class="block text-sm font-semibold text-gray-700 mb-2">Select Equipment</label>
                            <select id="item" bind:value={selectedItemId} class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl p-3" required>
                                <option value="" disabled selected>Select an item</option>
                                {#each items as item}
                                    <option value={item.item_Id}>{item.name} - {formatCurrency(item.price)}</option>
                                {/each}
                            </select>
                        </div>

                        <div>
                            <label for="qty" class="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                            <input type="number" id="qty" bind:value={quantity} min="1" class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl p-3" required />
                        </div>

                        {#if selectedItemId && items.length > 0}
                            {@const selectedItem = items.find(i => i.item_Id === selectedItemId)}
                            <div class="p-4 bg-blue-50 rounded-xl border border-blue-100 flex justify-between">
                                <span class="text-blue-600 text-sm">Subtotal</span>
                                <span class="font-bold text-blue-900">{formatCurrency((selectedItem?.price || 0) * quantity)}</span>
                            </div>
                        {/if}

                        <button type="submit" disabled={isLoading || !selectedItemId} class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                            {#if isLoading}
                                <span class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                {message.text.split(':')[0]}
                            {:else}
                                Validate & Record Sale
                            {/if}
                        </button>
                    </form>

                    {#if message.text}
                        <div class="mt-4 p-3 text-xs font-medium rounded-lg border 
                            {message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 
                             message.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 
                             'bg-blue-50 text-blue-700 border-blue-100 animate-pulse'}">
                            {message.text}
                        </div>
                    {/if}
                </div>
            </div>

            <div class="lg:col-span-2">
                <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                        <h2 class="font-bold text-gray-900">Recent Validated Records</h2>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead class="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                                <tr>
                                    <th class="px-6 py-4">Transaction ID</th>
                                    <th class="px-6 py-4">Items</th>
                                    <th class="px-6 py-4">Total Amount</th>
                                    <th class="px-6 py-4">Status</th>
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
                                    </tr>
                                {:else}
                                    <tr><td colspan="4" class="px-6 py-10 text-center text-gray-400 italic">No records found.</td></tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>