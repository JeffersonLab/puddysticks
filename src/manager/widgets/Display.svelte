<script>
    import {instanceStores} from '../util/registry.js';
    import Container from '../util/Container.svelte';

    export let config = {};

    /*$: console.log(config);*/

    $: properties = instanceStores[config.id];

</script>
<div class="display" style="{$properties.style}">
    <Container items="{config.items}"/>
</div>
<svelte:options tag="puddy-display"/>
<svelte:head>
    {#if $properties.theme}
        <link rel='stylesheet' href='themes/{$properties.theme}.css'>
    {/if}
</svelte:head>