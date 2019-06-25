<script>
    import {components} from './registry.js';

    export let children;
</script>
{#if children}
    {#each children as child}
        <svelte:component this="{components[child.component]}" config="{child}"/>
    {/each}
{/if}
<svelte:options tag="puddy-container"/>