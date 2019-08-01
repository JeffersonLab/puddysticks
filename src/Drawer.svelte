<style>
    .puddy-drawer {
        position: absolute;
        background-color: lightgray;
        height: 100%;
        z-index: 1;
        padding: 1em;
    }
</style>
<script>
    export let config;
</script>
<div class="puddy-drawer">
    <slot></slot>
</div>
<svelte:options tag="puddy-drawer"/>