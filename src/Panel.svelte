<script>
    import Container from './Container.svelte';

    export let config;
</script>
<div>
    <Container children="{config.components}"/>
</div>
<svelte:options tag="puddy-panel"/>