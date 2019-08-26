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
        import { openFile } from './file.js';

        const dispatch = createEventDispatcher();

        function newBlank() {
                console.log('newBlank');
                dispatch('newfile', openFile('{"name": "Display", "title": "Untitled"}'));
        }
</script>
<div class="new-container">
        <h1>New Display</h1>
        <button on:click="{newBlank}">Blank</button>
        <h2>From Template</h2>
        <ul>
                <li><a href="?display=templates/responsive-grid.puddy">Responsive Grid</a></li>
                <li><a href="?display=templates/with-navigation.puddy">With Navigation</a></li>
        </ul>
</div>
<svelte:options tag="puddy-display-new"/>