import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  X,
  Check,
  AlertCircle,
  Sparkles,
  SwitchCamera,
  ShieldAlert,
} from 'lucide-react';

interface PhotoCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoSelected: (photo: { url: string; name: string }) => void;
  title?: string;
}

export const PhotoCaptureModal: React.FC<PhotoCaptureModalProps> = ({
  isOpen,
  onClose,
  onPhotoSelected,
  title = 'Take or Upload Emergency Scene Photo',
}) => {
  const [activeMode, setActiveMode] = useState<'CAMERA' | 'UPLOAD' | 'PRESET'>('CAMERA');
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize camera stream when in CAMERA mode and modal is open
  useEffect(() => {
    if (!isOpen || activeMode !== 'CAMERA' || capturedPhotoUrl) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode, facingMode, capturedPhotoUrl]);

  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device access is not supported by this browser.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // Fallback without specific facingMode
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Video play interrupted', e));
      }
    } catch (err: any) {
      console.warn('Camera access failed:', err);
      setCameraError(
        err.message || 'Unable to access camera. Please allow camera permissions, or switch to upload or preset.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Add a high-visibility emergency watermark
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, canvas.height - 36, canvas.width, 36);
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('SCG EMERGENCY BEACON', 12, canvas.height - 14);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText(new Date().toLocaleTimeString(), 210, canvas.height - 14);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    const filename = `sos_photo_${Date.now()}.jpg`;
    setCapturedPhotoUrl(dataUrl);
    setPhotoName(filename);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedPhotoUrl(null);
    setPhotoName('');
  };

  const toggleCameraFacing = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid format. Please select a JPEG, PNG, or WebP photo.');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File is too large (max 10MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      if (typeof ev.target?.result === 'string') {
        setCapturedPhotoUrl(ev.target.result);
        setPhotoName(file.name);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read photo file.');
    };
    reader.readAsDataURL(file);
  };

  // Generate high quality simulated emergency photo SVG data URIs for instant testing
  const generatePreset = (type: 'FIRE' | 'INTRUDER' | 'MEDICAL' | 'HAZARD') => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (type === 'FIRE') {
      const grad = ctx.createLinearGradient(0, 0, 0, 480);
      grad.addColorStop(0, '#1a0500');
      grad.addColorStop(0.5, '#7f1d1d');
      grad.addColorStop(1, '#ea580c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      ctx.fillStyle = '#fee2e2';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('🔥 ACTIVE SMOKE / FIRE HAZARD', 60, 220);
      ctx.font = '16px monospace';
      ctx.fillText('Science Complex Wing B - 2nd Floor Corridor', 60, 260);
    } else if (type === 'INTRUDER') {
      const grad = ctx.createLinearGradient(0, 0, 0, 480);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('⚠️ SUSPICIOUS ACTIVITY / FORCED ENTRY', 50, 220);
      ctx.font = '16px monospace';
      ctx.fillText('East Parking Structure - Level 3 Stairwell Door', 50, 260);
    } else if (type === 'MEDICAL') {
      const grad = ctx.createLinearGradient(0, 0, 0, 480);
      grad.addColorStop(0, '#042f2e');
      grad.addColorStop(1, '#115e59');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      ctx.fillStyle = '#99f6e4';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('🩹 MEDICAL FIRST-AID SCENE', 80, 220);
      ctx.font = '16px monospace';
      ctx.fillText('South Quad Dorm C - Immediate EMT Response Needed', 80, 260);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, 480);
      grad.addColorStop(0, '#1c1917');
      grad.addColorStop(1, '#44403c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('⚡ FACILITY / INFRASTRUCTURE HAZARD', 60, 220);
      ctx.font = '16px monospace';
      ctx.fillText('Library West Walkway - Downed Lighting Fixture', 60, 260);
    }

    // Watermark
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 444, 640, 36);
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('SCG EMERGENCY INCIDENT WATERMARK', 12, 468);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText(new Date().toLocaleTimeString(), 320, 468);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhotoUrl(dataUrl);
    setPhotoName(`simulated_${type.toLowerCase()}_photo.jpg`);
  };

  const handleConfirm = () => {
    if (!capturedPhotoUrl) return;
    onPhotoSelected({
      url: capturedPhotoUrl,
      name: photoName || `emergency_photo_${Date.now()}.jpg`,
    });
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl space-y-4">
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-600/20 text-rose-400 rounded-lg">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="text-[11px] text-slate-400">
                Direct transmission to Campus Safety & Security Dispatch
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs (only if not already previewing a photo) */}
        {!capturedPhotoUrl && (
          <div className="px-5 flex items-center gap-2">
            <button
              onClick={() => setActiveMode('CAMERA')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeMode === 'CAMERA'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Device Camera</span>
            </button>
            <button
              onClick={() => setActiveMode('UPLOAD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeMode === 'UPLOAD'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>
            <button
              onClick={() => setActiveMode('PRESET')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeMode === 'PRESET'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Presets</span>
            </button>
          </div>
        )}

        {/* Body Container */}
        <div className="px-5 space-y-4">
          {/* PHOTO PREVIEW (if captured) */}
          {capturedPhotoUrl ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500 bg-black aspect-video flex items-center justify-center">
                <img
                  src={capturedPhotoUrl}
                  alt="Captured emergency evidence"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur px-2.5 py-1 rounded text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>PHOTO READY TO TRANSMIT</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono truncate max-w-[280px]">{photoName}</span>
                <button
                  onClick={handleRetake}
                  className="text-rose-400 hover:text-rose-300 font-bold underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake / Change Photo</span>
                </button>
              </div>
            </div>
          ) : activeMode === 'CAMERA' ? (
            /* LIVE CAMERA VIEWFINDER */
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Camera reticle / guides */}
                <div className="absolute inset-4 border border-white/30 rounded-lg pointer-events-none flex items-center justify-center">
                  <div className="w-8 h-8 border-t-2 border-l-2 border-rose-500 absolute top-0 left-0" />
                  <div className="w-8 h-8 border-t-2 border-r-2 border-rose-500 absolute top-0 right-0" />
                  <div className="w-8 h-8 border-b-2 border-l-2 border-rose-500 absolute bottom-0 left-0" />
                  <div className="w-8 h-8 border-b-2 border-r-2 border-rose-500 absolute bottom-0 right-0" />
                  <span className="text-[10px] text-white/70 font-mono tracking-widest bg-black/40 px-2 py-0.5 rounded">
                    LIVE SCENE VIEWFINDER
                  </span>
                </div>

                {/* Flip camera button */}
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  title="Switch camera"
                  className="absolute bottom-3 right-3 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white border border-slate-600 transition"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
              </div>

              {cameraError && (
                <div className="p-3 bg-amber-950/80 border border-amber-600 rounded-xl text-amber-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Camera Notification:</span> {cameraError}
                    <div className="mt-1">
                      <button
                        onClick={() => setActiveMode('UPLOAD')}
                        className="underline text-white font-bold"
                      >
                        Click here to upload from file instead
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Shutter Button */}
              <button
                type="button"
                onClick={captureFrame}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Snap Scene Photo</span>
              </button>
            </div>
          ) : activeMode === 'UPLOAD' ? (
            /* UPLOAD FILE TAB */
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-rose-500/80 rounded-xl p-8 text-center cursor-pointer transition bg-slate-950/50 space-y-2"
              >
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-rose-400">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Select Photo from Device</h4>
                <p className="text-xs text-slate-400">
                  PNG, JPEG, or WebP (up to 10MB)
                </p>
                <span className="inline-block mt-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg">
                  Browse Gallery / Files
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                className="hidden"
                onChange={handleFileUpload}
              />

              {uploadError && (
                <div className="p-3 bg-red-950/80 border border-red-600 rounded-xl text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          ) : (
            /* SIMULATED PRESETS TAB */
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Quickly simulate an on-scene emergency photograph without turning on a device webcam:
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => generatePreset('FIRE')}
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-amber-500 rounded-xl text-left transition"
                >
                  <span className="text-xs font-bold text-white block">🔥 Fire / Smoke</span>
                  <span className="text-[10px] text-slate-400">Simulate science quad fire</span>
                </button>
                <button
                  type="button"
                  onClick={() => generatePreset('INTRUDER')}
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-red-500 rounded-xl text-left transition"
                >
                  <span className="text-xs font-bold text-white block">⚠️ Forced Entry</span>
                  <span className="text-[10px] text-slate-400">Simulate stairwell lock tampering</span>
                </button>
                <button
                  type="button"
                  onClick={() => generatePreset('MEDICAL')}
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-emerald-500 rounded-xl text-left transition"
                >
                  <span className="text-xs font-bold text-white block">🩹 Medical First Aid</span>
                  <span className="text-[10px] text-slate-400">Simulate emergency medical triage</span>
                </button>
                <button
                  type="button"
                  onClick={() => generatePreset('HAZARD')}
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-yellow-500 rounded-xl text-left transition"
                >
                  <span className="text-xs font-bold text-white block">⚡ Facility Hazard</span>
                  <span className="text-[10px] text-slate-400">Simulate downed light pole</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Encrypted scene dispatch</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-3 py-1.5 bg-slate-800 text-xs text-slate-300 rounded-lg hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!capturedPhotoUrl}
              onClick={handleConfirm}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white rounded-lg flex items-center gap-1.5 transition"
            >
              <Check className="w-4 h-4" />
              <span>Attach & Send with SOS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
