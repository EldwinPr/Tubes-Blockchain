<script lang="ts">
    let { data } = $props();
</script>

<div style="padding: 2rem; font-family: sans-serif;">
    <h1>Tes Koneksi Database (Prisma 7)</h1>
    
    {#if data.status === 'Success'}
        <div style="background-color: #d4edda; color: #155724; padding: 1rem; border-radius: 4px; border: 1px solid #c3e6cb;">
            <strong>Berhasil!</strong> {data.message}
            <p>Jumlah User saat ini: {data.count}</p>
        </div>
    {:else}
        <div style="background-color: #f8d7da; color: #721c24; padding: 1rem; border-radius: 4px; border: 1px solid #f5c6cb;">
            <strong>Gagal!</strong> {data.message}
            <pre style="white-space: pre-wrap; word-break: break-all; background: #eee; padding: 10px; margin-top: 10px;">{data.error}</pre>
        </div>
    {/if}
</div>
