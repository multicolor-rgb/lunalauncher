use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};

use gilrs::{Axis, Button, EventType, Gilrs, PowerInfo};
use tauri::{AppHandle, Emitter, Manager};

use crate::model::{GamepadPayload, PadInfo};
use crate::AppState;

const DEADZONE: f32 = 0.55;

pub fn spawn(app: AppHandle, paused: Arc<AtomicBool>) {
    std::thread::spawn(move || {
        let mut gilrs = match Gilrs::new() {
            Ok(gilrs) => gilrs,
            Err(error) => {
                eprintln!("lunaclient: gamepad backend unavailable: {error}");
                let _ = app.emit("gamepad://error", error.to_string());
                return;
            }
        };

        let mut last_axis = (f32::NAN, f32::NAN);
        let mut reported: Vec<PadInfo> = Vec::new();
        let mut last_status = Instant::now() - Duration::from_secs(10);
        let mut was_paused = false;

        loop {
            let is_paused = paused.load(Ordering::SeqCst);
            if was_paused && !is_paused {
                last_axis = (f32::NAN, f32::NAN);
            }
            was_paused = is_paused;

            while let Some(event) = gilrs.next_event() {
                if is_paused {
                    continue;
                }
                match event.event {
                    EventType::ButtonPressed(button, _) => {
                        if let Some(control) = control_for(button) {
                            emit_button(&app, control, true);
                        }
                    }
                    EventType::ButtonReleased(button, _) => {
                        if let Some(control) = control_for(button) {
                            emit_button(&app, control, false);
                        }
                    }
                    EventType::Connected | EventType::Disconnected => {
                        last_status = Instant::now() - Duration::from_secs(10);
                    }
                    _ => {}
                }
            }

            if !is_paused {
                if let Some((_, gamepad)) = gilrs.gamepads().next() {
                    let raw_x = gamepad.value(Axis::LeftStickX);
                    let raw_y = gamepad.value(Axis::LeftStickY);
                    let x = if raw_x.abs() < DEADZONE { 0.0 } else { raw_x };
                    let y = if raw_y.abs() < DEADZONE { 0.0 } else { raw_y };

                    let changed = !last_axis.0.is_finite()
                        || !last_axis.1.is_finite()
                        || (x - last_axis.0).abs() > 0.02
                        || (y - last_axis.1).abs() > 0.02;

                    if changed {
                        last_axis = (x, y);
                        let _ = app.emit(
                            "gamepad://input",
                            GamepadPayload {
                                control: None,
                                pressed: None,
                                axis: Some("left".to_string()),
                                x: Some(x as f64),
                                y: Some(y as f64),
                            },
                        );
                    }
                }
            }

            if last_status.elapsed() >= Duration::from_secs(2) {
                last_status = Instant::now();
                let pads: Vec<PadInfo> = gilrs
                    .gamepads()
                    .map(|(id, gamepad)| PadInfo {
                        id: format!("{id:?}"),
                        name: gamepad.name().to_string(),
                        battery: battery_label(gamepad.power_info()),
                        connected: gamepad.is_connected(),
                    })
                    .collect();

                if pads != reported {
                    reported = pads.clone();
                    {
                        let state = app.state::<AppState>();
                        if let Ok(mut shared) = state.pads.lock() {
                            *shared = pads.clone();
                        };
                    }
                    let _ = app.emit("gamepad://pads", pads);
                }
            }

            std::thread::sleep(Duration::from_millis(if is_paused { 20 } else { 8 }));
        }
    });
}

fn emit_button(app: &AppHandle, control: &str, pressed: bool) {
    let _ = app.emit(
        "gamepad://input",
        GamepadPayload {
            control: Some(control.to_string()),
            pressed: Some(pressed),
            axis: None,
            x: None,
            y: None,
        },
    );
}

fn control_for(button: Button) -> Option<&'static str> {
    let control = match button {
        Button::South => "south",
        Button::East => "east",
        Button::West => "west",
        Button::North => "north",
        Button::LeftTrigger | Button::LeftTrigger2 => "left_bumper",
        Button::RightTrigger | Button::RightTrigger2 => "right_bumper",
        Button::Start => "start",
        Button::Select | Button::Mode => "select",
        Button::DPadUp => "dpad_up",
        Button::DPadDown => "dpad_down",
        Button::DPadLeft => "dpad_left",
        Button::DPadRight => "dpad_right",
        _ => return None,
    };
    Some(control)
}

fn battery_label(info: PowerInfo) -> String {
    let label = match info {
        PowerInfo::Wired => "wired",
        PowerInfo::Charged => "full",
        PowerInfo::Charging(_) => "wired",
        PowerInfo::Discharging(level) if level >= 90 => "full",
        PowerInfo::Discharging(level) if level >= 60 => "high",
        PowerInfo::Discharging(level) if level >= 30 => "medium",
        PowerInfo::Discharging(level) if level > 5 => "low",
        PowerInfo::Discharging(_) => "empty",
        _ => "unknown",
    };
    label.to_string()
}
