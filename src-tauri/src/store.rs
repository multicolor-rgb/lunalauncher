use std::fs;
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::de::DeserializeOwned;
use serde::Serialize;

use crate::model::{Library, RecentEntry, Settings};

pub fn now_ms() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as i64)
        .unwrap_or_default()
}

fn read_json<T: DeserializeOwned>(path: &Path) -> Result<Option<T>, String> {
    if !path.exists() {
        return Ok(None);
    }
    let contents = fs::read_to_string(path).map_err(|error| error.to_string())?;
    let value = serde_json::from_str(&contents).map_err(|error| error.to_string())?;
    Ok(Some(value))
}

fn write_json<T: Serialize>(path: &Path, value: &T) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }
    let contents = serde_json::to_vec_pretty(value).map_err(|error| error.to_string())?;
    fs::write(path, contents).map_err(|error| error.to_string())
}

pub fn load_settings(dir: &Path) -> Settings {
    match read_json::<Settings>(&dir.join("settings.json")) {
        Ok(Some(settings)) => settings.sanitized(),
        Ok(None) => Settings::default(),
        Err(error) => {
            eprintln!("lunaclient: could not read settings: {error}");
            Settings::default()
        }
    }
}

pub fn save_settings(dir: &Path, settings: &Settings) -> Result<(), String> {
    write_json(&dir.join("settings.json"), settings)
}

pub fn load_library(dir: &Path) -> Library {
    match read_json::<Library>(&dir.join("library.json")) {
        Ok(Some(library)) => library,
        Ok(None) => Library::default(),
        Err(error) => {
            eprintln!("lunaclient: could not read library: {error}");
            Library::default()
        }
    }
}

pub fn save_library(dir: &Path, library: &Library) -> Result<(), String> {
    write_json(&dir.join("library.json"), library)
}

pub fn record_play(library: &mut Library, game_id: &str, seconds: u64) {
    let timestamp = now_ms();
    let updated = if let Some(entry) = library.recents.iter_mut().find(|entry| entry.id == game_id)
    {
        entry.last_played_at = timestamp;
        entry.seconds = entry.seconds.saturating_add(seconds);
        entry.plays = entry.plays.saturating_add(1);
        entry.clone()
    } else {
        RecentEntry {
            id: game_id.to_string(),
            last_played_at: timestamp,
            seconds,
            plays: 1,
        }
    };

    library.recents.retain(|entry| entry.id != game_id);
    library.recents.insert(0, updated);
    library.recents.truncate(60);
}
