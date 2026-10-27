use std::env;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use crate::model::BrowserInfo;

struct Spec {
    name: &'static str,
    engine: &'static str,
    binaries: &'static [&'static str],
    paths: Vec<PathBuf>,
}

fn spec(
    name: &'static str,
    engine: &'static str,
    binaries: &'static [&'static str],
    paths: Vec<PathBuf>,
) -> Spec {
    Spec {
        name,
        engine,
        binaries,
        paths,
    }
}

#[cfg(target_os = "linux")]
fn specs() -> Vec<Spec> {
    vec![
        spec(
            "Google Chrome",
            "chromium",
            &["google-chrome-stable", "google-chrome"],
            vec![
                PathBuf::from("/opt/google/chrome/google-chrome"),
                PathBuf::from("/usr/bin/google-chrome-stable"),
                PathBuf::from("/usr/bin/google-chrome"),
            ],
        ),
        spec(
            "Microsoft Edge",
            "chromium",
            &["microsoft-edge-stable", "microsoft-edge"],
            vec![
                PathBuf::from("/usr/bin/microsoft-edge-stable"),
                PathBuf::from("/usr/bin/microsoft-edge"),
                PathBuf::from("/opt/microsoft/msedge/msedge"),
            ],
        ),
        spec(
            "Brave",
            "chromium",
            &["brave-browser", "brave"],
            vec![
                PathBuf::from("/usr/bin/brave-browser"),
                PathBuf::from("/opt/brave.com/brave/brave"),
            ],
        ),
        spec(
            "Vivaldi",
            "chromium",
            &["vivaldi-stable", "vivaldi"],
            vec![
                PathBuf::from("/usr/bin/vivaldi-stable"),
                PathBuf::from("/opt/vivaldi/vivaldi"),
            ],
        ),
        spec(
            "Chromium",
            "chromium",
            &["chromium", "chromium-browser"],
            vec![
                PathBuf::from("/usr/bin/chromium"),
                PathBuf::from("/usr/bin/chromium-browser"),
                PathBuf::from("/snap/bin/chromium"),
                PathBuf::from("/var/lib/flatpak/exports/bin/org.chromium.Chromium"),
            ],
        ),
    ]
}

#[cfg(target_os = "macos")]
fn specs() -> Vec<Spec> {
    let applications = PathBuf::from("/Applications");
    vec![
        spec(
            "Google Chrome",
            "chromium",
            &[],
            vec![applications.join("Google Chrome.app/Contents/MacOS/Google Chrome")],
        ),
        spec(
            "Microsoft Edge",
            "chromium",
            &[],
            vec![applications.join("Microsoft Edge.app/Contents/MacOS/Microsoft Edge")],
        ),
        spec(
            "Brave",
            "chromium",
            &[],
            vec![applications.join("Brave Browser.app/Contents/MacOS/Brave Browser")],
        ),
        spec(
            "Vivaldi",
            "chromium",
            &[],
            vec![applications.join("Vivaldi.app/Contents/MacOS/Vivaldi")],
        ),
        spec(
            "Chromium",
            "chromium",
            &[],
            vec![applications.join("Chromium.app/Contents/MacOS/Chromium")],
        ),
    ]
}

#[cfg(target_os = "windows")]
fn specs() -> Vec<Spec> {
    let mut chrome_paths = Vec::new();
    let mut edge_paths = Vec::new();
    let mut brave_paths = Vec::new();
    let mut vivaldi_paths = Vec::new();

    for variable in ["ProgramFiles", "ProgramFiles(x86)", "LOCALAPPDATA"] {
        if let Some(base) = env::var_os(variable) {
            let base = PathBuf::from(base);
            chrome_paths.push(base.join("Google/Chrome/Application/chrome.exe"));
            edge_paths.push(base.join("Microsoft/Edge/Application/msedge.exe"));
            brave_paths.push(base.join("BraveSoftware/Brave-Browser/Application/brave.exe"));
            vivaldi_paths.push(base.join("Vivaldi/Application/vivaldi.exe"));
        }
    }

    vec![
        spec("Google Chrome", "chromium", &[], chrome_paths),
        spec("Microsoft Edge", "chromium", &["msedge"], edge_paths),
        spec("Brave", "chromium", &[], brave_paths),
        spec("Vivaldi", "chromium", &[], vivaldi_paths),
        spec(
            "Chromium",
            "chromium",
            &["chromium"],
            vec![
                PathBuf::from(r"C:\Program Files\Chromium\Application\chrome.exe"),
                PathBuf::from(r"C:\Program Files (x86)\Chromium\Application\chrome.exe"),
            ],
        ),
    ]
}

