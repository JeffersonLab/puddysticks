<script>
    import {instanceStores} from './registry.js';

    /* The root Display always has same ID */
    let id = 'puddy-0';

    $: properties = instanceStores[id];
</script>
<svelte:head>
        <title>Puddysticks {$properties.title}</title>
</svelte:head>