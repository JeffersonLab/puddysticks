<script>
    import {instanceStores} from './registry.js';
    import Container from './Container.svelte';

    export let config = {};

    /*$: console.log(config);*/

    $: properties = instanceStores[config.id];

</script>
<div class="display" style="{$properties.style}">
    <Container items="{config.items}"/>
</div>
<svelte:options tag="puddy-display"/>