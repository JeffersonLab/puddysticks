<script>
    import Indicator from "../widgets/Indicator.svelte";

    export let config = {};

    $: data = {value: config.dataprovider.value};
</script>
<Indicator bind:config {data}/>
<svelte:options tag="puddy-static-indicator"/>