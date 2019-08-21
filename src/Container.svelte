<script>
    import {components, instances} from './registry.js';

    export let items;

    /*console.log(items);*/
</script>
{#if items}
    {#each items as item}
        {#if item.dataprovider}
            <svelte:component this="{components[item.name].dataproviders[item.dataprovider.name].constructor}" config="{instances[item.id]}"/>
        {:else}
            <svelte:component this="{components[item.name].constructor}" config="{instances[item.id]}"/>
        {/if}
    {/each}
{/if}
<svelte:options tag="puddy-container"/>