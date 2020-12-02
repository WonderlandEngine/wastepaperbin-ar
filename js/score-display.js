/* Global function used to update the score display */
var updateScore = null;
/**
@brief Marks an object with text component as "score display"

The center top text object that shows various helpful tutorial
texts and the score.
*/
WL.registerComponent('score-display', {
}, {
    init: function() {
        this.text = this.object.getComponent('text');

        updateScore = function(text) {
            this.text.text = text;
        }.bind(this);

        updateScore("");
        /* Initial text to set after session started */
        WL.onXRSessionStart.push(function() {
            updateScore("Slowly scan\narea");
        });
    },
});
