use serde::{Deserialize, Serialize};

fn default_language() -> String {
    "pl".to_string()
}

fn default_launch_mode() -> String {
    "fullscreen".to_string()
}

fn default_start_url() -> String {
    "https://luna.amazon.com/home".to_string()
}

fn default_true() -> bool {
    true
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    #[serde(default = "default_language")]
    pub language: String,
    #[serde(default)]
    pub browser_path: Option<String>,
    #[serde(default = "default_launch_mode")]
    pub launch_mode: String,
    #[serde(default = "default_true")]
    pub hide_launcher: bool,
    #[serde(default = "default_start_url")]
    pub start_url: String,
    #[serde(default)]
    pub reduce_motion: bool,
    #[serde(default)]
    pub onboarding_done: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            language: default_language(),
            browser_path: None,
            launch_mode: default_launch_mode(),
            hide_launcher: true,
            start_url: default_start_url(),
            reduce_motion: false,
            onboarding_done: false,
        }
    }
}

impl Settings {
    pub fn sanitized(mut self) -> Self {
        if self.language != "en" {
            self.language = "pl".to_string();
        }
        if !matches!(self.launch_mode.as_str(), "window" | "fullscreen" | "kiosk") {
            self.launch_mode = default_launch_mode();
        }
        if !is_web_url(&self.start_url) {
            self.start_url = default_start_url();
        }
        if let Some(path) = &self.browser_path {
            if path.trim().is_empty() {
                self.browser_path = None;
            }
        }
        self
    }

    pub fn is_kiosk(&self) -> bool {
        self.launch_mode == "kiosk"
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecentEntry {
    pub id: String,
    #[serde(default)]
    pub last_played_at: i64,
    #[serde(default)]
    pub seconds: u64,
    #[serde(default)]
    pub plays: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase", default)]
pub struct Library {
    pub favorites: Vec<String>,
    pub recents: Vec<RecentEntry>,
    pub custom: Vec<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BrowserInfo {
    pub id: String,
    pub name: String,
    pub path: String,
    pub engine: String,
    pub widevine: bool,
    pub recommended: bool,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct PadInfo {
    pub id: String,
    pub name: String,
    pub battery: String,
    pub connected: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlayerSession {
    pub game_id: String,
    pub title: String,
    pub started_at: i64,
    pub pid: u32,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlayerExitPayload {
    pub game_id: String,
    pub title: String,
    pub seconds: u64,
    pub exit_code: Option<i32>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemInfo {
    pub platform: String,
    pub browsers: Vec<BrowserInfo>,
    pub app_version: String,
    pub profile_dir: String,
    pub data_dir: String,
    pub player_supported: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BootstrapData {
    pub settings: Settings,
    pub library: Library,
    pub system: SystemInfo,
    pub playing: Option<PlayerSession>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GamepadPayload {
    pub control: Option<String>,
    pub pressed: Option<bool>,
    pub axis: Option<String>,
    pub x: Option<f64>,
    pub y: Option<f64>,
}

pub fn is_web_url(value: &str) -> bool {
    let trimmed = value.trim();
    if !(trimmed.starts_with("https://") || trimmed.starts_with("http://")) {
        return false;
    }
    if trimmed.len() > 2048 {
        return false;
    }
    !trimmed
        .chars()
        .any(|character| character.is_whitespace() || character == '"' || character == '\'')
}
