// Taken from https://codepen.io/lucasdellabella
let styleSheet = null;

const SPARK_ELEMENT_WIDTH = 30;
const DISTANCE = 40;

const RANDOMNESS_ON = true;

/**
 * Util for creating sequences of css transform steps cleanly
 */
function createTransformSteps() {
  if (Array.from(arguments).length === 0) {
    throw new Error("arguments to createTransformSteps should never be empty!");
  }

  const inputSteps = Array.from(arguments);
  const outputSteps = [inputSteps.shift()];
  inputSteps.forEach((step, i) => {
    outputSteps.push(`${outputSteps[i]} ${step}`);
  });

  return outputSteps;
}

/**
 * Creates a new keyframe rule available in css context with a specific spark rotation
 */
const dynamicAnimation = (name, rotation) => {
  if (!styleSheet) {
    styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    document.head.appendChild(styleSheet);
  }

  /**
  Explaining the transform rules
  1. prepares spark
  2. shoots the spark out
  3. keeps the spark in place while scaling it down
  */

  const randomDist = RANDOMNESS_ON
    ? Math.floor((Math.random() - 0.5) * DISTANCE * 0.7)
    : 0;

  const [s1, s2, s3] = createTransformSteps(
    `translate(-50%, -50%) rotate(${rotation}deg) translate(10px, 0px)`,
    `translate(${DISTANCE + randomDist}px, 0px) scale(0.5, 0.5)`,
    `translate(${SPARK_ELEMENT_WIDTH / 2}px, 0) scale(0, 0)`
  );

  styleSheet.sheet.insertRule(
    `@keyframes ${name} {
     0% {
       transform: ${s1};
     }
     70% {
       transform: ${s2};
     }
     100% {
       transform: ${s3};
     }
  }`,
    styleSheet.sheet.cssRules.length
  );
};

document.querySelectorAll(".icon").forEach((icon) => {
  icon.addEventListener("click", (e) => {
    const center = { x: e.pageX, y: e.pageY };
    makeBurst(center);
  });
});

const makeBurst = (center) => {
  for (let i = 0; i < 8; i++) {
    const randomSpace = RANDOMNESS_ON
      ? Math.floor(-17 + Math.random() * 34)
      : 0;
    makeSpark(center, 45 * i + randomSpace);
  }
};

/**
 * Creates a spark
 */
const makeSpark = (center, rotation) => {
  const div = document.createElement("div");
  const aniName = `disappear_${rotation}`;
  dynamicAnimation(aniName, rotation);

  div.classList.add("spark");
  div.style.left = `${center.x}px`;
  div.style.top = `${center.y}px`;
  div.style.animation = `${aniName} 500ms ease-out both`;
  document.body.append(div);
  setTimeout(() => {
    document.body.removeChild(div);
  }, 1000);
};

