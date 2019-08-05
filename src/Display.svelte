<script context="module">
    export async function openRemoteFile(url) {
        const res = await fetch(url);
        const text = await res.text();

        if (res.ok) {
            let obj = JSON.parse(text);

            assignUniqueId(obj);

            return {lookup: lookup, obj: obj};
        } else {
            throw new Error(text);
        }
    };

    let id = 0;
    let lookup = {};

    function assignUniqueId(obj) {
        obj.id = 'puddy-' + id++;
        lookup[obj.id] = obj;

        /*console.log(obj);*/

        if(obj.items) {
            for (const item of obj.items) {
                assignUniqueId(item);
            }
        }
    }
</script>
<script>
    import Container from './Container.svelte';
    export let config;

    /*console.log(config);*/

</script>
<Container items="{config.items}"/>
<svelte:options tag="puddy-display"/>