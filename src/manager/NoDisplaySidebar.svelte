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
    div {
        padding-top: 8px;
    }
    ul {
         margin-top: 0;
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
<div>
<Selectable bind:this="{selectable}" filter="li" bind:selected="{selected}">
    <ul>
        <li>Open</li>
        <li>New</li>
    </ul>
</Selectable>
</div>
<svelte:options tag="puddy-no-display-sidebar"/>