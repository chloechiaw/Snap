import "./App.css";
import Scene from "./Scene";
import image from "/Users/chloechia/sceneproject/scene/src/cal.jpeg";

function App() {
  return (
    <div>
      <Scene
        imageURL={image}
        depthMapUrl="depthestimation/Depth-Anything/depth_vis/cal_depth.png"
      />
    </div>
  );
}

export default App;
