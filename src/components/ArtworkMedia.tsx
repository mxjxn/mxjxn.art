"use client";
import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type { Artwork } from "@/lib/artworks";
import { publicUrl } from "@/lib/artworks";
import { ArtworkImage } from "./ArtworkImage";
import { ArtworkVideo } from "./ArtworkVideo";
export function ArtworkMedia({ work }: { work: Artwork }) {
  const [index, setIndex] = useState(0),
    [launched, setLaunched] = useState(false),
    [expanded, setExpanded] = useState(false);
  const media = work.media[index],
    src = publicUrl(media.src);
  const stage = () => (
    <div className="artwork-stage" key={src}>
      {media.type === "image" && (
        <ArtworkImage
          key={src}
          src={src}
          title={work.title}
          priority
          animated={work.animatedImage}
        />
      )}
      {(media.type === "video" || media.type === "hls") && (
        <ArtworkVideo
          key={src}
          src={src}
          title={work.title}
          poster={media.poster || work.thumbnail}
        />
      )}
      {(media.type === "interactive" || media.type === "model") &&
        (!launched || media.unavailable) &&
        media.poster && (
          <ArtworkImage
            src={publicUrl(media.poster)}
            title={work.title}
            priority
          />
        )}
      {media.type === "interactive" && launched && !media.unavailable && (
        <iframe
          src={src}
          title={work.title}
          sandbox="allow-scripts allow-pointer-lock"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
  const variants = () =>
    work.media.length > 1 && (
      <div
        className="media-variants"
        role="group"
        aria-label="Artwork variations"
      >
        {work.media.map((item, i) => (
          <button
            type="button"
            key={item.src}
            aria-pressed={index === i}
            onClick={() => {
              setIndex(i);
              setLaunched(false);
            }}
          >
            View {i + 1}
          </button>
        ))}
      </div>
    );
  return (
    <div>
      <div className="artwork-presentation">
        {!expanded ? stage() : <div className="artwork-stage stage-reserved" />}
        <button className="expand-artwork" onClick={() => setExpanded(true)}>
          Fullscreen ↗
        </button>
      </div>
      {media.type === "interactive" && (
        <div className="media-note">
          {media.unavailable ? (
            <p>
              The interactive original is currently unavailable. Shown here as a
              still image.
            </p>
          ) : (
            !launched && (
              <button type="button" onClick={() => setLaunched(true)}>
                Experience the interactive work
              </button>
            )
          )}
        </div>
      )}
      {media.type === "model" && (
        <p className="media-note">3D artwork · still view</p>
      )}
      {!expanded && variants()}
      <Dialog
        open={expanded}
        onClose={setExpanded}
        transition
        className="fullscreen-dialog"
      >
        <DialogPanel className="fullscreen-panel">
          <div className="fullscreen-bar">
            <DialogTitle>{work.title}</DialogTitle>
            <button
              onClick={() => setExpanded(false)}
              aria-label="Close fullscreen artwork"
            >
              Close ×
            </button>
          </div>
          {stage()}
          {variants()}
        </DialogPanel>
      </Dialog>
    </div>
  );
}
