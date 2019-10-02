<style>
</style>
<script>
    export let config;
</script>
<div class="arc {config.class}" style="{config.style}">
    <svg viewBox="{config.viewBox}">
        <path d="{config.d}"/>
    </svg>
</div>
<svelte:options tag="puddy-shape"/>