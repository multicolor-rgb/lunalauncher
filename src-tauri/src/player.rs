use std::fs;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::sync::atomic::Ordering;

use tauri::{AppHandle, Emitter, Manager};

use crate::model::{is_web_url, PlayerExitPayload, PlayerSession};
use crate::store::{now_ms, record_play, save_library};
use crate::AppState;

pub fn launch(
    app: &AppHandle,
    state: &AppState,
    game_id: String,
    title: String,
    url: String,
) -> Result<PlayerSession, String> {
    {
        let playing = state.playing.lock().map_err(|_| "STATE_LOCK".to_string())?;
        if playing.is_some() {
            return Err("PLAYER_RUNNING".to_string());
        }
    }

    let settings = state
        .settings
        .lock()
        .map_err(|_| "STATE_LOCK".to_string())?
        .clone();

    let browser_path = settings
        .browser_path
        .clone()
        .ok_or_else(|| "BROWSER_MISSING".to_string())?;
    let browser = PathBuf::from(&browser_path);
    if !browser.is_file() {
        return Err("BROWSER_MISSING".to_string());
    }
    if !is_web_url(&url) {
        return Err("INVALID_URL".to_string());
    }

    fs::create_dir_all(&state.profile_dir).map_err(|error| error.to_string())?;

    let mut command = Command::new(&browser);
    if settings.is_kiosk() {
        command.arg("--kiosk").arg(&url);
    } else {
        command.arg(format!("--app={url}"));
        if settings.launch_mode == "fullscreen" {
            command.arg("--start-fullscreen");
        }
    }

    command
        .arg(format!("--user-data-dir={}", state.profile_dir.display()))
        .arg("--no-first-run")
        .arg("--no-default-browser-check")
        .arg("--disable-session-crashed-bubble")
        .arg("--autoplay-policy=no-user-gesture-required")
        .arg("--class=LunaClientPlayer");

    #[cfg(target_os = "linux")]
    command.arg("--password-store=basic");

    let mut child = command
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|error| format!("SPAWN_FAILED: {error}"))?;

    let pid = child.id();
    let started_at = now_ms();
    let session = PlayerSession {
        game_id: game_id.clone(),
        title: title.clone(),
        started_at,
        pid,
    };

    {
        let mut playing = state.playing.lock().map_err(|_| "STATE_LOCK".to_string())?;
        *playing = Some(session.clone());
    }
    state.gamepad_paused.store(true, Ordering::SeqCst);

    if settings.hide_launcher {
        if let Some(window) = app.get_webview_window("main") {
            let _ = window.minimize();
        }
    }

    let _ = app.emit("player://started", session.clone());

    let app_handle = app.clone();
    std::thread::spawn(move || {
        let status = child.wait();
        let elapsed_ms = (now_ms() - started_at).max(0) as u64;
        let seconds = (elapsed_ms / 1000).max(1);
        let exit_code = status.ok().and_then(|status| status.code());

        let state = app_handle.state::<AppState>();
        {
            if let Ok(mut playing) = state.playing.lock() {
                if playing.as_ref().map(|session| session.pid) == Some(pid) {
                    *playing = None;
                    state.gamepad_paused.store(false, Ordering::SeqCst);
                }
            }
        }

        if let Ok(mut library) = state.library.lock() {
            record_play(&mut library, &game_id, seconds);
            let _ = save_library(&state.data_dir, &library);
        }

        let _ = app_handle.emit(
            "player://exited",
            PlayerExitPayload {
                game_id,
                title,
                seconds,
                exit_code,
            },
        );

        if let Some(window) = app_handle.get_webview_window("main") {
            let _ = window.unminimize();
            let _ = window.show();
            let _ = window.set_focus();
        }
    });

    Ok(session)
}

pub fn stop(state: &AppState) -> Result<(), String> {
    let pid = state
        .playing
        .lock()
        .map_err(|_| "STATE_LOCK".to_string())?
        .as_ref()
        .map(|session| session.pid);

    let Some(pid) = pid else {
        return Ok(());
    };

    #[cfg(unix)]
    {
        Command::new("kill")
            .args(["-TERM", &pid.to_string()])
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|error| error.to_string())?;
    }

    #[cfg(windows)]
    {
        Command::new("taskkill")
            .args(["/PID", &pid.to_string(), "/T", "/F"])
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|error| error.to_string())?;
    }

    Ok(())
}
