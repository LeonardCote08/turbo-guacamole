/**
 * Emotion Weather - Miniature Diorama Earth Visualization
 * PHASE 3.5: ROBUST SHADER INJECTION (DEFINITIVE FIX)
 *
 * This version definitively fixes the recurring shader compilation error by adopting
 * a single, robust injection pattern for all shader modifications.
 * - ALL shader code injection now uses the safe `#include <...>` replacement method.
 * - All fragile string prepending (`declarations + shader.code`) has been eliminated.
 * - This resolves the `invalid character '#'` error permanently.
 */

// --- GLOBALS & CONFIG ---
let scene, camera, renderer, clock, earthGroup, earth, cloudMesh, postProcessing, focusController, globeController;
let sunLight;
const testObjects = [];

const CONFIG = {
    earth: { radius: 2.5, segments: 256, displacementScale: 0.15, },
    camera: { fov: 35, near: 0.1, far: 1000, position: { x: 0, y: 0, z: 9 } },
    animation: { autoRotate: true, rotationSpeed: 0.00015, cloudRotationSpeed: 0.00020, wobbleSpeed: 0.0008, wobbleAmount: 0.01, dragSensitivity: 0.09 },
    postProcessing: { focus: 9.0, aperture: 4.5, maxblur: 0.01, saturation: 1.3 }
};

const DEBUG_STATE = { showTestObjects: false, autoFocus: false, logFrameInfo: false, colorDebugMode: 0 };

// --- CORE CLASSES ---
class GlobeInteractionController { constructor(camera, earthGroup, renderer) { this.camera = camera; this.earthGroup = earthGroup; this.renderer = renderer; this.raycaster = new THREE.Raycaster(); this.mouse = new THREE.Vector2(); this.previousMouse = new THREE.Vector2(); this.isDragging = false; this.rotationVelocity = 0; this.rotationDamping = 0.99; this.momentumThreshold = 0.0001; this.setupEvents(); } setupEvents() { const canvas = this.renderer.domElement; const onDown = (e) => { this.onMouseDown(e.type.startsWith('touch') ? e.touches[0] : e); }; const onMove = (e) => { this.onMouseMove(e.type.startsWith('touch') ? e.touches[0] : e); }; const onUp = () => this.onMouseUp(); canvas.addEventListener('mousedown', onDown); canvas.addEventListener('mousemove', onMove); canvas.addEventListener('mouseup', onUp); canvas.addEventListener('mouseleave', onUp); canvas.addEventListener('touchstart', (e) => { e.preventDefault(); onDown(e); }, { passive: false }); canvas.addEventListener('touchmove', (e) => { e.preventDefault(); onMove(e); }, { passive: false }); canvas.addEventListener('touchend', onUp); canvas.addEventListener('touchcancel', onUp); } updateMousePosition(event) { const rect = this.renderer.domElement.getBoundingClientRect(); this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1; } checkHover() { if (this.isDragging) return; this.raycaster.setFromCamera(this.mouse, this.camera); const intersects = this.raycaster.intersectObject(earth, true); document.getElementById('canvas-container').style.cursor = intersects.length > 0 ? 'grab' : 'default'; } onMouseDown(event) { this.updateMousePosition(event); this.raycaster.setFromCamera(this.mouse, this.camera); if (this.raycaster.intersectObject(earth, true).length > 0) { this.isDragging = true; this.rotationVelocity = 0; document.getElementById('canvas-container').style.cursor = 'grabbing'; CONFIG.animation.autoRotate = false; window.dispatchEvent(new CustomEvent('autoRotationChange', { detail: { value: false } })); this.previousMouse.copy(this.mouse); } } onMouseMove(event) { this.updateMousePosition(event); this.checkHover(); if (this.isDragging) { const deltaX = this.mouse.x - this.previousMouse.x; const rotationDelta = deltaX * Math.PI * CONFIG.animation.dragSensitivity; this.earthGroup.rotation.y += rotationDelta; this.rotationVelocity = this.rotationVelocity * 0.2 + rotationDelta * 0.8; this.previousMouse.copy(this.mouse); } } onMouseUp() { if (this.isDragging) { this.isDragging = false; document.getElementById('canvas-container').style.cursor = 'grab'; } } update() { if (!this.isDragging && Math.abs(this.rotationVelocity) > this.momentumThreshold) { this.earthGroup.rotation.y += this.rotationVelocity; this.rotationVelocity *= this.rotationDamping; if (Math.abs(this.rotationVelocity) < this.momentumThreshold) { this.rotationVelocity = 0; setTimeout(() => { if (!this.isDragging) { CONFIG.animation.autoRotate = true; window.dispatchEvent(new CustomEvent('autoRotationChange', { detail: { value: true } })); } }, 2000); } } if (CONFIG.animation.autoRotate && !this.isDragging) { this.earthGroup.rotation.y += CONFIG.animation.rotationSpeed; } const time = clock.getElapsedTime(); this.earthGroup.rotation.z = Math.sin(time * CONFIG.animation.wobbleSpeed * Math.PI) * CONFIG.animation.wobbleAmount; } }
class FocusController { constructor(camera) { this.camera = camera; this.mouse = new THREE.Vector2(0, 0); this.currentFocus = CONFIG.postProcessing.focus; this.enabled = false; } onMouseMove(event) { if (!this.enabled) return; this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1; this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; } update() { if (!this.enabled || !postProcessing) return; const targetFocus = CONFIG.camera.position.z + (this.mouse.y * 3); this.currentFocus = THREE.MathUtils.lerp(this.currentFocus, targetFocus, 0.1); postProcessing.updateFocus(this.currentFocus); } }

