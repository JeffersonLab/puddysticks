<script>
    import RandomNumberGenerator from "../datasources/RandomNumberGenerator.svelte";
    import Label from "../components/Label.svelte";

    export let config = {};

    config.value = 'Loading...';

    /*We have this indirection to avoid sending config updates to RNG component*/
    let datasourceConfig = config.datasource;

    function update(e) {
        config.value = e.detail.value;
    }
</script>
<RandomNumberGenerator config="{datasourceConfig}" on:value="{update}"/>
<Label bind:config/>
<svelte:options tag="puddy-rng-label"/>