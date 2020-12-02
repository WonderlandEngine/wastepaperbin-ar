/**
@brief (Unused) Moves a mesh back and forth

Feel free to extend the game with a PR!
*/
WL.registerComponent('roomba', {
    speed: {type: WL.Type.Float, default: 1.0},
}, {
    init: function() {
        this.time = 0;
        this.state = 0;
        this.position = [0, 0, 0];
        this.pointA = [0, 0, 0];
        this.pointB = [0, 0, 0];

        this.position = [0, 0, 0];
        glMatrix.quat2.getTranslation(this.position, this.object.transformLocal);

        glMatrix.vec3.add(this.pointA, this.pointA, this.position);
        glMatrix.vec3.add(this.pointB, this.position, [0, 0, 1.5]);
    },

    start: function() {
    },

    update: function(dt) {
        if(isNaN(dt)) return;

        this.time += dt;
        if(this.time >= 1.0) {
            this.time -= 1.0;
            this.state = (this.state + 1) % 4;
        }

        this.object.resetTransform();
        switch(this.state) {
            case 0:
                glMatrix.vec3.lerp(this.position, this.pointA, this.pointB, this.time);
                this.object.translate(this.position);
                break;
            case 1:
                this.object.rotateAxisAngleDeg([0, 1, 0], this.time*180);
                this.object.translate(this.position);
                break;
            case 2:
                glMatrix.vec3.lerp(this.position, this.pointB, this.pointA, this.time);
                this.object.translate(this.position);
                break;
            case 3:
                this.object.rotateAxisAngleDeg([0, 1, 0], (1-this.time)*180);
                this.object.translate(this.position);
                break;
        }
    },
});
