<script>
    import Display from "../Display.svelte";

    export let promise;
</script>
    {#await promise}
        <p>...waiting</p>
    {:then config}
        {#if config}
            <Display {config}/>
        {/if}
    {:catch error}
        <p style="color: red">{error.message}</p>
    {/await}
<svelte:options tag="puddy-display-main"/>