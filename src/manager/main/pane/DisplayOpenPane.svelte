<style>
        h1 {
                margin-top: 0;
        }
</style>
<script>
        import LocalFileReader from '../../util/LocalFileReader.svelte';
</script>
<div style="padding: 1em;">
        <h1>Open Display</h1>
        <h3>Examples</h3>
        <ul>
                <li><a href="?display=examples/exampleA.puddy">Example A</a></li>
                {#if 'EPICS2WEB_ENABLED' === 'true'}
                <li><a href="?display=examples/exampleB.puddy">Example B</a></li>
                {/if}
        </ul>
        <h2>Local</h2>
        <LocalFileReader on:localfile/>
</div>
<svelte:options tag="puddy-display-open-pane"/>