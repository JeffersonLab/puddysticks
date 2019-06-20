<script>
	import Display from './Display.svelte';
	import RemoteFileReader from './RemoteFileReader.svelte';
	import LocalFileReader from './LocalFileReader.svelte';
	let name = 'Ryan';

	let params = new URLSearchParams(location.search),
			file = params.get("file");

	if(!file) {
		file = "example.wedm";
	}

	const reader = new RemoteFileReader({target: document.createElement('div')});

	let promise = reader.openRemoteFile(file);
</script>

<h1>Hi from App</h1>

{#await promise}
	<p>...waiting</p>
{:then config}
	<Display {config}/>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
