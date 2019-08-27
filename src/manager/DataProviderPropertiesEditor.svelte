<script>
    import {components} from '../registry.js';

    export let component;
    export let provider;
    export let properties;

    let defaultConfig = {};

    $: {
        if(provider) {
            defaultConfig = components[component].dataproviders[provider].defaults;
            if(defaultConfig) {

                Object.keys(defaultConfig).forEach(key => {
                    if(!(key in properties)) {
                        /*console.log('adding key', key);*/
                        properties[key] = defaultConfig[key];
                    }
                });

                /*properties = {...defaultConfig, ...properties};*/
                Object.keys(properties).forEach(key => {
                    if (key !== 'name' && !(key in defaultConfig)) {
                        /*console.log('removing key', key);*/
                        delete properties[key];
                    }
                });
            }
        }
    }

        let nonEditable = ['name', 'id', 'items', 'par'];
</script>
<table>
    <tbody>
    {#each Object.keys(properties).sort() as key}
        {#if !nonEditable.includes(key)}
            <tr>
                <th>{key}</th>
            </tr>
            <tr>
                <td><input type="text" bind:value="{properties[key]}"/></td>
            </tr>
        {/if}
    {/each}
    </tbody>
</table>
<svelte:options tag="puddy-data-provider-properties-editor"/>