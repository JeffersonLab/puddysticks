<script>
    import DisplayNew from "./pane/DisplayNewPane.svelte";
    import DisplayOpen from "./pane/DisplayOpenPane.svelte";

    export let selected = {};
</script>
{#if selected && selected.textContent === 'New'}
    <DisplayNew on:newfile/>
{:else}
    <DisplayOpen on:localfile/>
{/if}
<svelte:options tag="puddy-no-display-main"/>