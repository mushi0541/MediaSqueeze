use std::time::Instant;
use regex::Regex;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, Emitter};
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;

// ── Types ──────────────────────────────────────────────────────────

#[derive(Serialize, Clone)]
pub struct SystemMetrics {
    pub cpu: f32,
    pub mem_used: f64,
    pub mem_total: f64,
}

#[derive(Serialize, Clone)]
pub struct ProgressPayload {
    pub pct:         f64,
    pub eta_seconds: f64,
    pub fps:         f64,
}

#[derive(Serialize)]
pub struct VideoInfo {
    pub duration: f64,
    pub width:    u32,
    pub height:   u32,
    pub codec:    String,
    pub fps:      f64,
    pub size:     u64,
}

#[derive(Serialize)]
pub struct ImageInfo {
    pub width:  u32,
    pub height: u32,
    pub format: String,
    pub size:   u64,
}

#[derive(Serialize)]
pub struct CompressResult {
    pub output_path: String,
    pub output_size: u64,
}

#[derive(Deserialize, Debug)]
struct FfprobeFormat {
    duration: Option<String>,
    size:     String,
}

#[derive(Deserialize, Debug)]
struct FfprobeStream {
    codec_name:   Option<String>,
    codec_type:   Option<String>,
    width:        Option<u32>,
    height:       Option<u32>,
    r_frame_rate: Option<String>,
}

#[derive(Deserialize, Debug)]
struct FfprobeOutput {
    format:  FfprobeFormat,
    streams: Vec<FfprobeStream>,
}

// ── Helpers ────────────────────────────────────────────────────────

fn parse_hms(s: &str) -> Option<f64> {
    let s = s.trim();
    let parts: Vec<&str> = s.split(':').collect();
    if parts.len() != 3 { return None; }
    let h: f64 = parts[0].parse().ok()?;
    let m: f64 = parts[1].parse().ok()?;
    let sec: f64 = parts[2].parse().ok()?;
    Some(h * 3600.0 + m * 60.0 + sec)
}

fn parse_frame_rate(s: &str) -> f64 {
    let parts: Vec<&str> = s.split('/').collect();
    if parts.len() == 2 {
        let num: f64 = parts[0].parse().unwrap_or(0.0);
        let den: f64 = parts[1].parse().unwrap_or(1.0);
        if den > 0.0 { return num / den; }
    }
    0.0
}

fn auto_rename(output_path: &str) -> String {
    let path = std::path::Path::new(output_path);
    if !path.exists() {
        return output_path.to_string();
    }
    let stem = path.file_stem().and_then(|s| s.to_str()).unwrap_or("output");
    let ext  = path.extension().and_then(|e| e.to_str()).unwrap_or("mp4");
    let dir  = path.parent().map(|p| p.to_str().unwrap_or("")).unwrap_or("");
    let mut counter = 1u32;
    loop {
        let candidate = format!("{}\\{}_{}.{}", dir, stem, counter, ext);
        if !std::path::Path::new(&candidate).exists() {
            return candidate;
        }
        counter += 1;
    }
}

fn build_ffmpeg_args(
    input_path:   &str,
    output_path:  &str,
    crf:          u8,
    preset_name:  &str,
    resolution:   &str,
    format:       &str,
    remove_audio: bool,
    hw_accel:     &str,
) -> Vec<String> {
    let mut args = vec![
        "-y".into(),
        "-i".into(), input_path.to_string(),
    ];

    match hw_accel {
        "nvenc" => {
            args.extend(["-vcodec".into(), "h264_nvenc".into()]);
            args.extend(["-cq".into(), crf.to_string()]); // NVENC uses -cq instead of -crf
            args.extend(["-preset".into(), preset_name.to_string()]);
        }
        "amf" => {
            args.extend(["-vcodec".into(), "h264_amf".into()]);
            args.extend(["-rc".into(), "cqp".into()]);
            args.extend(["-qp_i".into(), crf.to_string()]);
            args.extend(["-qp_p".into(), crf.to_string()]);
            // AMF presets are different, fallback to safe defaults or skip
        }
        "qsv" => {
            args.extend(["-vcodec".into(), "h264_qsv".into()]);
            args.extend(["-q".into(), crf.to_string()]);
            args.extend(["-preset".into(), preset_name.to_string()]);
        }
        _ => { // "cpu"
            args.extend(["-vcodec".into(), "libx264".into()]);
            args.extend(["-crf".into(), crf.to_string()]);
            args.extend(["-preset".into(), preset_name.to_string()]);
        }
    }

    match resolution {
        "4k"    => { args.push("-vf".into()); args.push("scale=-2:2160".into()); }
        "1080p" => { args.push("-vf".into()); args.push("scale=-2:1080".into()); }
        "720p"  => { args.push("-vf".into()); args.push("scale=-2:720".into());  }
        "480p"  => { args.push("-vf".into()); args.push("scale=-2:480".into());  }
        _       => {}
    }

    if remove_audio {
        args.push("-an".into());
    } else {
        let ab = if crf <= 20 { "192k" } else if crf <= 28 { "128k" } else { "96k" };
        args.extend(["-acodec".into(), "aac".into(), "-b:a".into(), ab.into()]);
    }

    if format == "mp4" {
        args.extend(["-movflags".into(), "+faststart".into()]);
    }

    args.extend(["-f".into(), format.to_string()]);
    args.push(output_path.to_string());
    args
}

