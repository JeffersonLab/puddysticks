<script>
    import {widgets} from '../../util/registry.js';

    export let component;
    export let provider;
    export let properties;

    let defaultConfig = {};

    $: {
        if(provider) {
            defaultConfig = widgets[component].dataproviders[provider].defaults;
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
    {#each Object.keys(properties).sort() as key}
        {#if !nonEditable.includes(key)}
            <div>{key}</div>
            <div class="editable-value"><input type="text" bind:value="{properties[key]}"/></div>
        {/if}
    {/each}
<svelte:options tag="puddy-data-provider-properties-pane"/>