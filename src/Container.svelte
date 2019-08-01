<script>
    import {components} from './registry.js';

    export let items;

    console.log(items);
</script>
{#if items}
    {#each items as item}
        <svelte:component this="{components[item.name]}" config="{item}"/>
    {/each}
{/if}
<svelte:options tag="puddy-container"/>