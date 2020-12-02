var paperBallSpawner = null;
/**
@brief Spawns paper balls at the component's object's location

During WebXR immersive-ar sessions, we do not have access to
touch or click events. The only way to retrieve touch locations
is through the `select`, `selectstart` and `selectend` events.
These events report location of the event in `[-1.0, 1.0]` on
both axis.

A swipe is determined by the difference in the position and time
from `selectstart` to `selectend` event.
The faster and the longer the swipe, the more force will be applied
for the throw.

After every throw, the main paper ball mesh in front of the camera
will be hidden for a short duration and reappears with a new
random rotation to hide the fact that it's the same mesh over and over.
*/
WL.registerComponent('paperball-spawner', {
    paperballMesh: {type: WL.Type.Mesh},
    paperballMaterial: {type: WL.Type.Material},
    spawnAnimation: {type: WL.Type.Animation},
    swipeSensitivity: {type: WL.Type.Float, default: 1.0},
    maxPapers: {type: WL.Type.Int, default: 32},
    debug: {type: WL.Type.Bool, default: false},
}, {
    start: function() {
        /* We can only bind the selectstart/select end events
         * when the session started */
        WL.onXRSessionStart.push(this.xrSessionStart.bind(this));
        this.start = new Float32Array(2);

        this.paperBalls = [];
        this.nextIndex = 0;
        this.throwCount = 0;

        if(this.debug) {
            this.active = true;
            this.object.getComponent('mesh').active = true;
        }

        paperBallSpawner = this.object;
    },
    onTouchDown: function(e) {
        /* We cannot use .axes directly, as the list is being reused
         * in the selectend event and would therefore change the value
         * of this.start */
        this.start.set(e.inputSource.gamepad.axes);
        this.startTime = e.timeStamp;
    },

    update: function(dt) {
        this.time = (this.time || 0) + dt;

        if(this.debug && this.time > 0.5) {
            let dir = [0, 0, 0];
            this.object.getForward(dir);
            dir[1] += 1;
            this.throw(dir);
            this.time = 0;
        }
    },
    onTouchUp: function(e) {
        const end = e.inputSource.gamepad.axes;
        const duration = 0.001*(e.timeStamp - this.startTime);

        const dir = [0, 0, -1];

        glMatrix.vec2.sub(dir, end, this.start);
        /* Screenspace Y is inverted */
        dir[1] = -dir[1];
        /* In portrait mode, left-right is shorter */
        dir[0] *= 0.5;

        const swipeLength = glMatrix.vec2.len(dir); /* [0 - 2] */
        /* Avoid tapping spawning a ball */
        if(swipeLength < 0.1) return;

        /* Rotate direction about rotation of the view object */
        glMatrix.vec3.transformQuat(dir, dir, this.object.parent.transformWorld);
        glMatrix.vec3.normalize(dir, dir);

        /* Assuming swipe length of 0.5, duration of 200ms, then the right term
         * evaluates to 0.5/0.2 = 2.5. Times the swipeSensitivity is the
         * meter per second initial speed of the ball */
        glMatrix.vec3.scale(dir, dir, this.swipeSensitivity*swipeLength/duration);

        this.throw(dir);
    },
    throw: function(dir) {
        let paper =
            this.paperBalls.length == this.maxPapers ?
            this.paperBalls[this.nextIndex] : this.spawnPaper();
        this.paperBalls[this.nextIndex] = paper;

        this.nextIndex = (this.nextIndex + 1) % this.maxPapers;

        paper.object.transformLocal.set(this.object.transformWorld);
        paper.object.setDirty();
        paper.physics.velocity.set(dir);
        /* Reset scored value which is set in 'score-trigger' component */
        paper.physics.scored = false;
        paper.physics.active = true;

        /* New orientation for the next paper */
        this.object.rotateAxisAngleDegObject([1, 0, 0], Math.random()*180.0);
        this.object.rotateAxisAngleDegObject([0, 1, 0], Math.random()*180.0);
        this.object.scale([0, 0, 0]);

        this.canThrow = false;
        setTimeout(function() {
            this.object.resetScaling();
            this.canThrow = true;
        }.bind(this), 1000);

        /* Important only to update score display to show score
         * instead of the tutorial after first throw */
        updateScore(score.toString());

        this.throwCount++;
        if(this.throwCount == 3) {
            resetButton.unhide();
        }
    },
    spawnPaper: function() {
        const obj = WL.scene.addObject();

        const mesh = obj.addComponent('mesh');
        mesh.mesh = this.paperballMesh;
        mesh.material = this.paperballMaterial;
        mesh.active = true;

        if(this.spawnAnimation) {
            const anim = obj.addComponent('animation');
            anim.animation = this.spawnAnimation;
            anim.active = true;
            anim.play();
        }

        const col = obj.addComponent('collision');
        col.shape = WL.Collider.Sphere;
        col.extents[0] = 0.05;
        col.group = (1 << 0);
        col.active = true;

        const physics = obj.addComponent('ball-physics', {
            bounciness: 0.5,
            weight: 0.2,
        });
        physics.active = true;

        return {
            object: obj,
            physics: physics
        };
    },
    onActivate: function() {
        if(WL.xrSession) {
            WL.xrSession.addEventListener('selectstart', this.onTouchDown.bind(this));
            WL.xrSession.addEventListener('selectend', this.onTouchUp.bind(this));
        }
    },
    xrSessionStart: function(session) {
        /* Only spawn object if cursor is visible */
        if(this.active) {
            session.addEventListener('selectstart', this.onTouchDown.bind(this));
            session.addEventListener('selectend', this.onTouchUp.bind(this));
        }
    },
});
