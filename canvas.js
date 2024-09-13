const KEY_W = 87;
const KEY_S = 83;
const KEY_A = 65;
const KEY_D = 68;
let keysDown = {87:false, 83:false, 65:false, 68:false};
let movelr = 0;
let moveud = 0;

/**
 * React to a key being pressed
 * @param {keyboard callback} evt 
 */
function keyDown(evt) {
    if (evt.keyCode == KEY_W) { //W
        if (!keysDown[KEY_W]) {
            keysDown[KEY_W] = true;
            moveud = 1;
        }
    }
    else if (evt.keyCode == KEY_S) { //S
        if (!keysDown[KEY_S]) {
            keysDown[KEY_S] = true;
            moveud = -1;
        }
    }
    else if (evt.keyCode == KEY_A) { //A
        if (!keysDown[KEY_A]) {
            keysDown[KEY_A] = true;
            movelr = -1;
        }
    }
    else if (evt.keyCode == KEY_D) { //D
        if (!keysDown[KEY_D]) {
            keysDown[KEY_D] = true;
            movelr = 1;
        }
    }
}

/**
 * React to a key being released
 * @param {keyboard callback} evt 
 */
function keyUp(evt) {
    if (evt.keyCode == KEY_W) { //W
        moveud = 0;
        keysDown[KEY_W] = false;
    }
    else if (evt.keyCode == KEY_S) { //S
        moveud = 0;
        keysDown[KEY_S] = false;
    }
    else if (evt.keyCode == KEY_A) { //A
        movelr = 0;
        keysDown[KEY_A] = false;
    }
    else if (evt.keyCode == KEY_D) { //D
        movelr = 0;
        keysDown[KEY_D] = false;
    }
}    

document.addEventListener('keydown', keyDown, true);
document.addEventListener('keyup', keyUp, true);



/**
 * Add coordinate axes
 * @param {dom element} parent Element to which to add the axes
 */
function makePlane(parent, res) {
    var plane = parent.append("g")
            .attr("viewBox", "-" + res + " -" + res + " " + res + " " + res*2 + " " + res*2);
    plane.append("line").attr({x1: 0, y1: -res, x2: 0, y2: res});
    plane.append("line").attr({x1: -res, y1: 0, x2: res, y2: 0});
    return plane;
}

/**
 * Add the plots with the 3x3 grid of colored squares
 * @param {DOM} elem DOM element to which to add this plot
 * @param {float} res Width/height of each plot in pixels
 * @param {float} shapeSide Dimension of each square in pixels
 * 
 * @return shape: The shape to be transformed
 */
function initializePlot(elem, res, shapeSide) {
    let svg = d3.select(elem).append("svg")
                .attr("id", "plot")
                .attr("width", res)
                .attr("height", res)
                .attr("viewBox", "" + (-res/3) + " " + (-res/3) + " " + res + " " + res);

    svg.attr("transform", "translate(0, "+res+")");
    svg.attr("transform", "scale(1, -1)")

    let plane = makePlane(svg, res);
    let shape = plane.append("g")
            .attr("viewBox", "0 0 "+shapeSide+" "+shapeSide+"");
    shape.append("svg:image")
    .attr("x", -res/8)
    .attr("y", -res/8)
    .attr("width", res/4)
    .attr("height", res/4)
    .attr("xlink:href", "dwayne.png");

    let dot = plane.append("circle")
    .attr("r", 10)
    .attr("fill", "red")
    .attr("stroke", "black")
    .attr("x", 0)
    .attr("y", 0);

    let m = 50;
    shape.attr("id", "shape");
    plane.attr("id", "plane")
            .attr("transform", "translate("+m+", "+m+")");
    return {"shape":shape, "dot":dot};
}


/**
 * Convert a 3x3 homogeneous matrix into svg format, noting
 * that they are column major in both glMatrix.mat3 and svg
 * @param {glMatrix.mat3} m The matrix
 */
function mat3ToSVG(m) {
    let ret = [m[0], m[1], m[3], m[4], m[6], m[7]];
    return ret;
}


function transformClick(event, node) {
    if (node === undefined) node = event.currentTarget;
    if (node) {
      var svg = node.ownerSVGElement || node;
      if (svg.createSVGPoint) {
        var point = svg.createSVGPoint();
        point.x = event.clientX, point.y = event.clientY;
        point = point.matrixTransform(node.getScreenCTM().inverse());
        return [point.x, point.y];
      }
      if (node.getBoundingClientRect) {
        var rect = node.getBoundingClientRect();
        return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
      }
    }
    return [event.pageX, event.pageY];
  }

let canvas = document.getElementById("canvas");
let res = Math.min(window.innerWidth*0.8,  window.innerHeight*0.8);
let sideLength = 0.2*res;
let shapes = initializePlot(canvas, res, sideLength);
let shape = shapes.shape;
let dot = shapes.dot;
let initialTime = (new Date()).getTime();
let v = [0, 0];

let ANGLE_RATE = 1; // Radians per second

function repaint() {
    let dT = (new Date()).getTime() - initialTime;
    let theta = dT*ANGLE_RATE/1000;
    let m = getRotationAroundPoint(theta, v);
    v[0] += (res/1000)*dT*movelr/1000;
    v[1] += (res/1000)*dT*moveud/1000;
    dot.attr("cx", v[0]);
    dot.attr("cy", v[1]);

    theta += 0.1;
    shape.attr("transform", "matrix("+mat3ToSVG(m)+")");
    requestAnimationFrame(repaint);
}

repaint();