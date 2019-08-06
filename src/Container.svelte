<script>
    import {components} from './registry.js';
    import {mediators} from './registry.js';

    export let items;

    /*console.log(items);*/
</script>
{#if items}
    {#each items as item}
        {#if item.datasource}
            <svelte:component this="{mediators[item.datasource.name + item.name]}" config="{item}"/>
        {:else}
            <svelte:component this="{components[item.name]}" config="{item}"/>
        {/if}
    {/each}
{/if}
<svelte:options tag="puddy-container"/>