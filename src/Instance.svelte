<script>
    import {components, instances, instanceStores} from './registry.js';

    export let item;

    $: properties = instanceStores[item.id];

    /*$: console.log($properties);*/

</script>
        {#if item.dataprovider}
            <svelte:component this="{components[item.name].dataproviders[item.dataprovider.name].constructor}" bind:config="{$properties}"/>
        {:else}
            <svelte:component this="{components[item.name].constructor}" bind:config="{$properties}"/>
        {/if}
<svelte:options tag="puddy-instance"/>