use tauri::{AppHandle, State};

use crate::model::{
    BootstrapData, BrowserInfo, Library, PadInfo, PlayerSession, Settings, SystemInfo,
};
use crate::{browser, player, store, AppState};

#[tauri::command]
pub fn get_bootstrap(app: AppHandle, state: State<'_, AppState>) -> Result<BootstrapData, String> {
    let settings = state
        .settings
        .lock()
        .map_err(|_| "STATE_LOCK".to_string())?
        .clone();
    let library = state
        .library
        .lock()
        .map_err(|_| "STATE_LOCK".to_string())?
        .clone();
    let playing = state
        .playing
        .lock()
        .map_err(|_| "STATE_LOCK".to_string())?
        .clone();

    Ok(BootstrapData {
        settings,
        library,
        system: SystemInfo {
            platform: std::env::consts::OS.to_string(),
            browsers: browser::detect(),
            app_version: app.package_info().version.to_string(),
            profile_dir: state.profile_dir.display().to_string(),
            data_dir: state.data_dir.display().to_string(),
            player_supported: true,
        },
        playing,
    })
}

#[tauri::command]
pub fn save_settings(state: State<'_, AppState>, settings: Settings) -> Result<(), String> {
    let settings = settings.sanitized();
    store::save_settings(&state.config_dir, &settings)?;
    let mut current = state
        .settings
        .lock()
        .map_err(|_| "STATE_LOCK".to_string())?;
    *current = settings;
    Ok(())
}

#[tauri::command]
pub fn save_library(state: State<'_, AppState>, mut library: Library) -> Result<(), String> {
    library.custom.truncate(200);
    library.favorites.truncate(2_000);
    library.recents.truncate(60);
    store::save_library(&state.data_dir, &library)?;
    let mut current = state.library.lock().map_err(|_| "STATE_LOCK".to_string())?;
    *current = library;
    Ok(())
}

#[tauri::command]
pub fn get_library(state: State<'_, AppState>) -> Result<Library, String> {
    Ok(state
        .library
        .lock()
        .map_err(|_| "STATE_LOCK".to_string())?
        .clone())
}

#[tauri::command]
pub fn detect_browsers() -> Vec<BrowserInfo> {
    browser::detect()
}

#[tauri::command]
pub fn check_browser(path: String) -> Option<BrowserInfo> {
    browser::check(&path)
}

#[tauri::command]
pub fn launch_game(
    app: AppHandle,
    state: State<'_, AppState>,
    game_id: String,
    title: String,
    url: String,
) -> Result<PlayerSession, String> {
    player::launch(&app, state.inner(), game_id, title, url)
}

#[tauri::command]
pub fn stop_player(state: State<'_, AppState>) -> Result<(), String> {
    player::stop(state.inner())
}

#[tauri::command]
pub fn open_external(url: String) -> Result<(), String> {
    browser::open_external(&url)
}

#[tauri::command]
pub fn get_pads(state: State<'_, AppState>) -> Result<Vec<PadInfo>, String> {
    Ok(state
        .pads
        .lock()
        .map_err(|_| "STATE_LOCK".to_string())?
        .clone())
}
