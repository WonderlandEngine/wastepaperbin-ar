var wastebinSpawner = null;
var floorHeight = 0;

/**
@brief Spawns wastebins at the same location as this mesh on click

Clicks are detected via `select` events, as in immersive AR sessions,
we don't have touch events.

To spawn the wastebin at the location of the AR hit-test, this component
is attached to the same object as the `hit-test-location` object.
That results in `this.object` having the same location as the hit-test
result.
*/
WL.registerComponent('wastebin-spawner', {
    binMesh: {type: WL.Type.Mesh},
    binMaterial: {type: WL.Type.Material},
    spawnAnimation: {type: WL.Type.Animation},
    maxWastebins: {type: WL.Type.Int, default: 3},
    particles: {type: WL.Type.Object},
}, {
    start: function() {
        WL.onXRSessionStart.push(this.xrSessionStart.bind(this));
        this.hitTest = this.object.getComponent('hit-test-location');
        this.wastebins = [];

        wastebinSpawner = this;
    },
    update: function(dt) {
        if(!this.hitTest || !this.hitTest.visible) return;
        if(this.wastebins.length >= this.maxWastebins) return;

        updateScore("Place a\nWastebin");
    },
    onClick: function(e) {
        if(this.wastebins.length >= this.maxWastebins) return;
        /* Only spawn object if cursor is visible */
        if(this.hitTest && !this.hitTest.visible) return;

        const obj = WL.scene.addObject();
        obj.transformLocal.set(this.object.transformWorld);

        const pos = [0, 0, 0];
        this.object.getTranslationWorld(pos);
        /* Make sure balls and confetti land on the floor */
        floorHeight = pos[1];

        const mesh = obj.addComponent('mesh');
        mesh.mesh = this.binMesh;
        mesh.material = this.binMaterial;
        mesh.active = true;

        if(this.spawnAnimation) {
            const anim = obj.addComponent('animation');
            anim.playCount = 1;
            anim.animation = this.spawnAnimation;
            anim.active = true;
            anim.play();
        }

        /* Add scoring trigger */
        const trigger = WL.scene.addObject(obj);
        const col = trigger.addComponent('collision');
        col.collider = WL.Collider.Sphere;
        col.extents[0] = 0.1;
        col.group = (1 << 0);
        col.active = true;
        trigger.translate([0, 0.4, 0]);
        trigger.addComponent('score-trigger', {
            particles: this.particles
        });

        obj.setDirty();

        this.wastebins.push(obj);

        if(this.wastebins.length == this.maxWastebins) {
            updateScore("Swipe to\nthrow");
            paperBallSpawner.getComponent('mesh').active = true;
            paperBallSpawner.getComponent('paperball-spawner').active = true;
            /* Hide cursor */
            this.object.getComponent('mesh').active = false;
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
