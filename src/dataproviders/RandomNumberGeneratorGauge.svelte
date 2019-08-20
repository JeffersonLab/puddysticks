<script>
    import RandomNumberGenerator from "../datasources/RandomNumberGenerator.svelte";
    import Gauge from "../components/Gauge.svelte";

    export let config;

    let data;

    function update(e) {
        data = {value: e.detail.value};
    }

    config.min = config.dataprovider.min;
    config.max = config.dataprovider.max;
</script>
<RandomNumberGenerator config="{config.dataprovider}" on:value="{update}"/>
<Gauge {config} {data}/>
<svelte:options tag="puddy-rng-guage"/>