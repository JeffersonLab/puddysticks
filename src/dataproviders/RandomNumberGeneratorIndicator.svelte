<script>
    import RandomNumberGenerator from "../datasources/RandomNumberGenerator.svelte";
    import Indicator from "../components/Indicator.svelte";

    export let config;

    let data;

    function update(e) {
        data = {value: e.detail.value};
    }
</script>
<RandomNumberGenerator config="{config.dataprovider}" on:value="{update}"/>
<Indicator {config} {data}/>
<svelte:options tag="puddy-rng-indicator"/>