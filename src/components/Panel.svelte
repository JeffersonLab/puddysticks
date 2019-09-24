<script>
    import Container from '../manager/util/Container.svelte';

    /* Note: Default values are managed externally in file.js */
    export let config;
</script>
<div class="panel {config.class}" style="{config.style}">
    <slot>
        <Container items="{config.items}"/>
    </slot>
</div>
<svelte:options tag="puddy-panel"/>