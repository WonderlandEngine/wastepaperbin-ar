var updateScore = null;
WL.registerComponent('score-display', {
}, {
    init: function() {
        this.text = this.object.getComponent('text');

        updateScore = function(text) {
            this.text.text = text;
        }.bind(this);

        updateScore("");
        WL.onXRSessionStart.push(function() {
            updateScore("Slowly scan\narea");
        });
    },
});
