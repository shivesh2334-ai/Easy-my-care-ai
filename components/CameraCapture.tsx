
import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, RefreshCw, Zap } from 'lucide-react';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64: string) => void;
  title: string;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ isOpen, onClose, onCapture, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Camera Error:", err);
      setError("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
      onCapture(base64);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black flex flex-col animate-in fade-in duration-300">
      <div className="p-4 flex justify-between items-center bg-black/40 backdrop-blur-md absolute top-0 w-full z-10">
        <div>
          <h3 className="text-white font-bold text-sm">{title}</h3>
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Live Capture Mode</p>
        </div>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="text-red-500" size={32} />
            </div>
            <p className="text-white font-bold">{error}</p>
            <button onClick={startCamera} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">Retry</button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            {/* Medical Focus Overlay */}
            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
              <div className="w-full h-full border-2 border-white/20 rounded-[2rem] relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-blue-500/50 rounded-full"></div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-10 bg-black/60 backdrop-blur-md flex justify-around items-center absolute bottom-0 w-full">
        <button className="p-4 bg-white/5 rounded-full text-white/40">
          <RefreshCw size={24} />
        </button>
        
        <button 
          onClick={capturePhoto}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-90 transition-transform"
        >
          <div className="w-full h-full bg-white rounded-full"></div>
        </button>

        <button className="p-4 bg-white/5 rounded-full text-white/40">
          <Zap size={24} />
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