// --- MAIN INITIALIZATION ---
async function init() {
    clock = new THREE.Clock(); scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x020308, 0.08); camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, window.innerWidth / window.innerHeight, CONFIG.camera.near, CONFIG.camera.far); camera.position.set(CONFIG.camera.position.x, CONFIG.camera.position.y, CONFIG.camera.position.z); camera.lookAt(0, 0, 0); renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" }); renderer.setSize(window.innerWidth, window.innerHeight); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputEncoding = THREE.sRGBEncoding; document.getElementById('canvas-container').appendChild(renderer.domElement); createLighting(); createStars(); createDepthTestObjects(); await createEarth();
    try { postProcessing = new window.PostProcessing(renderer, scene, camera); postProcessing.setParameters(CONFIG.postProcessing); } catch (e) { console.error('Post-processing failed to initialize. Rendering without effects.', e); postProcessing = null; document.getElementById('status-dofmode').textContent = 'ERROR'; }
    focusController = new FocusController(camera); globeController = new GlobeInteractionController(camera, earthGroup, renderer); resetParameters(); setupEvents(); animate();
}

// --- SCENE CREATION ---
function createLighting() { scene.add(new THREE.AmbientLight(0xffffff, 0.5)); scene.add(new THREE.HemisphereLight(0xa0c8f0, 0x504040, 1.0)); sunLight = new THREE.DirectionalLight(0xfff5e6, 2.2); sunLight.position.set(10, 5, 5); sunLight.castShadow = true; sunLight.shadow.mapSize.width = 4096; sunLight.shadow.mapSize.height = 4096; sunLight.shadow.camera.near = 1; sunLight.shadow.camera.far = 20; sunLight.shadow.bias = -0.0001; scene.add(sunLight); }

