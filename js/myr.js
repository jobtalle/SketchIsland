const Myr = function(canvasElement, antialias, alpha) {
    const _gl = canvasElement.getContext("webgl2", {
        antialias: antialias ? antialias : false,
        depth: false,
        alpha: alpha ? alpha : false
    });

    const Renderable = {};

    Renderable.prototype = {
        draw: function(x, y) {
            this._prepareDraw();

            setAttributesUv(this.getUvLeft(), this.getUvTop(), this.getUvWidth(), this.getUvHeight());
            setAttributesDraw(x, y, this.getWidth(), this.getHeight());
        },

        drawScaled: function(x, y, xScale, yScale) {
            this._prepareDraw();

            setAttributesUv(this.getUvLeft(), this.getUvTop(), this.getUvWidth(), this.getUvHeight());
            setAttributesDraw(x, y, this.getWidth() * xScale, this.getHeight() * yScale);
        },

        drawSheared: function(x, y, xShear, yShear) {
            this._prepareDraw();

            setAttributesUv(this.getUvLeft(), this.getUvTop(), this.getUvWidth(), this.getUvHeight());
            setAttributesDrawSheared(x, y, this.getWidth(), this.getHeight(), xShear, yShear);
        },

        drawRotated: function(x, y, angle) {
            this._prepareDraw();

            setAttributesUv(this.getUvLeft(), this.getUvTop(), this.getUvWidth(), this.getUvHeight());
            setAttributesDrawRotated(x, y, this.getWidth(), this.getHeight(), angle);
        },

        drawScaledRotated: function(x, y, xScale, yScale, angle) {
            this._prepareDraw();

            setAttributesUv(this.getUvLeft(), this.getUvTop(), this.getUvWidth(), this.getUvHeight());
            setAttributesDrawRotated(x, y, this.getWidth() * xScale, this.getHeight() * yScale, angle);
        },

        drawTransformed: function(transform) {
            this._prepareDraw();

            setAttributesUv(this.getUvLeft(), this.getUvTop(), this.getUvWidth(), this.getUvHeight());
            setAttributesDrawTransform(transform, this.getWidth(), this.getHeight());
        },

        drawTransformedAt: function(x, y, transform) {
            this._prepareDraw();

            setAttributesUv(this.getUvLeft(), this.getUvTop(), this.getUvWidth(), this.getUvHeight());
            setAttributesDrawTransformAt(x, y, transform, this.getWidth(), this.getHeight());
        },

        drawPart: function(x, y, left, top, w, h) {
            this._prepareDraw();

            const wf = 1 / this.getWidth();
            const hf = 1 / this.getHeight();

            setAttributesUvPart(this.getUvLeft(), this.getUvTop(), this.getUvWidth(), this.getUvHeight(), left * wf, top * hf, w * wf, h * hf);
            setAttributesDraw(x, y, w, h);
        },

        drawPartTransformed: function(transform, left, top, w, h) {
            this._prepareDraw();

            const wf = 1 / this.getWidth();
            const hf = 1 / this.getHeight();

            setAttributesUvPart(this.getUvLeft(), this.getUvTop(), this.getUvWidth(), this.getUvHeight(), left * wf, top * hf, w * wf, h * hf);
            setAttributesDrawTransform(transform, w, h);
        }
    };

    this.Surface = function() {
        this.free = () => {
            _gl.deleteTexture(_texture);
            _gl.deleteFramebuffer(_framebuffer);
        };

        this.bind = () => {
            bind(this);

            _gl.bindFramebuffer(_gl.FRAMEBUFFER, _framebuffer);
            _gl.viewport(0, 0, _width, _height);
        };

        this._prepareDraw = () => {
            bindTextureSurface(_texture);
            prepareDraw(RENDER_MODE_SURFACES, 12);

            _instanceBuffer[++_instanceBufferAt] = 0;
            _instanceBuffer[++_instanceBufferAt] = 0;
        };

        this._addFrame = frame => {
            if(_ready) {
                frame[5] /= _width;
                frame[6] /= _height;
                frame[7] /= _width;
                frame[8] /= _height;
            }
            else
                _frames.push(frame);
        };

        this._getTexture = () => _texture;
        this.getWidth = () => _width;
        this.getHeight = () => _height;
        this.setClearColor = color => _clearColor = color;
        this.clear = () => clear(_clearColor);
        this.ready = () => _ready;

        const _texture = _gl.createTexture();
        const _framebuffer = _gl.createFramebuffer();
        const _frames = [];

        let _ready = false;
        let _width = 0;
        let _height = 0;
        let _clearColor = new Myr.Color(1, 1, 1, 0);
        let _linear = false;
        let _repeat = false;

        _gl.activeTexture(TEXTURE_EDITING);
        _gl.bindTexture(_gl.TEXTURE_2D, _texture);

        if(typeof arguments[0] === "number") {
            _width = arguments[0];
            _height = arguments[1];
            _ready = true;

            if(arguments[2] !== undefined && typeof arguments[2] !== "number")
                _gl.texImage2D(
                    _gl.TEXTURE_2D, 0, _gl.RGBA, _width, _height, 0, _gl.RGBA, _gl.UNSIGNED_BYTE,
                    arguments[2]);
            else switch (arguments[2]) {
                default:
                case 0:
                    const initial = new Uint8Array(_width * _height << 2);

                    for (let i = 0; i < initial.length; i += 4) {
                        initial[i] = initial[i + 1] = initial[i + 2] = 255;
                        initial[i + 3] = 0;
                    }

                    _gl.texImage2D(
                        _gl.TEXTURE_2D, 0, _gl.RGBA, _width, _height, 0, _gl.RGBA, _gl.UNSIGNED_BYTE,
                        initial);

                    break;
                case 1:
                    _gl.texImage2D(
                        _gl.TEXTURE_2D, 0, _gl.RGBA16F, _width, _height, 0, _gl.RGBA, _gl.FLOAT,
                        new Float32Array(_width * _height << 2));

                    break;
                case 2:
                    _gl.texImage2D(
                        _gl.TEXTURE_2D, 0, _gl.RGBA32F, _width, _height, 0, _gl.RGBA, _gl.FLOAT,
                        new Float32Array(_width * _height << 2));

                    break;
            }

            if (arguments[3] === true)
                _linear = true;

            if (arguments[4] === true)
                _repeat = true;
        }
        else {
            const image = new Image();

            image.onload = () => {
                if(_width === 0 || _height === 0) {
                    _width = image.width;
                    _height = image.height;
                }

                _gl.activeTexture(TEXTURE_EDITING);
                _gl.bindTexture(_gl.TEXTURE_2D, _texture);
                _gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, image);

                for(let frame = _frames.pop(); frame !== undefined; frame = _frames.pop()) {
                    frame[5] /= _width;
                    frame[6] /= _height;
                    frame[7] /= _width;
                    frame[8] /= _height;
                }

                _ready = true;
            };

            const source = arguments[0];

            if (source instanceof Image) {
                image.crossOrigin = source.crossOrigin;
                image.src = source.src;
                image.width = source.width;
                image.height = source.height;
            } else {
                image.crossOrigin = "Anonymous";
                image.src = source;
            }

            if (arguments[2] !== undefined && (typeof arguments[2]) === "number") {
                _width = arguments[1];
                _height = arguments[2];

                if (arguments[3] === true)
                    _linear = true;

                if (arguments[4] === true)
                    _repeat = true;
            }
            else {
                if (arguments[1] === true)
                    _linear = true;

                if (arguments[2] === true)
                    _repeat = true;
            }

            _gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, 1, 1, 0, _gl.RGBA, _gl.UNSIGNED_BYTE, _emptyPixel);
        }

        if (_linear) {
            _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR);
            _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR);
        }
        else {
            _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.NEAREST);
            _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.NEAREST);
        }

        if (_repeat) {
            _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.REPEAT);
            _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.REPEAT);
        }
        else {
            _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE);
            _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE);
        }

        {
            const previousFramebuffer = _gl.getParameter(_gl.FRAMEBUFFER_BINDING);

            _gl.bindFramebuffer(_gl.FRAMEBUFFER, _framebuffer);
            _gl.framebufferTexture2D(_gl.FRAMEBUFFER, _gl.COLOR_ATTACHMENT0, _gl.TEXTURE_2D, _texture, 0);
            _gl.bindFramebuffer(_gl.FRAMEBUFFER, previousFramebuffer);
        }
    };

    this.Surface.prototype = Object.create(Renderable.prototype);
    this.Surface.prototype.getUvLeft = () => 0;
    this.Surface.prototype.getUvTop = () => 0;
    this.Surface.prototype.getUvWidth = () => 1;
    this.Surface.prototype.getUvHeight = () => 1;

    this.Sprite = function(name) {
        this.animate = timeStep => {
            if (this.isFinished())
                return;

            _frameCounter += timeStep;

            while (_frameCounter > this._getFrame()[9]) {
                _frameCounter -= this._getFrame()[9];

                if (++_frame === _frames.length)
                    _frame = 0;

                if (this.isFinished())
                    break;
            }
        };

        this._setMeshBounds = () => {
            _meshUvLeft = this._getFrame()[5];
            _meshUvTop = this._getFrame()[6];
            _meshUvWidth = this._getFrame()[7];
            _meshUvHeight = this._getFrame()[8];
        };

        this._prepareDraw = () => {
            const frame = this._getFrame();

            bindTextureAtlas(frame[0]);
            prepareDraw(RENDER_MODE_SPRITES, 12);

            _instanceBuffer[++_instanceBufferAt] = frame[3];
            _instanceBuffer[++_instanceBufferAt] = frame[4];
        };

        this._getFrame = () => _frames[_frame];
        this.setFrame = index => _frame = index;
        this.getFrame = () => _frame;
        this.getFrameCount = () => _frames.length;

        const _frames = _sprites[name];
        let _frameCounter = 0;
        let _frame = 0;
    };

    this.Sprite.prototype = Object.create(Renderable.prototype);

    this.Sprite.prototype._getTexture = function() {
        return this._getFrame()[0];
    };

    this.Sprite.prototype.getUvLeft = function() {
        return this._getFrame()[5];
    };

    this.Sprite.prototype.getUvTop = function() {
        return this._getFrame()[6];
    };

    this.Sprite.prototype.getUvWidth = function() {
        return this._getFrame()[7];
    };

    this.Sprite.prototype.getUvHeight = function() {
        return this._getFrame()[8];
    };

    this.Sprite.prototype.isFinished = function() {
        return this._getFrame()[9] < 0;
    };

    this.Sprite.prototype.getWidth = function() {
        return this._getFrame()[1];
    };

    this.Sprite.prototype.getHeight = function() {
        return this._getFrame()[2];
    };

    this.Sprite.prototype.getOriginX = function() {
        return this._getFrame()[3] * this.getWidth();
    };

    this.Sprite.prototype.getOriginY = function() {
        return this._getFrame()[4] * this.getHeight();
    };

    this.Sprite.prototype.finished = function() {
        return this._getFrame()[9] < 0;
    };

    const _shaderVariables = [
        {
            name: "pixelSize",
            storage: "flat",
            type: "mediump vec2",
            value: "1.0/vec2(a2.z,a3.y)"
        },
        {
            name: "pixel",
            storage: "",
            type: "mediump vec2",
            value: "vec2(a2.z, a3.y)*vertex"
        }
    ];

    this.Shader = function(fragment, surfaces, variables) {
        const makeUniformsObject = () => {
            const uniforms = {};

            for (let i = 0; i < surfaces.length; ++i)
                uniforms[surfaces[i]] = {
                    type: "1i",
                    value: 4 + i
                };

            for (const variable of variables)
                uniforms[variable] = {
                    type: "1f",
                    value: 0
                };

            return uniforms;
        };

        const makeUniformsDeclaration = () => {
            let result = "";

            for (const surface of surfaces)
                result += "uniform sampler2D " + surface + ";";

            for (const variable of variables)
                result += "uniform mediump float " + variable + ";";

            return result;
        };

        const makeVariablesOut = () => {
            let result = "";

            for (const variable of _shaderVariables) if (fragment.includes(variable.name))
                result += variable.storage + " out " + variable.type + " " + variable.name + ";";

            return result;
        };

        const makeVariablesOutAssignments = () => {
            let result = "";

            for (const variable of _shaderVariables) if (fragment.includes(variable.name))
                result += variable.name + "=" + variable.value + ";";

            return result;
        };

        const makeVariablesIn = () => {
            let result = "";

            for (const variable of _shaderVariables) if (fragment.includes(variable.name))
                result += variable.storage + " in " + variable.type + " " + variable.name + ";";

            return result;
        };

        const bindTextures = () => {
            for (let i = 0; i < surfaces.length; ++i) {
                _gl.activeTexture(TEXTURE_SHADER_FIRST + i);
                _gl.bindTexture(_gl.TEXTURE_2D, _surfaceTextures[i]);
            }
        };

        const _core = new ShaderCore(
            "layout(location=0) in mediump vec2 vertex;" +
            "layout(location=1) in mediump vec4 a1;" +
            "layout(location=2) in mediump vec4 a2;" +
            "layout(location=3) in mediump vec4 a3;" +
            _uniformBlock +
            "out mediump vec2 uv;" +
            makeVariablesOut() +
            "void main() {" +
            "uv=a1.zw+vertex*a2.xy;" +
            "mediump vec2 transformed=(((vertex-a1.xy)*" +
            "mat2(a2.zw,a3.xy)+a3.zw)*" +
            "mat2(tw.xy,th.xy)+vec2(tw.z,th.z))/" +
            "vec2(tw.w,th.w)*2.0;" +
            makeVariablesOutAssignments() +
            "gl_Position=vec4(transformed-vec2(1),0,1);" +
            "}",
            makeUniformsDeclaration() +
            _uniformBlock +
            "in mediump vec2 uv;" +
            makeVariablesIn() +
            "layout(location=0) out lowp vec4 color;" +
            fragment
        );

        const _shader = new Shader(_core, makeUniformsObject());
        const _surfaceTextures = new Array(surfaces.length);
        let _width = -1;
        let _height = 0;

        this.free = () => _shader.free();
        this.getWidth = () => _width;
        this.getHeight = () => _height;
        this.setVariable = (name, value) => _shader.setUniform(name, value);
        this.setSurface = (name, surface) => {
            const index = surfaces.indexOf(name);

            if (_width === -1 && index === 0) {
                _width = surface.getWidth();
                _height = surface.getHeight();
            }

            _surfaceTextures[index] = surface._getTexture();
        };

        this.setSize = (width, height) => {
            _width = width;
            _height = height;
        };

        this._prepareDraw = () => {
            prepareDraw(RENDER_MODE_SHADER, 12, _shader);
            bindTextures();

            _instanceBuffer[++_instanceBufferAt] = 0;
            _instanceBuffer[++_instanceBufferAt] = 0;
        };
    };

    this.Shader.prototype = Object.create(Renderable.prototype);
    this.Shader.prototype.getUvLeft = () => 0;
    this.Shader.prototype.getUvTop = () => 0;
    this.Shader.prototype.getUvWidth = () => 1;
    this.Shader.prototype.getUvHeight = () => 1;

    const setAttributesUv = (uvLeft, uvTop, uvWidth, uvHeight) => {
        _instanceBuffer[++_instanceBufferAt] = uvLeft;
        _instanceBuffer[++_instanceBufferAt] = uvTop;
        _instanceBuffer[++_instanceBufferAt] = uvWidth;
        _instanceBuffer[++_instanceBufferAt] = uvHeight;
    };

    const setAttributesUvPart = (uvLeft, uvTop, uvWidth, uvHeight, left, top, width, height) => {
        _instanceBuffer[++_instanceBufferAt] = uvLeft + uvWidth * left;
        _instanceBuffer[++_instanceBufferAt] = uvTop + uvHeight * top;
        _instanceBuffer[++_instanceBufferAt] = uvWidth * width;
        _instanceBuffer[++_instanceBufferAt] = uvHeight * height;
    };

    const setAttributesDraw = (x, y, width, height) => {
        _instanceBuffer[++_instanceBufferAt] = width;
        _instanceBuffer[++_instanceBufferAt] = _instanceBuffer[++_instanceBufferAt] = 0;
        _instanceBuffer[++_instanceBufferAt] = height;
        _instanceBuffer[++_instanceBufferAt] = x;
        _instanceBuffer[++_instanceBufferAt] = y;
    };

    const setAttributesDrawSheared = (x, y, width, height, xShear, yShear) => {
        _instanceBuffer[++_instanceBufferAt] = width;
        _instanceBuffer[++_instanceBufferAt] = width * xShear;
        _instanceBuffer[++_instanceBufferAt] = height * yShear;
        _instanceBuffer[++_instanceBufferAt] = height;
        _instanceBuffer[++_instanceBufferAt] = x;
        _instanceBuffer[++_instanceBufferAt] = y;
    };

    const setAttributesDrawRotated = (x, y, width, height, angle) => {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        _instanceBuffer[++_instanceBufferAt] = cos * width;
        _instanceBuffer[++_instanceBufferAt] = sin * height;
        _instanceBuffer[++_instanceBufferAt] = -sin * width;
        _instanceBuffer[++_instanceBufferAt] = cos * height;
        _instanceBuffer[++_instanceBufferAt] = x;
        _instanceBuffer[++_instanceBufferAt] = y;
    };

    const setAttributesDrawTransform = (transform, width, height) => {
        _instanceBuffer[++_instanceBufferAt] = transform._00 * width;
        _instanceBuffer[++_instanceBufferAt] = transform._10 * height;
        _instanceBuffer[++_instanceBufferAt] = transform._01 * width;
        _instanceBuffer[++_instanceBufferAt] = transform._11 * height;
        _instanceBuffer[++_instanceBufferAt] = transform._20;
        _instanceBuffer[++_instanceBufferAt] = transform._21;
    };

    const setAttributesDrawTransformAt = (x, y, transform, width, height) => {
        _instanceBuffer[++_instanceBufferAt] = transform._00 * width;
        _instanceBuffer[++_instanceBufferAt] = transform._10 * height;
        _instanceBuffer[++_instanceBufferAt] = transform._01 * width;
        _instanceBuffer[++_instanceBufferAt] = transform._11 * height;
        _instanceBuffer[++_instanceBufferAt] = transform._20 + x;
        _instanceBuffer[++_instanceBufferAt] = transform._21 + y;
    };

    const pushVertexColor = (mode, color, x, y) => {
        prepareDraw(mode, 6);

        _instanceBuffer[++_instanceBufferAt] = color.r;
        _instanceBuffer[++_instanceBufferAt] = color.g;
        _instanceBuffer[++_instanceBufferAt] = color.b;
        _instanceBuffer[++_instanceBufferAt] = color.a;
        _instanceBuffer[++_instanceBufferAt] = x;
        _instanceBuffer[++_instanceBufferAt] = y;
    };

    const _primitivesCirclePoints = new Array(1024);
    const _primitivesGetCircleStep = radius => Math.max(2, 32 >> Math.floor(radius / 128));

    for(let i = 0; i < 1024; i += 2) {
        const radians = i * Math.PI / 512;

        _primitivesCirclePoints[i] = Math.cos(radians);
        _primitivesCirclePoints[i + 1] = Math.sin(radians);
    }

    this.primitives = {};

    this.primitives.drawPoint = (color, x, y) => {
        pushVertexColor(RENDER_MODE_POINTS, color, x + 1, y + 1);
    };

    this.primitives.drawLine = (color, x1, y1, x2, y2) => {
        pushVertexColor(RENDER_MODE_LINES, color, x1, y1);
        pushVertexColor(RENDER_MODE_LINES, color, x2, y2);
    };

    this.primitives.drawLineGradient = (color1, x1, y1, color2, x2, y2) => {
        pushVertexColor(RENDER_MODE_LINES, color1, x1, y1);
        pushVertexColor(RENDER_MODE_LINES, color2, x2, y2);
    };

    this.primitives.drawRectangle = (color, x, y, width, height) => {
        this.primitives.drawLine(color, x, y, x + width, y);
        this.primitives.drawLine(color, x + width, y, x + width, y + height);
        this.primitives.drawLine(color, x + width, y + height, x, y + height);
        this.primitives.drawLine(color, x, y + height, x, y);
    };

    this.primitives.drawCircle = (color, x, y, radius) => {
        const step = _primitivesGetCircleStep(radius);
        let i;

        for(i = 0; i < 1024 - step; i += step)
            this.primitives.drawLine(
                color,
                x + _primitivesCirclePoints[i] * radius,
                y + _primitivesCirclePoints[i + 1] * radius,
                x + _primitivesCirclePoints[i + step] * radius,
                y + _primitivesCirclePoints[i + 1 + step] * radius);

        this.primitives.drawLine(
            color,
            x + _primitivesCirclePoints[i] * radius,
            y + _primitivesCirclePoints[i + 1] * radius,
            x + _primitivesCirclePoints[0] * radius,
            y + _primitivesCirclePoints[1] * radius);
    };

    this.primitives.drawTriangle = (color, x1, y1, x2, y2, x3, y3) => {
        pushVertexColor(RENDER_MODE_TRIANGLES, color, x1, y1);
        pushVertexColor(RENDER_MODE_TRIANGLES, color, x2, y2);
        pushVertexColor(RENDER_MODE_TRIANGLES, color, x3, y3);
    };

    this.primitives.drawTriangleGradient = (color1, x1, y1, color2, x2, y2, color3, x3, y3) => {
        pushVertexColor(RENDER_MODE_TRIANGLES, color1, x1, y1);
        pushVertexColor(RENDER_MODE_TRIANGLES, color2, x2, y2);
        pushVertexColor(RENDER_MODE_TRIANGLES, color3, x3, y3);
    };

    this.primitives.fillRectangle = (color, x, y, width, height) => {
        this.primitives.drawTriangle(color, x, y, x, y + height, x + width, y + height);
        this.primitives.drawTriangle(color, x + width, y + height, x + width, y, x, y);
    };

    this.primitives.fillRectangleGradient = (color1, color2, color3, color4, x, y, width, height) => {
        this.primitives.drawTriangleGradient(color1, x, y, color3, x, y + height, color4, x + width, y + height);
        this.primitives.drawTriangleGradient(color4, x + width, y + height, color2, x + width, y, color1, x, y);
    };

    this.primitives.fillCircle = (color, x, y, radius) => {
        const step = _primitivesGetCircleStep(radius);
        let i = 0;

        for(; i < 1024 - step; i+= step)
            this.primitives.drawTriangle(
                color,
                x, y,
                x + _primitivesCirclePoints[i] * radius,
                y + _primitivesCirclePoints[i + 1] * radius,
                x + _primitivesCirclePoints[i + step] * radius,
                y + _primitivesCirclePoints[i + 1 + step] * radius);

        this.primitives.drawTriangle(
            color,
            x, y,
            x + _primitivesCirclePoints[i] * radius,
            y + _primitivesCirclePoints[i + 1] * radius,
            x + _primitivesCirclePoints[0] * radius,
            y + _primitivesCirclePoints[1] * radius);
    };

    this.primitives.fillCircleGradient = (colorStart, colorEnd, x, y, radius) => {
        const step = _primitivesGetCircleStep(radius);
        let i;

        for(i = 0; i < 1024 - step; i+= step)
            this.primitives.drawTriangleGradient(
                colorStart,
                x, y,
                colorEnd,
                x + _primitivesCirclePoints[i] * radius,
                y + _primitivesCirclePoints[i + 1] * radius,
                colorEnd,
                x + _primitivesCirclePoints[i + step] * radius,
                y + _primitivesCirclePoints[i + 1 + step] * radius);

        this.primitives.drawTriangleGradient(
            colorStart,
            x, y,
            colorEnd,
            x + _primitivesCirclePoints[i] * radius,
            y + _primitivesCirclePoints[i + 1] * radius,
            colorEnd,
            x + _primitivesCirclePoints[0] * radius,
            y + _primitivesCirclePoints[1] * radius);
    };

    const meshBindSource = source => {
        if(source instanceof this.Surface) {
            _meshUvLeft = _meshUvTop = 0;
            _meshUvWidth = _meshUvHeight = 1;
        }
        else
            source._setMeshBounds();

        if(_currentTextureMesh === source._getTexture())
            return;

        flush();

        _gl.activeTexture(TEXTURE_MESH);
        _gl.bindTexture(_gl.TEXTURE_2D, source._getTexture());

        _currentTextureMesh = source._getTexture();
    };

    const pushVertexMesh = (mode, x, y, u, v) => {
        prepareDraw(mode, 4);

        _instanceBuffer[++_instanceBufferAt] = x;
        _instanceBuffer[++_instanceBufferAt] = y;
        _instanceBuffer[++_instanceBufferAt] = u * _meshUvWidth + _meshUvLeft;
        _instanceBuffer[++_instanceBufferAt] = v * _meshUvHeight + _meshUvTop;
    };

    this.mesh = {};

    this.mesh.drawTriangle = (source, x1, y1, u1, v1, x2, y2, u2, v2, x3, y3, u3, v3) => {
        meshBindSource(source);

        pushVertexMesh(RENDER_MODE_MESH, x1, y1, u1, v1);
        pushVertexMesh(RENDER_MODE_MESH, x2, y2, u2, v2);
        pushVertexMesh(RENDER_MODE_MESH, x3, y3, u3, v3);
    };

    this.utils = {};

    this.utils.loop = update => {
        let lastDate = new Date();
        const loopFunction = function(step) {
            const date = new Date();

            if(update((date - lastDate) * 0.001))
                requestAnimationFrame(loopFunction);

            lastDate = date;
        };

        requestAnimationFrame(loopFunction);
    };

    const ShaderCore = function(vertex, fragment) {
        const createShader = (type, source) => {
            const shader = _gl.createShader(type);

            _gl.shaderSource(shader, "#version 300 es\n" + source);
            _gl.compileShader(shader);

            if(!_gl.getShaderParameter(shader, _gl.COMPILE_STATUS))
                console.log(_gl.getShaderInfoLog(shader));

            return shader;
        };

        this.bind = () => {
            if(_currentShaderCore === this)
                return;

            _currentShaderCore = this;

            _gl.useProgram(_program);
        };

        this.getProgram = () => _program;
        this.free = () => _gl.deleteProgram(_program);
        this.getVertex = () => vertex;
        this.getFragment = () => fragment;

        const _program = _gl.createProgram();
        const _shaderVertex = createShader(_gl.VERTEX_SHADER, vertex);
        const _shaderFragment = createShader(_gl.FRAGMENT_SHADER, fragment);

        _gl.attachShader(_program, _shaderVertex);
        _gl.attachShader(_program, _shaderFragment);
        _gl.linkProgram(_program);
        _gl.detachShader(_program, _shaderVertex);
        _gl.detachShader(_program, _shaderFragment);
        _gl.deleteShader(_shaderVertex);
        _gl.deleteShader(_shaderFragment);
    };

    const Shader = function(core, uniforms) {
        this.bind = () => {
            if(_currentShader === this) {
                for (const uniformCall of _uniformCalls)
                    uniformCall[0](uniformCall[1], uniformCall[2].value);

                return;
            }

            _currentShader = this;

            core.bind();

            for (const uniformCall of _uniformCalls)
                uniformCall[0](uniformCall[1], uniformCall[2].value);
        };

        this.setUniform = (name, value) => uniforms[name].value = value;
        this.free = () => core.free();

        const _uniformCalls = [];

        for (const uniform of Object.keys(uniforms))
            _uniformCalls.push([
                _gl["uniform" + uniforms[uniform].type].bind(_gl),
                _gl.getUniformLocation(core.getProgram(), uniform),
                uniforms[uniform]
            ]);
    };

    const bind = target => {
        if(_surface === target)
            return;

        flush();

        if(_surface != null)
            this.pop();

        if(target != null)
            pushIdentity();

        _surface = target;
    };

    const bindTextureSurface = texture => {
        if(_currentTextureSurface === texture)
            return;

        flush();

        _gl.activeTexture(TEXTURE_SURFACE);
        _gl.bindTexture(_gl.TEXTURE_2D, texture);

        _currentTextureSurface = texture;
    };

    const bindTextureAtlas = texture => {
        if(_currentTextureAtlas === texture)
            return;

        flush();

        _gl.activeTexture(TEXTURE_ATLAS);
        _gl.bindTexture(_gl.TEXTURE_2D, texture);

        _currentTextureAtlas = texture;
    };

    const clear = color => {
        flush();

        _gl.clearColor(color.r * _uboContents[8], color.g * _uboContents[9], color.b * _uboContents[10], color.a * _uboContents[11]);
        _gl.clear(_gl.COLOR_BUFFER_BIT);
    };

    const flush = this.flush = () => {
        if(_instanceCount === 0)
            return;

        _gl.bindBuffer(_gl.ARRAY_BUFFER, _instances);
        _gl.bufferSubData(_gl.ARRAY_BUFFER, 0, _instanceBuffer, 0, _instanceBufferAt + 1);

        switch(_renderMode) {
            case RENDER_MODE_SURFACES:
            case RENDER_MODE_SPRITES:
            case RENDER_MODE_SHADER:
                _gl.bindVertexArray(_vaoSprites);
                _gl.drawArraysInstanced(_gl.TRIANGLE_FAN, 0, 4, _instanceCount);
                break;
            case RENDER_MODE_LINES:
                _gl.bindVertexArray(_vaoLines);
                _gl.drawArrays(_gl.LINES, 0, _instanceCount);
                break;
            case RENDER_MODE_POINTS:
                _gl.bindVertexArray(_vaoLines);
                _gl.drawArrays(_gl.POINTS, 0, _instanceCount);
                break;
            case RENDER_MODE_TRIANGLES:
                _gl.bindVertexArray(_vaoLines);
                _gl.drawArrays(_gl.TRIANGLES, 0, _instanceCount);
                break;
            case RENDER_MODE_MESH:
                _gl.bindVertexArray(_vaoMesh);
                _gl.drawArrays(_gl.TRIANGLES, 0, _instanceCount);
                break;
        }

        _instanceBufferAt = -1;
        _instanceCount = 0;
    };

    const sendUniformBuffer = () => {
        if(_surface == null) {
            _uboContents[3] = canvasElement.width;
            _uboContents[7] = canvasElement.height;
        }
        else {
            _uboContents[3] = _surface.getWidth();
            _uboContents[7] = _surface.getHeight();
        }

        _uboContents[0] = _transformStack[_transformAt]._00;
        _uboContents[1] = _transformStack[_transformAt]._10;
        _uboContents[2] = _transformStack[_transformAt]._20;
        _uboContents[4] = _transformStack[_transformAt]._01;
        _uboContents[5] = _transformStack[_transformAt]._11;
        _uboContents[6] = _transformStack[_transformAt]._21;

        _gl.bufferSubData(_gl.UNIFORM_BUFFER, 0, _uboContents);

        _transformDirty = false;
    };

    const prepareDraw = (mode, size, shader) => {
        if(_transformDirty) {
            flush();

            sendUniformBuffer();
        }

        if(_renderMode !== mode || _renderMode === RENDER_MODE_SHADER) {
            flush();

            _renderMode = mode;
            (shader || _shaders[mode]).bind();
        }

        if(_instanceBufferAt + size >= _instanceBufferCapacity) {
            const oldBuffer = _instanceBuffer;

            _instanceBuffer = new Float32Array(_instanceBufferCapacity *= 2);

            _gl.bindBuffer(_gl.ARRAY_BUFFER, _instances);
            _gl.bufferData(_gl.ARRAY_BUFFER, _instanceBufferCapacity * 4, _gl.DYNAMIC_DRAW);

            for(let i = 0; i < oldBuffer.byteLength; ++i)
                _instanceBuffer[i] = oldBuffer[i];
        }

        ++_instanceCount;
    };

    const pushIdentity = () => {
        if(++_transformAt === _transformStack.length)
            _transformStack.push(new Myr.Transform());
        else
            _transformStack[_transformAt].identity();

        _transformDirty = true;
    };

    this.push = () => {
        if(++_transformAt === _transformStack.length)
            _transformStack.push(_transformStack[_transformAt - 1].copy());
        else
            _transformStack[_transformAt].set(_transformStack[_transformAt - 1]);
    };

    this.pop = () => {
        --_transformAt;

        _transformDirty = true;
    };

    this.bind = () => {
        bind(null);

        _gl.bindFramebuffer(_gl.FRAMEBUFFER, null);
        _gl.viewport(0, 0, canvasElement.width, canvasElement.height);
    };

    this.register = function() {
        const frames = [];

        for(let i = 1; i < arguments.length; ++i)
            frames.push(arguments[i]);

        if(_sprites[arguments[0]] === undefined)
            _sprites[arguments[0]] = frames;
        else {
            _sprites[arguments[0]].length = 0;

            for(let i = 0; i < frames.length; ++i)
                _sprites[arguments[0]].push(frames[i]);
        }
    };

    this.isRegistered = name => _sprites[name] !== undefined;

    this.makeSpriteFrame = (sheet, x, y, width, height, xOrigin, yOrigin, time) => {
        const frame = [
            sheet._getTexture(),
            width,
            height,
            xOrigin / width,
            yOrigin / height,
            x,
            y,
            width,
            height,
            time
        ];

        sheet._addFrame(frame);

        return frame;
    };

    this.free = () => {
        for(let i = 0; i < _shaders.length; ++i)
            _shaders[i].free();

        _gl.deleteVertexArray(_vaoSprites);
        _gl.deleteVertexArray(_vaoLines);
        _gl.deleteVertexArray(_vaoMesh);
        _gl.deleteBuffer(_quad);
        _gl.deleteBuffer(_instances);
        _gl.deleteBuffer(_ubo);
    };

    this.setColor = color => {
        if(
            _uboContents[8] === color.r &&
            _uboContents[9] === color.g &&
            _uboContents[10] === color.b &&
            _uboContents[11] === color.a)
            return;

        flush();

        _uboContents[8] = color.r;
        _uboContents[9] = color.g;
        _uboContents[10] = color.b;
        _uboContents[11] = color.a;

        _gl.bufferSubData(_gl.UNIFORM_BUFFER, 0, _uboContents);
    };

    this.resize = (width, height) => {
        canvasElement.width = width;
        canvasElement.height = height;

        _transformStack[0]._21 = height;

        sendUniformBuffer();
    };

    this.setAlpha = alpha => {
        if(_uboContents[11] === alpha)
            return;

        flush();

        _uboContents[11] = alpha;

        _gl.bufferSubData(_gl.UNIFORM_BUFFER, 0, _uboContents);
    };

    this.blendEnable = () => {
        flush();
        _gl.enable(_gl.BLEND);
    };

    this.blendDisable = () => {
        flush();
        _gl.disable(_gl.BLEND);
    };

    const touchTransform = () => {
        _transformDirty = true;

        return _transformStack[_transformAt];
    };

    this.getTransform = () => _transformStack[_transformAt];
    this.transformSet = transform => {
        touchTransform().set(_transformStack[0]);
        touchTransform().multiply(transform);
    }
    this.transform = transform => touchTransform().multiply(transform);
    this.translate = (x, y) => touchTransform().translate(x, y);
    this.rotate = angle => touchTransform().rotate(angle);
    this.shear = (x, y) => touchTransform().shear(x, y);
    this.scale = (x, y) => touchTransform().scale(x, y);
    this.setClearColor = color => _clearColor = color;
    this.clear = () => clear(_clearColor);
    this.getWidth = () => canvasElement.width;
    this.getHeight = () => canvasElement.height;
    this.unregister = name => delete _sprites[name];

    const RENDER_MODE_NONE = -1;
    const RENDER_MODE_SURFACES = 0;
    const RENDER_MODE_SPRITES = 1;
    const RENDER_MODE_LINES = 2;
    const RENDER_MODE_POINTS = 3;
    const RENDER_MODE_TRIANGLES = 4;
    const RENDER_MODE_MESH = 5;
    const RENDER_MODE_SHADER = 6;
    const TEXTURE_ATLAS = _gl.TEXTURE0;
    const TEXTURE_SURFACE = _gl.TEXTURE1;
    const TEXTURE_MESH = _gl.TEXTURE2;
    const TEXTURE_EDITING = _gl.TEXTURE3;
    const TEXTURE_SHADER_FIRST = _gl.TEXTURE4;

    const _quad = _gl.createBuffer();
    const _instances = _gl.createBuffer();
    const _vaoSprites = _gl.createVertexArray();
    const _vaoLines = _gl.createVertexArray();
    const _vaoMesh = _gl.createVertexArray();
    const _ubo = _gl.createBuffer();
    const _uboContents = new Float32Array(12);
    const _emptyPixel = new Uint8Array(4);
    const _sprites = [];
    const _transformStack = [new Myr.Transform(1, 0, 0, 0, -1, canvasElement.height)];
    const _uniformBlock = "layout(std140) uniform transform {mediump vec4 tw;mediump vec4 th;lowp vec4 colorFilter;};";
    const _shaderCoreSprites = new ShaderCore(
        "layout(location=0) in mediump vec2 vertex;" +
        "layout(location=1) in mediump vec4 a1;" +
        "layout(location=2) in mediump vec4 a2;" +
        "layout(location=3) in mediump vec4 a3;" +
        _uniformBlock +
        "out mediump vec2 uv;" +
        "void main() {" +
        "uv=a1.zw+vertex*a2.xy;" +
        "mediump vec2 transformed=(((vertex-a1.xy)*" +
        "mat2(a2.zw,a3.xy)+a3.zw)*" +
        "mat2(tw.xy,th.xy)+vec2(tw.z,th.z))/" +
        "vec2(tw.w,th.w)*2.0;" +
        "gl_Position=vec4(transformed-vec2(1),0,1);" +
        "}",
        "uniform sampler2D source;" +
        _uniformBlock +
        "in mediump vec2 uv;" +
        "layout(location=0) out lowp vec4 color;" +
        "void main() {" +
        "color=texture(source,uv)*colorFilter;" +
        "}"
    );
    const _shaderCoreLines = new ShaderCore(
        "layout(location=0) in mediump vec4 color;" +
        "layout(location=1) in mediump vec2 vertex;" +
        _uniformBlock +
        "out lowp vec4 colori;" +
        "void main() {" +
        "mediump vec2 transformed=(vertex*" +
        "mat2(tw.xy,th.xy)+vec2(tw.z,th.z))/" +
        "vec2(tw.w,th.w)*2.0;" +
        "gl_Position=vec4(transformed-vec2(1),0,1);" +
        "colori = color*colorFilter;" +
        "}",
        "in lowp vec4 colori;" +
        "layout(location=0) out lowp vec4 color;" +
        "void main() {" +
        "color=colori;" +
        "}"
    );
    const _shaderCorePoints = new ShaderCore(
        "layout(location=0) in mediump vec4 color;" +
        "layout(location=1) in mediump vec2 vertex;" +
        _uniformBlock +
        "flat out lowp vec4 colorf;" +
        "void main() {" +
        "mediump vec2 transformed=(vertex*" +
        "mat2(tw.xy,th.xy)+vec2(tw.z,th.z))/" +
        "vec2(tw.w,th.w)*2.0;" +
        "gl_Position=vec4(transformed-vec2(1),0,1);" +
        "gl_PointSize=1.0;" +
        "colorf = color*colorFilter;" +
        "}",
        "flat in lowp vec4 colorf;" +
        "layout(location=0) out lowp vec4 color;" +
        "void main() {" +
        "color=colorf;" +
        "}"
    );
    const _shaderCoreMesh = new ShaderCore(
        "layout(location=0) in mediump vec4 vertex;" +
        _uniformBlock +
        "out mediump vec2 uv;" +
        "void main() {" +
        "mediump vec2 transformed=(vertex.xy*" +
        "mat2(tw.xy,th.xy)+vec2(tw.z,th.z))/" +
        "vec2(tw.w,th.w)*2.0;" +
        "gl_Position=vec4(transformed-vec2(1),0,1);" +
        "uv = vertex.zw;" +
        "}",
        _shaderCoreSprites.getFragment()
    );
    const _shaders = [
        new Shader(
            _shaderCoreSprites,
            {
                source: {
                    type: "1i",
                    value: 1
                }
            }),
        new Shader(
            _shaderCoreSprites,
            {
                source: {
                    type: "1i",
                    value: 0
                }
            }),
        new Shader(
            _shaderCoreLines,
            {}),
        new Shader(
            _shaderCorePoints,
            {}),
        new Shader(
            _shaderCoreLines,
            {}),
        new Shader(
            _shaderCoreMesh,
            {
                source: {
                    type: "1i",
                    value: 2
                }
            })
    ];

    let _currentShader, _currentShaderCore, _surface, _currentTextureSurface, _currentTextureAtlas, _currentTextureMesh;
    let _meshUvLeft, _meshUvTop, _meshUvWidth, _meshUvHeight;
    let _transformAt = 0;
    let _transformDirty = true;
    let _renderMode = RENDER_MODE_NONE;
    let _instanceBufferCapacity = 1024;
    let _instanceBufferAt = -1;
    let _instanceBuffer = new Float32Array(_instanceBufferCapacity);
    let _instanceCount = 0;
    let _clearColor = new Myr.Color(1, 1, 1, 0);

    _uboContents[8] = _uboContents[9] = _uboContents[10] = _uboContents[11] = 1;

    _gl.enable(_gl.BLEND);
    _gl.disable(_gl.DEPTH_TEST);
    _gl.blendFuncSeparate(_gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA, _gl.ONE, _gl.ONE_MINUS_SRC_ALPHA);
    _gl.getExtension("EXT_color_buffer_float");

    _gl.bindBuffer(_gl.ARRAY_BUFFER, _instances);
    _gl.bufferData(_gl.ARRAY_BUFFER, _instanceBufferCapacity * 4, _gl.DYNAMIC_DRAW);

    _gl.bindBuffer(_gl.ARRAY_BUFFER, _quad);
    _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array([0, 0, 0, 1, 1, 1, 1, 0]), _gl.STATIC_DRAW);

    _gl.bindBuffer(_gl.UNIFORM_BUFFER, _ubo);
    _gl.bufferData(_gl.UNIFORM_BUFFER, 48, _gl.DYNAMIC_DRAW);
    _gl.bindBufferBase(_gl.UNIFORM_BUFFER, 0, _ubo);

    _gl.bindVertexArray(_vaoSprites);
    _gl.bindBuffer(_gl.ARRAY_BUFFER, _quad);
    _gl.enableVertexAttribArray(0);
    _gl.vertexAttribPointer(0, 2, _gl.FLOAT, false, 8, 0);
    _gl.bindBuffer(_gl.ARRAY_BUFFER, _instances);
    _gl.enableVertexAttribArray(1);
    _gl.vertexAttribDivisor(1, 1);
    _gl.vertexAttribPointer(1, 4, _gl.FLOAT, false, 48, 0);
    _gl.enableVertexAttribArray(2);
    _gl.vertexAttribDivisor(2, 1);
    _gl.vertexAttribPointer(2, 4, _gl.FLOAT, false, 48, 16);
    _gl.enableVertexAttribArray(3);
    _gl.vertexAttribDivisor(3, 1);
    _gl.vertexAttribPointer(3, 4, _gl.FLOAT, false, 48, 32);

    _gl.bindVertexArray(_vaoLines);
    _gl.bindBuffer(_gl.ARRAY_BUFFER, _instances);
    _gl.enableVertexAttribArray(0);
    _gl.vertexAttribPointer(0, 4, _gl.FLOAT, false, 24, 0);
    _gl.enableVertexAttribArray(1);
    _gl.vertexAttribPointer(1, 2, _gl.FLOAT, false, 24, 16);

    _gl.bindVertexArray(_vaoMesh);
    _gl.bindBuffer(_gl.ARRAY_BUFFER, _instances);
    _gl.enableVertexAttribArray(0);
    _gl.vertexAttribPointer(0, 4, _gl.FLOAT, false, 16, 0);

    _gl.bindVertexArray(null);

    this.bind();
};

