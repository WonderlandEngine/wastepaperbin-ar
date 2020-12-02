/**
@brief Ball Physics

Very rudimentary physics with gravity, pseudo-friction, bounciness
and floor collisions.

Computes velocity and position each frame until the velocity falls
below a certain threshold, after which the component is deactivated.

This component is also used to attach a "scored" property to track
already scored paper balls. (See score-trigger and paperball-spawner).
*/
WL.registerComponent('ball-physics', {
    bounciness: {type: WL.Type.Float, default: 0.5},
    weight: {type: WL.Type.Float, default: 1.0}
}, {
    init: function() {
        this.pos = new Float32Array(3);
        this.velocity = new Float32Array(3);

        this.collision = this.object.getComponent('collision', 0);
        if(!this.collision) {
            console.warn("'ball-physics' component on object", this.object.name, "requires a collision component");
        }
    },

    update: function(dt) {
        /* Remember the last position */
        this.object.getTranslationWorld(this.pos);

        /* Don't fall through the floor */
        if(this.pos[1] <= floorHeight + this.collision.extents[0]) {
            if(Math.abs(this.velocity[0]) <= 0.001) {
                this.velocity[1] = 0;
            } else {
                /* bounce */
                this.velocity[1] *= -this.bounciness;
            }
            /* friction */
            this.velocity[0] *= 0.5;
            this.velocity[2] *= 0.5;
        }

        if(Math.abs(this.velocity[0]) <= 0.01 &&
           Math.abs(this.velocity[1]) <= 0.01 &&
           Math.abs(this.velocity[2]) <= 0.01)
        {
            /* Deactivating this object preserves performance,
             * update() will no longer be called */
            this.active = false;
            return;
        }

        /* Apply velocity to position */
        const tmp = [0, 0, 0];
        const quat = [0, 0, 0, 0];
        glMatrix.vec3.scale(tmp, this.velocity, dt);
        if(this.object.parent) {
            glMatrix.quat.conjugate(quat, this.object.parent.transformWorld);
            glMatrix.vec3.transformQuat(tmp, tmp, quat);
        }
        this.object.translate(tmp);

        /* Apply gravity to velocity */
        this.velocity[1] -= this.weight*9.81*dt;
    },
});
