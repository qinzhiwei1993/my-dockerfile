"use strict";
var webgl;
function webGlStart() {
    var canvas = document.getElementById('myCanvas');
    webgl = canvas.getContext('webgl');
    webgl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    // webgl.clearColor(204/255, 7/255, 7/255, 1)
    // [0-1]
    webgl.clearColor(137 / 255, 17 / 255, 17 / 255, 1);
    webgl.clear(webgl.COLOR_BUFFER_BIT); //颜色缓存区
}