Myr.Color = function(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a === undefined?1:a;
};

Myr.Color.BLACK = new Myr.Color(0, 0, 0);
Myr.Color.BLUE = new Myr.Color(0, 0, 1);
Myr.Color.GREEN = new Myr.Color(0, 1, 0);
Myr.Color.CYAN = new Myr.Color(0, 1, 1);
Myr.Color.RED = new Myr.Color(1, 0, 0);
Myr.Color.MAGENTA = new Myr.Color(1, 0, 1);
Myr.Color.YELLOW = new Myr.Color(1, 1, 0);
Myr.Color.WHITE = new Myr.Color(1, 1, 1);

Myr.Color.fromHex = hex => {
    const integer = parseInt(hex, 16);

    if (hex.length === 6)
        return new Myr.Color(
            ((integer >> 16) & 0xFF) / 255,
            ((integer >> 8) & 0xFF) / 255,
            (integer & 0xFF) / 255);
    else
        return new Myr.Color(
            ((integer >> 24) & 0xFF) / 255,
            ((integer >> 16) & 0xFF) / 255,
            ((integer >> 8) & 0xFF) / 255,
            (integer & 0xFF) / 255);
};

Myr.Color.prototype.toHex = function() {
    const componentToHex = component => {
        const hex = component.toString(16);

        return hex.length === 1?"0" + hex:hex;
    };

    return "#" +
        componentToHex(Math.round(this.r * 255)) +
        componentToHex(Math.round(this.g * 255)) +
        componentToHex(Math.round(this.b * 255));
};

