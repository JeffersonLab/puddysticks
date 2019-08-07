<script>
    import RandomNumberGenerator from "../datasources/RandomNumberGenerator.svelte";
    import Label from "../components/Label.svelte";

    export let config;

    let data;

    function update(e) {
        data = {value: e.detail.value};
    }
</script>
<RandomNumberGenerator config="{config.datasource}" on:value="{update}"/>
<Label {config} {data}/>