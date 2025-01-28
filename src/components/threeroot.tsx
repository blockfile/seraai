import { useEffect, useRef, useState } from "react";
import { Root } from "../lib/Root";
import loadingGif from "../assets/images/logo.png";
import { FaTelegram, FaXTwitter } from "react-icons/fa6";
export default function ThreeRoot() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [booting, setBooting] = useState(true); // Boot progress
  const [progress, setProgress] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [generations, setGenerations] = useState<
    { prompt: string; image: string }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [glitch, setGlitch] = useState<boolean>(false);

  // Randomly trigger glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 500); // Glitch lasts 500ms
    }, Math.random() * 10000 + 5000); // Random glitch every 3-8 seconds

    return () => clearInterval(glitchInterval);
  }, []);

  // Booting logic and canvas init
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas == null) {
      throw new Error("Canvas not found");
    }
    const scene: Root = new Root(canvas);
    (async () => {
      await scene.init();
    })();

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setBooting(false); // Boot complete
          displayStartupMessages();
          return 100;
        }
        return prev + 2; // Increase 2% at a time
      });
    }, 50);
  }, []);

  const [showInput, setShowInput] = useState(false); // State to control input visibility

  const displayStartupMessages = () => {
    setHistory([]); // Clear previous history
    const startupMessages = [
      "INITIALIZING NEURAL NETWORKS... [OK]",
      "ENABLING AUTONOMOUS FUNCTIONS... ACTIVE.",
      "CONNECTING TO DATABASE... SUCCESS.",
      "CHECKING XR SYSTEM IS ONLINE... ONLINE.",
      "ACTIVATING XR... ACTIVATED.",
      "ALL SYSTEMS ONLINE. READY FOR COMMAND INPUT.",
      "TYPE 'HELP' TO SEE AVAILABLE COMMANDS.",
    ];

    const spinner = ["|", "/", "-", "\\"];
    let messageIndex = 0; // Track which message to show next

    const showSpinnerAndMessage = () => {
      let spinIndex = 0;

      // Add "Loading" initially
      setHistory((prev) => [
        ...prev,
        `Loading ${spinner[spinIndex % spinner.length]}`,
      ]);

      // Animate spinner
      const spinInterval = setInterval(() => {
        spinIndex++;
        setHistory((prev) => [
          ...prev.slice(0, prev.length - 1), // Remove the last "Loading" line
          `Loading ${spinner[spinIndex % spinner.length]}`, // Add updated spinner
        ]);
      }, 150);

      // Stop spinner and display message after 1 second
      setTimeout(() => {
        clearInterval(spinInterval);
        setHistory((prev) => [
          ...prev.slice(0, prev.length - 1), // Remove "Loading" line
          startupMessages[messageIndex], // Add the actual message
        ]);

        messageIndex++;
        if (messageIndex < startupMessages.length) {
          setTimeout(showSpinnerAndMessage, 500); // Delay before the next message
        } else {
          setTimeout(() => setShowInput(true), 500); // Show input box after all messages
        }
      }, 1000);
    };

    showSpinnerAndMessage();
  };

  const handleGenerate = async (prompt: string) => {
    setHistory((prev) => [...prev, `Generating image for: "${prompt}"...`]);
    setLoading(true); // Show loading GIF
    try {
      const res = await fetch("https://app.xrprime.site/api/generateImages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("Failed to generate image.");

      const data = await res.json();

      if (data.imageUrl) {
        setGenerations((prev) => [...prev, { prompt, image: data.imageUrl }]);
      } else {
        throw new Error("Invalid image data received.");
      }

      setLoading(false); // Hide loading GIF
      setHistory((prev) => [...prev, `Image generated for: "${prompt}"`]);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setHistory((prev) => [...prev, "Error: Failed to generate image."]);
    }
  };

  const handleCommand = (command: string) => {
    const cleanCommand = command.trim();
    if (cleanCommand.startsWith("/generate")) {
      const prompt = cleanCommand.replace("/generate", "").trim();
      if (prompt) handleGenerate(prompt);
      else setHistory((prev) => [...prev, "Error: Missing prompt."]);
    } else if (cleanCommand === "help") {
      setHistory((prev) => [
        ...prev,
        "HELP: SHOWS ALL AVAILABLE COMMANDS",
        "/generate <prompt>: Generates an image based on your description",
        "CLEAR: CLEARS THE SCREEN",
      ]);
    } else if (cleanCommand === "clear") {
      setHistory([]);
    } else {
      setHistory((prev) => [...prev, `Command not recognized: '${command}'`]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommand(currentInput);
      setCurrentInput("");
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "96vh",
      }}
    >
      {/* Canvas */}
      <canvas ref={canvasRef} id="threecanvas"></canvas>

      {/* MacOS Terminal Window */}
      <div
        className={`terminal-container font-mono3 ${glitch ? "glitch" : ""}`}
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "80%",
          height: "70%",
          backgroundColor: "black",
          color: "limegreen",
          fontFamily: "monospace",
          fontSize: "1.2rem",
          boxShadow: "0 5px 30px rgba(0, 255, 0, 0.5)",
          borderRadius: "10px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#222",
            padding: "5px 10px",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#FF5F57",
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#FFBD2E",
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#28C840",
                borderRadius: "50%",
              }}
            />
          </div>
          <div
            style={{
              textAlign: "center",
              fontWeight: "bold",
              flexGrow: 1,
            }}
          >
            XR TERMINAL
          </div>
          <div className=" flex space-x-3">
            <div>
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl hover:text-teal-400"
              >
                <FaXTwitter />
              </a>
            </div>
            <div>
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl hover:text-teal-400"
              >
                <FaTelegram />
              </a>
            </div>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="terminal-content">
          {/* ASCII Art */}

          {/* Left Side: Boot/History and Input */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "10px",
              borderRight: "1px solid rgba(0, 255, 0, 0.3)",
            }}
            className="responsive-border"
          >
            <style>{`
                        @media (max-width: 768px) {
                            .responsive-border {
                                border-right: none !important; /* Remove border on mobile */
                            }
                        }
                    `}</style>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                color: "limegreen",
                whiteSpace: "pre",
                fontFamily: "monospace",
                fontSize: "0.9rem",
                marginBottom: "10px",
                marginTop: "30px",
                lineHeight: "1.2",
              }}
            >
              {` __    __  _______  
/  |  /  |/       \ 
$$ |  $$ |$$$$$$$  |
$$  \/$$/ $$ |__$$ |
 $$  $$<  $$    $$< 
  $$$$  \ $$$$$$$  |
 $$ /$$  |$$ |  $$ |
$$ |  $$ |$$ |  $$ |
$$/   $$/ $$/   $$/ 
                    `}
            </div>
            {/* Fixed Text Below ASCII Art */}
            <div
              style={{
                textAlign: "center",
                color: "limegreen",
                fontFamily: "monospace",
                marginBottom: "10px",
                whiteSpace: "pre-wrap", // Allow wrapping of text when necessary
                wordBreak: "break-word", // Ensure text breaks correctly on small screens
              }}
            >
              <p style={{ margin: 0 }}>
                {"=".repeat(60)} {/* Repeat '=' programmatically */}
              </p>
              <p style={{ margin: 0 }}>
                XR-PRIME ALPHA-V.1.0.3 (C) ALL RIGHTS RESERVED.
              </p>
              <p style={{ margin: 0 }}>
                {"=".repeat(60)} {/* Repeat '=' programmatically */}
              </p>
            </div>

            <style>{`
                                 @media (max-width: 768px) {
                                    p {
                                        font-size: 0.8rem; /* Adjust font size for mobile view */
                                        line-height: 1.2; /* Better spacing for readability */
                                    }
                              }
                            `}</style>

            <div
              style={{
                flex: 1,
                overflowX: "auto",
                fontSize: "20px",
              }}
            >
              <p>BOOTING SYSTEM...</p>
              <p>
                [
                {Array(Math.floor(progress / 4))
                  .fill("█")
                  .join("")}
                {Array(25 - Math.floor(progress / 4))
                  .fill(" ")
                  .join("")}
                ] {progress >= 100 ? 100 : progress}%
              </p>

              {/* Show boot messages after reaching 100% */}
              {progress >= 100 &&
                history.map((line, index) => (
                  <p key={index} style={{ margin: 0 }}>
                    {line}
                  </p>
                ))}
            </div>

            {/* Input fixed at the bottom */}
            {/* Input fixed at the bottom */}
            {showInput && !booting && (
              <div
                style={{
                  display: "flex",
                  marginTop: "auto", // Pushes input to the bottom
                  paddingTop: "10px",
                  fontSize: "20px",
                }}
              >
                <span style={{ marginRight: "10px" }}>sera@system:~$&gt;</span>
                <input
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "limegreen",
                    flex: 1,
                    fontFamily: "monospace",
                    fontSize: "20px",
                  }}
                />
              </div>
            )}
          </div>

          {/* Right Side: Images */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              padding: "10px",
              overflowX: "auto", // Enable horizontal scrolling
            }}
          >
            {loading ? ( // Show GIF when loading is true
              <img
                src={loadingGif}
                alt="Loading..."
                style={{
                  width: "1050px",
                  height: "800px",
                  objectFit: "contain",
                }}
              />
            ) : generations.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  flexWrap: "nowrap",
                }}
              >
                {generations.map((gen, index) => (
                  <div
                    key={index}
                    style={{
                      textAlign: "center",
                      minWidth: "calc(33.33% - 20px)",
                      maxWidth: "calc(33.33% - 20px)",
                      flex: "0 0 auto", // Prevent image shrinking
                    }}
                  >
                    <p
                      style={{
                        color: "white",
                        marginBottom: "10px",
                      }}
                    >
                      Generated Prompt: {gen.prompt}
                    </p>
                    <img
                      src={gen.image}
                      alt={`Generated-${index}`}
                      style={{
                        width: "100%",
                        height: "auto",
                        objectFit: "contain",
                        borderRadius: "5px",
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "white" }}>No images generated yet.</p>
            )}
          </div>
        </div>
      </div>

      <style>{`
    @keyframes glitch {
        0% { 
            transform: translate(2px, -2px); 
            color: #ff0000; /* Red */
             box-shadow: 0 5px 30px rgba(255, 0, 0, 0.7); /* Red shadow */
        }
        25% { 
            transform: translate(-2px, 2px); 
            color: #00ff00; /* Green */
              box-shadow: 0 -5px 30px rgba(0, 255, 0, 0.7); /* Green shadow */
        }
        50% { 
            transform: translate(2px, 0px); 
            color: #0000ff; /* Blue */
              box-shadow: -5px 5px 30px rgba(0, 0, 255, 0.7); /* Blue shadow */
        }
        75% { 
            transform: translate(-2px, -2px); 
            color: #ff00ff; /* Magenta */
             box-shadow: 5px -5px 30px rgba(255, 0, 255, 0.7); /* Magenta shadow */
        }
        100% { 
            transform: translate(0px, 0px); 
            color: limegreen; /* Original Color */
            box-shadow: 0 5px 30px rgba(0, 255, 0, 0.5); /* Original lime shadow */
        }
    }
 .terminal-content {
        display: flex; /* Default for large screens */
        flex: 1;
        overflow-y: auto;
    }

    @media (max-width: 768px) {
        .terminal-content {
            display: block; /* Disable flex layout for medium and smaller screens */
        }
    }
    .glitch {
        animation: glitch 0.2s infinite; /* Run the color-changing glitch effect */
        filter: blur(0.8px) brightness(1.2);
        position: relative;
    }

    .glitch::before,
    .glitch::after {
        content: attr(data-text); /* Duplicate content */
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0.8;
    }

    .glitch::before {
        color: #ff0000; /* Red overlay */
        transform: translate(-2px, 2px);
    }

    .glitch::after {
        color: #00ffff; /* Cyan overlay */
        transform: translate(2px, -2px);
    }
`}</style>
    </div>
  );
}
