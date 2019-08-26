<script>
    import DisplayNew from "./DisplayNew.svelte";
    import DisplayOpen from "./DisplayOpen.svelte";

    export let selected = {};
</script>
{#if selected && selected.textContent === 'New'}
    <DisplayNew on:newfile/>
{:else}
    <DisplayOpen on:localfile/>
{/if}
<svelte:options tag="puddy-no-display-main"/>