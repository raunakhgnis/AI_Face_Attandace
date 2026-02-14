import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Scan, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { identifyUser } from '../services/geminiService';
import { Card, Button } from '../components/UI';
import { AttendanceRecord } from '../types';
import { Link } from 'react-router-dom';

const Attendance: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const { users, markAttendance, attendanceRecords } = useSystem();
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ 
    status: 'success' | 'unknown' | 'error' | null;
    message: string;
    details?: string;
  }>({ status: null, message: '' });

  // Auto-clear success message after few seconds
  useEffect(() => {
    if (scanResult.status) {
      const timer = setTimeout(() => {
        setScanResult({ status: null, message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [scanResult.status]);

  const handleScan = useCallback(async () => {
    if (!webcamRef.current) return;
    
    setIsScanning(true);
    setScanResult({ status: null, message: 'Analyzing biometric data...' });

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setScanResult({ status: 'error', message: 'Failed to capture camera frame. Please check permissions.' });
      setIsScanning(false);
      return;
    }

    try {
      // Call Gemini Service
      const result = await identifyUser(imageSrc, users);
      console.log("Recognition Result:", result);

      if (result.matchedUserId) {
        const user = users.find(u => u.id === result.matchedUserId);
        if (user) {
          const record: AttendanceRecord = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
            userId: user.id,
            userName: user.name,
            department: user.department,
            timestamp: new Date().toISOString(),
            status: 'PRESENT',
            confidence: result.confidence
          };
          
          markAttendance(record);
          setScanResult({ 
            status: 'success', 
            message: `Welcome, ${user.name}!`,
            details: `Attendance marked at ${new Date().toLocaleTimeString()} (Confidence: ${Math.round(result.confidence * 100)}%)`
          });
        } else {
           setScanResult({ 
            status: 'unknown', 
            message: 'User ID matched but not found in local DB.',
            details: 'This should not happen.'
          });
        }
      } else {
        setScanResult({ 
          status: 'unknown', 
          message: 'Face not recognized.',
          details: result.reasoning || 'Please register first or try again.'
        });
      }
    } catch (error) {
      console.error(error);
      setScanResult({ status: 'error', message: 'System Error. Please check API configuration.' });
    } finally {
      setIsScanning(false);
    }
  }, [webcamRef, users, markAttendance]);

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col lg:flex-row gap-6 animate-fade-in">
      
      {/* Main Camera View */}
      <div className="flex-1 flex flex-col">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Live Attendance</h1>
          <p className="text-slate-400">Face the camera and click scan to mark attendance.</p>
        </header>

        <Card className="flex-1 relative overflow-hidden bg-black flex flex-col">
          <div className="relative flex-1 min-h-[400px]">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="absolute inset-0 w-full h-full object-cover"
              videoConstraints={{ facingMode: "user" }}
            />
            
            {/* Overlay UI */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Scanning Reticle */}
              <div className={`w-64 h-64 border-2 rounded-xl transition-colors duration-500 relative
                ${scanResult.status === 'success' ? 'border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.5)]' : 
                  scanResult.status === 'unknown' ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]' : 
                  isScanning ? 'border-primary-500 animate-pulse shadow-[0_0_50px_rgba(59,130,246,0.3)]' : 
                  'border-white/30'}`}
              >
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-inherit -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-inherit -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-inherit -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-inherit -mb-1 -mr-1"></div>
                
                {/* Scanning line */}
                {isScanning && (
                   <div className="absolute left-0 right-0 h-0.5 bg-primary-400 shadow-[0_0_10px_#60a5fa] animate-scan-down top-0"></div>
                )}
              </div>
            </div>

            {/* Status Overlay */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center px-4">
              {scanResult.message && (
                <div className={`backdrop-blur-md px-6 py-4 rounded-2xl border shadow-xl flex items-center gap-3 max-w-md animate-slide-up
                  ${scanResult.status === 'success' ? 'bg-emerald-900/80 border-emerald-500/50 text-emerald-100' : 
                    scanResult.status === 'unknown' ? 'bg-red-900/80 border-red-500/50 text-red-100' : 
                    scanResult.status === 'error' ? 'bg-slate-800/90 border-slate-600 text-white' :
                    'bg-slate-900/80 border-primary-500/50 text-blue-100'
                  }`}>
                  {isScanning ? <Loader2 className="animate-spin w-6 h-6" /> :
                   scanResult.status === 'success' ? <CheckCircle className="w-6 h-6 text-emerald-400" /> :
                   scanResult.status === 'unknown' ? <AlertCircle className="w-6 h-6 text-red-400" /> :
                   null}
                  <div>
                    <p className="font-semibold text-lg">{scanResult.message}</p>
                    {scanResult.details && <p className="text-sm opacity-80">{scanResult.details}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-slate-900 border-t border-slate-800 flex flex-col items-center">
             {users.length === 0 && (
                <p className="text-amber-400 mb-3 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  No users registered. 
                  <Link to="/registration" className="underline ml-1 font-semibold hover:text-amber-300">Register first</Link>
                </p>
             )}
            <Button 
              onClick={handleScan} 
              disabled={isScanning || users.length === 0}
              className="w-full max-w-xs h-12 text-lg"
              variant={isScanning ? 'secondary' : 'primary'}
            >
              {isScanning ? 'Processing...' : 'Scan Face'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Sidebar: Recent Activity */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
        <Card className="flex-1 p-0 overflow-hidden flex flex-col bg-slate-900/50">
          <div className="overflow-y-auto flex-1 p-4 space-y-3">
            {attendanceRecords.slice(0, 10).map((record) => (
              <div key={record.id} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700 animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-primary-900/50 flex items-center justify-center text-primary-400 font-bold border border-primary-800">
                  {record.userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{record.userName}</p>
                  <p className="text-xs text-slate-400">{new Date(record.timestamp).toLocaleTimeString()}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              </div>
            ))}
            {attendanceRecords.length === 0 && (
              <p className="text-center text-slate-500 mt-10">No records yet today.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Attendance;