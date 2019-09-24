<script>
    import { model } from '../../registry.js';
    import Display from "../widgets/Display.svelte";

    export let promise;
</script>
    {#await promise}
        <p>...waiting</p>
    {:then config}
        {#if config}
            <Display config="{$model}"/>
        {/if}
    {:catch error}
        <p style="color: red">{error.message}</p>
    {/await}
<svelte:options tag="puddy-display-main"/>