fn preset_ffmpeg_name(preset: &str) -> &'static str {
    match preset {
        "low"  => "fast",
        "high" => "slow",
        _      => "medium",
    }
}

// ── Commands ────────────────────────────────────────────────────────

#[tauri::command]
pub async fn check_ffmpeg(app: AppHandle) -> Result<bool, String> {
    let output = app
        .shell()
        .sidecar("ffmpeg")
        .map_err(|e| e.to_string())?
        .args(["-version"])
        .output()
        .await
        .map_err(|e| e.to_string())?;
    Ok(output.status.success())
}

#[tauri::command]
pub async fn get_video_info(
    app: AppHandle,
    path: String,
) -> Result<VideoInfo, String> {
    let output = app
        .shell()
        .sidecar("ffprobe")
        .map_err(|e| e.to_string())?
        .args([
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            &path,
        ])
        .output()
        .await
        .map_err(|e| e.to_string())?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let parsed: FfprobeOutput = serde_json::from_str(&stdout)
        .map_err(|e| format!("ffprobe parse error: {e}"))?;

    let duration: f64 = parsed.format.duration
        .as_deref()
        .and_then(|d| d.parse().ok())
        .unwrap_or(0.0);
    let size: u64 = parsed.format.size.parse().unwrap_or(0);

    let video_stream = parsed.streams.iter()
        .find(|s| s.codec_type.as_deref() == Some("video"));

    let width  = video_stream.and_then(|s| s.width).unwrap_or(0);
    let height = video_stream.and_then(|s| s.height).unwrap_or(0);
    let codec  = video_stream
        .and_then(|s| s.codec_name.clone())
        .unwrap_or_else(|| "unknown".into());
    let fps = video_stream
        .and_then(|s| s.r_frame_rate.as_deref())
        .map(parse_frame_rate)
        .unwrap_or(0.0);

    Ok(VideoInfo { duration, width, height, codec, fps, size })
}

#[tauri::command]
pub async fn get_image_info(
    app: AppHandle,
    path: String,
) -> Result<ImageInfo, String> {
    let output = app
        .shell()
        .sidecar("ffprobe")
        .map_err(|e| e.to_string())?
        .args([
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            &path,
        ])
        .output()
        .await
        .map_err(|e| e.to_string())?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let parsed: FfprobeOutput = serde_json::from_str(&stdout)
        .map_err(|e| format!("ffprobe parse error: {e}"))?;

    let size: u64 = parsed.format.size.parse().unwrap_or_else(|_| {
        std::fs::metadata(&path).map(|m| m.len()).unwrap_or(0)
    });

    let img_stream = parsed.streams.iter()
        .find(|s| s.codec_type.as_deref() == Some("video"));

    let width  = img_stream.and_then(|s| s.width).unwrap_or(0);
    let height = img_stream.and_then(|s| s.height).unwrap_or(0);
    let format = img_stream
        .and_then(|s| s.codec_name.clone())
        .unwrap_or_else(|| "unknown".into());

    Ok(ImageInfo { width, height, format, size })
}

#[tauri::command]
pub async fn compress_video(
    app:          AppHandle,
    input_path:   String,
    output_path:  String,
    crf:          u8,
    preset:       String,
    resolution:   String,
    format:       String,
    remove_audio: bool,
    hw_accel:     String,
) -> Result<CompressResult, String> {
    let final_output = auto_rename(&output_path);

    let args = build_ffmpeg_args(
        &input_path,
        &final_output,
        crf,
        preset_ffmpeg_name(&preset),
        &resolution,
        &format,
        remove_audio,
        &hw_accel,
    );

    let (mut rx, child) = app
        .shell()
        .sidecar("ffmpeg")
        .map_err(|e| e.to_string())?
        .args(&args)
        .spawn()
        .map_err(|e| e.to_string())?;

    {
        let state = app.state::<crate::state::AppState>();
        *state.ffmpeg_child.lock().unwrap() = Some(child);
    }

    let duration_re = Regex::new(r"Duration:\s*(\d+:\d+:\d+\.\d+)").unwrap();
    let time_re     = Regex::new(r"time=(\d+:\d+:\d+\.\d+)").unwrap();
    let fps_re      = Regex::new(r"fps=\s*(\d+\.?\d*)").unwrap();

    let mut total_secs: f64 = 0.0;
    let start         = Instant::now();
    let mut stderr_tail: Vec<String> = Vec::new();

    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stderr(line_bytes) => {
                let line = String::from_utf8_lossy(&line_bytes).to_string();
                stderr_tail.push(line.clone());
                if stderr_tail.len() > 20 { stderr_tail.remove(0); }

                if total_secs == 0.0 {
                    if let Some(cap) = duration_re.captures(&line) {
                        if let Some(d) = parse_hms(&cap[1]) {
                            total_secs = d;
                        }
                    }
                }

                if total_secs > 0.0 {
                    if let Some(tcap) = time_re.captures(&line) {
                        if let Some(cur) = parse_hms(&tcap[1]) {
                            let pct = (cur / total_secs * 100.0).min(99.9);
                            let elapsed = start.elapsed().as_secs_f64();
                            let eta = if pct > 0.1 {
                                elapsed / pct * (100.0 - pct)
                            } else { 0.0 };

                            let fps: f64 = fps_re.captures(&line)
                                .and_then(|c| c[1].parse().ok())
                                .unwrap_or(0.0);

                            let _ = app.emit("compress-progress", ProgressPayload {
                                pct,
                                eta_seconds: eta,
                                fps,
                            });
                        }
                    }
                }
            }
            CommandEvent::Terminated(status) => {
                let state = app.state::<crate::state::AppState>();
                *state.ffmpeg_child.lock().unwrap() = None;

                let code = status.code.unwrap_or(1);
                if code != 0 {
                    let _ = std::fs::remove_file(&final_output);
                    let tail = stderr_tail.join("\n");
                    return Err(format!("FFmpeg exited with code {code}:\n{tail}"));
                }
                break;
            }
            _ => {}
        }
    }

    let _ = app.emit("compress-progress", ProgressPayload { pct: 100.0, eta_seconds: 0.0, fps: 0.0 });

    let output_size = std::fs::metadata(&final_output)
        .map(|m| m.len())
        .unwrap_or(0);

    Ok(CompressResult { output_path: final_output, output_size })
}

