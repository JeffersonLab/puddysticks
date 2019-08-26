<style>
        h1 {
                margin-top: 0;
        }
</style>
<script>
        import LocalFileReader from '../LocalFileReader.svelte';
</script>
<div style="padding: 1em;">
        <h1>Open Display</h1>
        <h2>Remote</h2>
        <h3>Recent</h3>
        <h3>Examples</h3>
        <ul>
                <li><a href="?display=examples/exampleA.wedm">Example A</a></li>
                <li><a href="?display=examples/exampleB.wedm">Example B</a></li>
                <li><a href="?display=examples/exampleC.wedm">Example C</a></li>
                <li><a href="?display=examples/exampleD.wedm">Example D</a></li>
        </ul>
        <h2>Local</h2>
        <LocalFileReader on:localfile/>
</div>
<svelte:options tag="puddy-display-open"/>