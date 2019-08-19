<style>
    li {
        cursor: pointer;
    }
    li:hover {
        background-color: lightblue;
    }
    :global(li.selected) { /*Svelte wants to compile this CSS class out unless we make it global since the compiler thinks the class isn't used*/
        background-color: white;
    }
</style>
<script>
    import Selectable from "../Selectable.svelte";
    import { onMount } from 'svelte';

    export let selected = {};

    let selectable;

    onMount(() => {
        selectable.select('li:first-child');
    });
</script>
<Selectable bind:this="{selectable}" filter="li" bind:selected="{selected}">
    <ul>
        <li>Open</li>
        <li>New</li>
    </ul>
</Selectable>
<svelte:options tag="puddy-no-display-sidebar"/>