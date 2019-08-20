<script>
    import {components} from './registry.js';
    import {mediators} from './registry.js';

    export let items;

    /*console.log(items);*/
</script>
{#if items}
    {#each items as item}
        {#if item.dataprovider}
            <svelte:component this="{components[item.name].dataproviders[item.dataprovider.name]}" config="{item}"/>
        {:else}
            <svelte:component this="{components[item.name].constructor}" config="{item}"/>
        {/if}
    {/each}
{/if}
<svelte:options tag="puddy-container"/>