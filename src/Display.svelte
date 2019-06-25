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
    export let config;
</script>
<Container children="{config.components}"/>
<svelte:options tag="puddy-display"/>