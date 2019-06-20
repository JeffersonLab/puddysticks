<script>
    import FileParser from './FileParser.svelte';

    export async function openRemoteFile(url) {
        console.log('open remote file');

        const res = await fetch(url);
        const text = await res.text();

		if (res.ok) {
            let parser = new FileParser({target: document.body});

            return parser.fromJSON(text);
		} else {
			throw new Error(text);
		}
    };
</script>

<svelte:options tag="wedm-remote-file-reader"/>