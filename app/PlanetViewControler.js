/**loading PlanetCamearContorl control
 * @author tide_h
 * 
 * @author Eberhard Graether / http://egraether.com/
 * @author Mark Lundin 	/ http://mark-lundin.com
 * @author Simone Manini / http://daron1337.github.io
 * @author Luca Antiga 	/ http://lantiga.github.io
 */

var PlanetViewControler = function(object, domElement) {

    var _this = this;
    var STATE = { NONE: -1, ROTATEX: 0, ZOOM: 1, ROTATEY: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_ROTATEA: 4, FOUSE_STATE: 5 };

    this.object = object;
    this.domElement = (domElement !== undefined) ? domElement : document;

    // API

    this.enabled = true;

    this.screen = { left: 0, top: 0, width: 0, height: 0 };

    this.autoRotate = false;
    this.autoRotateSpeed = 1.0;

    this.rotateSpeed = 1.0;
    this.zoomSpeed = 1.2;
    this.panSpeed = 0.3;

    this.fouseSpeed = 1.0;
    this.fouseTarget = new THREE.Vector3(-1, 0, 0);

    this.noRotate = false;
    this.noZoom = false;
    this.noRotateY = false;
    this.noFocus = false;

    this.staticMoving = false;
    this.dynamicDampingFactor = 0.2;

    this.minDistance = 0;
    this.maxDistance = Infinity;

    this.keys = [65 /*A*/ , 83 /*S*/ , 68 /*D*/ ];

    // internals

    this.target = new THREE.Vector3();

    var EPS = 0.000001;

    var lastPosition = new THREE.Vector3();

    var _state = STATE.NONE,
        _prevState = STATE.NONE,

        _eye = new THREE.Vector3(),

        _movePrev = new THREE.Vector2(),
        _moveCurr = new THREE.Vector2(),

        _lastAxis = new THREE.Vector3(),
        _lastAngle = 0,

        _zoomStart = new THREE.Vector2(),
        _zoomEnd = new THREE.Vector2(),

        _touchZoomDistanceStart = 0,
        _touchZoomDistanceEnd = 0;

    // for reset

    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.up0 = this.object.up.clone();

    // events

    var changeEvent = { type: 'change' };
    var startEvent = { type: 'start' };
    var endEvent = { type: 'end' };


    // methods

    this.handleResize = function() {

        if (this.domElement === document) {

            this.screen.left = 0;
            this.screen.top = 0;
            this.screen.width = window.innerWidth;
            this.screen.height = window.innerHeight;

        } else {

            var box = this.domElement.getBoundingClientRect();
            // adjustments come from similar code in the jquery offset() function
            var d = this.domElement.ownerDocument.documentElement;
            this.screen.left = box.left + window.pageXOffset - d.clientLeft;
            this.screen.top = box.top + window.pageYOffset - d.clientTop;
            this.screen.width = box.width;
            this.screen.height = box.height;

        }

    };

    this.handleEvent = function(event) {

        if (typeof this[event.type] == 'function') {

            this[event.type](event);

        }

    };

    var getMouseOnScreen = (function() {

        var vector = new THREE.Vector2();

        return function getMouseOnScreen(pageX, pageY) {

            vector.set(
                (pageX - _this.screen.left) / _this.screen.width,
                (pageY - _this.screen.top) / _this.screen.height
            );

            return vector;

        };

    }());

    var getMouseOnCircle = (function() {

        var vector = new THREE.Vector2();
        var x, y;
        return function getMouseOnCircle(pageX, pageY, getY) {

            x = ((pageX - _this.screen.width * 0.5 - _this.screen.left) / (_this.screen.width * 0.5));
            y = 0.0;
            if (getY)
                y = ((_this.screen.height + 2 * (_this.screen.top - pageY)) / _this.screen.width); // screen.width intentional

            vector.set(x, y);

            return vector;

        };

    }());

    this.rotateCamera = (function() {

        var axis = new THREE.Vector3(),
            quaternion = new THREE.Quaternion(),
            eyeDirection = new THREE.Vector3(),
            objectUpDirection = new THREE.Vector3(),
            objectSidewaysDirection = new THREE.Vector3(),
            moveDirection = new THREE.Vector3(),
            angle;

        return function rotateCamera() {

            moveDirection.set(_moveCurr.x - _movePrev.x, _moveCurr.y - _movePrev.y, 0);
            angle = moveDirection.length();

            if (angle) {

                _eye.copy(_this.object.position).sub(_this.target);

                eyeDirection.copy(_eye).normalize();
                objectUpDirection.copy(_this.object.up).normalize();
                objectSidewaysDirection.crossVectors(objectUpDirection, eyeDirection).normalize();

                objectUpDirection.setLength(_moveCurr.y - _movePrev.y);
                objectSidewaysDirection.setLength(_moveCurr.x - _movePrev.x);

                moveDirection.copy(objectUpDirection.add(objectSidewaysDirection));

                axis.crossVectors(moveDirection, _eye).normalize();

                angle *= _this.rotateSpeed;
                quaternion.setFromAxisAngle(axis, angle);

                _eye.applyQuaternion(quaternion);
                _this.object.up.applyQuaternion(quaternion);

                _lastAxis.copy(axis);
                _lastAngle = angle;

            } else if (!_this.staticMoving && _lastAngle) {

                _lastAngle *= Math.sqrt(1.0 - _this.dynamicDampingFactor);
                _eye.copy(_this.object.position).sub(_this.target);
                quaternion.setFromAxisAngle(_lastAxis, _lastAngle);
                _eye.applyQuaternion(quaternion);
                _this.object.up.applyQuaternion(quaternion);

            }

            _movePrev.copy(_moveCurr);

        };

    }());


    this.zoomCamera = function() {

        var factor;

        if (_state === STATE.TOUCH_ZOOM_ROTATEA) {

            factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
            _touchZoomDistanceStart = _touchZoomDistanceEnd;
            _eye.multiplyScalar(factor);

        } else {

            factor = 1.0 + (_zoomEnd.y - _zoomStart.y) * _this.zoomSpeed;

            if (factor !== 1.0 && factor > 0.0) {

                _eye.multiplyScalar(factor);

            }

            if (_this.staticMoving) {

                _zoomStart.copy(_zoomEnd);

            } else {

                _zoomStart.y += (_zoomEnd.y - _zoomStart.y) * this.dynamicDampingFactor;

            }

        }

    };

    this.FocusCamera = (function() {
        var fouseT = new THREE.Vector3(),
            scalar,
            count, i = 0,
            flagFocus = false;
        fouseT.copy(_this.fouseTarget);
        scalar = 0.02 * _this.fouseSpeed;
        fouseT = fouseT.sub(_this.target0).multiplyScalar(scalar);
        count = Math.round(1.0 / scalar);
        return function FocusCamera() {
            if (_state === STATE.FOUSE_STATE) {
                i++;
                if (i > count) {
                    _prevState = _state;
                    _state = STATE.NONE;
                    i = 0;
                    flagFocus = !flagFocus;
                    return;
                }
                if (flagFocus) {
                    _eye.multiplyScalar(1.0 + scalar);
                    _this.target.sub(fouseT);
                } else {
                    _eye.multiplyScalar(1.0 - scalar);
                    _this.target.add(fouseT);
                }
                //console.log(fouseT);
            }
        };

    }());

    this.checkDistances = function() {

        if (!_this.noZoom || !_this.noPan) {

            if (_eye.lengthSq() > _this.maxDistance * _this.maxDistance) {

                _this.object.position.addVectors(_this.target, _eye.setLength(_this.maxDistance));
                _zoomStart.copy(_zoomEnd);

            }

            if (_eye.lengthSq() < _this.minDistance * _this.minDistance) {

                _this.object.position.addVectors(_this.target, _eye.setLength(_this.minDistance));
                _zoomStart.copy(_zoomEnd);

            }

        }

    };

    this.update = function() {

        _eye.subVectors(_this.object.position, _this.target);

        if (_this.autoRotate && _state === STATE.NONE) {
            _movePrev.set(0, 0);
            _moveCurr.set(0.01 * _this.autoRotateSpeed, 0);
        }

        if (!_this.noRotate) {

            _this.rotateCamera();

        }

        if (!_this.noZoom) {

            _this.zoomCamera();

        }

        if (!_this.noFocus) {

            _this.FocusCamera();

        }
        _this.object.position.addVectors(_this.target, _eye);

        _this.checkDistances();

        _this.object.lookAt(_this.target);

        if (lastPosition.distanceToSquared(_this.object.position) > EPS) {

            _this.dispatchEvent(changeEvent);

            lastPosition.copy(_this.object.position);

        }

    };

    this.reset = function() {

        _state = STATE.NONE;
        _prevState = STATE.NONE;

        _this.target.copy(_this.target0);
        _this.object.position.copy(_this.position0);
        _this.object.up.copy(_this.up0);

        _eye.subVectors(_this.object.position, _this.target);

        _this.object.lookAt(_this.target);

        _this.dispatchEvent(changeEvent);

        lastPosition.copy(_this.object.position);

    };

    // listeners

    function keydown(event) {

        if (_this.enabled === false) return;

        window.removeEventListener('keydown', keydown);

        _prevState = _state;

        if (_state !== STATE.NONE) {

            return;

        } else if (event.keyCode === _this.keys[STATE.ROTATEX] && !_this.noRotate) {

            _state = STATE.ROTATEX;

        } else if (event.keyCode === _this.keys[STATE.ZOOM] && !_this.noZoom) {

            _state = STATE.ZOOM;

        } else if (event.keyCode === _this.keys[STATE.ROTATEY] && !_this.noPan) {

            _state = STATE.ROTATEY;

        }

    }

    function keyup(event) {

        if (_this.enabled === false) return;

        _state = _prevState;

        window.addEventListener('keydown', keydown, false);

    }

    function mousedown(event) {

        if (_this.enabled === false) return;

        event.preventDefault();
        event.stopPropagation();

        if (_state === STATE.NONE) {

            _state = event.button;

        }

        if (_state === STATE.ROTATEX && !_this.noRotate) {

            _moveCurr.copy(getMouseOnCircle(event.pageX, event.pageY));
            _movePrev.copy(_moveCurr);

        } else if (_state === STATE.ZOOM && !_this.noZoom) {

            _zoomStart.copy(getMouseOnScreen(event.pageX, event.pageY));
            _zoomEnd.copy(_zoomStart);

        } else if (_state === STATE.ROTATEY && !_this.noRotateY) {

            _moveCurr.copy(getMouseOnCircle(event.pageX, event.pageY, true));
            _movePrev.copy(_moveCurr);

        }

        document.addEventListener('mousemove', mousemove, false);
        document.addEventListener('mouseup', mouseup, false);

        _this.dispatchEvent(startEvent);

    }

    function mousemove(event) {

        if (_this.enabled === false) return;

        event.preventDefault();
        event.stopPropagation();

        if (_state === STATE.ROTATEX && !_this.noRotate) {

            _movePrev.copy(_moveCurr);
            _moveCurr.copy(getMouseOnCircle(event.pageX, event.pageY));

        } else if (_state === STATE.ZOOM && !_this.noZoom) {

            _zoomEnd.copy(getMouseOnScreen(event.pageX, event.pageY));

        } else if (_state === STATE.ROTATEY && !_this.noRotateY) {

            _movePrev.copy(_moveCurr);
            _moveCurr.copy(getMouseOnCircle(event.pageX, event.pageY, true));

        }

    }

    function mouseup(event) {

        if (_this.enabled === false) return;

        event.preventDefault();
        event.stopPropagation();

        _state = STATE.NONE;

        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
        _this.dispatchEvent(endEvent);

    }

    function mousewheel(event) {

        if (_this.enabled === false) return;

        event.preventDefault();
        event.stopPropagation();

        _zoomStart.y -= event.deltaY * 0.01;

        _this.dispatchEvent(startEvent);
        _this.dispatchEvent(endEvent);

    }

    function touchstart(event) {

        if (_this.enabled === false) return;

        switch (event.touches.length) {

            case 1:
                _state = STATE.TOUCH_ROTATE;
                _moveCurr.copy(getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY));
                _movePrev.copy(_moveCurr);
                break;

            default: // 2 or more
                _state = STATE.TOUCH_ZOOM_ROTATEA;
                var dx = event.touches[0].pageX - event.touches[1].pageX;
                var dy = event.touches[0].pageY - event.touches[1].pageY;
                _touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt(dx * dx + dy * dy);

                var x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
                var y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
                _moveCurr.copy(getMouseOnCircle(x, y, true));
                _movePrev.copy(_moveCurr);
                break;

        }

        _this.dispatchEvent(startEvent);

    }

    function touchmove(event) {

        if (_this.enabled === false) return;

        event.preventDefault();
        event.stopPropagation();

        switch (event.touches.length) {

            case 1:
                _movePrev.copy(_moveCurr);
                _moveCurr.copy(getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY));
                break;

            default: // 2 or more
                var dx = event.touches[0].pageX - event.touches[1].pageX;
                var dy = event.touches[0].pageY - event.touches[1].pageY;
                _touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy);

                var x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
                var y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
                _movePrev.copy(_moveCurr);
                _moveCurr.copy(getMouseOnCircle(x, y));
                break;

        }

    }

    function touchend(event) {

        if (_this.enabled === false) return;

        switch (event.touches.length) {

            case 0:
                _state = STATE.NONE;
                break;

            case 1:
                _state = STATE.TOUCH_ROTATE;
                _moveCurr.copy(getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY));
                _movePrev.copy(_moveCurr);
                break;

        }

        _this.dispatchEvent(endEvent);

    }

    function contextmenu(event) {

        event.preventDefault();

    }

    function ondblclick() {
        if (_this.enabled === false) return;


        event.preventDefault();
        event.stopPropagation();


        _prevState = _state;

        if (_state !== STATE.NONE) {

            return;

        } else if (!_this.noFocus) {

            _state = STATE.FOUSE_STATE;

        }
        _this.dispatchEvent(startEvent);
        _this.dispatchEvent(endEvent);

    }
    this.dispose = function() {

        this.domElement.removeEventListener('contextmenu', contextmenu, false);
        this.domElement.removeEventListener('mousedown', mousedown, false);
        this.domElement.removeEventListener('wheel', mousewheel, false);

        this.domElement.removeEventListener('dblclick', ondblclick, false);

        this.domElement.removeEventListener('touchstart', touchstart, false);
        this.domElement.removeEventListener('touchend', touchend, false);
        this.domElement.removeEventListener('touchmove', touchmove, false);

        document.removeEventListener('mousemove', mousemove, false);
        document.removeEventListener('mouseup', mouseup, false);

        window.removeEventListener('keydown', keydown, false);
        window.removeEventListener('keyup', keyup, false);

    };

    this.domElement.addEventListener('contextmenu', contextmenu, false);

    this.domElement.addEventListener('mousedown', mousedown, false);
    this.domElement.addEventListener('wheel', mousewheel, false);

    this.domElement.addEventListener('dblclick', ondblclick, false);

    this.domElement.addEventListener('touchstart', touchstart, false);
    this.domElement.addEventListener('touchend', touchend, false);
    this.domElement.addEventListener('touchmove', touchmove, false);

    window.addEventListener('keydown', keydown, false);
    window.addEventListener('keyup', keyup, false);

    this.handleResize();

    // force an update at start
    this.update();

};

PlanetViewControler.prototype = Object.create(THREE.EventDispatcher.prototype);
PlanetViewControler.prototype.constructor = PlanetViewControler;