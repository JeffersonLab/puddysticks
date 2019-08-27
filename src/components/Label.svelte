<style>
    div {
        border: 1px solid black;
        text-align: center;
    }
</style>
<script>
    /* Note: Default values are managed externally in file.js */
    export let config;

    let formattedValue = '';

    $: {
        /*Format Decimals*/
        formattedValue = (config.value && config.value.toFixed ? config.value.toFixed(config.decimals) : config.value);
    }
</script>
<div class="label" style="{config.style}">{formattedValue}</div>
<svelte:options tag="puddy-label"/>