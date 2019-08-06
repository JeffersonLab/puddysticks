<script>
    import { onMount } from 'svelte';

    export let value;
    export let config;

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
                value = randomInt();
            } else {
                value = randomFloat();
            }
        }, 1000 * config.hz);

        return () => {
            clearInterval(interval);
        };
    });
</script>