Myr.Color.fromHSV = (h, s, v) => {
    const c = v * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = v - c;

    switch(Math.floor(h * 6)) {
        case 1:
            return new Myr.Color(x + m, c + m, m);
        case 2:
            return new Myr.Color(m, c + m, x + m);
        case 3:
            return new Myr.Color(m, x + m, c + m);
        case 4:
            return new Myr.Color(x + m, m, c + m);
        case 5:
            return new Myr.Color(c + m, m, x + m);
        default:
            return new Myr.Color(c + m, x + m, m);
    }
};

Myr.Color.prototype.toHSV = function() {
    const cMax = Math.max(this.r, this.g, this.b);
    const cMin = Math.min(this.r, this.g, this.b);
    let h, s, l = (cMax + cMin) * 0.5;

    if (cMax === cMin)
        h = s = 0;
    else {
        let delta = cMax - cMin;
        s = l > 0.5 ? delta / (2 - delta) : delta / (cMax + cMin);

        switch(cMax) {
            case this.r:
                h = (this.g - this.b) / delta + (this.g < this.b ? 6 : 0);
                break;
            case this.g:
                h = (this.b - this.r) / delta + 2;
                break;
            case this.b:
                h = (this.r - this.g) / delta + 4;
        }
    }

    return {
        h: h / 6,
        s: s,
        v: cMax
    };
};

