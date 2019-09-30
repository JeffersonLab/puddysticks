<script>
    import DataSource from "../datasources/SharedRandomNumberGenerator.svelte";
    import Gauge from "../widgets/Gauge.svelte";

    export let config = {};

    let data = {value: 0};

    function update(e) {
        if(e.detail.value !== undefined) {
            data.value = e.detail.value;
        }
    }
</script>
<DataSource config="{config.dataprovider}" on:value="{update}"/>
<Gauge {config} {data}/>
<svelte:options tag="puddy-shared-rng-guage"/>