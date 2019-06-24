<script>
    let save = function () {

        var json = $("wedm-display")[0].toJSON();

        console.log(json);

        var link = document.createElement("a");

        link.href = "data:application/json," + encodeURIComponent(json);
        link.download = "display.wedm";

        /*document.body.appendChild(link);*/

        link.click();

        /*document.body.removeChild(link);*/
    };

    let toJSON = function() {
        let slot = this.shadowRoot.querySelector('slot'),
                nodes = slot.assignedNodes(),
                widgets = [];

        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];

            let Widget = customElements.get('wedm-widget');

            if (node instanceof Widget) {
                let obj = node.toOBJ();

                widgets.push(obj);
            }
        }

        let val = {title: this.title, widgets: widgets};

        return JSON.stringify(val);
    };
</script>