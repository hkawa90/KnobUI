/** TODO 
 * Ka_Donutを継承してKa_Dial、円中心で直線(scale)を刻む Pictures/Dial(icon/image/scale/analogMeter)
 * ダイアル部を子要素としてつかう
 * http://www.yamatyuu.net/computer/html/svg/trans.html
 */
let inherits = function (childCtor, parentCtor) {
    Object.setPrototypeOf(childCtor.prototype, parentCtor.prototype);
}

var Ka_RotateUI = function (element, callback) {
    this.element = element;
    this.callback = (typeof callback === 'function') ? callback : undefined;
    if (element.dataset.readonly !== 'true') {
        this.element.addEventListener('mousedown', this, false);
        this.element.addEventListener('dragstart', this, false); // for prevent default drag event
        this.element.addEventListener('wheel', this, false); // for wheel event
        // touch event
        this.element.addEventListener("touchstart", this, false);
    }
    this.getDataSet();
    this.init();
}

Ka_RotateUI.prototype.init = function () {
    this.prevPoint = {};
    this.round = 0;
}

Ka_RotateUI.prototype.getDataSet = function () {
    const defaultSize = '100';
    this.data = {};
    Object.assign(this.data, this.element.dataset);
    this.value = parseInt(this.data.value);
    this.size = this.data.size || defaultSize;
    this.size = parseInt(this.size);
    this.limit = this.data.limit || '0';
    this.limit = parseInt(this.limit);
    this.snap = this.data.snap || '0';
    this.snap = parseInt(this.snap);
    this.dataMin = this.data.valueMin || '0';
    this.dataMin = parseInt(this.dataMin);
    this.dataMax = this.data.ValueMmax || '100';
    this.datMax = parseInt(this.dataMax);
}

Ka_RotateUI.prototype.update = function (theta) {
    if ((theta === undefined) || (theta === null)) {
        this.round = 0;
        theta = this.value * 360 / 100;
    }
    if ((this.limit) && ((this.value + this.round * 100) > this.limit)) {
        this.value = this.limit;
        theta = this.value * 360 / 100;
    }
    this.render(theta);
    if (this.callback)
        this.callback(this.element, this.value);
}

Ka_RotateUI.prototype.move = function (event) {
    let s, inter = false;
    let x = event.clientX - this.circle.cx - this.boundingClientRect.left;
    let y = event.clientY - this.circle.cy - this.boundingClientRect.top;
    let thetaCur = this.rad2deg(Math.atan(y / x)) + 90;
    if (x < 0)
        thetaCur += 180;
    if ((this.snap) && (this.snap !== 0))
        thetaCur = Math.floor(thetaCur / this.snap) * this.snap;

    this.value = thetaCur / 360 * 100;
    if (this.prevPoint.x !== undefined) {
        s = x * this.prevPoint.y - y * this.prevPoint.x;
        // update round counter using intersection and mouse movement
        //         y axis
        //         |
        //  (x,y) -+- (x',y')
        //         |
        //         origin
        //
        inter = this.ientersected(this.prevPoint.x, this.prevPoint.y, x, y, 0, 0, 0, -this.size / 2);

        if (inter && (s < 0)) {
            // clockwise
            this.round++;
        } else if (inter && (s > 0)) {
            // Counterclockwise
            this.round--;
            if (this.round < 0)
                this.round = 0;
        }
    }
    this.prevPoint.x = x;
    this.prevPoint.y = y;
    this.update(thetaCur);
}

Ka_RotateUI.prototype.render = function (theta) {
    return;
}

