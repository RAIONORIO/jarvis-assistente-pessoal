import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

type AssistantState = "standby" | "listening" | "processing" | "speaking";

type SpeakResponse = {
  success: boolean;
  message: string;
};

function App() {
  const [state, setState] = useState<AssistantState>("standby");

  async function handleCoreClick() {
    setState("processing");

    try {
      await invoke<SpeakResponse>("plugin:jarvis-voice|speak", {
        payload: {
          text: "Estou na escuta, Mestre.",
        },
      });

      setState("speaking");

      window.setTimeout(() => {
        setState("listening");
      }, 2600);
    } catch (error) {
      console.error("Erro ao chamar voz nativa do Jarvis:", error);
      setState("standby");
    }
  }

  return (
    <main className={`jarvis-screen ${state}`}>
      <section className="cortex-field">
        <button
          className="jarvis-cortex"
          type="button"
          onClick={handleCoreClick}
          aria-label="Ativar voz do Jarvis"
        >
          <span className="cortex-ring cortex-ring-outer" />
          <span className="cortex-ring cortex-ring-middle" />
          <span className="cortex-ring cortex-ring-inner" />
          <span className="cortex-core" />
          <span className="cortex-center" />
        </button>
      </section>
    </main>
  );
}

export default App;
