<script>
    import Indicator from "../widgets/Indicator.svelte";
    import Epics2Web from "../datasources/Epics2Web.svelte";

    export let config = {};

    let data = {value: 'No Channel'};

    function update(e) {
        if(e.detail.value !== undefined) {
            data.value = e.detail.value;
        } else if(e.detail.type === 'info') {
            if(!e.detail.connected) {
                data.value = 'Disconnected';
            }
        }
    }
</script>
<Epics2Web config="{config.dataprovider}" on:value="{update}"/>
<Indicator {config} {data}/>
<svelte:options tag="puddy-epics2web-indicator"/>