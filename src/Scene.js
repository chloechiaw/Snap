import React, { useEffect, useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

import * as THREE from "three";
import myimage from "/Users/chloechia/sceneproject/scene/src/party_img_depth.png";

const Scene = () => {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  const scene = useRef(null);
  const mesh = useRef(null);

  const settings = useRef({
    metalness: 0.0,
    roughness: 0.14,
    ambientIntensity: 0.85,
    displacementScale: 5,
    displacementBias: -0.5,
  });

  useEffect(() => {
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      1,
      950
    );
    camera.position.z = 2;

    const sceneInstance = new THREE.Scene();
    scene.current = sceneInstance;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    sceneInstance.add(ambientLight);

    renderer.setAnimationLoop(animation);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enableDamping = true;

    function animation(time) {
      renderer.render(sceneInstance, camera);
    }

    function changeWindowSize() {
      const aspect = window.innerWidth / window.innerHeight;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", changeWindowSize);

    const gui = new GUI();
    const material = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      roughness: settings.current.roughness,
      metalness: settings.current.metalness,
      side: THREE.DoubleSide,
    });

    function changeMat(i, v) {
      material[i] = v;
    }

    gui
      .add(settings.current, "metalness")
      .min(0)
      .max(1)
      .onChange((value) => changeMat("metalness", value));
    gui
      .add(settings.current, "roughness")
      .min(0)
      .max(1)
      .onChange((value) => changeMat("roughness", value));
    gui
      .add(settings.current, "ambientIntensity")
      .min(0)
      .max(20)
      .onChange((value) => {
        settings.current.ambientIntensity = value;
        material.ambientIntensity = value;
        mesh.current.material = material;
      });
    gui
      .add(settings.current, "displacementScale")
      .min(0)
      .max(10.0)
      .onChange((value) => {
        settings.current.displacementScale = value;
        material.displacementScale = value;
        mesh.current.material = material;
      });

    gui
      .add(settings.current, "displacementBias")
      .min(-10)
      .max(10)
      .onChange((value) => {
        settings.current.displacementBias = value;
        material.displacementScale = value;
        mesh.current.material = material;
      });

    const image = new Image();
    image.onload = function () {
      if (mesh.current) {
        mesh.current.geometry.dispose();
        mesh.current.material.dispose();
        sceneInstance.remove(mesh.current);
      }

      const measurements = image.width / image.height / 2;

      const scene = document.createElement("canvas").getContext("2d");
      scene.canvas.width = image.width / 2;
      scene.canvas.height = image.height;
      scene.drawImage(
        image,
        0,
        0,
        image.width / 2,
        image.height,
        0,
        0,
        image.width / 2,
        image.height
      );
      const myrgbmap = new THREE.CanvasTexture(scene.canvas);

      const depthmap = document.createElement("canvas").getContext("2d");
      depthmap.canvas.width = image.width / 2;
      depthmap.canvas.height = image.height;
      depthmap.drawImage(
        image,
        image.width / 2,
        0,
        image.width / 2,
        image.height,
        0,
        0,
        image.width / 2,
        image.height
      );
      const mydepthmap = new THREE.CanvasTexture(depthmap.canvas);

      material.map = myrgbmap;
      material.displacementMap = mydepthmap;

      const geometry = new THREE.PlaneGeometry(10, 10, 512, 512);
      mesh.current = new THREE.Mesh(geometry, material);
      mesh.current.scale.y = 1.0 / measurements;
      mesh.current.scale.multiplyScalar(0.23);
      sceneInstance.add(mesh.current);
      saveImage();
    };
    image.src = myimage;

    return () => {
      window.removeEventListener("resize", changeWindowSize);
    };
  }, []);

  const saveImage = () => {
    const canvas = renderer.domElement; // Get the canvas element
    const dataURL = canvas.toDataURL(); // Convert canvas to data URL
    const link = document.createElement("a"); // Create a link element
    link.download = "scene.png"; // Set the file name
    link.href = dataURL; // Set the data URL as href
    link.click(); // Click the link to trigger download
  };

  return <div />;
};

export default Scene;

// // make sure depth map is in right format
// // display the iamge first
// const Scene = ({ imageUrl, depthMapUrl }) => {
//   const settings = {
//     metalness: 0.0,
//     roughness: 0.14,
//     ambientIntensity: 0.85,
//     displacementScale: 5,
//     displacementBias: -0.5,
//   };

//   const mountRef = useRef(null);

//   const depthArrayToImage = (data, width, height) => {
//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");
//     canvas.width = width;
//     canvas.height = height;

