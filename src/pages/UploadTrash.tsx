import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '@/components/ui/select'; // Import SelectValue
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';

// Define interfaces for backend responses
interface DetectionResult {
  category: string;
  specific_item: string;
  credits_value: number;
}

interface UserCreditsResponse {
  user_id: string;
  credits: number;
  recycled_items: Array<{
    category: string;
    item_name: string;
    timestamp: string;
    bin_id: string;
    credits: number;
  }>;
}

const BIN_OPTIONS = [
  { id: 'A01', label: 'Bin #A01' },
  { id: 'B03', label: 'Bin #B03' },
  { id: 'C05', label: 'Bin #C05' },
  { id: 'D10', label: 'Bin #D10' },
];

const API_URL = 'http://localhost:8000';

const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 240;

const UploadTrash: React.FC = () => {
  const [userId, setUserId] = useState('user1'); // Hardcoded for demo
  const [binId, setBinId] = useState(BIN_OPTIONS[0].id);
  
  // State to store results from classify-image
  const [detectedCategory, setDetectedCategory] = useState('');
  const [detectedSpecificItem, setDetectedSpecificItem] = useState('');
  const [assignedCredits, setAssignedCredits] = useState(0); // Store credits from detection
  
  const [captured, setCaptured] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultReady, setResultReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use react-query to fetch user credits for display
  const { data: userCreditsData, isLoading: loadingCredits, refetch: refetchCredits } = useQuery<UserCreditsResponse>({
    queryKey: ['userCredits', userId],
    queryFn: () => fetch(`${API_URL}/user-credits/${userId}`).then(res => res.json()),
    enabled: !!userId, // Only fetch if userId is available
    refetchInterval: 5000, // Keep credits updated
  });

  // Start webcam automatically on mount or when retaking
  useEffect(() => {
    if (captured) return; // Don't start if already captured
    let active = true;
    setVideoReady(false);
    setError(null);
    setDebug('');
    async function startWebcam() {
      if (videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setDebug('Stream acquired');
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          console.log('Stream assigned to video element', stream);
          videoRef.current.onloadedmetadata = () => {
            setDebug('onloadedmetadata fired');
            videoRef.current?.play();
          };
          videoRef.current.oncanplay = () => {
            setDebug('oncanplay fired');
            setVideoReady(true);
            if (videoTimeoutRef.current) clearTimeout(videoTimeoutRef.current);
          };
          videoTimeoutRef.current = setTimeout(() => {
            if (!videoReady && active) {
              setError('Camera did not become ready. Try refreshing or check permissions.');
              setDebug('Timeout: video never became ready');
              stopWebcam();
            }
          }, 5000);
        } catch (err) {
          setError('Could not access webcam');
          setDebug('getUserMedia error: ' + (err instanceof Error ? err.message : String(err)));
          toast({ title: 'Error', description: 'Could not access webcam', variant: 'destructive' });
        }
      }
    }
    startWebcam();
    return () => {
      active = false;
      stopWebcam();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captured]);

  // Stop webcam
  const stopWebcam = () => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.pause();
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      videoRef.current.srcObject = null;
    }
    setVideoReady(false);
    if (videoTimeoutRef.current) clearTimeout(videoTimeoutRef.current);
  };

  // Capture image and stop webcam
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const width = video.videoWidth || DEFAULT_WIDTH;
      const height = video.videoHeight || DEFAULT_HEIGHT;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCaptured(dataUrl);
      }
    }
    stopWebcam();
  };

  // Send image to backend
  const handleSend = async () => {
    if (!captured) return;
    setLoading(true);
    setDetectedCategory(''); // Clear previous results
    setDetectedSpecificItem('');
    setAssignedCredits(0);
    setResultReady(false);

    try {
      const res = await fetch(captured);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('file', blob, 'capture.jpg');
      
      const resp = await fetch(`${API_URL}/classify-image`, {
        method: 'POST',
        body: formData,
      });

      if (resp.ok) {
        const data: DetectionResult = await resp.json();
        // Store all relevant data received from backend
        setDetectedCategory(data.category);
        setDetectedSpecificItem(data.specific_item);
        setAssignedCredits(data.credits_value);
        setResultReady(true);
        toast({ title: 'Detection Complete', description: `Detected: ${data.specific_item} (${data.category}), Credits: ${data.credits_value}` });
      } else {
        toast({ title: 'Error', description: 'Detection failed', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Detection failed', variant: 'destructive' });
    }
    setLoading(false);
  };

  // Submit waste
  const handleSubmit = async () => {
    if (!detectedCategory || !userId || !binId || !detectedSpecificItem) {
      toast({ title: 'Error', description: 'Missing detection information or user/bin ID.', variant: 'destructive' });
      return;
    }
    
    const res = await fetch(`${API_URL}/submit-waste`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        user_id: userId, 
        bin_id: binId, 
        category: detectedCategory, 
        specific_item: detectedSpecificItem,
        credits_value: assignedCredits
      }),
    });

    if (res.ok) {
      const data: UserCreditsResponse = await res.json();
      refetchCredits(); // Re-fetch credits to update display on this page and Dashboard
      toast({ title: 'Success', description: `+${assignedCredits} credits for ${detectedSpecificItem}!` });
      // Optionally reset UI after successful submission
      handleRetake(); 
    } else {
      toast({ title: 'Error', description: 'Failed to submit waste', variant: 'destructive' });
    }
  };

  // Allow retake
  const handleRetake = () => {
    setCaptured(null);
    setDetectedCategory('');
    setDetectedSpecificItem('');
    setAssignedCredits(0);
    setResultReady(false);
    // Webcam will auto-restart due to useEffect
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Trash</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block mb-1 font-medium">User ID</label>
            <Input value={userId} onChange={e => setUserId(e.target.value)} placeholder="Enter your user ID" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Select Bin</label>
            <Select value={binId} onValueChange={setBinId}>
              {/* --- FIX HERE: Add SelectValue inside SelectTrigger --- */}
              <SelectTrigger>
                <SelectValue placeholder="Select a bin" />
              </SelectTrigger>
              {/* --- END FIX --- */}
              <SelectContent>
                {BIN_OPTIONS.map(bin => (
                  <SelectItem key={bin.id} value={bin.id}>{bin.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <div className="mb-4 text-red-500">{error}</div>}
          {debug && <div className="mb-4 text-xs text-gray-400">Debug: {debug}</div>}
          {!captured && (
            <div className="mb-4 flex flex-col items-center">
              <video
                ref={videoRef}
                width={DEFAULT_WIDTH}
                height={DEFAULT_HEIGHT}
                style={{ borderRadius: 12, border: '2px solid #eee', background: '#222' }}
                autoPlay
                muted
                playsInline
              />
              <canvas ref={canvasRef} width={DEFAULT_WIDTH} height={DEFAULT_HEIGHT} style={{ display: 'none' }} />
              <Button className="mt-2" onClick={handleCapture} disabled={!videoReady}>Capture</Button>
              {!videoReady && <div className="text-sm text-gray-500 mt-2">Waiting for camera...</div>}
            </div>
          )}
          {captured && (
            <div className="mb-4 flex flex-col items-center">
              <img src={captured} alt="Captured" style={{ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT, borderRadius: 12, border: '2px solid #eee' }} />
              <div className="flex gap-2 mt-2">
                <Button onClick={handleRetake} variant="secondary">Retake</Button>
                <Button onClick={handleSend} disabled={loading}>{loading ? 'Sending...' : 'Send'}</Button>
              </div>
            </div>
          )}
          {resultReady && (
            <div className="mb-4 flex flex-col items-start w-full">
              <label className="block mb-1 font-medium">Detection Result</label>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={detectedCategory ? 'default' : 'secondary'} className="text-lg px-4 py-2">
                  Category: {detectedCategory || 'No detection'}
                </Badge>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  Item: {detectedSpecificItem || 'N/A'}
                </Badge>
                <Badge variant="success" className="text-lg px-4 py-2">
                  Credits: {assignedCredits}
                </Badge>
              </div>
              <Button className="mt-2 w-full" onClick={handleSubmit} disabled={!detectedCategory || !detectedSpecificItem}>Submit Waste</Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loadingCredits ? 'Loading...' : (userCreditsData?.credits !== undefined && userCreditsData?.credits !== null ? userCreditsData.credits : '—')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadTrash;