<script>
    import Gauge from "../components/Gauge.svelte";

    export let config = {};

    $: data = {value: config.dataprovider.value};
</script>
<Gauge {config} {data}/>
<svelte:options tag="puddy-static-gauge"/>