Ka_RotateUI.prototype.handleEvent = function (event) {
    if (event.type === 'mousedown') {
        this.element.addEventListener("mousemove", this, false);
        this.element.addEventListener("mouseleave", this, false);
        this.element.addEventListener("mouseup", this, false);
    } else if (event.type === 'mouseup') {
        this.element.removeEventListener("mousemove", this, false);
        this.element.removeEventListener("mouseleave", this, false);
        this.element.removeEventListener("mouseup", this, false);
    } else if (event.type === 'mousemove') {
        this.move(event);
    } else if (event.type === 'mouseleave') {
        this.element.removeEventListener("mousemove", this, false);
        this.element.removeEventListener("mouseleave", this, false);
        this.element.removeEventListener("mouseup", this, false);
    } else if (event.type === 'touchstart') {
        this.element.addEventListener("touchend", this, false);
        this.element.addEventListener("touchcancel", this, false);
        this.element.addEventListener("touchmove", this, false);
    } else if (event.type === 'touchend') {
        this.element.removeEventListener("touchend", this, false);
        this.element.removeEventListener("touchcancel", this, false);
        this.element.removeEventListener("touchmove", this, false);
    } else if (event.type === 'touchcancel') {
        this.element.removeEventListener("touchend", this, false);
        this.element.removeEventListener("touchcancel", this, false);
        this.element.removeEventListener("touchmove", this, false);
    } else if (event.type === 'touchmove') {
        this.move(event);
    } else if (event.type === 'wheel') {
        const delta = ((event.deltaY || -event.wheelDelta || event.detail) >> 10) || 1;
        if (delta > 0) {
            this.value++;
            if (this.value > 100)
                this.value = 100;
        } else {
            this.value--;
            if (this.value < 0)
                this.value = 0;
        }
        this.update();
    } else {
        event.preventDefault();
    }
}

Ka_RotateUI.prototype.deg2rad = function (degree) {
    return degree * Math.PI / 180;
}

Ka_RotateUI.prototype.rad2deg = function (radian) {
    return radian * 180 / Math.PI;
}

/**
 * Line segment intersection test
 */
Ka_RotateUI.prototype.ientersected = function (ax, ay, bx, by, cx, cy, dx, dy) {
    var ta = (cx - dx) * (ay - cy) + (cy - dy) * (cx - ax);
    var tb = (cx - dx) * (by - cy) + (cy - dy) * (cx - bx);
    var tc = (ax - bx) * (cy - ay) + (ay - by) * (ax - cx);
    var td = (ax - bx) * (dy - ay) + (ay - by) * (ax - dx);

    return ((tc * td) < 0) && ((ta * tb) < 0);
}

Ka_Donut = function (element, callback) {
    Ka_RotateUI.call(this, element, callback);
};

inherits(Ka_Donut, Ka_RotateUI);

Ka_Donut.prototype.init = function () {
    Ka_RotateUI.prototype.init.call(this);
    this.circle = {};
    this.knob = {};
    this.circle.radius = (this.size - this.thickness) / 2;
    this.circle.cx = this.circle.cy = this.circle.radius + this.thickness / 2;
    // create background donut
    this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.circle.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.knob.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.svgElement.setAttribute('width', this.size);
    this.svgElement.setAttribute('height', this.size);

    this.circle.path.setAttribute('fill', 'none');
    this.circle.path.setAttribute('stroke', "blue");
    this.circle.path.setAttribute('stroke-width', this.thickness);
    this.circle.path.setAttribute('class', 'ka-knob-background');
    this.knob.path.setAttribute('fill', 'none');
    this.knob.path.setAttribute('class', 'ka-knob-foreground');
    this.knob.path.setAttribute('stroke', this.element.getAttribute('stroke') || 'red');
    this.knob.path.setAttribute('stroke-width', this.thickness);
    this.svgElement.appendChild(this.circle.path);
    this.svgElement.appendChild(this.knob.path);
    this.element.appendChild(this.svgElement);
    this.boundingClientRect = this.element.getBoundingClientRect();

    if (this.value) {
        this.update(this.value * 360 / 100);
    }
}

Ka_Donut.prototype.getDataSet = function () {
    const defaultThickness = '20';
    const defaultSize = '100';
    Ka_RotateUI.prototype.getDataSet.call(this);
    this.thickness = this.data.thickness || defaultThickness;
    this.thickness = parseInt(this.thickness);
}