Myr.Color.prototype.copy = function() {
    return new Myr.Color(this.r, this.g, this.b, this.a);
};

Myr.Color.prototype.add = function(color) {
    this.r = Math.min(this.r + color.r, 1);
    this.g = Math.min(this.g + color.g, 1);
    this.b = Math.min(this.b + color.b, 1);

    return this;
};

Myr.Color.prototype.multiply = function(color) {
    this.r *= color.r;
    this.g *= color.g;
    this.b *= color.b;

    return this;
};

Myr.Color.prototype.equals = function(color) {
    return this.r === color.r && this.g === color.g && this.b === color.b && this.a === color.a;
};

Myr.Vector = function(x, y) {
    this.x = x;
    this.y = y;
};

Myr.Vector.prototype.copy = function() {
    return new Myr.Vector(this.x, this.y);
};

Myr.Vector.prototype.add = function(vector) {
    this.x += vector.x;
    this.y += vector.y;
};

Myr.Vector.prototype.subtract = function(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
};

Myr.Vector.prototype.negate = function() {
    this.x = -this.x;
    this.y = -this.y;
};

Myr.Vector.prototype.dot = function(vector) {
    return this.x * vector.x + this.y * vector.y;
};

Myr.Vector.prototype.length = function() {
    return Math.sqrt(this.dot(this));
};

