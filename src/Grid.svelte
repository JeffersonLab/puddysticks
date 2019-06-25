<style>
    div {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(1fr, 2fr));
    }
</style>
<script>
    import Container from './Container.svelte';

    export let config;
</script>

<h1>Hi from Grid</h1>
<div>
    <Container children="{config.components}"/>
</div>
<svelte:options tag="puddy-grid"/>