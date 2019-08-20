<script>
    import Container from '../Container.svelte';

    const defaultConfig = {style: ''};

    export let config = defaultConfig;

    config = {...defaultConfig, ...config};
</script>
<div class="panel" style="{config.style}">
    <slot>
        <Container items="{config.items}"/>
    </slot>
</div>
<svelte:options tag="puddy-panel"/>