Myr.Vector.prototype.multiply = function(scalar) {
    this.x *= scalar;
    this.y *= scalar;
};

Myr.Vector.prototype.divide = function(scalar) {
    if(scalar === 0)
        this.x = this.y = 0;
    else
        this.multiply(1.0 / scalar);
};

Myr.Vector.prototype.normalize = function() {
    this.divide(this.length());
};

Myr.Vector.prototype.angle = function() {
    return Math.atan2(this.y, this.x);
};

Myr.Vector.prototype.reflect = function(vector) {
    const ddot = this.dot(vector) * 2;

    this.x -= ddot * vector.x;
    this.y -= ddot * vector.y;
};

Myr.Vector.prototype.equals = function(vector) {
    return this.x === vector.x && this.y === vector.y;
};

Myr.Vector.prototype.rotate = function(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = this.x;
    const y = this.y;

    this.x = x * cos - y * sin;
    this.y = x * sin + y * cos;
};

Myr.Transform = function(_00, _10, _20, _01, _11, _21) {
    if(_00 === undefined)
        this.identity();
    else {
        this._00 = _00;
        this._10 = _10;
        this._20 = _20;
        this._01 = _01;
        this._11 = _11;
        this._21 = _21;
    }
};

Myr.Transform.prototype.apply = function(vector) {
    const x = vector.x;
    const y = vector.y;

    vector.x = this._00 * x + this._10 * y + this._20;
    vector.y = this._01 * x + this._11 * y + this._21;
};

