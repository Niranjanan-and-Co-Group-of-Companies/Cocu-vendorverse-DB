
'use client';

import * as React from 'react';

interface YouTubeEmbedProps {
  url: string;
}

export function YouTubeEmbed({ url }: YouTubeEmbedProps) {
  const getEmbedUrl = (youtubeUrl: string) => {
    let videoId: string | null = null;
    try {
      const urlObj = new URL(youtubeUrl);
      videoId = urlObj.searchParams.get("v");
    } catch (e) {
      // Fallback for shortlinks or invalid formats
      const match = youtubeUrl.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/);
      videoId = (match && match[1].length === 11) ? match[1] : null;
    }
    
    if (videoId) {
      // Parameters to make it a clean background video
      const params = new URLSearchParams({
        autoplay: '1',
        mute: '1',
        loop: '1',
        playlist: videoId, // Required for loop to work
        controls: '0',     // Hide player controls
        showinfo: '0',     // Hide video title and uploader
        modestbranding: '1', // Hide YouTube logo
        fs: '0',           // Hide fullscreen button
        iv_load_policy: '3', // Hide annotations
      });
      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    }

    return null;
  };

  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return <div className="w-full h-full bg-black flex items-center justify-center text-white">Invalid YouTube URL</div>;
  }

  return (
    <div className="w-full h-full overflow-hidden">
      <iframe
        className="w-full h-full scale-[1.5]"
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
}