//     const imageData = ctx.createImageData(width, height);
//     for (let i = 0; i < data.length; i++) {
//       const val = data[i];
//       imageData.data[i * 4] = val; // R
//       imageData.data[i * 4 + 1] = val; // G
//       imageData.data[i * 4 + 2] = val; // B
//       imageData.data[i * 4 + 3] = 255; // A
//     }
//     ctx.putImageData(imageData, 0, 0);

//     return canvas.toDataURL();
//   };

//   useEffect(() => {
//     const depthImageUrl = depthArrayToImage(depthMapUrl, 564, 564);
//     console.log("here");
//     console.log(depthImageUrl);

//     // Scene setup
//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(
//       75,
//       window.innerWidth / window.innerHeight,
//       0.1,
//       1000
//     );
//     const renderer = new THREE.WebGLRenderer();
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     mountRef.current.appendChild(renderer.domElement);

//     const controls = new OrbitControls(camera, renderer.domElement);
//     controls.addEventListener("change", () => renderer.render(scene, camera)); // Optional: add an event listener to render on control changes

//     // Lighting
//     const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
//     scene.add(ambientLight);
//     const pointLight = new THREE.PointLight(0xffffff, 0.5);
//     camera.add(pointLight);
//     scene.add(camera);

//     // Geometry setup
//     const geometry = new THREE.PlaneGeometry(5, 5, 256, 256); // Adjust size and segments as needed

//     // Texture and Displacement Map loading
//     const textureLoader = new THREE.TextureLoader();
//     const texture = textureLoader.load(
//       image, // URL of the image to load
//       function (texture) {
//         // onLoad callback
//         console.log("Texture loaded successfully");
//         // Here, 'texture' is the loaded Texture object
//       },
//       function (xhr) {
//         // onProgress callback
//         console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
//         // This provides progress information, such as how much of the image has been downloaded
//       },
//       function (error) {
//         // onError callback
//         console.error("An error happened during loading the texture:", error);
//         // This logs any errors that occurred during the loading process
//       }
//     );

//     // displacement map:
//     const depthMapWidth = depthMapUrl[0].length;
//     const depthMapHeight = depthMapUrl.length;

//     // Create a canvas
//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");

//     // Set canvas size
//     canvas.width = depthMapWidth;
//     canvas.height = depthMapHeight;

//     // Draw depth map
//     for (let y = 0; y < depthMapHeight; y++) {
//       for (let x = 0; x < depthMapWidth; x++) {
//         // Assume depthMap values are normalized between 0 and 1
//         const depthValue = depthMapUrl[y][x];
//         // Convert depth value to grayscale color (0-255)
//         const grayValue = Math.floor(depthValue * 255);
//         // Set pixel color
//         ctx.fillStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
//         ctx.fillRect(x, y, 1, 1); // Draw a pixel
//       }
//     }

//     // Create CanvasTexture from the canvas
//     const depthMapTexture = new THREE.CanvasTexture(canvas);

//     // const displacementMap = textureLoader.load(depthImageUrl);
//     // console.log(displacementMap);

//     const material = new THREE.MeshStandardMaterial({
//       map: texture,
//       displacementMap: depthMapTexture,
//       displacementScale: 10, // Adjust this value based on your depth map
//     });

//     // Mesh setup
//     const mesh = new THREE.Mesh(geometry, material);
//     scene.add(mesh);

//     // Camera position
//     camera.position.z = 10;

//     // Animation loop
//     const animate = () => {
//       requestAnimationFrame(animate);
//       controls.update(); // Only required if controls.enableDamping or controls.autoRotate are set to true
//       renderer.render(scene, camera);
//     };
//     animate();

//     const gui = new GUI();
//     gui
//       .add(settings, "metalness")
//       .min(0)
//       .max(1)
//       .onChange(function (value) {
//         material.metalness = value;
//       });
//     gui
//       .add(settings, "roughness")
//       .min(0)
//       .max(1)
//       .onChange(function (value) {
//         material.roughness = value;
//       });
//     gui
//       .add(settings, "ambientIntensity")
//       .min(0)
//       .max(1)
//       .onChange(function (value) {
//         ambientLight.intensity = value;
//       });
//     gui
//       .add(settings, "displacementScale")
//       .min(0)
//       .max(30.0)
//       .onChange(function (value) {
//         material.displacementScale = value;
//       });
//     gui
//       .add(settings, "displacementBias")
//       .min(-10)
//       .max(10)
//       .onChange(function (value) {
//         material.displacementBias = value;
//       });
//     // Cleanup function
//     return () => {
//       mountRef.current.removeChild(renderer.domElement);
//     };
//   }, [imageUrl, depthMapUrl]); // Dependency array to re-run effect if URLs change

//   return <div ref={mountRef} />;
// };

// export default Scene;
