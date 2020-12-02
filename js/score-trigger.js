var score = 0;
/**
@brief Score trigger

Check overlap with paper balls to spawn confetti particles and
increase the score.

This component is automatically attached to newly spawned wastebins,
see `wastebin-spawner`.
*/
WL.registerComponent('score-trigger', {
    particles: {type: WL.Type.Object}
}, {
    init: function() {
        this.collision = this.object.getComponent('collision');
    },
    update: function(dt) {
        let overlaps = this.collision.queryOverlaps();

        for(let i = 0; i < overlaps.length; ++i) {
            let p = overlaps[i].object.getComponent('ball-physics');

            if(p && p.velocity[1] < 0.0 && !p.scored) {
                p.scored = true;
                this.particles.transformWorld.set(this.object.transformWorld);
                this.particles.getComponent('confetti-particles').burst();
                ++score;
                updateScore(score.toString());

                /* We don't have collisions with the wastebin, simply
                 * drop it straight down to avoid it flying through */
                p.velocity.set([0, -1, 0]);
            }
        }
    },
});
