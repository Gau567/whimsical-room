"use client";

import { Track } from "@/lib/types";
import { RetroMediaFile } from "@/lib/retroMedia";

type Props = {
  file: RetroMediaFile;
  tracks: Track[];
  onPlayTrack: (track: Track) => void;
  onLaunchGame: () => void;
};

function FileArt({ visual }: { visual?: RetroMediaFile["visual"] }) {
  return (
    <div className={`retro-image-canvas retro-image-${visual || "desk"}`} aria-label="Retro bitmap preview">
      <div className="retro-image-noise" />
      {visual === "sunset" && <><span className="pixel-sun" /><i className="pixel-horizon" /><b className="pixel-date">08 14 98</b></>}
      {visual === "arcade" && <><span className="arcade-cab cab-a" /><span className="arcade-cab cab-b" /><span className="arcade-cab cab-c" /><b className="pixel-date">11:42 PM</b></>}
      {visual === "desk" && <><span className="bitmap-monitor" /><span className="bitmap-lamp" /><span className="bitmap-mug" /></>}
      {visual === "stars" && <><span className="star-pixel s1">✦</span><span className="star-pixel s2">✧</span><span className="star-pixel s3">✦</span><span className="star-pixel s4">·</span><span className="star-pixel s5">✧</span></>}
    </div>
  );
}

export default function RetroFileViewer({ file, tracks, onPlayTrack, onLaunchGame }: Props) {
  if (file.type === "image") {
    return (
      <div className="retro-file-app image-viewer-app">
        <div className="retro-app-titlebar"><span>IMAGE VIEWER — {file.name}</span><span>100%</span></div>
        <FileArt visual={file.visual} />
        <p className="retro-file-caption">{file.content}</p>
      </div>
    );
  }

  if (file.type === "playlist") {
    const playlist = (file.trackIds || []).map((id) => tracks.find((track) => track.id === id)).filter(Boolean) as Track[];
    return (
      <div className="retro-file-app playlist-viewer-app">
        <div className="retro-app-titlebar"><span>PLAYLIST PLAYER — {file.name}</span><span>{playlist.length} tracks</span></div>
        <p className="playlist-description">{file.content}</p>
        <ol className="retro-playlist-list">
          {playlist.map((track, index) => (
            <li key={track.id}>
              <button type="button" onClick={() => onPlayTrack(track)}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{track.title}</strong>
                <small>{track.artist}</small>
                <b>▶</b>
              </button>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (file.type === "game") {
    return (
      <div className="retro-file-app executable-viewer-app">
        <div className="retro-app-titlebar"><span>PROGRAM MANAGER</span><span>EXE</span></div>
        <div className="exe-icon">☄</div>
        <h4>{file.name}</h4>
        <pre>{file.content}</pre>
        {file.executable === "starmaze" && <button type="button" className="retro-run-button" onClick={onLaunchGame}>RUN PROGRAM</button>}
      </div>
    );
  }

  const mode = file.type === "log" ? "SYSTEM LOG" : file.type === "data" ? "HEX VIEWER" : "NOTEPAD";
  return (
    <div className={`retro-file-app notepad-viewer-app file-mode-${file.type}`}>
      <div className="retro-app-titlebar"><span>{mode} — {file.name}</span><span>{file.content.length} bytes</span></div>
      <div className="notepad-menu">File&nbsp;&nbsp; Edit&nbsp;&nbsp; Search&nbsp;&nbsp; Help</div>
      <pre className="notepad-paper">{file.content}</pre>
    </div>
  );
}
