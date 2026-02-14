import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, UserPlus, RefreshCw, Save } from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { Card, Button, Input, Label } from '../components/UI';
import { User } from '../types';

const Registration: React.FC = () => {
  const { registerUser } = useSystem();
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
    }
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imgSrc || !name || !department) {
      setMessage({ type: 'error', text: 'Please fill all fields and capture a photo.' });
      return;
    }

    setIsSubmitting(true);

    const newUser: User = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name,
      department,
      photoBase64: imgSrc,
      registeredAt: new Date().toISOString(),
    };

    // Simulate async saving
    setTimeout(() => {
      registerUser(newUser);
      setIsSubmitting(false);
      setMessage({ type: 'success', text: `User ${name} registered & stored locally!` });
      // Reset form
      setName('');
      setDepartment('');
      setImgSrc(null);
    }, 500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">User Registration</h1>
        <p className="text-slate-400">Add new users to the face recognition database.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Camera/Image */}
        <Card className="p-6 flex flex-col items-center justify-center min-h-[400px]">
          {imgSrc ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-primary-500">
              <img src={imgSrc} alt="Captured" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/10" />
            </div>
          ) : (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                videoConstraints={{ facingMode: "user" }}
              />
            </div>
          )}

          <div className="mt-6 flex gap-4">
            {!imgSrc ? (
              <Button onClick={capture} icon={Camera}>Capture Photo</Button>
            ) : (
              <Button onClick={retake} variant="secondary" icon={RefreshCw}>Retake</Button>
            )}
          </div>
        </Card>

        {/* Right Column: Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                required
              />
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Engineering"
                required
              />
            </div>

            {message && (
              <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {message.text}
              </div>
            )}

            <div className="pt-4">
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full" 
                icon={imgSrc ? UserPlus : undefined} // Only show icon if photo taken, else just text for clarity or keep icon
                disabled={isSubmitting || !imgSrc}
              >
                {isSubmitting ? 'Registering...' : 'Register User'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Registration;