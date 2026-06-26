use std::process::Command;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn speak_lara_desktop(text: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let script = r#"
Add-Type -AssemblyName System.Speech
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speaker.SelectVoice('Microsoft Maria Desktop')
$speaker.Rate = -1
$speaker.Volume = 100
$speaker.Speak($env:LARA_SPEAK_TEXT)
"#;

        Command::new("powershell.exe")
            .arg("-NoProfile")
            .arg("-ExecutionPolicy")
            .arg("Bypass")
            .arg("-Command")
            .arg(script)
            .env("LARA_SPEAK_TEXT", text)
            .spawn()
            .map_err(|error| format!("Falha ao iniciar voz desktop da Lara: {error}"))?;

        Ok(())
    }

    #[cfg(not(target_os = "windows"))]
    {
        let _ = text;
        Err("Voz desktop nativa disponível apenas no Windows.".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_jarvis_voice::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            speak_lara_desktop
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