Ka_Donut.prototype.render = function (theta) {
    let svgPath;
    let xstart = this.circle.cx;
    let ystart = this.thickness / 2;

    let x = this.circle.radius * Math.cos(this.deg2rad(theta + 270)) + this.circle.cx;
    let y = this.circle.radius * Math.sin(this.deg2rad(theta + 270)) + this.circle.cy;
    if (theta > 180) {
        let large_arc_flag = 0;

        svgPath = `M ${xstart},${ystart} A${this.circle.radius},${this.circle.radius} 0 0,1 ${this.circle.cx},${this.circle.cy + this.circle.radius}`;
        svgPath += ` A${this.circle.radius},${this.circle.radius} 0 ${large_arc_flag},1 ${x},${y}`;
    } else {
        svgPath = `M ${xstart},${ystart} A${this.circle.radius},${this.circle.radius} 0 0,1 ${x},${y}`;
    }
    this.knob.path.setAttribute("d", svgPath);
}

ka_Knob = function (element, callback) {
    Ka_RotateUI.call(this, element, callback);
}

inherits(ka_Knob, Ka_RotateUI);

ka_Knob.prototype.init = function () {
    Ka_RotateUI.prototype.init.call(this);
    this.boundingClientRect = this.element.getBoundingClientRect();
    this.circle = {};
    this.circle.cx = this.circle.radius = this.boundingClientRect.width / 2;
    this.circle.cy = this.boundingClientRect.height / 2;

    this.size = this.boundingClientRect.width;
    if (this.value) {
        this.update(this.value * 360 / 100);
    }
}

ka_Knob.prototype.render = function (theta) {
    this.element.setAttribute("style", `transform:rotate(${theta}deg);`);
}

Ka_Dial = function (element, callback) {
    Ka_RotateUI.call(this, element, callback);
}

inherits(Ka_Dial, Ka_RotateUI);

var RotateController = function (callback) {
    this.instance = [];
    this.callback = (typeof callback === 'function') ? callback : undefined;
    let id, ins;
    const donutElements = document.getElementsByClassName('ka-donut');
    for (const donutElement of donutElements) {
        this.addInstance(donutElement);
    }
    const knobElements = document.getElementsByClassName('ka-knob');
    for (const knobElement of knobElements) {
        this.addInstance(knobElement);
    }
}

RotateController.prototype.addInstance = function (element) {
    const id = element.getAttribute('id');
    let ins;
    if (element.tagName === 'IMG') {
        ins = new ka_Knob(element, this.callback);
    } else {
        ins = new Ka_Donut(element, this.callback);
    }
    const obs = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            this.idList().forEach(function (l) {
                if (l.el === mutations.target) {
                    let oldValue = mutation.oldValue;
                    let newValue = mutation.target.getAttribute(mutation.attributeName);
                    if (mutation.attributeName.startsWith('data-') && (oldValue !== newValue)) {
                        this.instance[l].ins.getDataSet();
                        this.instance[l].ins.update();
                    }
                }
            }, this);
        }, this);
    }.bind(this));
    obs.observe(element, {
        attributes: true,
        attributeOldValue: true
    });
    this.instance[id] = { observer: obs, ins: ins, el: element };
}

RotateController.prototype.idList = function () {
    return Object.keys(this.instance);
}

document.addEventListener('DOMContentLoaded', function () {
    const con = new RotateController(function (element, value) {
        const id = element.getAttribute('id') + '-annotation';
        const el = document.getElementById(id);
        if (el) {
            el.textContent = Math.floor(value);
        }
    });
    const b1 = document.getElementById('b1');
    b1.addEventListener('click', event => {
        let ids = con.idList();
        for (let i = 0; i < ids.length; i++) {
            let el = document.getElementById(ids[i]);
            let v = Math.floor(Math.random() * Math.floor(100));
            el.setAttribute('data-value', v)
        }
    })
});