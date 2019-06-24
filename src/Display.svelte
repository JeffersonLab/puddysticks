<script context="module">
    export async function openRemoteFile(url) {
        const res = await fetch(url);
        const text = await res.text();

        if (res.ok) {
            return JSON.parse(text);
        } else {
            throw new Error(text);
        }
    };
</script>

<script>
    import Container from './Container.svelte';
    import {components} from './components.js';
    export let config;
</script>

<h1>Hi from Display</h1>

<Container {components} children="{config.components}"/>

<svelte:options tag="puddy-display"/>