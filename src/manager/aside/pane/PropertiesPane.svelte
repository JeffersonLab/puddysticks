<style>
    :global(.properties-pane .editable-value) {
        margin-bottom: 8px;
    }
</style>
<script>
    import {widgets, instances, instanceStores} from '../../util/registry.js';
    import DataProviderPropertiesEditor from './DataProviderPropertiesPane.svelte';

    export let selected;
    $: properties = instanceStores[selected];

    const noneditable = ['name', 'id', 'items', 'par'];
</script>
    {#each Object.keys($properties).sort() as key}
        {#if key === 'dataprovider'}
            <div>dataprovider</div>
                <div class="editable-value">
                    <select bind:value="{$properties[key].name}">
                        {#each Object.keys(widgets[$properties.name].dataproviders) as provider}
                            <option>{provider}</option>
                        {/each}
                    </select>
                </div>
            <DataProviderPropertiesEditor component="{$properties.name}" provider="{$properties[key].name}" bind:properties="{$properties.dataprovider}"/>
        {:else if !noneditable.includes(key)}
            <div>{key}</div>
            <div class="editable-value"><input type="text" bind:value="{$properties[key]}"/></div>
        {/if}
    {/each}
<svelte:options tag="puddy-properties-pane"/>