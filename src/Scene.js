import React, { useEffect, useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import * as THREE from "three";
import myimage from "/Users/chloechia/sceneproject/scene/src/party_img_depth.png";

const Scene = () => {
  const directory = "/depthmaps";
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  const scene = useRef(new THREE.Scene());
  const mesh = useRef(null);
  const camera = useRef(null);

  const startTime = useRef(null);
  const currentFrameIndex = useRef(-1); // Start with -1 to ensure the first frame is loaded at start

  useEffect(() => {
    camera.current = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      1,
      950
    );
    camera.current.position.z = 2;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    new OrbitControls(camera.current, renderer.domElement);
    scene.current.add(new THREE.AmbientLight(0xffffff, 0.5));

    renderer.setAnimationLoop(animation);

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      document.body.removeChild(renderer.domElement);
    };
  }, []);

  const onResize = () => {
    camera.current.aspect = window.innerWidth / window.innerHeight;
    camera.current.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  const generateFilePath = (number) => {
    const basePath = `${process.env.PUBLIC_URL}/depthmaps`;
    const fileName = `output_${number
      .toString()
      .padStart(5, "0")}_img_depth.png`;
    // console.log(`${basePath}/${fileName}`);
    return `${basePath}/${fileName}`;
  };

  const loadNewImage = (imageNumber) => {
    const imagePath = generateFilePath(imageNumber);
    console.log(imagePath);
    const image = new Image();
    image.onload = () => {
      createTexturesAndApply(image);
    };
    image.src = imagePath;
  };

  const createTexturesAndApply = (image) => {
    const visualCanvas = document.createElement("canvas");
    const visualCtx = visualCanvas.getContext("2d");
    visualCanvas.width = image.width / 2; // Use only half the image width
    visualCanvas.height = image.height;
    visualCtx.drawImage(
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
    const visualTexture = new THREE.CanvasTexture(visualCanvas);

    const depthCanvas = document.createElement("canvas");
    const depthCtx = depthCanvas.getContext("2d");
    depthCanvas.width = image.width / 2; // Use only half the image width for the depth map as well
    depthCanvas.height = image.height;
    depthCtx.drawImage(
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
    const depthTexture = new THREE.CanvasTexture(depthCanvas);

    //   // Apply the textures to the material of the mesh
    if (mesh.current) {
      mesh.current.material.map = visualTexture;
      mesh.current.material.displacementMap = depthTexture;
      mesh.current.material.needsUpdate = true;
    } else {
      // If the mesh doesn't exist yet, create it
      const material = new THREE.MeshStandardMaterial({
        map: visualTexture,
        displacementMap: depthTexture,
        // Include other material properties as needed
      });
      const geometry = new THREE.PlaneGeometry(10, 10, 512, 512); // Adjust size as needed
      mesh.current = new THREE.Mesh(geometry, material);
      scene.current.add(mesh.current);
    }
  };

  const animation = (time) => {
    if (!startTime.current) startTime.current = time;
    const elapsedTime = time - startTime.current;
    const frameDuration = 1000 / 15; // Duration per frame in milliseconds
    const totalNumberOfImages = 10;

    const targetFrame =
      (Math.floor(elapsedTime / frameDuration) % totalNumberOfImages) + 1;

    if (targetFrame !== currentFrameIndex.current) {
      currentFrameIndex.current = targetFrame;
      loadNewImage(currentFrameIndex.current);
    }

    renderer.render(scene.current, camera.current);
  };

  //   return <div />;
};

export default Scene;
