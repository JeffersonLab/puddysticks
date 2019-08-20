<script>
    import Container from '../Container.svelte';

    export let config = {};
</script>
<div class="panel">
    <slot>
        <Container items="{config.items}"/>
    </slot>
</div>
<svelte:options tag="puddy-panel"/>