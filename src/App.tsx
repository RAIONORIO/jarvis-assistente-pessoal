import { FormEvent, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

type AssistantState = "standby" | "listening" | "processing" | "speaking";

type AgentStatus = "online" | "standby" | "locked";

type Agent = {
  name: string;
  description: string;
  status: AgentStatus;
};

type LogItem = {
  time: string;
  text: string;
};

type SpeakResponse = {
  success: boolean;
  message: string;
};

const agents: Agent[] = [
  {
    name: "Voz",
    description: "Entrada e resposta por voz",
    status: "standby",
  },
  {
    name: "Memória",
    description: "Preferências, histórico e contexto",
    status: "online",
  },
  {
    name: "Agenda",
    description: "Eventos, lembretes e rotina",
    status: "locked",
  },
  {
    name: "WhatsApp",
    description: "Ponte futura pelo notebook",
    status: "locked",
  },
  {
    name: "Arquivos",
    description: "Busca e organização local",
    status: "standby",
  },
  {
    name: "Sistema",
    description: "Ações no desktop Windows",
    status: "standby",
  },
];

function getCurrentTime() {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isAndroidDevice() {
  return /android/i.test(navigator.userAgent);
}

async function speakWithAndroidPlugin(text: string) {
  await invoke<SpeakResponse>("plugin:jarvis-voice|speak", {
    payload: {
      text,
    },
  });
}

async function speakWithDesktopVoice(text: string) {
  await invoke("speak_lara_desktop", {
    text,
  });
}

function App() {
  const [state, setState] = useState<AssistantState>("standby");
  const [command, setCommand] = useState("");
  const [lastResponse, setLastResponse] = useState(
    "Lara inicializada no modo desktop. Núcleo aguardando comando."
  );
  const [logs, setLogs] = useState<LogItem[]>([
    {
      time: getCurrentTime(),
      text: "Command Center iniciado.",
    },
    {
      time: getCurrentTime(),
      text: "Módulo de voz Android preservado para uso no tablet.",
    },
    {
      time: getCurrentTime(),
      text: "Modo desktop ativo para desenvolvimento local.",
    },
  ]);

  function addLog(text: string) {
    setLogs((currentLogs) =>
      [
        {
          time: getCurrentTime(),
          text,
        },
        ...currentLogs,
      ].slice(0, 8)
    );
  }

  async function speakLara(text: string) {
    setState("speaking");

    try {
      if (isAndroidDevice()) {
        await speakWithAndroidPlugin(text);
        addLog("Voz Android acionada.");
      } else {
        await speakWithDesktopVoice(text);
        addLog("Voz desktop acionada.");
      }
    } catch (error) {
      console.error("Erro ao acionar voz da Lara:", error);
      addLog("Falha ao acionar voz neste ambiente.");
    } finally {
      setState("listening");
    }
  }

  function simulateCommand(text: string) {
    const normalizedText = text.trim();

    if (!normalizedText) {
      setLastResponse("Digite um comando para a Lara processar.");
      addLog("Comando vazio ignorado.");
      void speakLara("Digite um comando para eu processar.");
      return;
    }

    setState("processing");
    setLastResponse("Processando comando...");
    addLog(`Comando recebido: ${normalizedText}`);

    window.setTimeout(() => {
      const response = `Entendido. Ainda estou em modo simulado, mas registrei o comando: ${normalizedText}.`;

      setLastResponse(response);
      addLog("Resposta simulada gerada.");
      void speakLara(response);
    }, 900);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    simulateCommand(command);
    setCommand("");
  }

  function handleCortexClick() {
    setState("listening");
    setLastResponse("Lara na escuta. Digite um comando no painel.");
    addLog("Córtex ativado manualmente no desktop.");
    void speakLara("Lara na escuta.");
  }

  return (
    <main className={`lara-command-center ${state}`}>
      <section className="top-bar">
        <div>
          <p className="eyebrow">Assistente pessoal</p>
          <h1>Lara</h1>
        </div>

        <div className="system-status">
          <span className="status-dot" />
          <span>Desktop online</span>
        </div>
      </section>

      <section className="workspace">
        <aside className="panel left-panel">
          <div className="panel-header">
            <p className="eyebrow">Módulos</p>
            <h2>Agentes</h2>
          </div>

          <div className="agent-list">
            {agents.map((agent) => (
              <article className={`agent-card ${agent.status}`} key={agent.name}>
                <div>
                  <h3>{agent.name}</h3>
                  <p>{agent.description}</p>
                </div>
                <span>{agent.status}</span>
              </article>
            ))}
          </div>
        </aside>

        <section className="core-stage">
          <button
            className="lara-cortex"
            type="button"
            onClick={handleCortexClick}
            aria-label="Ativar Lara"
          >
            <span className="cortex-orbit cortex-orbit-outer" />
            <span className="cortex-orbit cortex-orbit-middle" />
            <span className="cortex-orbit cortex-orbit-inner" />
            <span className="cortex-grid" />
            <span className="cortex-core" />
            <span className="cortex-center" />
            <span className="cortex-pulse" />
          </button>

          <div className="core-caption">
            <p className="eyebrow">Núcleo neural</p>
            <h2>{state === "standby" ? "Aguardando" : state}</h2>
            <p>{lastResponse}</p>
          </div>

          <form className="command-form" onSubmit={handleSubmit}>
            <input
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              placeholder="Digite um comando para a Lara..."
              aria-label="Comando para Lara"
            />
            <button type="submit">Executar</button>
          </form>
        </section>

        <aside className="panel right-panel">
          <div className="panel-header">
            <p className="eyebrow">Sistema</p>
            <h2>Status</h2>
          </div>

          <div className="metrics-grid">
            <article>
              <span>IA</span>
              <strong>Simulada</strong>
            </article>
            <article>
              <span>Voz</span>
              <strong>Desktop OK</strong>
            </article>
            <article>
              <span>Tablet</span>
              <strong>APK OK</strong>
            </article>
            <article>
              <span>Memória</span>
              <strong>Local</strong>
            </article>
          </div>

          <div className="log-box">
            <p className="eyebrow">Registro</p>

            {logs.map((log, index) => (
              <div className="log-line" key={`${log.time}-${index}`}>
                <span>{log.time}</span>
                <p>{log.text}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

export default App;
