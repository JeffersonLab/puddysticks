<script>
    import {widgets, instances, instanceStores} from './registry.js';

    export let item;

    $: properties = instanceStores[item.id];

    /*$: console.log($properties);*/

</script>
        {#if $properties.dataprovider}
            <svelte:component this="{widgets[$properties.name].dataproviders[$properties.dataprovider.name].constructor}" bind:config="{$properties}"/>
        {:else}
            <svelte:component this="{widgets[$properties.name].constructor}" bind:config="{$properties}"/>
        {/if}
<svelte:options tag="puddy-instance"/>