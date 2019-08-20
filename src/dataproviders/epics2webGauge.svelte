<script>
    import Gauge from "../components/Gauge.svelte";

    export let config = {};
</script>
<Gauge {config}/>
<svelte:options tag="puddy-epics2web-gauge"/>