#[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
fn specs() -> Vec<Spec> {
    Vec::new()
}

#[cfg(unix)]
fn is_executable(path: &Path) -> bool {
    use std::os::unix::fs::PermissionsExt;
    path.is_file()
        && path
            .metadata()
            .map(|metadata| metadata.permissions().mode() & 0o111 != 0)
            .unwrap_or(false)
}

#[cfg(not(unix))]
fn is_executable(path: &Path) -> bool {
    path.is_file()
}

fn which(binaries: &[&str]) -> Option<PathBuf> {
    let search_path = env::var_os("PATH")?;
    for directory in env::split_paths(&search_path) {
        for binary in binaries {
            let candidate = directory.join(binary);
            if is_executable(&candidate) {
                return Some(candidate);
            }
            #[cfg(target_os = "windows")]
            {
                let with_extension = directory.join(format!("{binary}.exe"));
                if is_executable(&with_extension) {
                    return Some(with_extension);
                }
            }
        }
    }
    None
}

fn display_name(path: &Path) -> String {
    let file = path
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("Browser")
        .to_lowercase();
    if file.contains("edge") {
        "Microsoft Edge".to_string()
    } else if file.contains("brave") {
        "Brave".to_string()
    } else if file.contains("vivaldi") {
        "Vivaldi".to_string()
    } else if file.contains("chromium") {
        "Chromium".to_string()
    } else if file.contains("chrome") {
        "Google Chrome".to_string()
    } else {
        path.file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("Browser")
            .to_string()
    }
}

pub fn has_widevine(path: &Path) -> bool {
    let mut directories: Vec<PathBuf> = Vec::new();
    if let Some(parent) = path.parent() {
        directories.push(parent.to_path_buf());
    }
    if let Ok(canonical) = std::fs::canonicalize(path) {
        if let Some(parent) = canonical.parent() {
            directories.push(parent.to_path_buf());
        }
    }

    directories.iter().any(|directory| {
        directory.join("WidevineCdm").exists() || directory.join("widevinecdm").exists()
    })
}

fn info_for(name: &str, engine: &str, path: &Path, recommended: bool) -> BrowserInfo {
    BrowserInfo {
        id: name.to_lowercase().replace(' ', "-"),
        name: name.to_string(),
        path: path.to_string_lossy().to_string(),
        engine: engine.to_string(),
        widevine: has_widevine(path),
        recommended,
    }
}

pub fn detect() -> Vec<BrowserInfo> {
    let mut found: Vec<BrowserInfo> = Vec::new();
    let mut seen: Vec<String> = Vec::new();

    for spec in specs() {
        let path = spec
            .paths
            .iter()
            .find(|candidate| is_executable(candidate))
            .cloned()
            .or_else(|| which(spec.binaries));

        let Some(path) = path else { continue };

        let canonical = std::fs::canonicalize(&path).unwrap_or_else(|_| path.clone());
        let key = canonical.to_string_lossy().to_string();
        if seen.iter().any(|existing| existing == &key) {
            continue;
        }
        seen.push(key);

        found.push(info_for(spec.name, spec.engine, &canonical, false));
    }

    let best = found
        .iter()
        .position(|browser| browser.widevine)
        .or_else(|| if found.is_empty() { None } else { Some(0) });
    if let Some(index) = best {
        found[index].recommended = true;
    }

    found
}

pub fn check(path: &str) -> Option<BrowserInfo> {
    let trimmed = path.trim();
    if trimmed.is_empty() {
        return None;
    }

    let candidate = PathBuf::from(trimmed);
    let resolved = if candidate.is_absolute() {
        candidate
    } else {
        which(&[trimmed])?
    };
    let resolved = std::fs::canonicalize(&resolved).ok()?;

    if !is_executable(&resolved) {
        return None;
    }

    let name = display_name(&resolved);
    Some(info_for(&name, "chromium", &resolved, false))
}

pub fn open_external(url: &str) -> Result<(), String> {
    if !crate::model::is_web_url(url) {
        return Err("INVALID_URL".to_string());
    }

    #[cfg(target_os = "linux")]
    let mut command = {
        let mut command = Command::new("xdg-open");
        command.arg(url);
        command
    };

    #[cfg(target_os = "macos")]
    let mut command = {
        let mut command = Command::new("open");
        command.arg(url);
        command
    };

    #[cfg(target_os = "windows")]
    let mut command = {
        let mut command = Command::new("cmd");
        command.args(["/C", "start", "", url]);
        command
    };

    #[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
    let mut command = {
        let mut command = Command::new("xdg-open");
        command.arg(url);
        command
    };

    command
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map(|_| ())
        .map_err(|error| error.to_string())
}
