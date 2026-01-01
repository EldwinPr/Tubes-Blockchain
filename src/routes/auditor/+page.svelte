<script lang="ts">
    import { onMount } from 'svelte';

    interface Auditor {
        user_Id: string;
        name: string;
        email: string;
    }

    let auditors: Auditor[] = $state([]);
    let isLoading = $state(true);

    async function fetchAuditors() {
        try {
            const res = await fetch('/api/auditors');
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    auditors = data.data;
                } else {
                    console.error('Failed to fetch auditors:', data.error);
                }
            } else {
                console.error('Failed to fetch auditors:', res.status, res.statusText);
            }
        } catch (e) {
            console.error('Error fetching auditors:', e);
            // Fallback to empty array
            auditors = [];
        } finally {
            isLoading = false;
        }
    }

    onMount(fetchAuditors);
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div class="bg-purple-600 p-8 text-white text-center">
            <h1 class="text-3xl font-bold mb-2">Auditor Portal</h1>
            <p class="text-purple-100 text-sm">Prototype - Select an identity to continue</p>
        </div>

        <div class="p-8">
            <div class="space-y-4">
                {#each auditors as auditor}
                    <a href={`/auditor/${auditor.user_Id}`} class="block p-4 rounded-2xl border-2 border-gray-100 hover:border-purple-500 hover:bg-purple-50 transition-all group">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-bold text-gray-900 group-hover:text-purple-700">{auditor.name}</h3>
                                <p class="text-xs text-gray-500 font-mono mt-1">{auditor.user_Id}</p>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-300 group-hover:text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </a>
                {:else}
                    <div class="text-center py-10">
                        <span class="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full inline-block"></span>
                        <p class="text-gray-400 mt-4">Loading active auditors...</p>
                    </div>
                {/each}
            </div>

            <p class="mt-8 text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                Identity based on Database Seed
            </p>
        </div>
    </div>
</div>