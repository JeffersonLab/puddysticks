<script>
    import { onMount } from 'svelte';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    export let value;
    export let config;

    let duration = 1000;

    if(config.datasource) {
        duration = config.datasource.hz ? config.datasource.hz : duration;
    }

    const tween = tweened(0, {duration: 1000, easing: cubicOut});

    let next;

    $: {
        if(config.tween && !isNaN(next)) {
            tween.set(next);
            value = $tween;
        } else {
            value = next;
        }
    }


    let intMaxIncVal = config.intMaxInc ? 1 : 0;
    let min = config.min;
    let max = config.max;

    if(config.int) {
        min = Math.ceil(min);
        max = Math.floor(max);
    }

    function randomFloat() {
        return Math.random() * (max - min) + min;
    }

    function randomInt() {
        return Math.floor(Math.random() * (max - min + intMaxIncVal) + min);
    }

    onMount(() => {
        const interval = setInterval(() => {
            if(config.int) {
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