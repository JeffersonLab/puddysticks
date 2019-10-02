<script>
    import { a, b, c } from './rng/channels.js';
    import { createEventDispatcher } from 'svelte';

    let defaultConfig = {channel: 'a'};

    export let config = defaultConfig;

    $: {
        config = {...defaultConfig, ...config};
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