use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

pub use models::*;

#[cfg(desktop)]
mod desktop;

#[cfg(mobile)]
mod mobile;

mod commands;
mod error;
mod models;

pub use error::{Error, Result};

#[cfg(desktop)]
use desktop::JarvisVoice;

#[cfg(mobile)]
use mobile::JarvisVoice;

pub trait JarvisVoiceExt<R: Runtime> {
    fn jarvis_voice(&self) -> &JarvisVoice<R>;
}

impl<R: Runtime, T: Manager<R>> crate::JarvisVoiceExt<R> for T {
    fn jarvis_voice(&self) -> &JarvisVoice<R> {
        self.state::<JarvisVoice<R>>().inner()
    }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("jarvis-voice")
        .invoke_handler(tauri::generate_handler![commands::speak])
        .setup(|app, api| {
            #[cfg(mobile)]
            let jarvis_voice = mobile::init(app, api)?;

            #[cfg(desktop)]
            let jarvis_voice = desktop::init(app, api)?;

            app.manage(jarvis_voice);

            Ok(())
        })
        .build()
}
