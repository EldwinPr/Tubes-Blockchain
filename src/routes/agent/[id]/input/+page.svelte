<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { ethers } from 'ethers';

    declare global {
        interface Window {
            ethereum: any;
        }
    }

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

    let agentId = $derived($page.params.id);
    let items: Item[] = $state([]);
    
    // Form Input State
    let selectedItemId = $state('');
    let quantity = $state(1);

    // Cart State
    let cart: CartItem[] = $state([]);
    
    let isLoading = $state(false);
    let message = $state({ text: '', type: '' });
    
    // MetaMask State
    let userAccount = $state('');
    let isMetaMaskConnected = $state(false);

    // Derived Totals
    let grandTotal = $derived(cart.reduce((sum, item) => sum + (item.price * item.qty), 0));

    // Fetch Items Reference
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
        fetchItems();
        checkMetaMaskConnection();
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

        // Check stock
        const existingInCart = cart.find(c => c.item_Id === selectedItemId)?.qty || 0;
        if (existingInCart + quantity > item.stock) {
            message = { text: `Cannot add more than ${item.stock} units of ${item.name}`, type: 'error' };
            return;
        }

        // Check if item already in cart
        const existing = cart.find(c => c.item_Id === selectedItemId);
        if (existing) {
            existing.qty += quantity;
            cart = [...cart]; // Trigger reactivity
        } else {
            cart = [...cart, {
                item_Id: item.item_Id,
                name: item.name,
                price: item.price,
                qty: quantity
            }];
        }

        // Reset inputs
        selectedItemId = '';
        quantity = 1;
        if (message.type === 'error') message = { text: '', type: '' };
    }

    function removeFromCart(index: number) {
        cart = cart.filter((_, i) => i !== index);
    }

    async function handleSubmit() {
        if (cart.length === 0) return;

        // 1. Check MetaMask
        if (!isMetaMaskConnected) {
            await connectMetaMask();
            if (!isMetaMaskConnected) return;
        }

        isLoading = true;
        message = { text: 'Processing...', type: 'info' };

        try {
            // Prepare payload from cart
            const itemsPayload = cart.map(c => ({ item_Id: c.item_Id, qty: c.qty }));

            // 2. Send to Backend (Create Unverified Transaction & Get Hash)
            const response = await fetch(`/api/agents/${agentId}/transaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: itemsPayload
                })
            });

            const result = await response.json();

            if (result.success) {
                const { payload, hash } = result.data;
                console.log("Server Hash:", hash);
                console.log("Payload:", payload);

                message = { text: 'Transaction Created! Please Confirm in MetaMask...', type: 'info' };

                // 3. Interact with Smart Contract (Future Step)
                // const provider = new ethers.BrowserProvider(window.ethereum);
                // const signer = await provider.getSigner();
                // Call contract here...

                // Temporary Success Message
                message = { text: 'Success! Hash generated: ' + hash.slice(0, 10) + '...', type: 'success' };
                
                // Clear Cart
                cart = [];
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

<div class="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
    <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div class="bg-blue-600 p-6 text-white flex justify-between items-center">
            <h1 class="text-xl font-bold">New Sale Input</h1>
            <a href={`/agent/${agentId}`} class="text-xs bg-blue-700 px-3 py-1 rounded-full hover:bg-blue-800 transition">Back</a>
        </div>
        
        <div class="p-8">
            <!-- ADD ITEM SECTION -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 items-end">
                <div class="md:col-span-6">
                    <label for="item" class="block text-xs font-bold text-gray-500 uppercase mb-1">Equipment</label>
                    <select id="item" bind:value={selectedItemId} class="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition">
                        <option value="" disabled selected>Select Item...</option>
                        {#each items as item}
                            <option value={item.item_Id}>{item.name} ({item.stock} in stock) - {formatCurrency(item.price)}</option>
                        {/each}
                    </select>
                </div>

                <div class="md:col-span-3">
                    <label for="qty" class="block text-xs font-bold text-gray-500 uppercase mb-1">Qty</label>
                    <input type="number" id="qty" bind:value={quantity} min="1" class="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" />
                    {#if selectedItemId && quantity > (items.find(i => i.item_Id === selectedItemId)?.stock || 0)}
                        <span class="text-[10px] text-red-500 font-bold">Exceeds Stock!</span>
                    {/if}
                </div>

                <div class="md:col-span-3">
                    <button onclick={addToCart} disabled={!selectedItemId || quantity > (items.find(i => i.item_Id === selectedItemId)?.stock || 0)} class="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-2.5 rounded-lg text-sm shadow transition disabled:opacity-50">
                        + Add
                    </button>
                </div>
            </div>

            <!-- CART TABLE -->
            {#if cart.length > 0}
                <div class="border rounded-xl overflow-hidden mb-8">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-gray-100 text-gray-600 font-bold">
                            <tr>
                                <th class="p-3">Item</th>
                                <th class="p-3 text-right">Price</th>
                                <th class="p-3 text-center">Qty</th>
                                <th class="p-3 text-right">Total</th>
                                <th class="p-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            {#each cart as item, i}
                                <tr class="hover:bg-gray-50">
                                    <td class="p-3">{item.name}</td>
                                    <td class="p-3 text-right">{formatCurrency(item.price)}</td>
                                    <td class="p-3 text-center">{item.qty}</td>
                                    <td class="p-3 text-right font-medium">{formatCurrency(item.price * item.qty)}</td>
                                    <td class="p-3 text-center">
                                        <button onclick={() => removeFromCart(i)} class="text-red-500 hover:text-red-700 font-bold text-xs uppercase">
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                        <tfoot class="bg-blue-50 text-blue-900 font-bold">
                            <tr>
                                <td colspan="3" class="p-3 text-right uppercase text-xs tracking-wider">Grand Total</td>
                                <td class="p-3 text-right text-lg">{formatCurrency(grandTotal)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            {:else}
                <div class="text-center py-8 text-gray-400 border-2 border-dashed rounded-xl mb-8">
                    Cart is empty. Add items above.
                </div>
            {/if}

            <!-- ACTION BUTTONS -->
            <div class="space-y-4">
                <!-- Wallet Status -->
                <div class="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <span class="text-gray-500">Wallet Status</span>
                    {#if isMetaMaskConnected}
                        <span class="flex items-center gap-2 text-green-600 font-bold">
                            <span class="h-2 w-2 bg-green-500 rounded-full"></span> Connected
                        </span>
                    {:else}
                        <button type="button" onclick={connectMetaMask} class="text-blue-600 font-bold hover:underline">Connect Wallet</button>
                    {/if}
                </div>

                <button onclick={handleSubmit} disabled={isLoading || cart.length === 0 || !isMetaMaskConnected} 
                    class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2">
                    {#if isLoading}
                        <span class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                        Processing...
                    {:else}
                        Sign Transaction & Record
                    {/if}
                </button>
            </div>

            {#if message.text}
                <div class="mt-6 p-4 rounded-xl text-center text-sm font-medium
                    {message.type === 'success' ? 'bg-green-50 text-green-700' : 
                     message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}">
                    {message.text}
                </div>
            {/if}
        </div>
    </div>
</div>
