<script>
    import {components} from '../registry.js';

    export let component;
    export let provider;
    export let properties;

    let defaultConfig = {};

    $: {
        if(provider) {
            defaultConfig = components[component].dataproviders[provider].config;
            properties = {...defaultConfig, ...properties};
            Object.keys(properties).forEach(key => {
                if (key !== 'name' && !(key in defaultConfig)) {
                    delete properties[key];
                }
            });
        }
    }

        let nonEditable = ['name', 'id', 'items', 'par'];
</script>
<table>
    <tbody>
    {#each Object.keys(properties).sort() as key}
        <!-- {#each Object.keys(components[properties.name].dataproviders[properties[key].name].config) as k}
                <tr>
                    <th>{k}</th>
                </tr>
                <tr>
                    <td></td>
                </tr>
            {/each} -->
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