<script>
	import {components} from './registry.js';

	import Display from './Display.svelte';
	import Grid from './Grid.svelte';
	import Label from './Label.svelte';
	import Gauge from './Gauge.svelte';

	components['Display'] = Display;
	components['Grid'] = Grid;
	components['Label'] = Label;
	components['Gauge'] = Gauge;

	import {openRemoteFile} from './Display.svelte';
	/*import Display from './Display.svelte';*/

	let params = new URLSearchParams(location.search),
			file = params.get("file");

	if(!file) {
		file = "example.wedm";
	}

	let promise = openRemoteFile(file);
</script>

<h1>Hi from App</h1>

{#await promise}
	<p>...waiting</p>
{:then config}
	<Display {config}/>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
