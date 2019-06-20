<script>
    import Container from './Container.svelte';
    export let config;
</script>

<h1>Hi from Display</h1>

<Container children="{config.components}"/>

<svelte:options tag="wedm-display"/>