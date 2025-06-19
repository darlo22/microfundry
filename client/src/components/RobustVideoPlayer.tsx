import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RobustVideoPlayerProps {
  videoUrl: string;
  title: string;
  logoUrl?: string;
}

export function RobustVideoPlayer({ videoUrl, title, logoUrl }: RobustVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideoFile = videoUrl.match(/\.(mp4|mov|avi|webm|mkv)$/i);
  
  // Multiple video source URLs to try
  const videoSources = [
    `/api/stream/${videoUrl.replace(/^\/uploads\//, '')}`,
    videoUrl.startsWith('/') ? videoUrl : `/${videoUrl}`,
    `/uploads/${videoUrl.replace(/^\/uploads\//, '')}`,
  ];

  const resetPlayer = () => {
    setHasError(false);
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      resetPlayer();
      if (videoRef.current) {
        videoRef.current.load();
      }
    }
  };

  const handlePlay = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          await videoRef.current.play();
        }
      } catch (error) {
        console.error('Play failed:', error);
        setHasError(true);
      }
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const seekTime = percent * duration;
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // If it's not a video file, show image
  if (!isVideoFile) {
    return (
      <div className="w-full h-full relative bg-gray-900 flex items-center justify-center">
        <img 
          src={videoUrl.startsWith('/') ? videoUrl : `/${videoUrl}`} 
          alt={`${title} - Cover Image`}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Image failed to load:', videoUrl);
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        {/* Logo Overlay */}
        <div className="absolute bottom-4 left-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white border-4 border-white rounded-xl flex items-center justify-center overflow-hidden shadow-2xl">
            {logoUrl ? (
              <img 
                src={logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`} 
                alt={title}
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <span className="text-fundry-orange text-xl sm:text-2xl font-bold">
                {title.charAt(0)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError && retryCount >= 3) {
    return (
      <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center text-white p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold mb-2">Video Unavailable</h3>
          <p className="text-gray-300 mb-4">
            This video cannot be played at the moment. Please try again later.
          </p>
          <Button 
            onClick={() => {
              setRetryCount(0);
              handleRetry();
            }}
            className="bg-fundry-orange hover:bg-orange-600"
          >
            <RotateCcw className="mr-2" size={16} />
            Try Again
          </Button>
        </div>
        {/* Logo Overlay */}
        <div className="absolute bottom-4 left-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white border-4 border-white rounded-xl flex items-center justify-center overflow-hidden shadow-2xl">
            {logoUrl ? (
              <img 
                src={logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`} 
                alt={title}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <span className="text-fundry-orange text-xl sm:text-2xl font-bold">
                {title.charAt(0)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-black group">
      {/* Video Element with Multiple Sources */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        preload="metadata"
        playsInline
        poster={logoUrl ? (logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`) : undefined}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={(e) => {
          console.error('Video error occurred:', {
            currentSrc: videoRef.current?.currentSrc,
            error: videoRef.current?.error,
            networkState: videoRef.current?.networkState,
            readyState: videoRef.current?.readyState
          });
          setHasError(true);
          setIsLoading(false);
        }}
        onCanPlay={() => {
          setIsLoading(false);
          setHasError(false);
        }}
        onWaiting={() => setIsLoading(true)}
        onCanPlayThrough={() => setIsLoading(false)}
      >
        {/* Multiple source formats */}
        {videoSources.map((src, index) => (
          <source key={index} src={src} type="video/mp4" />
        ))}
        Your browser does not support the video tag.
      </video>

      {/* Loading Overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="animate-spin w-12 h-12 border-4 border-fundry-orange border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Custom Video Controls */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          onClick={handlePlay}
          disabled={isLoading || hasError}
          className="bg-black/70 hover:bg-black/90 text-white border-0 p-4 rounded-full"
          size="lg"
        >
          {isPlaying ? <Pause size={32} /> : <Play size={32} />}
        </Button>
      </div>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Progress Bar */}
        <div 
          className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-3"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-fundry-orange rounded-full transition-all duration-150"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <Button
              onClick={handlePlay}
              disabled={isLoading || hasError}
              variant="ghost"
              size="sm"
              className="text-white hover:text-fundry-orange p-1"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </Button>
            
            <Button
              onClick={handleMute}
              variant="ghost"
              size="sm"
              className="text-white hover:text-fundry-orange p-1"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </Button>

            <span className="text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {hasError && (
              <Button
                onClick={handleRetry}
                variant="ghost"
                size="sm"
                className="text-white hover:text-fundry-orange p-1"
              >
                <RotateCcw size={20} />
              </Button>
            )}
            
            <Button
              onClick={handleFullscreen}
              variant="ghost"
              size="sm"
              className="text-white hover:text-fundry-orange p-1"
            >
              <Maximize size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Logo Overlay */}
      <div className="absolute bottom-4 left-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white border-4 border-white rounded-xl flex items-center justify-center overflow-hidden shadow-2xl">
          {logoUrl ? (
            <img 
              src={logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`} 
              alt={title}
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <span className="text-fundry-orange text-xl sm:text-2xl font-bold">
              {title.charAt(0)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}