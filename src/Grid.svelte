<style>
    div {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
    }
</style>
<script>
    import Container from './Container.svelte';

    export let config;
</script>
<div>
    <Container children="{config.components}"/>
</div>
<svelte:options tag="puddy-grid"/>