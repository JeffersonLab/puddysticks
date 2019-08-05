<style>
    div {
        background-color: orange;
        color: white;
        border: 1px solid black;
        text-align: center;
    }
</style>
<script>
    import {onMount} from 'svelte';

    export let config;

    onMount(() => {
        if(config.datasource && config.datasource.name == 'Random Number Generator') {
            const interval = setInterval(() => {
                config.text = (Math.floor(Math.random() * 101));
            }, 1000);

            return () => {
                clearInterval(interval);
            };
        }
    });

</script>
<div>{config.text}</div>
<svelte:options tag="puddy-label"/>