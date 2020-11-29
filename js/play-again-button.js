var resetButton = null;
WL.registerComponent('play-again-button', {
}, {
    start: function() {
        WL.onXRSessionStart.push(this.xrSessionStart.bind(this));
        resetButton = this;
        this.hide();
    },
    restart: function() {
        for(let i = 0; i < wastebinSpawner.wastebins.length; ++i) {
            wastebinSpawner.wastebins[i].destroy();
        }
        wastebinSpawner.wastebins = [];
        paperBallSpawner.getComponent('paperball-spawner').throwCount = 0;

        /* Show cursor */
        wastebinSpawner.object.getComponent('mesh').active = true;
        /* Hide pall spawner */
        paperBallSpawner.getComponent('mesh').active = false;
        paperBallSpawner.getComponent('paperball-spawner').active = false;

        this.hide();
    },

    hide: function() {
        this.object.getComponent('text').active = false;
        this.active = false;
    },

    unhide: function() {
        this.object.getComponent('text').active = true;
        this.active = true;
    },

    onClick: function(e) {
        const pos = e.inputSource.gamepad.axes;
        console.log(pos);
        /* Test position agains bottom right corner */
        if(pos[0] > 0.3 && pos[1] > 0.9) {
            this.restart();
        }
    },

    onActivate: function() {
        if(WL.xrSession) {
            WL.xrSession.addEventListener('select', this.onClick.bind(this));
        }
    },
    xrSessionStart: function(session) {
        if(this.active) {
            session.addEventListener('select', this.onClick.bind(this));
        }
    },
});
