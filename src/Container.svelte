<script>
    import Instance from './Instance.svelte';

    export let items;

    /*console.log(items);*/
</script>
{#if items}
    {#each items as item}
        <Instance {item}/>
    {/each}
{/if}
<svelte:options tag="puddy-container"/>