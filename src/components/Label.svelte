<style>
    div {
        border: 1px solid black;
        text-align: center;
    }
</style>
<script>
    let defaultConfig = {decimals: 0, style: ''};

    export let config = defaultConfig;
    export let data = {value: 'Loading...'};

    config = {...defaultConfig, ...config};

    if(config.text) {
        data.value = config.text;
    }

    let formattedValue = '';

    $: {
        /*Format Decimals*/
        formattedValue = (data.value.toFixed ? data.value.toFixed(config.decimals) : data.value);
    }
</script>
<div class="label" style="{config.style}">{formattedValue}</div>
<svelte:options tag="puddy-label"/>