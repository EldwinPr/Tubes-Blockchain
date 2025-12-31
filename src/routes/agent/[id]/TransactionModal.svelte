<script lang="ts">
    import { onMount } from 'svelte';
    import { ethers } from 'ethers';

    // Props
    let { agentId, isOpen, onClose, onSuccess } = $props<{ 
        agentId: string, 
        isOpen: boolean, 
        onClose: () => void,
        onSuccess: () => void 
    }>();

    interface Item {
        item_Id: string;
        name: string;
        price: number;
        stock: number;
    }

    interface CartItem {
        item_Id: string;
        name: string;
        price: number;
        qty: number;
    }

    let items: Item[] = $state([]);
    let selectedItemId = $state('');
    let quantity = $state(1);
    let cart: CartItem[] = $state([]);
    let isLoading = $state(false);
    let message = $state({ text: '', type: '' });
    
    let userAccount = $state('');
    let isMetaMaskConnected = $state(false);

    let grandTotal = $derived(cart.reduce((sum, item) => sum + (item.price * item.qty), 0));

    async function fetchItems() {
        try {
            const res = await fetch('/api/agents/items');
            if (res.ok) {
                const data = await res.json();
                items = data.success ? data.data : [];
            }
        } catch (e) {
            console.error("Failed to load items", e);
        }
    }

    $effect(() => {
        if (isOpen) {
            fetchItems();
            checkMetaMaskConnection();
        }
    });

    async function checkMetaMaskConnection() {
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                userAccount = accounts[0];
                isMetaMaskConnected = true;
            }
        }
    }

    async function connectMetaMask() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                userAccount = accounts[0];
                isMetaMaskConnected = true;
            } catch (error) {
                console.error("User denied account access", error);
            }
        } else {
            message = { text: 'Please install MetaMask!', type: 'error' };
        }
    }

    function addToCart() {
        if (!selectedItemId || quantity <= 0) return;
        const item = items.find(i => i.item_Id === selectedItemId);
        if (!item) return;

        const existingInCart = cart.find(c => c.item_Id === selectedItemId)?.qty || 0;
        if (existingInCart + quantity > item.stock) {
            message = { text: `Cannot add more than ${item.stock} units of ${item.name}`, type: 'error' };
            return;
        }

        const existing = cart.find(c => c.item_Id === selectedItemId);
        if (existing) {
            existing.qty += quantity;
            cart = [...cart];
        } else {
            cart = [...cart, { item_Id: item.item_Id, name: item.name, price: item.price, qty: quantity }];
        }

        selectedItemId = '';
        quantity = 1;
        if (message.type === 'error') message = { text: '', type: '' };
    }

    function removeFromCart(index: number) {
        cart = cart.filter((_, i) => i !== index);
    }

    async function handleSubmit() {
        if (cart.length === 0) return;
        if (!isMetaMaskConnected) {
            await connectMetaMask();
            if (!isMetaMaskConnected) return;
        }

        isLoading = true;
        message = { text: 'Processing...', type: 'info' };

        try {
            const itemsPayload = cart.map(c => ({ item_Id: c.item_Id, qty: c.qty }));
            const response = await fetch(`/api/agents/${agentId}/transaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: itemsPayload })
            });

            const result = await response.json();

            if (result.success) {
                const { hash } = result.data;
                message = { text: 'Success! Hash: ' + hash.slice(0, 10) + '...', type: 'success' };
                cart = [];
                setTimeout(() => {
                    onSuccess();
                    onClose();
                    message = { text: '', type: '' };
                }, 1500);
            } else {
                message = { text: 'Error: ' + result.error, type: 'error' };
            }
        } catch (e) {
            console.error(e);
            message = { text: 'Request Failed', type: 'error' };
        } finally {
            isLoading = false;
        }
    }

    function formatCurrency(amt: number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amt);
    }
</script>

{#if isOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div class="bg-blue-600 p-6 text-white flex justify-between items-center shrink-0">
                <h2 class="text-xl font-bold">New Sale Transaction</h2>
                <button onclick={onClose} class="text-white/80 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div class="p-6 overflow-y-auto">
                <!-- ADD ITEM SECTION -->
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 items-end bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div class="md:col-span-6">
                        <label for="item" class="block text-xs font-bold text-gray-500 uppercase mb-1">Equipment</label>
                        <select id="item" bind:value={selectedItemId} class="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition">
                            <option value="" disabled selected>Select Item...</option>
                            {#each items as item}
                                <option value={item.item_Id}>{item.name} ({item.stock} in stock) - {formatCurrency(item.price)}</option>
                            {/each}
                        </select>
                    </div>

                    <div class="md:col-span-3">
                        <label for="qty" class="block text-xs font-bold text-gray-500 uppercase mb-1">Qty</label>
                        <input type="number" id="qty" bind:value={quantity} min="1" class="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" />
                        {#if selectedItemId && quantity > (items.find(i => i.item_Id === selectedItemId)?.stock || 0)}
                            <span class="text-[10px] text-red-500 font-bold">Exceeds Stock!</span>
                        {/if}
                    </div>

                    <div class="md:col-span-3">
                        <button onclick={addToCart} disabled={!selectedItemId || quantity > (items.find(i => i.item_Id === selectedItemId)?.stock || 0)} class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm shadow transition disabled:opacity-50">
                            + Add Item
                        </button>
                    </div>
                </div>

                <!-- CART TABLE -->
                {#if cart.length > 0}
                    <div class="border rounded-xl overflow-hidden mb-6">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-gray-100 text-gray-600 font-bold">
                                <tr>
                                    <th class="p-3">Item</th>
                                    <th class="p-3 text-right">Price</th>
                                    <th class="p-3 text-center">Qty</th>
                                    <th class="p-3 text-right">Total</th>
                                    <th class="p-3 text-center"></th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                {#each cart as item, i}
                                    <tr class="hover:bg-gray-50">
                                        <td class="p-3">{item.name}</td>
                                        <td class="p-3 text-right font-mono">{formatCurrency(item.price)}</td>
                                        <td class="p-3 text-center">{item.qty}</td>
                                        <td class="p-3 text-right font-bold">{formatCurrency(item.price * item.qty)}</td>
                                        <td class="p-3 text-center">
                                            <button onclick={() => removeFromCart(i)} class="text-red-500 hover:bg-red-50 p-1 rounded transition">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {:else}
                    <div class="text-center py-12 text-gray-400 border-2 border-dashed rounded-xl mb-6 flex flex-col items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p>No items added yet</p>
                    </div>
                {/if}

                <!-- ACTION SECTION -->
                <div class="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <div class="flex justify-between items-center mb-6">
                        <span class="text-gray-500 font-bold uppercase text-xs tracking-wider">Grand Total</span>
                        <span class="text-3xl font-extrabold text-blue-900">{formatCurrency(grandTotal)}</span>
                    </div>

                    <div class="flex items-center justify-between text-sm bg-white p-3 rounded-lg border border-gray-200 mb-4">
                        <span class="text-gray-500">MetaMask Status</span>
                        {#if isMetaMaskConnected}
                            <span class="flex items-center gap-2 text-green-600 font-bold">
                                <span class="h-2 w-2 bg-green-500 rounded-full"></span> Connected ({userAccount.slice(0,6)}...)
                            </span>
                        {:else}
                            <button onclick={connectMetaMask} class="text-blue-600 font-bold hover:underline">Connect Wallet</button>
                        {/if}
                    </div>

                    <button onclick={handleSubmit} disabled={isLoading || cart.length === 0 || !isMetaMaskConnected} 
                        class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2">
                        {#if isLoading}
                            <span class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                            Processing Hash...
                        {:else}
                            Confirm & Record Sale
                        {/if}
                    </button>

                    {#if message.text}
                        <div class="mt-4 p-3 text-center text-sm font-bold rounded-lg
                            {message.type === 'success' ? 'bg-green-100 text-green-700' : 
                             message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}">
                            {message.text}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if}
