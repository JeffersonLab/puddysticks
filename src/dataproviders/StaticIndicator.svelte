<script>
    import Indicator from "../components/Indicator.svelte";

    export let config = {};
</script>
<Indicator bind:config/>
<svelte:options tag="puddy-static-indicator"/>