use tauri::{command, AppHandle, Runtime};

use crate::models::*;
use crate::JarvisVoiceExt;
use crate::Result;

#[command]
pub(crate) async fn speak<R: Runtime>(
    app: AppHandle<R>,
    payload: SpeakRequest,
) -> Result<SpeakResponse> {
    app.jarvis_voice().speak(payload)
}
