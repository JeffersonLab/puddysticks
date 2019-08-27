<script>
    import RandomNumberGenerator from "../datasources/RandomNumberGenerator.svelte";
    import Gauge from "../components/Gauge.svelte";

    export let config = {};

    let data = {value: 0};

    function update(e) {
        if(e.detail.value !== undefined) {
            data.value = e.detail.value;
        }
    }
</script>
<RandomNumberGenerator config="{config.dataprovider}" on:value="{update}"/>
<Gauge {config} {data}/>
<svelte:options tag="puddy-rng-guage"/>