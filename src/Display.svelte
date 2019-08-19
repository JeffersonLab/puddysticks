<script context="module">
    import { display } from './stores.js';

    export async function openRemoteFile(url) {
        const res = await fetch(url);
        const text = await res.text();

        if (res.ok) {
            let obj = JSON.parse(text);

            assignUniqueId(obj);

            let result = {lookup: lookup, nextId: id, obj: obj};

            display.set(result);

            return result;

        } else {
            throw new Error(text);
        }
    };

    let id = 0;
    let lookup = {};

    function assignUniqueId(obj, par) {
        obj.id = 'puddy-' + id++;
        obj.par = par;
        lookup[obj.id] = obj;

        /*console.log(obj);*/

        if(obj.items) {
            for (const item of obj.items) {
                assignUniqueId(item, obj);
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