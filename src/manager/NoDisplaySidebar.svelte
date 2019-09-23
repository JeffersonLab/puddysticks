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
        list-style: none;
    }
    ul li {
        margin: 1em 0;
        padding: 1em;
        border-radius: 8px 0 0 8px;
    }
    h1 {
        padding-left: 8px;
        margin-top: 0;
        display: block;
        min-width: 242px;
    }
    .logo-icon {
        width: 64px;
        height: 64px;
        background-size: cover;
        display: inline-block;
        background: url(icons/logo.svg) 0 0 no-repeat;
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
    <h1><i class="logo-icon"></i> Puddysticks</h1>
<Selectable bind:this="{selectable}" filter="li" bind:selected="{selected}">
    <ul>
        <li>Open</li>
        <li>New</li>
    </ul>
</Selectable>
</div>
<svelte:options tag="puddy-no-display-sidebar"/>