#[tauri::command]
pub async fn compress_image(
    app:            AppHandle,
    input_path:     String,
    output_path:    String,
    quality:        u8,
    format:         String,
    strip_metadata: bool,
) -> Result<CompressResult, String> {
    let final_output = auto_rename(&output_path);

    let mut args: Vec<String> = vec![
        "-y".into(),
        "-i".into(), input_path.clone(),
    ];

    match format.as_str() {
        "webp" => {
            // FFmpeg quality for webp: -q:v 0-100 (0=worst, 100=best)
            args.extend(["-c:v".into(), "libwebp".into()]);
            args.extend(["-q:v".into(), quality.to_string()]);
        }
        "png" => {
            // PNG is lossless — ignore quality
            args.extend(["-c:v".into(), "png".into()]);
        }
        _ => {
            // JPG: q:v maps 1-31 (1=best, 31=worst). Map quality 1-100 to 31-1
            let qv = 31 - ((quality as f64 / 100.0) * 30.0) as u8;
            args.extend(["-q:v".into(), qv.to_string()]);
        }
    }

    if strip_metadata {
        args.extend(["-map_metadata".into(), "-1".into()]);
    }

    args.push(final_output.clone());

    // Emit a fake 50% progress since image compression is near-instant
    let _ = app.emit("compress-progress", ProgressPayload { pct: 50.0, eta_seconds: 1.0, fps: 0.0 });

    let output = app
        .shell()
        .sidecar("ffmpeg")
        .map_err(|e| e.to_string())?
        .args(&args)
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        let _ = std::fs::remove_file(&final_output);
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("FFmpeg image compression failed:\n{stderr}"));
    }

    let _ = app.emit("compress-progress", ProgressPayload { pct: 100.0, eta_seconds: 0.0, fps: 0.0 });

    let output_size = std::fs::metadata(&final_output)
        .map(|m| m.len())
        .unwrap_or(0);

    Ok(CompressResult { output_path: final_output, output_size })
}

#[tauri::command]
pub fn cancel_compression(app: AppHandle) -> Result<(), String> {
    let state = app.state::<crate::state::AppState>();
    let mut guard = state.ffmpeg_child.lock().unwrap();
    if let Some(child) = guard.take() {
        child.kill().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn load_history(app: AppHandle) -> Result<String, String> {
    let data_dir = app.path().app_data_dir()
        .map_err(|e| e.to_string())?;
    let history_path = data_dir.join("history.json");
    if history_path.exists() {
        std::fs::read_to_string(&history_path).map_err(|e| e.to_string())
    } else {
        Ok("[]".to_string())
    }
}

#[tauri::command]
pub async fn save_history(app: AppHandle, entries_json: String) -> Result<(), String> {
    let data_dir = app.path().app_data_dir()
        .map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;
    let history_path = data_dir.join("history.json");
    std::fs::write(history_path, entries_json).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn reveal_file(app: AppHandle, path: String) -> Result<(), String> {
    use tauri_plugin_opener::OpenerExt;
    app.opener()
        .reveal_item_in_dir(&path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_system_metrics(app: AppHandle) -> Result<SystemMetrics, String> {
    let state = app.state::<crate::state::AppState>();
    let mut sys = state.sys.lock().map_err(|e| e.to_string())?;
    sys.refresh_cpu_usage();
    sys.refresh_memory();
    
    let cpu = sys.global_cpu_usage();
    let mem_used = sys.used_memory() as f64 / 1_048_576.0; // MB
    let mem_total = sys.total_memory() as f64 / 1_048_576.0; // MB
    
    Ok(SystemMetrics {
        cpu,
        mem_used,
        mem_total,
    })
}