Myr.Transform.prototype.copy = function() {
    return new Myr.Transform(this._00, this._10, this._20, this._01, this._11, this._21);
};

Myr.Transform.prototype.identity = function() {
    this._00 = 1;
    this._10 = 0;
    this._20 = 0;
    this._01 = 0;
    this._11 = 1;
    this._21 = 0;
};

Myr.Transform.prototype.set = function(transform) {
    this._00 = transform._00;
    this._10 = transform._10;
    this._20 = transform._20;
    this._01 = transform._01;
    this._11 = transform._11;
    this._21 = transform._21;
};

Myr.Transform.prototype.multiply = function(transform) {
    const _00 = this._00;
    const _10 = this._10;
    const _01 = this._01;
    const _11 = this._11;

    this._00 = _00 * transform._00 + _10 * transform._01;
    this._10 = _00 * transform._10 + _10 * transform._11;
    this._20 += _00 * transform._20 + _10 * transform._21;
    this._01 = _01 * transform._00 + _11 * transform._01;
    this._11 = _01 * transform._10 + _11 * transform._11;
    this._21 += _01 * transform._20 + _11 * transform._21;
};

Myr.Transform.prototype.rotate = function(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const _00 = this._00;
    const _01 = this._01;

    this._00 = _00 * cos - this._10 * sin;
    this._10 = _00 * sin + this._10 * cos;
    this._01 = _01 * cos - this._11 * sin;
    this._11 = _01 * sin + this._11 * cos;
};

Myr.Transform.prototype.shear = function(x, y) {
    const _00 = this._00;
    const _01 = this._01;

    this._00 += this._10 * y;
    this._10 += _00 * x;
    this._01 += this._11 * y;
    this._11 += _01 * x;
};

Myr.Transform.prototype.translate = function(x, y) {
    this._20 += this._00 * x + this._10 * y;
    this._21 += this._01 * x + this._11 * y;
};

Myr.Transform.prototype.scale = function(x, y) {
    this._00 *= x;
    this._10 *= y;
    this._01 *= x;
    this._11 *= y;
};

Myr.Transform.prototype.invert = function() {
    const s11 = this._00;
    const s02 = this._10 * this._21 - this._11 * this._20;
    const s12 = -this._00 * this._21 + this._01 * this._20;

    const d = 1.0 / (this._00 * this._11 - this._10 * this._01);

    this._00 = this._11 * d;
    this._10 = -this._10 * d;
    this._20 = s02 * d;
    this._01 = -this._01 * d;
    this._11 = s11 * d;
    this._21 = s12 * d;
};

if(typeof module !== 'undefined') module.exports = Myr;
