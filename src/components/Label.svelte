<style>
    div {
        border: 1px solid black;
        text-align: center;
    }
</style>
<script>
    const defaultConfig = {datasource: {name: 'Static'}, text: 'Label', decimals: 0, style: ''};

    export let config = defaultConfig;
    export let data = {value: 'Loading...'};

    config = {...defaultConfig, ...config};

    let formattedValue = '';

    $: {

        if(config.text) {
            data.value = config.text;
        }

        /*Format Decimals*/
        formattedValue = (data.value && data.value.toFixed ? data.value.toFixed(config.decimals) : data.value);
    }
</script>
<div class="label" style="{config.style}">{formattedValue}</div>
<svelte:options tag="puddy-label"/>