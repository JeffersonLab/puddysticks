<style>
    div {
        background-color: orange;
        color: white;
        border: 1px solid black;
        text-align: center;
    }
</style>
<script>
    export let config;
</script>
<div>{config.text}</div>
<svelte:options tag="puddy-label"/>