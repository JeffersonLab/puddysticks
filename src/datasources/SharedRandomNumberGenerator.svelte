<script>
    import { a, b, c } from './rng/channels.js';
    import { createEventDispatcher } from 'svelte';

    let defaultConfig = {channel: 'a'};

    export let config = defaultConfig;

    $: {
        config = {...defaultConfig, ...config};
    }

    const dispatch = createEventDispatcher();

    let value;

    $: {
        if(config.channel === 'c') {
            value = $c;
        } else if(config.channel === 'b') {
            value = $b;
        } else {
            value = $a;
        }

        dispatch('value', {
            value: value
        });
    }
</script>
<svelte:options tag="puddy-shared-rng"/>