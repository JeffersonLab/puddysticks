<script>
    import {components, instances, instanceStores} from '../registry.js';
    import DataProviderPropertiesEditor from './DataProviderPropertiesEditor.svelte';

    export let selected;
    $: properties = instanceStores[selected];

    const noneditable = ['name', 'id', 'items', 'par'];
</script>
    {#each Object.keys($properties).sort() as key}
        {#if key === 'dataprovider'}
            <div>dataprovider</div>
                <div>
                    <select bind:value="{$properties[key].name}">
                        {#each Object.keys(components[$properties.name].dataproviders) as provider}
                            <option>{provider}</option>
                        {/each}
                    </select>
                </div>
            <DataProviderPropertiesEditor component="{$properties.name}" provider="{$properties[key].name}" bind:properties="{$properties.dataprovider}"/>
        {:else if !noneditable.includes(key)}
            <div>{key}</div>
            <div><input type="text" bind:value="{$properties[key]}"/></div>
        {/if}
    {/each}
<svelte:options tag="puddy-properties-editor"/>