<script>
    import {components} from '../registry.js';
    export let properties;

    let nonEditable = ['name', 'id', 'items', 'par'];
</script>
<table>
    <tbody>
    {#each Object.keys(properties).sort() as key}
        {#if key === 'dataprovider'}
            <tr>
                <th>dataprovider</th>
            </tr>
            <tr>
                <td>
                    <select bind:value="{properties[key].name}">
                        {#each Object.keys(components[properties.name].dataproviders) as provider}
                            <option>{provider}</option>
                        {/each}
                    </select>
                </td>
            </tr>
        {:else if !nonEditable.includes(key)}
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
<svelte:options tag="puddy-properties-editor"/>