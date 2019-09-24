<style>
        h1 {
                margin-top: 0;
        }
        .new-container {
                padding: 1em;
        }
</style>
<script>
        import { createEventDispatcher } from 'svelte';
        import { openFile } from '../../util/file.js';

        const dispatch = createEventDispatcher();

        function newBlank() {
                dispatch('newfile', openFile('{"name": "Display", "title": "Untitled"}'));
        }
</script>
<div class="new-container">
        <h1>New Display</h1>
        <button on:click="{newBlank}">Blank</button>
</div>
<svelte:options tag="puddy-display-new-pane"/>