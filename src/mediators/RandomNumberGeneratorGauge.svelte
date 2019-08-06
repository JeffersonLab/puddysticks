<script>
    import RandomNumberGenerator from "../datasources/RandomNumberGenerator.svelte";
    import Gauge from "../components/Gauge.svelte";

    export let config;

    let value;
</script>
<RandomNumberGenerator config="{config.datasource}" bind:value/>
<Gauge {config} data="{value}"/>