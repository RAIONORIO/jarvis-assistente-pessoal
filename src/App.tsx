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
          text: "Lara na escuta, Mestre.",
        },
      });

      setState("speaking");

      window.setTimeout(() => {
        setState("listening");
      }, 2600);
    } catch (error) {
      console.error("Erro ao chamar voz nativa da Lara:", error);
      setState("standby");
    }
  }

  return (
    <main className={`lara-screen ${state}`}>
      <section className="lara-cortex-field">
        <button
          className="lara-cortex"
          type="button"
          onClick={handleCoreClick}
          aria-label="Ativar voz da Lara"
        >
          <span className="cortex-orbit cortex-orbit-outer" />
          <span className="cortex-orbit cortex-orbit-middle" />
          <span className="cortex-orbit cortex-orbit-inner" />
          <span className="cortex-grid" />
          <span className="cortex-core" />
          <span className="cortex-center" />
          <span className="cortex-pulse" />
        </button>
      </section>
    </main>
  );
}

export default App;
