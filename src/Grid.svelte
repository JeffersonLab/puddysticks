<script>
    import Container from './Container.svelte';
    import {components} from './components.js';

    export let config;
</script>

<h1>Hi from Grid</h1>

<Container {components} children="{config.components}"/>

<svelte:options tag="puddy-grid"/>