<script>
    import { a, b, c } from './rng/channels.js';
    import { createEventDispatcher } from 'svelte';

    let defaultConfig = {channel: 'a'};

    export let config = defaultConfig;

    $: {
        Object.keys(defaultConfig).forEach(key => {
            if(!(key in config)) {
                config[key] = defaultConfig[key];
            }
        });

        /* Data Source should not remove keys used by other data sources*/
        /*Object.keys(config).forEach(key => {
            if (key !== 'name' && !(key in defaultConfig)) {
                delete config[key];
            }
        });*/
    }

    const dispatch = createEventDispatcher();

    let channels = {a: a, b: b, c: c};

    $: value = channels[config.channel] || a;

    $: {
        dispatch('value', {
            value: $value
        });
    }
</script>
<svelte:options tag="puddy-shared-rng"/>