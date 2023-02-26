
var webgl: WebGLRenderingContext
var vertexShaderObject: WebGLShader
var fragmentShaderObject: WebGLShader
var programObject: WebGLProgram
var triangleBuffer: WebGLBuffer
var triangleBuffer1: WebGLBuffer
var indexBuffer: WebGLBuffer
var uniformAnim: WebGLUniformLocation

var v3PositionIndex = 0
var attrUV = 0
var uniformTexture: WebGLUniformLocation
var animTime = 0
var projectMat = glMatrix.mat4.create()
var uniformProj: WebGLUniformLocation
var textureHandle: WebGLTexture
var animSteap = 0

/**
 * 在显卡在执行， 针对于顶点的输入
 * @description: vertex ve
 */
var shaderVs = `
  attribute vec3 v3Position;
  attribute vec2 inUV;
  uniform mat4 proj;
  varying vec2 outUV;

  void main(void) {
    gl_Position = proj * vec4(v3Position.x,v3Position.y, v3Position.z, 1.0);
    outUV = inUV;
  }
`
/**
* @description: 在显卡在执行， 给形状填充颜色
* @return {*}
*/
var shaderFs = `
  precision lowp float;
  uniform sampler2D texture;
  uniform float anim;
  varying vec2 outUV;
  void main(void) {
    gl_FragColor = texture2D(texture, vec2(outUV.s + anim,outUV.t + anim));
  }
`
/**
 * 初始化完成资源的加载
 */
function init(): void {
  var canvas = document.getElementById('myCanvas') as HTMLCanvasElement
  // 获取webgl
  webgl = canvas.getContext('webgl') as WebGLRenderingContext
  // 设置webgl的视口大小
  webgl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight)

  glMatrix.mat4.ortho(projectMat, 0, canvas.clientWidth, canvas.clientHeight, 0, -1000, 1000)
  webgl.clearColor(1.0, 1.0, 0.0, 1.0)

  // 创建一个顶点的shader
  vertexShaderObject = webgl.createShader(webgl.VERTEX_SHADER) as WebGLShader
  // 创建
  fragmentShaderObject = webgl.createShader(webgl.FRAGMENT_SHADER) as WebGLShader

  // 将创建好的代码赋值一段代码
  webgl.shaderSource(vertexShaderObject, shaderVs)
  webgl.shaderSource(fragmentShaderObject, shaderFs)

  // 编译shader， 生成显卡可以执行的汇编或者二进制代码
  webgl.compileShader(vertexShaderObject)
  webgl.compileShader(fragmentShaderObject)
  /**
   * @description: 获取编译的状态
   */
  if (!webgl.getShaderParameter(vertexShaderObject, webgl.COMPILE_STATUS)) {
    alert('error:vertexShaderObject')
    // 获取编译失败的原因
    console.error(webgl.getShaderInfoLog(vertexShaderObject));
    return
  }
  if (!webgl.getShaderParameter(fragmentShaderObject, webgl.COMPILE_STATUS)) {
    console.error(webgl.getShaderInfoLog(fragmentShaderObject));

    alert('error:fragmentShaderObject')
    return
  }

  /**
   * @description: 创建一个程序
   */
  programObject = webgl.createProgram() as WebGLProgram

  /**
   * @description: 将编译器好的代码导入webgl
   */
  webgl.attachShader(programObject, vertexShaderObject)
  webgl.attachShader(programObject, fragmentShaderObject)

  /**
   * @description: 链接到二进制文件中，生成可执行体
   */
  webgl.linkProgram(programObject)

  if (!webgl.getProgramParameter(programObject, webgl.LINK_STATUS)) {
    alert("error:programObject ")
    return
  }
  webgl.useProgram(programObject)


  uniformProj = webgl.getUniformLocation(programObject, 'proj') as WebGLUniformLocation
  uniformTexture = webgl.getUniformLocation(programObject, 'texture') as WebGLUniformLocation
  uniformAnim = webgl.getUniformLocation(programObject, 'anim') as WebGLUniformLocation

  v3PositionIndex = webgl.getAttribLocation(programObject, "v3Position")

  attrUV = webgl.getAttribLocation(programObject, 'inUV')


  webgl.activeTexture(webgl.TEXTURE0)
  webgl.bindTexture(webgl.TEXTURE_2D, textureHandle)
  webgl.uniform1i(uniformTexture, 0)

  // 坐标换位屏幕坐标
  var jsArrayData = [
    0, 0, 0, 0, 0,
    400, 0, 0, 1.0, 0,
    400, 400, 0, 1.0, 1.0,

    0, 0, 0, 0, 0,
    400, 400, 0, 1.0, 1.0,
    0, 400, 0, 0, 1
  ]

  triangleBuffer = webgl.createBuffer() as WebGLBuffer
  webgl.bindBuffer(webgl.ARRAY_BUFFER, triangleBuffer)
  webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(jsArrayData), webgl.STATIC_DRAW)

  initTexture("https://static.xiaohoucode.com/scratch-res-test/common/mit/22479d8c718d1f376854c1924b097865.png")
}

