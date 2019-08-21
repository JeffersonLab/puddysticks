<script>
    import {components, instances} from './registry.js';

    export let item;

    $: properties = instances[item.id];

</script>
        {#if item.dataprovider}
            <svelte:component this="{components[item.name].dataproviders[item.dataprovider.name].constructor}" bind:config="{$properties}"/>
        {:else}
            <svelte:component this="{components[item.name].constructor}" bind:config="{$properties}"/>
        {/if}
<svelte:options tag="puddy-instance"/>