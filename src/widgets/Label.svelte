<script>
    /* Note: Default values are managed externally in file.js */
    export let config;

    /* data is separate from config because they update at different frequencies and also to avoid circular dependency since datasource config is nested inside config */
    export let data = {value: 0};

    let formattedValue = '';

    $: {
        /*Format Decimals*/
        if(config.dataprovider && config.dataprovider.decimals && data.value && data.value.toFixed) {
            formattedValue = data.value.toFixed(config.dataprovider.decimals);
        } else {
            formattedValue = data.value;
        }
    }
</script>
<span class="label {config.class}" style="{config.style}">{formattedValue}</span>
<svelte:options tag="puddy-label"/>