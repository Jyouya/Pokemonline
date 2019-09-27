import spriteVS from './shaders/sprite.vert';
import spriteFS from './shaders/sprite.frag';

import { vec2 } from './utils/gl-matrix-min';
import GLUtil from './utils/gl-utils';

class Sprite {
    constructor(options) {
        this.currentFrame = 0;
        this.sheet = options.spriteSheet;
        this.size = options.size || 16;
        this.frames = options.frames || [{ x: 0, y: 0 }]; // [{x, y}]
        this.framerate = options.framerate || 2;

        this.defaultFrame = options.restFrame === 'first' || 1;

        // Sprites position in the world
        this.position = vec2.create();
        this.position[0] = options.x || 0;
        this.position[1] = options.y || 0;

        this.mask = options.mask || [0xFFFF, 0xFFFF];
        // this.mask = options.mask || [32766, 4080]

        this.scale = options.scale || 1;

        this.filters = options.filters || {};

        new Promise(resolve => this._promise = resolve);

        this.frameGen = (function* (sprite) {
            // const frameInterval = 1 / sprite.framerate * 1000;
            restingFrame:
            while (true) {
                sprite._resetAnimation = false;
                while (!sprite._playing) {
                    yield sprite.frames[sprite.defaultFrame && sprite.frames.length - 1];
                }

                for (let frame of sprite.frames) { //eslint-disable-line
                    // Advance frames every frameInterval milliseconds
                    const last = Date.now();
                    while (Date.now() - last < 1000 / sprite.framerate) {
                        // Maybe test if a _resetAnimation flag is set and continue
                        yield frame;
                        if (!sprite._playing || sprite._resetAnimation) continue restingFrame;
                    }
                    // if (sprite._resetAnimation) continue restingFrame;
                }

                if (sprite._repeat && !--sprite._repeat) { // decrement only if nonzero
                    sprite.pause();
                }
            }
        })(this);
    }

    _reject() { };
    _resolve() { };

    get textureOffset() {
        return this.nextFrame();
    }

    _playing = false;
    // _playOnce = false;

    play(n = null) {
        this._resetAnimation = true;
        this._playing = true;
        this._repeat = n;
        this._resolve();
        return new Promise((resolve, reject) => [this._resolve, this._reject] = [resolve, reject]);
    }

    pause() {
        this._resolve();
        this._playing = false;
        // this._playOnce = false;
        this._repeat = 0;
    }

    nextFrame() {
        if (this.updateAnimationFrame) this.updateAnimationFrame();
        return this.frameGen.next().value;
    }

    playOnce() {
        this._resetAnimation = true;
        this._playOnce = true;
        this.play(1);
    }

    updateAnimationFrame() { };

    animate(animationFunction) {
        this.updateAnimationFrame = animationFunction;
    }

    get x() {
        return this.position[0];
    }

    set x(val) {
        this.position[0] = val;
    }

    get y() {
        return this.position[1];
    }

    set y(val) {
        this.position[1] = val;
    }

    isPlaying() {
        return this._playing;
    }
}

Sprite.drawSpritesFactory = function (canvasWidth, canvasHeight) {
    const inverseWidth = 1 / canvasWidth;
    const inverseHeight = 1 / canvasHeight;
    let program;
    return function (gl, sprites, offset, spritesheet) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        if (!program) program = GLUtil.createProgram(gl, spriteVS, spriteFS);
        // console.log(offset);
        const shader = program;
        gl.useProgram(shader.program);

        gl.uniform2f(shader.uniform.inverseViewportSize, inverseWidth, inverseHeight);
        gl.uniform2f(shader.uniform.viewOffset, offset.x, offset.y);
        gl.uniform2f(shader.uniform.inverseTextureSize, spritesheet.inverseWidth, spritesheet.inverseHeight);
        // gl.uniform1f(shader.uniform.monochrome, monochrome ? 1.0 : 0.0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, spritesheet.texture);

        const buffer = new Float32Array(704); // 64 sprites active at once;
        let i = 0;
        let count = 0;
        for (let sprite of sprites) { //eslint-disable-line
            if (!sprite) continue;
            if (sprite.customDraw) {
                i = sprite.customDraw(buffer, i);
            } else {
                const textureOffset = sprite.textureOffset;
                buffer[i++] = sprite.position[0];
                buffer[i++] = sprite.position[1];
                buffer[i++] = sprite.size;
                buffer[i++] = textureOffset.x;
                buffer[i++] = textureOffset.y;
                buffer[i++] = textureOffset.flip_h ? 1.0 : 0.0;
                buffer[i++] = textureOffset.flip_v ? 1.0 : 0.0;
                buffer[i++] = sprite.mask[0];
                buffer[i++] = sprite.mask[1];
                buffer[i++] = sprite.scale;
                buffer[i++] = sprite.filters.monochrome ? 1.0 : 0.0;
                // count++;
            }
            // console.log(i);
        }

        count = i / 11;

        const glBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.DYNAMIC_DRAW);

        gl.enableVertexAttribArray(shader.attribute.spritePosition);
        gl.enableVertexAttribArray(shader.attribute.spriteSize);
        gl.enableVertexAttribArray(shader.attribute.texOffset);
        gl.enableVertexAttribArray(shader.attribute.flip);
        gl.enableVertexAttribArray(shader.attribute.mask);
        gl.enableVertexAttribArray(shader.attribute.scale);
        gl.enableVertexAttribArray(shader.attribute.monochromeFilter);

        gl.vertexAttribPointer(shader.attribute.spritePosition, 2, gl.FLOAT, false, 44, 0);
        gl.vertexAttribPointer(shader.attribute.spriteSize, 1, gl.FLOAT, false, 44, 8);
        gl.vertexAttribPointer(shader.attribute.texOffset, 2, gl.FLOAT, false, 44, 12);
        gl.vertexAttribPointer(shader.attribute.flip, 2, gl.FLOAT, false, 44, 20);
        gl.vertexAttribPointer(shader.attribute.mask, 2, gl.FLOAT, false, 44, 28)
        gl.vertexAttribPointer(shader.attribute.scale, 1, gl.FLOAT, false, 44, 36)
        gl.vertexAttribPointer(shader.attribute.monochromeFilter, 1, gl.FLOAT, false, 44, 40);

        gl.drawArrays(gl.POINTS, 0, count);
    }
}

// flips left/right each time it plays all the way through
class AlternatingSprite extends Sprite {
    constructor(options) {
        super(options);

        this.frameGen = (function* (sprite) {
            restingFrame:
            while (true) {
                sprite.frames[0].flip_h = !sprite.frames[0].flip_h;
                while (!sprite._playing) {
                    yield sprite.frames[sprite.defaultFrame && sprite.frames.length - 1];
                }
                sprite._resetAnimation = false;

                for (let frame of sprite.frames) { //eslint-disable-line
                    // Advance frames every frameInterval milliseconds
                    const last = Date.now();
                    while (Date.now() - last < 1000 / sprite.framerate) {
                        // Maybe test if a _resetAnimation flag is set and continue
                        yield frame;
                        if (!sprite._playing || sprite._resetAnimation) continue restingFrame;
                    }
                    // if (sprite._resetAnimation) continue restingFrame;
                }

                if (sprite._repeat && !--sprite._repeat) { // decrement only if nonzero
                    sprite.pause();
                }
            }
        })(this);
    }
}

export { Sprite, AlternatingSprite };