use serde::de::DeserializeOwned;
use tauri::{
    plugin::PluginApi,
    AppHandle, Runtime,
};

use crate::models::*;

pub fn init<R: Runtime, C: DeserializeOwned>(
    app: &AppHandle<R>,
    _api: PluginApi<R, C>,
) -> crate::Result<JarvisVoice<R>> {
    Ok(JarvisVoice {
        _app: app.clone(),
    })
}

pub struct JarvisVoice<R: Runtime> {
    _app: AppHandle<R>,
}

impl<R: Runtime> JarvisVoice<R> {
    pub fn speak(&self, payload: SpeakRequest) -> crate::Result<SpeakResponse> {
        Ok(SpeakResponse {
            success: true,
            message: format!("Desktop mock recebeu: {}", payload.text),
        })
    }
}
