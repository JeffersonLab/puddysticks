<style>
    div {
        background-color: orange;
        color: white;
        border: 1px solid black;
        text-align: center;
    }
</style>
<script>
    import RandomNumberGenerator from "./RandomNumberGenerator.svelte";

    export let config;

    let value;
    let formattedValue;

    $: {
        /*Format Decimals*/
        if(config.datasource && config.datasource.decimals > 0) {
            formattedValue = (isNaN(value) ? value : value.toFixed(config.datasource.decimals));
        }
    }

    if(config.text) {
        formattedValue = config.text;
    }
</script>
<div>{formattedValue}</div>
{#if config.datasource && config.datasource.name === 'Random Number Generator'}
    <RandomNumberGenerator config="{config.datasource}" bind:value/>
{/if}
<svelte:options tag="puddy-label"/>