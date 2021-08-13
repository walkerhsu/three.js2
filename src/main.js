const root  = '/'
const wall  = root + 'image/wall.jpeg'
const floor = root + 'image/floor.jpeg'

const wrapModes = {
    'ClampToEdgeWrapping': THREE.ClampToEdgeWrapping,
    'RepeatWrapping': THREE.RepeatWrapping,
    'MirroredRepeatWrapping': THREE.MirroredRepeatWrapping,
};

class DegRadHelper {
    constructor(obj, prop) {
        this.obj = obj;
        this.prop = prop;
    }
    get value() {
        return THREE.MathUtils.radToDeg(this.obj[this.prop]);
    }
    set value(v) {
        this.obj[this.prop] = THREE.MathUtils.degToRad(v);
    }
}

class StringToNumberHelper {
    constructor(obj, prop) {
        this.obj = obj;
        this.prop = prop;
    }
    get value() {
        return this.obj[this.prop];
    }
    set value(v) {
        this.obj[this.prop] = parseFloat(v);
    }
}
  
class ColorGUIHelper {
    constructor(object, prop) {
        this.object = object;
        this.prop = prop;
    }
    get value() {
        return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
         this.object[this.prop].set(hexString);
    }
}
  
class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDif) {
        this.obj = obj;
        this.minProp = minProp;
        this.maxProp = maxProp;
        this.minDif = minDif;
    }
    get min() {
        return this.obj[this.minProp];
    }
    set min(v) {
        this.obj[this.minProp] = v;
        this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
    }
    get max() {
        return this.obj[this.maxProp];
    }
    set max(v) {
        this.obj[this.maxProp] = v;
        this.min = this.min;  // this will call the min setter
    }
}
  
function bodyLoaded() {
    main()
}

function main() {
    const canvas = document.querySelector('#Canvas');
    const renderer = new THREE.WebGLRenderer({canvas});

    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);

    const scene = new THREE.Scene()

    const controls = new THREE.OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();
    
    
    // --------hemisphere light------------

    /*
        const skyColor = 0xB1E1FF;  // light blue
        const groundColor = 0xB97A20;  // brownish orange
        const intensity = 1;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);
    */

    // --------directional light------------

    /*
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(0, 10, 0);
        light.target.position.set(-5, 0, 0);
        scene.add(light);
        scene.add(light.target);

        const helper = new THREE.DirectionalLightHelper(light);
        scene.add(helper);
    */

    // --------point light------------

        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.PointLight(color, intensity);
        light.position.set(0, 10, 0);
        scene.add(light);

        const helper = new THREE.PointLightHelper(light);
        scene.add(helper);


    // -------spotlight ------

    /*
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.SpotLight(color, intensity);
        scene.add(light);
        scene.add(light.target);
         
        const helper = new THREE.SpotLightHelper(light);
        scene.add(helper);
    */
   
    const cubes = [];  // just an array we can use to rotate the cubes
    {
        const boxWidth = 1;
        const boxHeight = 1;
        const boxDepth = 1;
        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

        const loadManager = new THREE.LoadingManager();
        const loader = new THREE.TextureLoader(loadManager);
        const texture = loader.load(wall)
        const material = new THREE.MeshBasicMaterial({
            map: texture
        });

        loadManager.onLoad = () => {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(2, 1, 1);
            scene.add(mesh);
            cubes.push(mesh);  // add to our list of cubes to rotate
        };
    }
    
    
    {
        const planeSize = 40;

        const loader = new THREE.TextureLoader();
        const texture = loader.load(floor);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        const repeats = planeSize / 3
        texture.repeat.set(repeats, repeats);

        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.rotation.x = Math.PI * -.5;
        scene.add(mesh);
    }

    {
        const sphereRadius = 1;
        const sphereWidthDivisions = 32;
        const sphereHeightDivisions = 16;
        const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
        const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
        const mesh = new THREE.Mesh(sphereGeo, sphereMat);
        mesh.position.set(-2, 3, 4);
        scene.add(mesh);
        cubes.push(mesh)
    }
    
    // ------- GUI -------
    function updateTexture() {
        texture.needsUpdate = true;
    }

    function updateLight() {
        helper.update()
    }

    function updateCamera() {
        camera.updateProjectionMatrix();
    }

    function makeXYZGUI(gui, vector3, name, onChangeFn) {
        const folder = gui.addFolder(name);
        folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
        folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
        folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
        folder.open();
    }
    const gui = new dat.GUI()
    // ------texture GUI -------------
    
    /*
    const loader = new THREE.TextureLoader();
    const texture = loader.load(wall)

    gui.add(new StringToNumberHelper(texture, 'wrapS'), 'value', wrapModes)
    .name('texture.wrapS')
    .onChange(updateTexture);

    gui.add(new StringToNumberHelper(texture, 'wrapT'), 'value', wrapModes)
    .name('texture.wrapT')
    .onChange(updateTexture);

    gui.add(texture.repeat, 'x', 0, 5, .01).name('texture.repeat.x');
    gui.add(texture.repeat, 'y', 0, 5, .01).name('texture.repeat.y');
    gui.add(texture.offset, 'x', -2, 2, .01).name('texture.offset.x');
    gui.add(texture.offset, 'y', -2, 2, .01).name('texture.offset.y');
    gui.add(texture.center, 'x', -.5, 1.5, .01).name('texture.center.x');
    gui.add(texture.center, 'y', -.5, 1.5, .01).name('texture.center.y');
    gui.add(new DegRadHelper(texture, 'rotation'), 'value', -360, 360)
    .name('texture.rotation');
    */

    // ----hemisphere light GUI ------

    /*
    gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('skyColor');
    gui.addColor(new ColorGUIHelper(light, 'groundColor'), 'value').name('groundColor');
    gui.add(light, 'intensity', 0, 2, 0.01);
    */

    // ----directional light GUI -----

    /*
    gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
    gui.add(light, 'intensity', 0, 2, 0.01);
    makeXYZGUI(gui, light.position, 'position', updateLight);
    makeXYZGUI(gui, light.target.position, 'target', updateLight);
    */

    // ----point light GUI -----------

    /*
    gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
    gui.add(light, 'intensity', 0, 2, 0.01);
    gui.add(light, 'distance', 0, 40).onChange(updateLight);

    makeXYZGUI(gui, light.position, 'position')
    */

    // ----spotlight GUI -------------

    /*
    gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
    gui.add(light, 'intensity', 0, 2, 0.01);
    gui.add(light, 'distance', 0, 40).onChange(updateLight);
    gui.add(new DegRadHelper(light, 'angle'), 'value', 0, 90).name('angle').onChange(updateLight);
    gui.add(light, 'penumbra', 0, 1, 0.01);

    makeXYZGUI(gui, light.position, 'position', updateLight);
    makeXYZGUI(gui, light.target.position, 'target', updateLight);
    */

    // ------------fov GUI------------

    gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
    const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
    gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
    gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);

    // --------render loop -----------
    function render(time) {
        time *= 0.001;
    
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        renderer.render(scene, camera);
    
        requestAnimationFrame(render);
    }
    
    requestAnimationFrame(render);
}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
}