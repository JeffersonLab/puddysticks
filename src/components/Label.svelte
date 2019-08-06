<style>
    div {
        background-color: orange;
        color: white;
        border: 1px solid black;
        text-align: center;
    }
</style>
<script>
    export let config;
    export let data;

    $: value = data ? data : 'Loading...';
    let formattedValue = '';

    $: {
        /*Format Decimals*/
        if(config.datasource && config.datasource.decimals > 0) {
            formattedValue = (value.toFixed ? value.toFixed(config.datasource.decimals) : value);
        }
    }

    if(config.text) {
        formattedValue = config.text;
    }
</script>
<div>{formattedValue}</div>
<svelte:options tag="puddy-label"/>