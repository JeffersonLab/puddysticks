<script>
    import DataSource from "../datasources/RandomNumberGenerator.svelte";
    import Label from "../widgets/Label.svelte";

    export let config = {};

    let data = {value: 'Load'};

    function update(e) {
        if(e.detail.value !== undefined) {
            data.value = e.detail.value;
        }
    }
</script>
<DataSource config="{config.dataprovider}" on:value="{update}"/>
<Label {config} {data}/>
<svelte:options tag="puddy-rng-label"/>