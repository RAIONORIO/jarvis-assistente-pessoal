use serde::de::DeserializeOwned;
use tauri::{
    plugin::{PluginApi, PluginHandle},
    AppHandle, Runtime,
};

use crate::models::*;

#[cfg(target_os = "ios")]
tauri::ios_plugin_binding!(init_plugin_jarvis_voice);

pub fn init<R: Runtime, C: DeserializeOwned>(
    _app: &AppHandle<R>,
    api: PluginApi<R, C>,
) -> crate::Result<JarvisVoice<R>> {
    #[cfg(target_os = "android")]
    let handle = api.register_android_plugin(
        "br.com.raionorio.jarvisvoice",
        "JarvisVoicePlugin",
    )?;

    #[cfg(target_os = "ios")]
    let handle = api.register_ios_plugin(init_plugin_jarvis_voice)?;

    Ok(JarvisVoice(handle))
}

pub struct JarvisVoice<R: Runtime>(PluginHandle<R>);

impl<R: Runtime> JarvisVoice<R> {
    pub fn speak(&self, payload: SpeakRequest) -> crate::Result<SpeakResponse> {
        self
            .0
            .run_mobile_plugin("speak", payload)
            .map_err(Into::into)
    }
}
