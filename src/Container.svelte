<script>
    import Instance from './Instance.svelte';

    export let items;
</script>
{#if items}
    {#each items as item}
        <Instance {item}/>
    {/each}
{/if}
<svelte:options tag="puddy-container"/>