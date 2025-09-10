
'use client';

import * as React from 'react';

interface YouTubeEmbedProps {
  url: string;
}

export function YouTubeEmbed({ url }: YouTubeEmbedProps) {
  const getEmbedUrl = (youtubeUrl: string) => {
    try {
      const urlObj = new URL(youtubeUrl);
      const videoId = urlObj.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0`;
      }
    } catch (e) {
      console.error("Invalid YouTube URL", e);
    }

    // Fallback for youtu.be shortlinks or invalid formats
    const match = youtubeUrl.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/);
    const videoId = (match && match[1].length === 11) ? match[1] : null;

    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0` : null;
  };

  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return <div className="w-full h-full bg-black flex items-center justify-center text-white">Invalid YouTube URL</div>;
  }

  return (
    <div className="w-full h-full">
      <iframe
        width="100%"
        height="100%"
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
}
