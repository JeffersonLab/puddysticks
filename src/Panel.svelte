<script>
    import Container from './Container.svelte';

    export let config;
</script>

<h1>Hi from Panel</h1>
<div>
    <Container children="{config.components}"/>
</div>

<svelte:options tag="puddy-panel"/>