// ===== Spine-Leaf Datacenter Background (Three.js) =====
(function () {
  if (typeof THREE === "undefined") {
    console.warn("Three.js not loaded.");
    return;
  }

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 35);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true, // transparent so body background shows through
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  renderer.domElement.id = "bg-canvas";
  // Put the canvas at the very top of <body>
  document.body.insertBefore(renderer.domElement, document.body.firstChild);

  // Subtle ambient & directional light
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  // ---- Topology: big spine/leaf with multiple pods ----
  const nodes = [];
  const nodePositions = [];

  const normalColor = 0x4aa8ff; // default node color
  const activeColor = 0xff3366; // node highlight when packet arrives (strong pink/red)

  const nodeGeometry = new THREE.SphereGeometry(0.35, 12, 12);

  function addNode(pos) {
    nodePositions.push(pos);
    const mat = new THREE.MeshBasicMaterial({ color: normalColor });
    const mesh = new THREE.Mesh(nodeGeometry, mat);
    mesh.position.copy(pos);
    scene.add(mesh);
    nodes.push(mesh);
    return nodes.length - 1; // index
  }

  // Layers and layout parameters
  const CORE_COUNT = 4;
  const N_PODS = 8;
  const LEAVES_PER_POD = 2;
  const TORS_PER_POD = 4;

  const R_LEAF = 9;  // radius of leaf ring
  const R_TOR  = 14; // radius of ToR ring

  // ---- Core (spine) layer ----
  const coreIndices = [];
  for (let i = 0; i < CORE_COUNT; i++) {
    const x = (i - (CORE_COUNT - 1) / 2) * 4; // spread horizontally
    const z = i % 2 === 0 ? -1.5 : 1.5;
    coreIndices.push(addNode(new THREE.Vector3(x, 9, z)));
  }

  // ---- Leaf + ToR pods arranged in a ring ----
  const pods = [];
  const leafAll = [];

  for (let p = 0; p < N_PODS; p++) {
    const angle = (p / N_PODS) * Math.PI * 2; // around circle
    const pod = { leafIndices: [], torIndices: [] };

    // Leaves for this pod (slightly offset around the pod angle)
    for (let l = 0; l < LEAVES_PER_POD; l++) {
      const offset = l === 0 ? -0.18 : 0.18; // radians
      const a = angle + offset;
      const x = R_LEAF * Math.cos(a);
      const z = R_LEAF * Math.sin(a);
      const idx = addNode(new THREE.Vector3(x, 3, z));
      pod.leafIndices.push(idx);
      leafAll.push(idx);
    }

    // ToRs for this pod (further out and slightly fanned)
    for (let t = 0; t < TORS_PER_POD; t++) {
      const fan = (t - (TORS_PER_POD - 1) / 2) * 0.18; // small spread
      const a = angle + fan;
      const x = R_TOR * Math.cos(a);
      const z = R_TOR * Math.sin(a);
      const idx = addNode(new THREE.Vector3(x, -3, z));
      pod.torIndices.push(idx);
    }

    pods.push(pod);
  }

  // ---- Links (edges) (static lines) ----
  const edgePositions = [];
  const edgeSeen = new Set();

  function addLink(a, b) {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (edgeSeen.has(key)) return;
    edgeSeen.add(key);

    const pa = nodePositions[a];
    const pb = nodePositions[b];
    edgePositions.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z);
  }

  // Core ↔ all leaves (full spine-leaf)
  coreIndices.forEach((core) => {
    leafAll.forEach((leaf) => addLink(core, leaf));
  });

  // ToR ↔ both leaves in its pod (redundant uplinks)
  pods.forEach((pod) => {
    pod.torIndices.forEach((tor) => {
      pod.leafIndices.forEach((leaf) => addLink(tor, leaf));
    });
  });

  const edgeGeom = new THREE.BufferGeometry();
  edgeGeom.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(edgePositions, 3)
  );

  const edgeMat = new THREE.LineBasicMaterial({
    color: 0x555566,
    transparent: true,
    opacity: 0.4,
  });

  const edgeLines = new THREE.LineSegments(edgeGeom, edgeMat);
  scene.add(edgeLines);

  // ---- Single packet traveling hop-by-hop along path ----
  const PACKET_DURATION = 900; // ms per hop
  const FLOW_INTERVAL  = 3800; // ms between flows
  const RESET_AFTER    = 600;  // ms after last arrival before resetting

  // Higher-contrast packet color (deep orange/gold)
  const packetGeometry = new THREE.SphereGeometry(0.22, 10, 10);
  const packetMaterial = new THREE.MeshBasicMaterial({ color: 0xffb300 });

  let activeFlow = null;      // { path, packet, hopIndex, hopStartTime, duration }
  let lastArrivalTime = 0;    // for auto-reset timing

  function resetNodeColors() {
    nodes.forEach((node) => {
      node.material.color.setHex(normalColor);
    });
  }

  function startRandomFlow() {
    // Only start a new flow if none is active
    if (activeFlow) return;

    resetNodeColors();

    // pick two *different* pods to show cross-pod traffic
    let srcPodIndex = Math.floor(Math.random() * pods.length);
    let dstPodIndex = Math.floor(Math.random() * pods.length);
    if (dstPodIndex === srcPodIndex) {
      dstPodIndex = (dstPodIndex + 1) % pods.length;
    }

    const srcPod = pods[srcPodIndex];
    const dstPod = pods[dstPodIndex];

    const srcTor =
      srcPod.torIndices[Math.floor(Math.random() * srcPod.torIndices.length)];
    const dstTor =
      dstPod.torIndices[Math.floor(Math.random() * dstPod.torIndices.length)];

    const srcLeaf =
      srcPod.leafIndices[Math.floor(Math.random() * srcPod.leafIndices.length)];
    const dstLeaf =
      dstPod.leafIndices[Math.floor(Math.random() * dstPod.leafIndices.length)];

    const core =
      coreIndices[Math.floor(Math.random() * coreIndices.length)];

    // ToR_src → Leaf_src → Core → Leaf_dst → ToR_dst
    const path = [srcTor, srcLeaf, core, dstLeaf, dstTor];

    // Origin node immediately red (starts sending)
    nodes[path[0]].material.color.setHex(activeColor);

    // Create a single packet sphere used for all hops
    const packetMesh = new THREE.Mesh(packetGeometry, packetMaterial);
    packetMesh.visible = false;
    scene.add(packetMesh);

    activeFlow = {
      path,
      packet: packetMesh,
      hopIndex: 0,               // starting from path[0] -> path[1]
      hopStartTime: performance.now(),
      duration: PACKET_DURATION,
    };
  }

  // ---- Animation loop ----
  const clock = new THREE.Clock();
  let lastFlow = performance.now();

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // Slow rotation to show 3D
    scene.rotation.y = elapsed * 0.06;
    scene.rotation.x = Math.sin(elapsed * 0.12) * 0.08;

    const now = performance.now();

    // Periodically *attempt* to start a new flow (only if none active)
    if (now - lastFlow > FLOW_INTERVAL) {
      startRandomFlow();
      lastFlow = now;
    }

    // Update active flow (single packet moving hop-by-hop)
    if (activeFlow) {
      const { path, packet, duration } = activeFlow;

      // If we've finished all hops, clean up
      if (activeFlow.hopIndex >= path.length - 1) {
        scene.remove(packet);
        activeFlow = null;
        lastArrivalTime = now;
      } else {
        const fromIndex = path[activeFlow.hopIndex];
        const toIndex   = path[activeFlow.hopIndex + 1];
        const raw = (now - activeFlow.hopStartTime) / duration;

        if (raw <= 0) {
          packet.visible = false;
        } else if (raw >= 1) {
          // Packet arrived at next node: mark it red
          nodes[toIndex].material.color.setHex(activeColor);

          // Move to next hop (but keep same packet)
          activeFlow.hopIndex++;
          activeFlow.hopStartTime = now; // start next hop *after* this arrival
        } else {
          // EASING: ease-out (fast start, slow end)
          // t = 1 - (1 - raw)^3
          const t = 1 - Math.pow(1 - raw, 3);

          packet.visible = true;
          const fromPos = nodePositions[fromIndex];
          const toPos   = nodePositions[toIndex];

          packet.position.set(
            fromPos.x + (toPos.x - fromPos.x) * t,
            fromPos.y + (toPos.y - fromPos.y) * t,
            fromPos.z + (toPos.z - fromPos.z) * t
          );
        }
      }
    }

    // After the flow is done, reset colors shortly after last arrival
    if (!activeFlow &&
        lastArrivalTime !== 0 &&
        now - lastArrivalTime > RESET_AFTER) {
      resetNodeColors();
      lastArrivalTime = 0;
    }

    renderer.render(scene, camera);
  }

  animate();

  // ---- Resize handling ----
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

