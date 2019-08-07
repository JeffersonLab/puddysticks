<script>
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    let defaultConfig = {min: 0, max: 100, hz: 1, intVal: false, intMaxInc: false, tween: false};

    export let config = defaultConfig;

    config = {...defaultConfig, ...config};

    /*let min = config.min ? config.min : 0;
    let max = config.max ? config.max : 100;
    let hz = config.hz ? config.hz : 1;
    let intVal = config.intVal ? config.intVal : false;
    let intMaxInc = config.intMaxInc ? config.intMaxInc : false;
    let tween = config.tween ? config.tween : false;*/

    const dispatch = createEventDispatcher();
    const tweener = tweened(0, {duration: config.hz * 1000, easing: cubicOut});

    let value;
    let next;

    $: {
        if(config.tween && !isNaN(next)) {
            tweener.set(next);
            value = $tweener;
        } else {
            value = next;
        }

        dispatch('value', {
            value: value
        });
    }


    let intMaxIncVal = config.intMaxInc ? 1 : 0;

    if(config.intVal) {
        config.min = Math.ceil(config.min);
        config.max = Math.floor(config.max);
    }

    function randomFloat() {
        return Math.random() * (config.max - config.min) + config.min;
    }

    function randomInt() {
        return Math.floor(Math.random() * (config.max - config.min + intMaxIncVal) + config.min);
    }

    onMount(() => {
        const interval = setInterval(() => {
            if(config.intVal) {
                next = randomInt();
            } else {
                next = randomFloat();
            }
        }, 1000 * config.hz);

        return () => {
            clearInterval(interval);
        };
    });
</script>
<svelte:options tag="puddy-rng"/>