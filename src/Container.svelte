<script>
    import {components} from './registry.js';

    console.log(components);

    export let children;

    console.log(children);
</script>

<h1>Hi from Container</h1>

{#if children}
    {#each children as child}
        <svelte:component this="{components[child.component]}" config="{child}"/>
    {/each}
{/if}

<svelte:options tag="puddy-container"/>