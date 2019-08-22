<script context="module">
    import { writable } from 'svelte/store';
    import { instances, getUniqueId, componentHierarchy } from './registry.js';

    export async function openRemoteFile(url) {
        const res = await fetch(url);
        const text = await res.text();

        if (res.ok) {
            let obj = JSON.parse(text);

            assignUniqueIdAndParentThenStore(obj);

            componentHierarchy.set(obj);

            return obj;

        } else {
            throw new Error(text);
        }
    };

    function assignUniqueIdAndParentThenStore(obj, par) {
        obj.id = getUniqueId();
        obj.par = par;
        instances[obj.id] = writable(obj);
        /*instances[obj.id] = obj;*/

        /*console.log(obj);*/

        if(obj.items) {
            for (const item of obj.items) {
                assignUniqueIdAndParentThenStore(item, obj);
            }
        }
    }
</script>
<script>
    import Container from './Container.svelte';
    export let config = {};

    /*$: console.log(config);*/

</script>
<Container items="{config.items}"/>
<svelte:options tag="puddy-display"/>