function webGlStart() {
  init()
  // 进行游戏循环
  tick()
}
/**
 * 绘制场景函数
 */
function renderScene() {
  webgl.clearColor(0.0, 0.0, 0.0, 1.0)

  webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT) //颜色缓存区
  webgl.enable(webgl.DEPTH_TEST)

  /**
   * 创建一个顶点缓存区， 将输入传入到显卡中
   */
  webgl.bindBuffer(webgl.ARRAY_BUFFER, triangleBuffer)

  /**
   * @description: 使用这个可执行程序
   */
  webgl.useProgram(programObject)

  webgl.activeTexture(webgl.TEXTURE0)
  webgl.bindTexture(webgl.TEXTURE_2D, textureHandle)

  /**
   * 给显卡执行程序赋值
   */
  webgl.uniform1i(uniformTexture, 0)
  webgl.uniformMatrix4fv(uniformProj, false, projectMat)
  webgl.uniform1f(uniformAnim, animSteap)
  animSteap += 0.004


  /**
   * @description: 申明给顶点变量赋值
   */
  webgl.enableVertexAttribArray(v3PositionIndex)
  webgl.enableVertexAttribArray(attrUV)

  /**
   * @description: 给显卡中的变量赋值
   * 1: 给那个变量赋值
   * 2、变量的类型是几维数据
   * 3、变量的类型是什么
   * 4、是否规格化
   * 5、变量的间隔
   * 6、
   */
  webgl.vertexAttribPointer(v3PositionIndex, 3, webgl.FLOAT, false, 4 * 5, 0)
  webgl.vertexAttribPointer(attrUV, 2, webgl.FLOAT, false, 4 * 5, 12)

  // 绘制一个纹理
  webgl.drawArrays(webgl.TRIANGLES, 0, 6)
  webgl.useProgram(null)
}

function handleLoadedTexture(texture) {
  webgl.bindTexture(webgl.TEXTURE_2D, texture)
  webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGBA, webgl.RGBA, webgl.UNSIGNED_BYTE, texture.image)
  // 指定纹理的参数
  webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST)
  webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST)
  
  // 纹理的属性设置
  // webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.REPEAT)
  // webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.REPEAT)

  webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE)
  webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.REPEAT)


  // 状态机绑定为空
  webgl.bindTexture(webgl.TEXTURE_2D, null)
}


// 初始化一个纹理
function initTexture(imageFile) {

  textureHandle = webgl.createTexture() as WebGLTexture
  // @ts-ignore
  // 添加一个属性
  textureHandle.image = new Image()
  // @ts-ignore
  textureHandle.image.src = imageFile
  // @ts-ignore
  textureHandle.image.crossOrigin = "Anonymous";
  // @ts-ignore
  textureHandle.image.onload = () => {
    handleLoadedTexture(textureHandle)
  }
}

function tick() {

  requestAnimationFrame(tick)
  renderScene()
}