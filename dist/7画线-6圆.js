"use strict";
var webgl;
var vertexShaderObject;
var fragmentShaderObject;
var programObject;
var triangleBuffer;
var triangleBuffer1;
var indexBuffer;
var v3PositionIndex = 0;
var uniforColor;
var unifromAnim;
var animTime = 0;
var projectMat = glMatrix.mat4.create();
var uniformProj;
/**
 * 在显卡在执行， 针对于顶点的输入
 * @description: vertex ve
 */
var shaderVs = `
  attribute vec3 v3Position;
  uniform float anim;
  uniform mat4 proj;
  void main(void) {
    gl_Position = proj * vec4(v3Position.x + anim,v3Position.y, v3Position.z, 1.0);
  }
`;
/**
* @description: 在显卡在执行， 给形状填充颜色
* @return {*}
*/
var shaderFs = `
  precision lowp float;
  uniform vec4 color;
  void main(void) {
    gl_FragColor = color;
  }
`;
/**
 * 初始化完成资源的加载
 */
function init() {
    var canvas = document.getElementById('myCanvas');
    // 获取webgl
    webgl = canvas.getContext('webgl');
    // 设置webgl的视口大小
    webgl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    glMatrix.mat4.ortho(projectMat, 0, canvas.clientWidth, canvas.clientHeight, 0, -1000, 1000);
    webgl.clearColor(1.0, 1.0, 0.0, 1.0);
    // 创建一个顶点的shader
    vertexShaderObject = webgl.createShader(webgl.VERTEX_SHADER);
    // 创建
    fragmentShaderObject = webgl.createShader(webgl.FRAGMENT_SHADER);
    // 将创建好的代码赋值一段代码
    webgl.shaderSource(vertexShaderObject, shaderVs);
    webgl.shaderSource(fragmentShaderObject, shaderFs);
    // 编译shader， 生成显卡可以执行的汇编或者二进制代码
    webgl.compileShader(vertexShaderObject);
    webgl.compileShader(fragmentShaderObject);
    /**
     * @description: 获取编译的状态
     */
    if (!webgl.getShaderParameter(vertexShaderObject, webgl.COMPILE_STATUS)) {
        alert('error:vertexShaderObject');
        // 获取编译失败的原因
        console.error(webgl.getShaderInfoLog(vertexShaderObject));
        return;
    }
    if (!webgl.getShaderParameter(fragmentShaderObject, webgl.COMPILE_STATUS)) {
        console.error(webgl.getShaderInfoLog(fragmentShaderObject));
        alert('error:fragmentShaderObject');
        return;
    }
    /**
     * @description: 创建一个程序
     */
    programObject = webgl.createProgram();
    /**
     * @description: 将编译器好的代码导入webgl
     */
    webgl.attachShader(programObject, vertexShaderObject);
    webgl.attachShader(programObject, fragmentShaderObject);
    /**
     * @description: 链接到二进制文件中，生成可执行体
     */
    webgl.linkProgram(programObject);
    if (!webgl.getProgramParameter(programObject, webgl.LINK_STATUS)) {
        alert("error:programObject ");
        return;
    }
    /**
     * @description: 使用这个可执行程序
     */
    webgl.useProgram(programObject);
    var circle = new Float32Array(362 * 3);
    var radius = 100;
    var centerX = 200;
    var centerY = 200;
    circle[0] = centerX;
    circle[1] = centerY;
    circle[2] = 0;
    for (let i = 1; i < 362; i++) {
        circle[i * 3 + 0] = radius * Math.cos(Math.PI / 180 * i) + centerX;
        circle[i * 3 + 1] = radius * Math.sin(Math.PI / 180 * i) + centerY;
        circle[i * 3 + 2] = 0;
    }
    uniforColor = webgl.getUniformLocation(programObject, 'color');
    unifromAnim = webgl.getUniformLocation(programObject, 'anim');
    uniformProj = webgl.getUniformLocation(programObject, 'proj');
    /**
     * @description: 将programObject的v3PositionIndex 与 ``的v3Position 进行绑定
     */
    webgl.bindAttribLocation(programObject, v3PositionIndex, "v3Position");
    webgl.uniform4f(uniforColor, 1, 0, 0, 1);
    /**
     * 创建一个顶点缓存区， 将输入传入到显卡中
     */
    triangleBuffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, triangleBuffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, circle, webgl.STATIC_DRAW);
    indexBuffer = webgl.createBuffer();
}
function webGlStart() {
    init();
    // 进行游戏循环
    tick();
}
/**
 * 绘制场景函数
 */
function renderScene() {
    webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    webgl.clear(webgl.COLOR_BUFFER_BIT); //颜色缓存区
    webgl.bindBuffer(webgl.ARRAY_BUFFER, triangleBuffer);
    webgl.useProgram(programObject);
    animTime += 1;
    webgl.uniform1f(unifromAnim, 0);
    // webgl.uniform1f(unifromAnim, animTime)
    webgl.uniformMatrix4fv(uniformProj, false, projectMat);
    webgl.enableVertexAttribArray(v3PositionIndex);
    webgl.vertexAttribPointer(v3PositionIndex, 3, webgl.FLOAT, false, 4 * 3, 0);
    webgl.drawArrays(webgl.TRIANGLE_FAN, 0, 362);
    webgl.useProgram(null);
}
function tick() {
    requestAnimationFrame(tick);
    renderScene();
}
