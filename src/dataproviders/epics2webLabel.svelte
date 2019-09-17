<script>
    import Label from "../components/Label.svelte";
    import Epics2Web from "../datasources/Epics2Web.svelte";

    export let config = {};

    let data = {value: 'Loading...'};

    function update(e) {
        if(e.detail.value !== undefined) {
            data.value = e.detail.value;
        }
    }
</script>
<Epics2Web config="{config.dataprovider}" on:value="{update}"/>
<Label {config} {data}/>
<svelte:options tag="puddy-epics2web-label"/>