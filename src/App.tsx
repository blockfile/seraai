import { useEffect, useRef, useState } from "react";

import "./App.css";

import WebGPU from "three/examples/jsm/capabilities/WebGPU.js";

function App() {
    const [hasWebGPU, setHasWebGPU] = useState(false);
    useEffect(() => {
        setHasWebGPU(WebGPU.isAvailable());
    }, []);

    return (
        <div id="app">
            {!hasWebGPU && (
                <div className="">
                    <div className="pb-2">
                        is not available on your browser and this page requires
                        compatibility
                    </div>
                    <div className="pb-2">
                        Please try with a WebGPU compatible browser.
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
