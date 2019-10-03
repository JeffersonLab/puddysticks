<script>
    import { a, b, c } from './rng/channels.js';
    import { createEventDispatcher } from 'svelte';

    /* TODO: min and max are included here because guage requires them even though shared RNG doesn't use them.  Need to re-think this */
    let defaultConfig = {min: 0, max: 100, channel: 'a'};

    export let config = defaultConfig;

    $: {
        Object.keys(defaultConfig).forEach(key => {
            if(!(key in config)) {
                config[key] = defaultConfig[key];
            }
        });

        Object.keys(config).forEach(key => {
            if (key !== 'name' && !(key in defaultConfig)) {
                delete config[key];
            }
        });
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