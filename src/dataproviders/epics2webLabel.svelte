<script>
    import Label from "../components/Label.svelte";

    export let config = {};

    let data = {value: 'Loading...'};

    function update(e) {
        if(e.detail.value !== undefined) {
            data.value = e.detail.value;
        }
    }
</script>
<Label {config} {data}/>
<svelte:options tag="puddy-epics2web-label"/>