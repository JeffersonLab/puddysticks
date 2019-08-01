<script>
    import Container from './Container.svelte';

    export let config;
</script>
<div>
    <Container items="{config.items}"/>
</div>
<svelte:options tag="puddy-panel"/>