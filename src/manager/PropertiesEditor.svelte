<script>
    export let properties;

    let nonEditable = ['name', 'id', 'items', 'par'];
</script>
<table>
    <tbody>
    {#each Object.keys(properties).sort() as key}
        {#if key === 'datasource'}
            <tr>
                <th>datasource</th>
            </tr>
            <tr>
                <td>{properties[key].name}</td>
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