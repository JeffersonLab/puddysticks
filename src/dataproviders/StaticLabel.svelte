<script>
    import Label from "../widgets/Label.svelte";

    export let config = {};

    $: data = {value: config.dataprovider.value};
</script>
<Label bind:config {data}/>
<svelte:options tag="puddy-static-label"/>