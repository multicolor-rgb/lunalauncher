mod browser;
mod commands;
mod gamepad;
mod model;
mod player;
mod store;

use std::path::PathBuf;
use std::sync::atomic::AtomicBool;
use std::sync::{Arc, Mutex};

use tauri::Manager;

use model::{Library, PadInfo, PlayerSession, Settings};

pub struct AppState {
    pub settings: Mutex<Settings>,
    pub library: Mutex<Library>,
    pub playing: Mutex<Option<PlayerSession>>,
    pub pads: Mutex<Vec<PadInfo>>,
    pub gamepad_paused: Arc<AtomicBool>,
    pub config_dir: PathBuf,
    pub data_dir: PathBuf,
    pub profile_dir: PathBuf,
}

impl AppState {
    fn new(app: &tauri::AppHandle) -> Result<Self, String> {
        let config_dir = app
            .path()
            .app_config_dir()
            .map_err(|error| error.to_string())?;
        let data_dir = app
            .path()
            .app_data_dir()
            .map_err(|error| error.to_string())?;

        std::fs::create_dir_all(&config_dir).map_err(|error| error.to_string())?;
        std::fs::create_dir_all(&data_dir).map_err(|error| error.to_string())?;

        let profile_dir = data_dir.join("player");
        std::fs::create_dir_all(&profile_dir).map_err(|error| error.to_string())?;

        Ok(Self {
            settings: Mutex::new(store::load_settings(&config_dir)),
            library: Mutex::new(store::load_library(&data_dir)),
            playing: Mutex::new(None),
            pads: Mutex::new(Vec::new()),
            gamepad_paused: Arc::new(AtomicBool::new(false)),
            config_dir,
            data_dir,
            profile_dir,
        })
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let state = AppState::new(app.handle())?;
            let paused = state.gamepad_paused.clone();
            app.manage(state);
            gamepad::spawn(app.handle().clone(), paused);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_bootstrap,
            commands::save_settings,
            commands::save_library,
            commands::get_library,
            commands::detect_browsers,
            commands::check_browser,
            commands::launch_game,
            commands::stop_player,
            commands::open_external,
            commands::get_pads,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Luna Client");
}
