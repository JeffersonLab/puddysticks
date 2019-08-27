<script>
    import RandomNumberGenerator from "../datasources/RandomNumberGenerator.svelte";
    import Label from "../components/Label.svelte";

    export let config = {};

    let data = {value: 'Loading...'};

    function update(e) {
        if(e.detail.value !== undefined) {
            data.value = e.detail.value;
        }
    }
</script>
<RandomNumberGenerator config="{config.dataprovider}" on:value="{update}"/>
<Label {config} {data}/>
<svelte:options tag="puddy-rng-label"/>