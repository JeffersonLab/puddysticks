<script>
    import Label from "../widgets/Label.svelte";
    import Epics2Web from "../datasources/Epics2Web.svelte";

    export let config = {};

    let data = {value: 'None'};

    function update(e) {
        if(e.detail.value !== undefined) {
            data.value = e.detail.value;
        } else if(e.detail.type === 'info') {
            if(!e.detail.connected) {
                data.value = 'Error';
            }
        }
    }
</script>
<Epics2Web config="{config.dataprovider}" on:value="{update}"/>
<Label {config} {data}/>
<svelte:options tag="puddy-epics2web-label"/>