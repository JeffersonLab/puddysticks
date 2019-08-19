<script>
    import DisplayNew from "./DisplayNew.svelte";
    import DisplayOpen from "./DisplayOpen.svelte";

    export let selected = {};
</script>
{#if selected && selected.textContent === 'New'}
    <DisplayNew/>
{:else}
    <DisplayOpen/>
{/if}
<svelte:options tag="puddy-no-display-main"/>