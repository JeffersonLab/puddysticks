<script>
    import RandomNumberGenerator from "../datasources/RandomNumberGenerator.svelte";
    import Gauge from "../components/Gauge.svelte";

    export let config;

    let dataproviderConfig = config.dataprovider;

    function update(e) {
        config.value = e.detail.value;
    }

    config.min = config.dataprovider.min;
    config.max = config.dataprovider.max;
</script>
<RandomNumberGenerator config="{dataproviderConfig}" on:value="{update}"/>
<Gauge {config}/>
<svelte:options tag="puddy-rng-guage"/>