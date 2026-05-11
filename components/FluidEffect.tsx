'use client'

import { useEffect, useRef } from 'react'

export default function FluidEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const config = {
      SIM_RESOLUTION: 128, DYE_RESOLUTION: 1024,
      DENSITY_DISSIPATION: 2, VELOCITY_DISSIPATION: 0.2,
      PRESSURE: 0.8, PRESSURE_ITERATIONS: 20, CURL: 30,
      SPLAT_RADIUS: 0.25, SPLAT_FORCE: 6000,
      SHADING: true, COLORFUL: true, COLOR_UPDATE_SPEED: 10, PAUSED: false,
      BACK_COLOR: { r: 0, g: 0, b: 0 }, TRANSPARENT: false,
      BLOOM: true, BLOOM_ITERATIONS: 8, BLOOM_RESOLUTION: 256,
      BLOOM_INTENSITY: 0.8, BLOOM_THRESHOLD: 0.6, BLOOM_SOFT_KNEE: 0.7,
      SUNRAYS: false, SUNRAYS_RESOLUTION: 196, SUNRAYS_WEIGHT: 1.0,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pointers: any[] = []
    const splatStack: number[] = []

    function mkPointer() {
      return { id: -1, texcoordX: 0, texcoordY: 0, prevTexcoordX: 0, prevTexcoordY: 0, deltaX: 0, deltaY: 0, down: false, moved: false, color: [30, 0, 300] }
    }
    pointers.push(mkPointer())

    function getWebGLContext(c: HTMLCanvasElement) {
      const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let gl: any = c.getContext('webgl2', params)
      const isWebGL2 = !!gl
      if (!isWebGL2) gl = c.getContext('webgl', params) || c.getContext('experimental-webgl', params)
      let halfFloat: any, supportLinearFiltering: any
      if (isWebGL2) { gl.getExtension('EXT_color_buffer_float'); supportLinearFiltering = gl.getExtension('OES_texture_float_linear') }
      else { halfFloat = gl.getExtension('OES_texture_half_float'); supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear') }
      gl.clearColor(0, 0, 0, 1)
      const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat.HALF_FLOAT_OES
      const fmt = (i: number, f: number) => supportRenderTextureFormat(gl, i, f, halfFloatTexType) ? { internalFormat: i, format: f } : null
      const fmtFallback = (i: number, f: number): any => {
        if (!supportRenderTextureFormat(gl, i, f, halfFloatTexType)) {
          if (i === gl.R16F) return fmtFallback(gl.RG16F, gl.RG)
          if (i === gl.RG16F) return fmtFallback(gl.RGBA16F, gl.RGBA)
          return null
        }
        return { internalFormat: i, format: f }
      }
      const formatRGBA = isWebGL2 ? fmtFallback(gl.RGBA16F, gl.RGBA) : fmt(gl.RGBA, gl.RGBA)
      const formatRG   = isWebGL2 ? fmtFallback(gl.RG16F,   gl.RG)   : fmt(gl.RGBA, gl.RGBA)
      const formatR    = isWebGL2 ? fmtFallback(gl.R16F,    gl.RED)  : fmt(gl.RGBA, gl.RGBA)
      return { gl, ext: { formatRGBA, formatRG, formatR, halfFloatTexType, supportLinearFiltering } }
    }

    function supportRenderTextureFormat(gl: any, internalFormat: number, format: number, type: number) {
      const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null)
      const fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
      return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE
    }

    const { gl, ext } = getWebGLContext(canvas)
    if (/Mobi|Android/i.test(navigator.userAgent)) config.DYE_RESOLUTION = 512
    if (!ext.supportLinearFiltering) { config.DYE_RESOLUTION = 512; config.SHADING = false; config.BLOOM = false; config.SUNRAYS = false }

    function hashCode(s: string) { let h = 0; for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0 } return h }
    function compileShader(type: number, source: string, keywords?: string[]) {
      let src = keywords ? keywords.map(k => `#define ${k}\n`).join('') + source : source
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s))
      return s
    }
    function createProgram(vs: any, fs: any) {
      const p = gl.createProgram(); gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p)
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(p))
      return p
    }
    function getUniforms(program: any) {
      const u: any = {}; const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
      for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(program, i).name; u[name] = gl.getUniformLocation(program, name) }
      return u
    }

    class Material {
      vertexShader: any; fragmentShaderSource: string; programs: any = {}; activeProgram: any = null; uniforms: any = []
      constructor(vs: any, fs: string) { this.vertexShader = vs; this.fragmentShaderSource = fs }
      setKeywords(keywords: string[]) {
        let key = 0; keywords.forEach(k => key += hashCode(k))
        if (!this.programs[key]) { const fs = compileShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords); this.programs[key] = createProgram(this.vertexShader, fs) }
        if (this.programs[key] !== this.activeProgram) { this.uniforms = getUniforms(this.programs[key]); this.activeProgram = this.programs[key] }
      }
      bind() { gl.useProgram(this.activeProgram) }
    }
    class GLProgram {
      uniforms: any; program: any
      constructor(vs: any, fs: any) { this.program = createProgram(vs, fs); this.uniforms = getUniforms(this.program) }
      bind() { gl.useProgram(this.program) }
    }

    // ── Vertex shaders ─────────────────────────────────────────────────────────
    const baseVS = compileShader(gl.VERTEX_SHADER, `precision highp float;attribute vec2 aPosition;varying vec2 vUv,vL,vR,vT,vB;uniform vec2 texelSize;void main(){vUv=aPosition*.5+.5;vL=vUv-vec2(texelSize.x,0.);vR=vUv+vec2(texelSize.x,0.);vT=vUv+vec2(0.,texelSize.y);vB=vUv-vec2(0.,texelSize.y);gl_Position=vec4(aPosition,0.,1.);}`)
    const blurVS = compileShader(gl.VERTEX_SHADER, `precision highp float;attribute vec2 aPosition;varying vec2 vUv,vL,vR;uniform vec2 texelSize;void main(){vUv=aPosition*.5+.5;float o=1.33333333;vL=vUv-texelSize*o;vR=vUv+texelSize*o;gl_Position=vec4(aPosition,0.,1.);}`)

    // ── Fragment shaders ───────────────────────────────────────────────────────
    const blurFS      = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying vec2 vUv,vL,vR;uniform sampler2D uTexture;void main(){vec4 s=texture2D(uTexture,vUv)*.29411764;s+=texture2D(uTexture,vL)*.35294117;s+=texture2D(uTexture,vR)*.35294117;gl_FragColor=s;}`)
    const copyFS      = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;void main(){gl_FragColor=texture2D(uTexture,vUv);}`)
    const clearFS     = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;uniform float value;void main(){gl_FragColor=value*texture2D(uTexture,vUv);}`)
    const colorFS     = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;uniform vec4 color;void main(){gl_FragColor=color;}`)
    const displayFS   = `precision highp float;precision highp sampler2D;varying vec2 vUv,vL,vR,vT,vB;uniform sampler2D uTexture,uBloom,uSunrays,uDithering;uniform vec2 ditherScale,texelSize;vec3 linearToGamma(vec3 c){c=max(c,vec3(0));return max(1.055*pow(c,vec3(.416666667))-.055,vec3(0));}void main(){vec3 c=texture2D(uTexture,vUv).rgb;\n#ifdef SHADING\nvec3 lc=texture2D(uTexture,vL).rgb,rc=texture2D(uTexture,vR).rgb,tc=texture2D(uTexture,vT).rgb,bc=texture2D(uTexture,vB).rgb;float dx=length(rc)-length(lc),dy=length(tc)-length(bc);vec3 n=normalize(vec3(dx,dy,length(texelSize)));float diffuse=clamp(dot(n,vec3(0,0,1))+.7,.7,1.);c*=diffuse;\n#endif\n#ifdef BLOOM\nvec3 bloom=texture2D(uBloom,vUv).rgb;\n#endif\n#ifdef SUNRAYS\nfloat sunrays=texture2D(uSunrays,vUv).r;c*=sunrays;\n#ifdef BLOOM\nbloom*=sunrays;\n#endif\n#endif\n#ifdef BLOOM\nfloat noise=texture2D(uDithering,vUv*ditherScale).r;noise=noise*2.-1.;bloom+=noise/255.;bloom=linearToGamma(bloom);c+=bloom;\n#endif\nfloat a=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c,a);}`
    const bloomPreFS  = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying vec2 vUv;uniform sampler2D uTexture;uniform vec3 curve;uniform float threshold;void main(){vec3 c=texture2D(uTexture,vUv).rgb;float br=max(c.r,max(c.g,c.b));float rq=clamp(br-curve.x,0.,curve.y);rq=curve.z*rq*rq;c*=max(rq,br-threshold)/max(br,.0001);gl_FragColor=vec4(c,0.);}`)
    const bloomBlurFS = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying vec2 vL,vR,vT,vB;uniform sampler2D uTexture;void main(){vec4 s=vec4(0.);s+=texture2D(uTexture,vL);s+=texture2D(uTexture,vR);s+=texture2D(uTexture,vT);s+=texture2D(uTexture,vB);s*=.25;gl_FragColor=s;}`)
    const bloomFinFS  = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying vec2 vL,vR,vT,vB;uniform sampler2D uTexture;uniform float intensity;void main(){vec4 s=vec4(0.);s+=texture2D(uTexture,vL);s+=texture2D(uTexture,vR);s+=texture2D(uTexture,vT);s+=texture2D(uTexture,vB);s*=.25;gl_FragColor=s*intensity;}`)
    const splatFS     = compileShader(gl.FRAGMENT_SHADER, `precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uTarget;uniform float aspectRatio;uniform vec3 color;uniform vec2 point;uniform float radius;void main(){vec2 p=vUv-point.xy;p.x*=aspectRatio;vec3 splat=exp(-dot(p,p)/radius)*color;vec3 base=texture2D(uTarget,vUv).xyz;gl_FragColor=vec4(base+splat,1.);}`)
    const advFS       = compileShader(gl.FRAGMENT_SHADER, `precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uVelocity,uSource;uniform vec2 texelSize,dyeTexelSize;uniform float dt,dissipation;vec4 bilerp(sampler2D s,vec2 uv,vec2 ts){vec2 st=uv/ts-.5;vec2 iuv=floor(st),fuv=fract(st);vec4 a=texture2D(s,(iuv+vec2(.5,.5))*ts),b=texture2D(s,(iuv+vec2(1.5,.5))*ts),c=texture2D(s,(iuv+vec2(.5,1.5))*ts),d=texture2D(s,(iuv+vec2(1.5,1.5))*ts);return mix(mix(a,b,fuv.x),mix(c,d,fuv.x),fuv.y);}void main(){\n#ifdef MANUAL_FILTERING\nvec2 coord=vUv-dt*bilerp(uVelocity,vUv,texelSize).xy*texelSize;vec4 result=bilerp(uSource,coord,dyeTexelSize);\n#else\nvec2 coord=vUv-dt*texture2D(uVelocity,vUv).xy*texelSize;vec4 result=texture2D(uSource,coord);\n#endif\nfloat decay=1.+dissipation*dt;gl_FragColor=result/decay;}`, ext.supportLinearFiltering ? undefined : ['MANUAL_FILTERING'])
    const divFS       = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uVelocity;void main(){float L=texture2D(uVelocity,vL).x,R=texture2D(uVelocity,vR).x,T=texture2D(uVelocity,vT).y,B=texture2D(uVelocity,vB).y;vec2 C=texture2D(uVelocity,vUv).xy;if(vL.x<0.)L=-C.x;if(vR.x>1.)R=-C.x;if(vT.y>1.)T=-C.y;if(vB.y<0.)B=-C.y;gl_FragColor=vec4(.5*(R-L+T-B),0.,0.,1.);}`)
    const curlFS      = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uVelocity;void main(){float L=texture2D(uVelocity,vL).y,R=texture2D(uVelocity,vR).y,T=texture2D(uVelocity,vT).x,B=texture2D(uVelocity,vB).x;gl_FragColor=vec4(.5*(R-L-T+B),0.,0.,1.);}`)
    const vortFS      = compileShader(gl.FRAGMENT_SHADER, `precision highp float;precision highp sampler2D;varying vec2 vUv,vL,vR,vT,vB;uniform sampler2D uVelocity,uCurl;uniform float curl,dt;void main(){float L=texture2D(uCurl,vL).x,R=texture2D(uCurl,vR).x,T=texture2D(uCurl,vT).x,B=texture2D(uCurl,vB).x,C=texture2D(uCurl,vUv).x;vec2 force=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));force/=length(force)+.0001;force*=curl*C;force.y*=-1.;vec2 v=texture2D(uVelocity,vUv).xy+force*dt;v=min(max(v,-1000.),1000.);gl_FragColor=vec4(v,0.,1.);}`)
    const pressFS     = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uPressure,uDivergence;void main(){float L=texture2D(uPressure,vL).x,R=texture2D(uPressure,vR).x,T=texture2D(uPressure,vT).x,B=texture2D(uPressure,vB).x,divergence=texture2D(uDivergence,vUv).x;gl_FragColor=vec4((L+R+B+T-divergence)*.25,0.,0.,1.);}`)
    const gradFS      = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uPressure,uVelocity;void main(){float L=texture2D(uPressure,vL).x,R=texture2D(uPressure,vR).x,T=texture2D(uPressure,vT).x,B=texture2D(uPressure,vB).x;vec2 v=texture2D(uVelocity,vUv).xy;v.xy-=vec2(R-L,T-B);gl_FragColor=vec4(v,0.,1.);}`)

    // ── Blit (draw quad) ───────────────────────────────────────────────────────
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,-1,1,1,1,1,-1]), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,0,2,3]), gl.STATIC_DRAW)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(0)
    const blit = (target: any, clear = false) => {
      if (target == null) { gl.viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER,null) }
      else { gl.viewport(0,0,target.width,target.height); gl.bindFramebuffer(gl.FRAMEBUFFER,target.fbo) }
      if (clear) { gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT) }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
    }

    // ── Programs ───────────────────────────────────────────────────────────────
    const blurP    = new GLProgram(blurVS, blurFS)
    const copyP    = new GLProgram(baseVS, copyFS)
    const clearP   = new GLProgram(baseVS, clearFS)
    const colorP   = new GLProgram(baseVS, colorFS)
    const bloomPreP  = new GLProgram(baseVS, bloomPreFS)
    const bloomBlurP = new GLProgram(baseVS, bloomBlurFS)
    const bloomFinP  = new GLProgram(baseVS, bloomFinFS)
    const splatP   = new GLProgram(baseVS, splatFS)
    const advP     = new GLProgram(baseVS, advFS)
    const divP     = new GLProgram(baseVS, divFS)
    const curlP    = new GLProgram(baseVS, curlFS)
    const vortP    = new GLProgram(baseVS, vortFS)
    const pressP   = new GLProgram(baseVS, pressFS)
    const gradP    = new GLProgram(baseVS, gradFS)
    const displayM = new Material(baseVS, displayFS)

    // ── FBOs ───────────────────────────────────────────────────────────────────
    function createFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
      gl.activeTexture(gl.TEXTURE0)
      const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null)
      const fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
      gl.viewport(0,0,w,h); gl.clear(gl.COLOR_BUFFER_BIT)
      const attach = (id: number) => { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, tex); return id }
      return { texture: tex, fbo, width: w, height: h, texelSizeX: 1/w, texelSizeY: 1/h, attach }
    }
    function createDoubleFBO(w: number, h: number, iF: number, f: number, t: number, p: number) {
      let read = createFBO(w,h,iF,f,t,p), write = createFBO(w,h,iF,f,t,p)
      return { width: w, height: h, texelSizeX: read.texelSizeX, texelSizeY: read.texelSizeY, get read(){return read}, set read(v){read=v}, get write(){return write}, set write(v){write=v}, swap(){const tmp=read;read=write;write=tmp} }
    }
    function resizeFBO(src: any, w: number, h: number, iF: number, f: number, t: number, p: number) {
      const dst = createFBO(w,h,iF,f,t,p); copyP.bind(); gl.uniform1i(copyP.uniforms.uTexture, src.attach(0)); blit(dst); return dst
    }
    function resizeDoubleFBO(fbo: any, w: number, h: number, iF: number, f: number, t: number, p: number) {
      if (fbo.width === w && fbo.height === h) return fbo
      fbo.read = resizeFBO(fbo.read, w,h,iF,f,t,p); fbo.write = createFBO(w,h,iF,f,t,p)
      fbo.width=w; fbo.height=h; fbo.texelSizeX=1/w; fbo.texelSizeY=1/h; return fbo
    }

    function getResolution(res: number) {
      let ar = gl.drawingBufferWidth / gl.drawingBufferHeight; if (ar < 1) ar = 1/ar
      const w = Math.round(res * ar), h = Math.round(res)
      return gl.drawingBufferWidth > gl.drawingBufferHeight ? {width:w,height:h} : {width:h,height:w}
    }
    function scaleByPixelRatio(v: number) { return Math.floor(v * (window.devicePixelRatio || 1)) }

    // ── Dithering texture (simple white fallback) ──────────────────────────────
    const ditheringTexture = (() => {
      const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([255,255,255]))
      const obj = { texture: tex, width: 1, height: 1, attach: (id: number) => { gl.activeTexture(gl.TEXTURE0+id); gl.bindTexture(gl.TEXTURE_2D, tex); return id } }
      return obj
    })()

    // ── Init framebuffers ──────────────────────────────────────────────────────
    let dye: any, velocity: any, divergence: any, curl: any, pressure: any, bloom: any
    const bloomFBOs: any[] = []
    let sunrays: any, sunraysTemp: any

    function initFramebuffers() {
      const sim  = getResolution(config.SIM_RESOLUTION)
      const dyed = getResolution(config.DYE_RESOLUTION)
      const a  = ext.halfFloatTexType, fRGBA = ext.formatRGBA, fRG = ext.formatRG, fR = ext.formatR
      const lin = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST
      gl.disable(gl.BLEND)
      dye      = dye      == null ? createDoubleFBO(dyed.width,dyed.height,fRGBA.internalFormat,fRGBA.format,a,lin) : resizeDoubleFBO(dye,dyed.width,dyed.height,fRGBA.internalFormat,fRGBA.format,a,lin)
      velocity = velocity == null ? createDoubleFBO(sim.width,sim.height,fRG.internalFormat,fRG.format,a,lin)  : resizeDoubleFBO(velocity,sim.width,sim.height,fRG.internalFormat,fRG.format,a,lin)
      divergence = createFBO(sim.width,sim.height,fR.internalFormat,fR.format,a,gl.NEAREST)
      curl       = createFBO(sim.width,sim.height,fR.internalFormat,fR.format,a,gl.NEAREST)
      pressure   = createDoubleFBO(sim.width,sim.height,fR.internalFormat,fR.format,a,gl.NEAREST)
      // bloom
      const bRes = getResolution(config.BLOOM_RESOLUTION)
      bloom = createFBO(bRes.width,bRes.height,fRGBA.internalFormat,fRGBA.format,a,lin)
      bloomFBOs.length = 0
      for (let i=0;i<config.BLOOM_ITERATIONS;i++) {
        const w=bRes.width>>i+1, h=bRes.height>>i+1
        if (w<2||h<2) break
        bloomFBOs.push(createFBO(w,h,fRGBA.internalFormat,fRGBA.format,a,lin))
      }
      // sunrays
      const sRes = getResolution(config.SUNRAYS_RESOLUTION)
      sunrays     = createFBO(sRes.width,sRes.height,fR.internalFormat,fR.format,a,lin)
      sunraysTemp = createFBO(sRes.width,sRes.height,fR.internalFormat,fR.format,a,lin)
    }

    function updateKeywords() {
      const kw: string[] = []
      if (config.SHADING) kw.push('SHADING')
      if (config.BLOOM) kw.push('BLOOM')
      if (config.SUNRAYS) kw.push('SUNRAYS')
      displayM.setKeywords(kw)
    }
    updateKeywords(); initFramebuffers()

    // ── Colors ─────────────────────────────────────────────────────────────────
    function HSVtoRGB(h: number, s: number, v: number) {
      const i = Math.floor(h*6), f=h*6-i, p=v*(1-s), q=v*(1-f*s), t=v*(1-(1-f)*s)
      const cases = [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]]
      const [r,g,b] = cases[i%6]; return {r,g,b}
    }
    function generateColor() { const c=HSVtoRGB(Math.random(),1,1); return {r:c.r*.15,g:c.g*.15,b:c.b*.15} }
    function normalizeColor(c:{r:number,g:number,b:number}) { return {r:c.r/255,g:c.g/255,b:c.b/255} }
    function wrap(v:number,min:number,max:number) { const r=max-min; return r===0?min:(v-min)%r+min }

    // ── Splats ─────────────────────────────────────────────────────────────────
    function splat(x:number,y:number,dx:number,dy:number,color:{r:number,g:number,b:number}) {
      splatP.bind()
      gl.uniform1i(splatP.uniforms.uTarget, velocity.read.attach(0))
      gl.uniform1f(splatP.uniforms.aspectRatio, canvas!.width/canvas!.height)
      gl.uniform2f(splatP.uniforms.point, x, y)
      gl.uniform3f(splatP.uniforms.color, dx, dy, 0)
      gl.uniform1f(splatP.uniforms.radius, correctRadius(config.SPLAT_RADIUS/100))
      blit(velocity.write); velocity.swap()
      gl.uniform1i(splatP.uniforms.uTarget, dye.read.attach(0))
      gl.uniform3f(splatP.uniforms.color, color.r, color.g, color.b)
      blit(dye.write); dye.swap()
    }
    function correctRadius(r:number) { const ar=canvas!.width/canvas!.height; return ar>1?r*ar:r }
    function multipleSplats(n:number) {
      for (let i=0;i<n;i++) { const c=generateColor(); c.r*=10;c.g*=10;c.b*=10; splat(Math.random(),Math.random(),1000*(Math.random()-.5),1000*(Math.random()-.5),c) }
    }
    function splatPointer(p:any) { splat(p.texcoordX,p.texcoordY,p.deltaX*config.SPLAT_FORCE,p.deltaY*config.SPLAT_FORCE,p.color) }

    // ── Simulation step ────────────────────────────────────────────────────────
    function step(dt:number) {
      gl.disable(gl.BLEND)
      curlP.bind(); gl.uniform2f(curlP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY); gl.uniform1i(curlP.uniforms.uVelocity,velocity.read.attach(0)); blit(curl)
      vortP.bind(); gl.uniform2f(vortP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY); gl.uniform1i(vortP.uniforms.uVelocity,velocity.read.attach(0)); gl.uniform1i(vortP.uniforms.uCurl,curl.attach(1)); gl.uniform1f(vortP.uniforms.curl,config.CURL); gl.uniform1f(vortP.uniforms.dt,dt); blit(velocity.write); velocity.swap()
      divP.bind(); gl.uniform2f(divP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY); gl.uniform1i(divP.uniforms.uVelocity,velocity.read.attach(0)); blit(divergence)
      clearP.bind(); gl.uniform1i(clearP.uniforms.uTexture,pressure.read.attach(0)); gl.uniform1f(clearP.uniforms.value,config.PRESSURE); blit(pressure.write); pressure.swap()
      pressP.bind(); gl.uniform2f(pressP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY); gl.uniform1i(pressP.uniforms.uDivergence,divergence.attach(0))
      for (let i=0;i<config.PRESSURE_ITERATIONS;i++) { gl.uniform1i(pressP.uniforms.uPressure,pressure.read.attach(1)); blit(pressure.write); pressure.swap() }
      gradP.bind(); gl.uniform2f(gradP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY); gl.uniform1i(gradP.uniforms.uPressure,pressure.read.attach(0)); gl.uniform1i(gradP.uniforms.uVelocity,velocity.read.attach(1)); blit(velocity.write); velocity.swap()
      advP.bind(); gl.uniform2f(advP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY)
      if (!ext.supportLinearFiltering) gl.uniform2f(advP.uniforms.dyeTexelSize,velocity.texelSizeX,velocity.texelSizeY)
      const va = velocity.read.attach(0); gl.uniform1i(advP.uniforms.uVelocity,va); gl.uniform1i(advP.uniforms.uSource,va); gl.uniform1f(advP.uniforms.dt,dt); gl.uniform1f(advP.uniforms.dissipation,config.VELOCITY_DISSIPATION); blit(velocity.write); velocity.swap()
      if (!ext.supportLinearFiltering) gl.uniform2f(advP.uniforms.dyeTexelSize,dye.texelSizeX,dye.texelSizeY)
      gl.uniform1i(advP.uniforms.uVelocity,velocity.read.attach(0)); gl.uniform1i(advP.uniforms.uSource,dye.read.attach(1)); gl.uniform1f(advP.uniforms.dissipation,config.DENSITY_DISSIPATION); blit(dye.write); dye.swap()
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    function applyBloom(src:any, dst:any) {
      if (bloomFBOs.length < 2) return
      let fbo = dst; gl.disable(gl.BLEND)
      bloomPreP.bind()
      const knee = config.BLOOM_THRESHOLD * config.BLOOM_SOFT_KNEE + 1e-4
      const curve0 = config.BLOOM_THRESHOLD - knee
      gl.uniform3f(bloomPreP.uniforms.curve, curve0, 2*knee, .25/knee)
      gl.uniform1f(bloomPreP.uniforms.threshold, config.BLOOM_THRESHOLD)
      gl.uniform1i(bloomPreP.uniforms.uTexture, src.attach(0)); blit(fbo)
      bloomBlurP.bind()
      for (let i=0;i<bloomFBOs.length;i++) { const f=bloomFBOs[i]; gl.uniform2f(bloomBlurP.uniforms.texelSize,fbo.texelSizeX,fbo.texelSizeY); gl.uniform1i(bloomBlurP.uniforms.uTexture,fbo.attach(0)); blit(f); fbo=f }
      gl.blendFunc(gl.ONE,gl.ONE); gl.enable(gl.BLEND)
      for (let i=bloomFBOs.length-2;i>=0;i--) { const f=bloomFBOs[i]; gl.uniform2f(bloomBlurP.uniforms.texelSize,fbo.texelSizeX,fbo.texelSizeY); gl.uniform1i(bloomBlurP.uniforms.uTexture,fbo.attach(0)); gl.viewport(0,0,f.width,f.height); blit(f); fbo=f }
      gl.disable(gl.BLEND)
      bloomFinP.bind(); gl.uniform2f(bloomFinP.uniforms.texelSize,fbo.texelSizeX,fbo.texelSizeY); gl.uniform1i(bloomFinP.uniforms.uTexture,fbo.attach(0)); gl.uniform1f(bloomFinP.uniforms.intensity,config.BLOOM_INTENSITY); blit(dst)
    }

    function render(target: any) {
      if (config.BLOOM) applyBloom(dye.read, bloom)
      if (target == null) { gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA); gl.enable(gl.BLEND) }
      if (!config.TRANSPARENT) { colorP.bind(); const c=normalizeColor(config.BACK_COLOR); gl.uniform4f(colorP.uniforms.color,c.r,c.g,c.b,1); blit(target) }
      const w = target==null?gl.drawingBufferWidth:target.width, h = target==null?gl.drawingBufferHeight:target.height
      displayM.bind()
      if (config.SHADING) gl.uniform2f(displayM.uniforms.texelSize,1/w,1/h)
      gl.uniform1i(displayM.uniforms.uTexture, dye.read.attach(0))
      if (config.BLOOM) { gl.uniform1i(displayM.uniforms.uBloom,bloom.attach(1)); gl.uniform1i(displayM.uniforms.uDithering,ditheringTexture.attach(2)); gl.uniform2f(displayM.uniforms.ditherScale,w/ditheringTexture.width,h/ditheringTexture.height) }
      blit(target)
    }

    // ── Main loop ──────────────────────────────────────────────────────────────
    let lastTime = Date.now(), colorTimer = 0, rafId = 0, stopped = false

    function resizeCanvas() {
      const w=scaleByPixelRatio(canvas!.clientWidth), h=scaleByPixelRatio(canvas!.clientHeight)
      if (canvas!.width!==w||canvas!.height!==h) { canvas!.width=w; canvas!.height=h; return true }
      return false
    }

    function update() {
      if (stopped) return
      const now = Date.now(), dt = Math.min((now-lastTime)/1000, 0.016666); lastTime=now
      if (resizeCanvas()) initFramebuffers()
      if (config.COLORFUL) { colorTimer+=dt*config.COLOR_UPDATE_SPEED; if (colorTimer>=1) { colorTimer=wrap(colorTimer,0,1); pointers.forEach(p=>{p.color=generateColor()}) } }
      if (splatStack.length>0) multipleSplats(splatStack.pop()!)
      pointers.forEach(p=>{ if (p.moved) { p.moved=false; splatPointer(p) } })
      if (!config.PAUSED) step(dt)
      render(null)
      rafId = requestAnimationFrame(update)
    }
    rafId = requestAnimationFrame(update)

    // ── Events ─────────────────────────────────────────────────────────────────
    const onMouseDown = (e: MouseEvent) => {
      const x=scaleByPixelRatio(e.x), y=scaleByPixelRatio(e.y)
      let p=pointers.find(p=>p.id===-1); if (!p) { p=mkPointer(); pointers.push(p) }
      p.id=-1; p.down=true; p.moved=false; p.texcoordX=x/canvas!.width; p.texcoordY=1-y/canvas!.height
      p.prevTexcoordX=p.texcoordX; p.prevTexcoordY=p.texcoordY; p.deltaX=0; p.deltaY=0; p.color=generateColor()
      splatStack.push(1)
    }
    const onMouseMove = (e: MouseEvent) => {
      const p=pointers[0]; if (!p.down) return
      const x=scaleByPixelRatio(e.x), y=scaleByPixelRatio(e.y)
      p.prevTexcoordX=p.texcoordX; p.prevTexcoordY=p.texcoordY
      p.texcoordX=x/canvas!.width; p.texcoordY=1-y/canvas!.height
      const ar=canvas!.width/canvas!.height
      p.deltaX=(p.texcoordX-p.prevTexcoordX)*(ar<1?ar:1)
      p.deltaY=(p.texcoordY-p.prevTexcoordY)*(ar>1?1/ar:1)
      p.moved=Math.abs(p.deltaX)>0||Math.abs(p.deltaY)>0
    }
    const onMouseUp = () => { pointers[0].down=false }

    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      stopped = true
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        mixBlendMode: 'screen',
      }}
    />
  )
}
