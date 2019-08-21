<style>
    div {
        border: 1px solid black;
        text-align: center;
    }
</style>
<script>
    const defaultConfig = {dataprovider: {name: 'Static'}, text: 'Label', decimals: 0, style: ''};

    export let config = defaultConfig;

    config = {...defaultConfig, ...config};

    let formattedValue = '';

    $: {
        /*Format Decimals*/
        formattedValue = (config.text && config.text.toFixed ? config.text.toFixed(config.decimals) : config.text);

        console.log(config);
    }
</script>
<div class="label" style="{config.style}">{formattedValue}</div>
<svelte:options tag="puddy-label"/>