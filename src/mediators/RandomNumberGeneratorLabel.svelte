<script>
    import RandomNumberGenerator from "../datasources/RandomNumberGenerator.svelte";
    import Label from "../components/Label.svelte";

    export let config;

    let value;
</script>
<RandomNumberGenerator config="{config.datasource}" bind:value/>
<Label {config} data="{value}"/>