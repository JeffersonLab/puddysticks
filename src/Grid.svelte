<script>
    import Container from './Container.svelte';

    export let config;

    let style;

    try {
        style =
                `
            grid-template-columns: ${config.style['grid-template-columns']};
            grid-template-rows: ${config.style['grid-template-rows']};
        `
        ;
    } catch(e) {
        console.log('Unable to parse Grid style:', e.message);
        style = ``;
    }
</script>
<style>
    div {
        display: grid;
    }
</style>
<div style="{style}">
    <Container children="{config.components}"/>
</div>
<svelte:options tag="puddy-grid"/>