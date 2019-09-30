<script>
    import DataSource from "../datasources/SharedRandomNumberGenerator.svelte";
    import Indicator from "../widgets/Indicator.svelte";

    export let config;

    let data;

    function update(e) {
        data = {value: e.detail.value};
    }
</script>
<DataSource config="{config.dataprovider}" on:value="{update}"/>
<Indicator bind:config {data}/>
<svelte:options tag="puddy-shared-rng-indicator"/>