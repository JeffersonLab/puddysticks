<script>
    import Container from '../Container.svelte';

    /* Note: Default values are managed externally in file.js */
    export let config;
</script>
<div class="panel" style="{config.style}">
    <slot>
        <Container items="{config.items}"/>
    </slot>
</div>
<svelte:options tag="puddy-panel"/>