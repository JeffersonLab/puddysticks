<script>
    export let text;

    export function fromOBJ (obj) {
        this.type = obj.type;
        this.version = obj.version;

        console.log(obj.style);

        this.shadowRoot.querySelector("style").textContent = obj.style;
    };

    export function toOBJ() {
        let style = this.shadowRoot.querySelector("style").textContent;

        let obj = {type: this.type, version: this.version, style: style};

        console.log(obj);

        return obj;
    };

</script>

<h1>Hi from Label</h1>

<svelte:options tag="wedm-label-widget"/>