<script>
    import { a, b } from './rng/channels.js';
    import { createEventDispatcher } from 'svelte';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    let defaultConfig = {channel: 'a', tween: false};

    export let config = defaultConfig;

    $: {
        config = {...defaultConfig, ...config};

        /*Again, if we used Svelte checkbox then conversion is automatic... */
        config.tween = (config.tween === true || config.tween === 'true') ? true : false;

        /*console.log(config);*/
    }

    let stores = {a: $a, b: $b};

    const dispatch = createEventDispatcher();
    $: tweener = tweened(0, {duration: 1000, easing: cubicOut});

    let value;
    let next;

    $: if(config.channel === 'a') {
        next = $a;
    } else {
        next = $b;
    }

    $: {
        if(config.tween && next != null && !isNaN(next)) {
            tweener.set(next);
            value = $tweener;
        } else {
            value = next;
        }

        dispatch('value', {
            value: value
        });
    }

</script>
<svelte:options tag="puddy-shared-rng"/>