function createEarth() {
    return new Promise((resolve) => {
        const loadingManager = new THREE.LoadingManager(() => { console.log("All Earth assets loaded."); document.body.classList.add('loaded'); setTimeout(resolve, 500); });
        earthGroup = new THREE.Group(); scene.add(earthGroup);
        const textureLoader = new THREE.TextureLoader(loadingManager); const anisotropy = renderer.capabilities.getMaxAnisotropy();
        const textures = { day: textureLoader.load('assets/textures/earth_day.jpg'), height: textureLoader.load('assets/textures/earth_bump.jpg'), specular: textureLoader.load('assets/textures/earth_specular.jpg'), clouds: textureLoader.load('assets/textures/earth_clouds.jpg'), night: textureLoader.load('assets/textures/earth_night.jpg'), };
        for (const key in textures) { textures[key].anisotropy = anisotropy; textures[key].encoding = THREE.sRGBEncoding; }
        textures.height.encoding = THREE.LinearEncoding;

        const earthMaterial = new THREE.MeshStandardMaterial({ map: textures.day, normalMap: textures.height, roughnessMap: textures.specular, metalness: 0.1, roughness: 1.0 });
        earthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uNightTexture = { value: textures.night }; shader.uniforms.uSunDirection = { value: new THREE.Vector3() }; shader.uniforms.uHeightMap = { value: textures.height }; shader.uniforms.uDisplacementScale = { value: CONFIG.earth.displacementScale }; shader.uniforms.uDebugMode = { value: 0 };
            shader.vertexShader = shader.vertexShader.replace('#include <common>', `
                #include <common>
                uniform sampler2D uHeightMap;
                uniform float uDisplacementScale;
                varying float vElevation;`);
            shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `
                #include <common>
                uniform sampler2D uNightTexture;
                uniform vec3 uSunDirection;
                uniform int uDebugMode;
                varying float vElevation;`);
            shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
                #include <begin_vertex>
                float height = texture2D(uHeightMap, uv).r;
                if (height > 0.01) { transformed += normal * height * uDisplacementScale; }
                vElevation = height;`);
            shader.fragmentShader = shader.fragmentShader.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );', `
                vec3 finalColor = outgoingLight;
                if (vElevation > 0.01) { vec3 f = vec3(0.31, 0.78, 0.47); vec3 s = vec3(0.97, 0.97, 0.99); float ff = smoothstep(0.05, 0.35, vElevation); finalColor = mix(finalColor, f, ff * 0.25); float sf = smoothstep(0.5, 0.7, vElevation); finalColor = mix(finalColor, s, sf * 0.9); }
                float sunI = smoothstep(-0.1, 0.1, dot(normalize(vNormal), uSunDirection)); vec3 nightL = texture2D(uNightTexture, vUv).rgb; finalColor = finalColor * sunI + nightL * (1.0 - sunI);
                if (uDebugMode == 1) { finalColor = vec3(vElevation); } else if (uDebugMode == 2) { finalColor = texture2D(roughnessMap, vUv).rrr; }
                gl_FragColor = vec4(finalColor, diffuseColor.a);`);
            earthMaterial.userData.shader = shader;
        };
        const earthGeometry = new THREE.SphereGeometry(CONFIG.earth.radius, CONFIG.earth.segments, CONFIG.earth.segments);
        earth = new THREE.Mesh(earthGeometry, earthMaterial); earth.rotation.y = Math.PI; earth.receiveShadow = true; earth.castShadow = true; earthGroup.add(earth);

        const cloudMaterial = new THREE.MeshStandardMaterial({ map: textures.clouds, transparent: true, opacity: 0.4, blending: THREE.NormalBlending, depthWrite: false });
        cloudMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uHeightMap = { value: textures.height };
            shader.uniforms.uDisplacementScale = { value: CONFIG.earth.displacementScale };

            // --- DEFINITIVE FIX ---
            // Use the same robust #include replacement pattern for declarations.
            shader.vertexShader = shader.vertexShader.replace('#include <common>', `
                #include <common>
                uniform sampler2D uHeightMap;
                uniform float uDisplacementScale;
            `);

            // Inject logic into the main function.
            shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
                #include <begin_vertex>
                float height = texture2D(uHeightMap, uv).r;
                float cloudAltitude = 0.02; 
                if (height > 0.01) {
                    transformed += normal * height * uDisplacementScale;
                }
                transformed += normal * cloudAltitude;`);
            cloudMaterial.userData.shader = shader;
        };

        cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(CONFIG.earth.radius, CONFIG.earth.segments, CONFIG.earth.segments), cloudMaterial);
        cloudMesh.castShadow = true; earthGroup.add(cloudMesh);
        const atmosphereMaterial = new THREE.ShaderMaterial({ uniforms: { 'c': { value: 0.5 }, 'p': { value: 4.0 } }, vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`, fragmentShader: `uniform float c; uniform float p; varying vec3 vNormal; void main() { float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p); gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 1.2; }`, side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true });
        const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(CONFIG.earth.radius * 1.05, CONFIG.earth.segments, CONFIG.earth.segments), atmosphereMaterial); earthGroup.add(atmosphere);
    });
}
function createStars() { const starCount = 8000; const geometry = new THREE.BufferGeometry(); const positions = new Float32Array(starCount * 3); for (let i = 0; i < starCount; i++) { const i3 = i * 3; const radius = 100 + Math.random() * 400; const u = Math.random(); const v = Math.random(); const theta = 2 * Math.PI * u; const phi = Math.acos(2 * v - 1); positions[i3] = radius * Math.sin(phi) * Math.cos(theta); positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta); positions[i3 + 2] = radius * Math.cos(phi); } geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); const material = new THREE.PointsMaterial({ size: 0.5, sizeAttenuation: true, color: 0xffffff, transparent: true, opacity: 0.8 }); scene.add(new THREE.Points(geometry, material)); }
function createDepthTestObjects() { const objectsData = [{ pos: [-3, 1, 4], size: 0.5, color: 0xff0000, emissive: 0x440000 }, { pos: [3.5, 0, 0], size: 0.4, color: 0xffff00, emissive: 0x444400 }, { pos: [0, -2, -5], size: 0.6, color: 0x00ff00, emissive: 0x004400 }, { pos: [-2, 3, -10], size: 0.8, color: 0x0000ff, emissive: 0x000044 }]; objectsData.forEach(obj => { const sphere = new THREE.Mesh(new THREE.SphereGeometry(obj.size, 32, 32), new THREE.MeshPhongMaterial({ color: obj.color, emissive: obj.emissive, shininess: 100 })); sphere.position.set(...obj.pos); sphere.visible = false; sphere.castShadow = true; scene.add(sphere); testObjects.push({ mesh: sphere }); }); }

// --- ANIMATION & EVENTS ---
function animate() { requestAnimationFrame(animate); const delta = clock.getDelta(); if (earth && earth.material.userData.shader) { const sunWorldDirection = new THREE.Vector3(); sunLight.getWorldDirection(sunWorldDirection); const earthGroupInverseRotation = earthGroup.quaternion.clone().invert(); const sunLocalDirection = sunWorldDirection.clone().applyQuaternion(earthGroupInverseRotation); earth.material.userData.shader.uniforms.uSunDirection.value.copy(sunLocalDirection); } if (globeController) globeController.update(); if (cloudMesh) cloudMesh.rotation.y += CONFIG.animation.cloudRotationSpeed; if (focusController) focusController.update(); if (DEBUG_STATE.logFrameInfo) console.log(`Frame: ${renderer.info.render.frame}, Tris: ${renderer.info.render.triangles}, Calls: ${renderer.info.render.calls}`); if (postProcessing) { postProcessing.render(delta); } else { renderer.render(scene, camera); } }
function onWindowResize() { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); if (postProcessing) postProcessing.onWindowResize(); }
function setupEvents() { window.addEventListener('resize', onWindowResize, false); document.addEventListener('mousemove', (e) => { if (focusController) focusController.onMouseMove(e) }); setupDebugControls(); }

// --- DEBUG & UI ---
function setupDebugControls() { const debugParams = ['focus', 'aperture', 'maxblur', 'saturation', 'displacement']; debugParams.forEach(param => { const slider = document.getElementById(param); const input = document.getElementById(param + '-input'); if (!slider || !input) return; slider.addEventListener('input', (e) => { const value = parseFloat(e.target.value); input.value = value.toFixed(param.includes('blur') || param.includes('displace') ? 3 : 2); updateDebugParameter(param, value); }); input.addEventListener('change', (e) => { let value = parseFloat(e.target.value); if (isNaN(value)) return; slider.value = value; updateDebugParameter(param, value); }); }); document.addEventListener('keydown', handleKeyboardShortcuts); }
function handleKeyboardShortcuts(e) { if (e.key === 'd' && e.ctrlKey) { e.preventDefault(); document.body.classList.toggle('debug-mode'); return; } if (!document.body.classList.contains('debug-mode')) return; const keyActions = { 'r': resetParameters, 'f': toggleAutoFocus, 't': toggleTestObjects, 'd': () => postProcessing && postProcessing.debugDOF(), 's': logDetailedState, 'l': toggleFrameLogging, 'a': toggleAutoRotation, 'c': cycleColorDebug, '1': () => focusOnObject(0), '2': focusOnEarth, '3': () => focusOnObject(3) }; if (keyActions[e.key.toLowerCase()]) keyActions[e.key.toLowerCase()](); }
function updateDebugParameter(param, value) { if (param === 'displacement') { CONFIG.earth.displacementScale = value; if (earth && earth.material.userData.shader) { earth.material.userData.shader.uniforms.uDisplacementScale.value = value; } if (cloudMesh && cloudMesh.material.userData.shader) { cloudMesh.material.userData.shader.uniforms.uDisplacementScale.value = value; } } else { CONFIG.postProcessing[param] = value; if (postProcessing) postProcessing.setParameters({ [param]: value }); } }
function cycleColorDebug() { if (!earth || !earth.material.userData.shader) return; DEBUG_STATE.colorDebugMode = (DEBUG_STATE.colorDebugMode + 1) % 3; earth.material.userData.shader.uniforms.uDebugMode.value = DEBUG_STATE.colorDebugMode; const modes = ['Normal', 'Height Map', 'Specular Map']; console.log(`Color Debug Mode: ${modes[DEBUG_STATE.colorDebugMode]}`); }
function toggleAutoRotation() { CONFIG.animation.autoRotate = !CONFIG.animation.autoRotate; window.dispatchEvent(new CustomEvent('autoRotationChange', { detail: { value: CONFIG.animation.autoRotate } })); }
function toggleAutoFocus() { focusController.enabled = !focusController.enabled; updateDebugStatus('autofocus', focusController.enabled); }
function toggleTestObjects() { DEBUG_STATE.showTestObjects = !DEBUG_STATE.showTestObjects; testObjects.forEach(obj => obj.mesh.visible = DEBUG_STATE.showTestObjects); updateDebugStatus('testobjects', DEBUG_STATE.showTestObjects); }
function toggleFrameLogging() { DEBUG_STATE.logFrameInfo = !DEBUG_STATE.logFrameInfo; updateDebugStatus('framelog', DEBUG_STATE.logFrameInfo); }
function focusOnObject(index) { if (testObjects[index]) { const distance = camera.position.distanceTo(testObjects[index].mesh.position); updateDebugParameter('focus', distance); document.getElementById('focus').value = distance; document.getElementById('focus-input').value = distance.toFixed(2); } }
function focusOnEarth() { const dist = camera.position.distanceTo(earthGroup.position) - CONFIG.earth.radius; updateDebugParameter('focus', dist); document.getElementById('focus').value = dist; document.getElementById('focus-input').value = dist.toFixed(2); }
function logDetailedState() { console.log('STATE:', { config: CONFIG, debug: DEBUG_STATE, camera: camera.position, focus: postProcessing ? postProcessing.params.focus : 'N/A' }); }
function resetParameters() { const ppDefaults = { focus: 9.0, aperture: 4.5, maxblur: 0.01, saturation: 1.3 }; Object.entries(ppDefaults).forEach(([key, value]) => { updateDebugParameter(key, value); const slider = document.getElementById(key); const input = document.getElementById(key + '-input'); if (slider) slider.value = value; if (input) input.value = value.toFixed(key === 'maxblur' ? 3 : 2); }); const earthDefaults = { displacement: 0.15 }; Object.entries(earthDefaults).forEach(([key, value]) => { updateDebugParameter(key, value); const slider = document.getElementById(key); const input = document.getElementById(key + '-input'); if (slider) slider.value = value; if (input) input.value = value.toFixed(3); }); }
function updateDebugStatus(key, value) { window.dispatchEvent(new CustomEvent('debugStateChange', { detail: { key, value } })); }

// --- START ---
window.addEventListener('DOMContentLoaded', init);