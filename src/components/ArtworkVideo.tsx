"use client";
import { useEffect, useRef, useState } from "react";
export function ArtworkVideo({
  src,
  title,
  poster,
  preview = false,
  motionPreview = false,
  active = true,
  onPreviewState,
  onPreviewProgress,
  onPreviewLoaded,
}: {
  src: string;
  title: string;
  poster?: string | null;
  preview?: boolean;
  motionPreview?: boolean;
  active?: boolean;
  onPreviewState?: (state: "loading" | "playing" | "failed") => void;
  onPreviewProgress?: (progress: number) => void;
  onPreviewLoaded?: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<import("hls.js").default>();
  const activeRef = useRef(active);
  activeRef.current = active;
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const stateCallback = useRef(onPreviewState);
  stateCallback.current = onPreviewState;
  useEffect(() => {
    if (failed) stateCallback.current?.("failed");
  }, [failed]);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let stopped = false,
      started = false,
      observer: IntersectionObserver | undefined;
    let player: import("hls.js").default | undefined;
    setFailed(false);
    setPlaying(false);
    const start = async () => {
      if (stopped || started) return;
      started = true;
      if (
        src.includes(".m3u8") &&
        !video.canPlayType("application/vnd.apple.mpegurl")
      ) {
        const { default: Hls } = await import("hls.js");
        if (stopped) return;
        if (!Hls.isSupported()) {
          setFailed(true);
          return;
        }
        player = new Hls({
          capLevelToPlayerSize: true,
          maxBufferLength: preview ? 2 : 20,
          maxMaxBufferLength: preview ? 4 : 30,
          backBufferLength: motionPreview ? 30 : 0,
        });
        playerRef.current = player;
        player.on(Hls.Events.ERROR, (_, event) => {
          if (event.fatal) setFailed(true);
        });
        player.loadSource(src);
        player.attachMedia(video);
      } else {
        video.src = src;
      }
    };
    const loaded = () => {
      if (motionPreview) {
        if (!activeRef.current) {
          player?.stopLoad();
          return;
        }
        void video.play().catch(() => {
          if (!stopped && activeRef.current) setFailed(true);
        });
      } else if (preview) {
        video.currentTime = Math.min(0.1, video.duration / 2 || 0.1);
        player?.stopLoad();
      }
    };
    video.addEventListener("loadeddata", loaded, { once: true });
    if (preview && !motionPreview) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            void start().catch(() => setFailed(true));
            observer?.disconnect();
          }
        },
        { rootMargin: "100px" },
      );
      observer.observe(video);
    } else void start().catch(() => setFailed(true));
    return () => {
      stopped = true;
      observer?.disconnect();
      video.removeEventListener("loadeddata", loaded);
      player?.destroy();
      playerRef.current = undefined;
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [src, preview, motionPreview]);
  useEffect(() => {
    if (!motionPreview) return;
    const video = ref.current;
    if (!video) return;
    if (!active) {
      video.pause();
      playerRef.current?.stopLoad();
      setPlaying(false);
      return;
    }
    playerRef.current?.startLoad(-1);
    if (video.readyState >= 2) {
      void video.play().catch(() => {
        if (activeRef.current) setFailed(true);
      });
    }
  }, [active, motionPreview]);
  return (
    <div
      className={
        motionPreview
          ? `motion-preview${active && playing && !failed ? " is-playing" : ""}`
          : preview
            ? "video-preview"
            : "video-player"
      }
    >
      <video
        ref={ref}
        poster={poster || undefined}
        controls={!preview && !motionPreview}
        muted={preview || motionPreview}
        tabIndex={motionPreview ? -1 : undefined}
        aria-hidden={motionPreview || undefined}
        onLoadedData={onPreviewLoaded}
        onPlaying={() => {
          setPlaying(true);
          onPreviewState?.("playing");
        }}
        onWaiting={() => onPreviewState?.("loading")}
        onTimeUpdate={(event) => {
          const video = event.currentTarget;
          if (Number.isFinite(video.duration) && video.duration > 0)
            onPreviewProgress?.(
              Math.min(1, video.currentTime / video.duration),
            );
        }}
        playsInline
        loop
        preload="metadata"
        aria-label={title}
        onError={() => setFailed(true)}
      />
      {failed && !motionPreview && (
        <p className="media-note">This film is temporarily unavailable.</p>
      )}
      {preview && <span className="film-label">Film</span>}
    </div>
  );
}
