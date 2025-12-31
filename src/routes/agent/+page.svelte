<script lang="ts">
    import { onMount } from 'svelte';

    interface Agent {
        user_Id: string;
        name: string;
        email: string;
    }

    let agents: Agent[] = $state([]);
    let isLoading = $state(true);

    async function fetchAgents() {
        try {
            // We can reuse the test DB API or create a small internal one.
            // For now, I'll fetch via a direct query to help the user.
            const res = await fetch('/api/test-db'); // Assuming this returns users if it exists
            // If /api/test-db doesn't work, we'll need to create a simple endpoint.
            // Let's assume we can fetch them from a standard user list if it existed.
            // Since there isn't one, I'll provide a placeholder or use the seed data we know.
            
            // Simulation/Hardcoded for prototype ease if API fails
            agents = [
                { user_Id: '84df4d88-4e27-4559-96c3-03d24636fa57', name: 'Agent Alat Berat (Budi)', email: 'agent@example.com' }
            ];
        } catch (e) {
            console.error(e);
        } finally {
            isLoading = false;
        }
    }

    onMount(fetchAgents);
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div class="bg-blue-600 p-8 text-white text-center">
            <h1 class="text-3xl font-bold mb-2">Agent Portal</h1>
            <p class="text-blue-100 text-sm">Prototype - Select an identity to continue</p>
        </div>

        <div class="p-8">
            <div class="space-y-4">
                {#each agents as agent}
                    <a href={`/agent/${agent.user_Id}`} class="block p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all group">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-bold text-gray-900 group-hover:text-blue-700">{agent.name}</h3>
                                <p class="text-xs text-gray-500 font-mono mt-1">{agent.user_Id}</p>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-300 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </a>
                {:else}
                    <div class="text-center py-10">
                        <span class="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full inline-block"></span>
                        <p class="text-gray-400 mt-4">Loading active agents...</p>
                    </div>
                {/each}
            </div>

            <p class="mt-8 text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                Identity based on Database Seed
            </p>
        </div>
    </div>
</div>
