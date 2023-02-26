"use strict";
var webgl;
var vertexShaderObject;
var fragmentShaderObject;
var programObject;
var v3PositionIndex = 0;
var indexBuffer;
var triangleBuffer;
var inColor = 1;
/**
 * 在显卡在执行， 针对于顶点的输入
 * @description: vertex ve
 */
var shaderVs = `
  attribute vec3 v3Position;
  attribute vec4 inColor;
  varying vec4 outColor;

  void main(void) {
    outColor = inColor;
    gl_Position = vec4(v3Position, 1.0);
  }
`;
/**
* @description: 在显卡在执行， 给形状填充颜色
* @return {*}
*/
var shaderFs = `
  precision lowp float;
  varying vec4 outColor;
  void main(void) {
    gl_FragColor = outColor;
  }
`;
function init() {
    var canvas = document.getElementById('myCanvas');
    // 获取webgl
    webgl = canvas.getContext('webgl');
    // 设置webgl的视口大小
    webgl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
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
     * @description: 将programObject的v3PositionIndex 与 ``的v3Position 进行绑定
     */
    webgl.bindAttribLocation(programObject, v3PositionIndex, "v3Position");
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
    /**
    * @description: 创建一个顶点缓存区
    */
    var jsArrayData = [
        -0.5, +0.5, 0.0, 0.0, 0.0, 0.0, 1.0,
        +0.5, +0.5, 0.0, 0.0, 1.0, 0.0, 1.0,
        +0.5, -0.5, 0.0, 0.0, 0.0, 1.0, 1.0,
        -0.5, -0.5, 0.0, 0.0, 1.0, 1.0, 1.0,
    ];
    // 创建一个索引数据
    var indexData = [
        0, 1, 2,
        0, 2, 3
    ];
    /**
    * @description: 创建一个顶点缓存区对象
    */
    triangleBuffer = webgl.createBuffer();
    /**
      * @description: 指定缓存区对象存储的类型, 他还有另外一个作用，指定当前运行环境的上下文
      */
    webgl.bindBuffer(webgl.ARRAY_BUFFER, triangleBuffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(jsArrayData), webgl.STATIC_DRAW);
    /**
     * @description: 创建一个索引缓存区对象
     */
    indexBuffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    webgl.bufferData(webgl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), webgl.STATIC_DRAW);
}
/**
 * 绘制场景函数
 */
function renderScene() {
    /**
     * @description: 设置清除成什么颜色
     */
    webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    /**
     * @description: 清除颜色
     */
    webgl.clear(webgl.COLOR_BUFFER_BIT); //颜色缓存区
    /**
     * 指定绘制的数据从该缓冲区获取
     */
    webgl.bindBuffer(webgl.ARRAY_BUFFER, triangleBuffer);
    /**
     * @description: 申明给顶点变量赋值
     */
    webgl.enableVertexAttribArray(v3PositionIndex);
    webgl.enableVertexAttribArray(inColor);
    /**
     * @description: 给显卡中的变量赋值
     * 1: 给那个变量赋值
     * 2、变量的类型是几维数据
     * 3、变量的类型是什么
     * 4、是否规格化
     * 5、一个顶点占用的空间
     * 6、
     */
    webgl.vertexAttribPointer(v3PositionIndex, 3, webgl.FLOAT, false, 4 * 7, 0);
    webgl.vertexAttribPointer(inColor, 4, webgl.FLOAT, false, 4 * 7, 3 * 4);
    /**
     * @description: 执行绘制, 指定绘制点的个数
     */
    webgl.drawElements(webgl.TRIANGLES, 6, webgl.UNSIGNED_SHORT, 0);
}
function tick() {
    renderScene();
}
function webGlStart() {
    init();
    // 进行游戏循环
    tick();
}
