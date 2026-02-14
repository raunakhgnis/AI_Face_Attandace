import React from 'react';
import { Link } from 'react-router-dom';
import { useSystem } from '../context/SystemContext';
import { Card, Button } from '../components/UI';
import { Users, UserCheck, Clock, Activity, UserPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const { users, attendanceRecords } = useSystem();

  const today = new Date().toDateString();
  const presentToday = attendanceRecords.filter(r => new Date(r.timestamp).toDateString() === today);
  const uniquePresentUsers = new Set(presentToday.map(r => r.userId)).size;
  const attendancePercentage = users.length > 0 ? Math.round((uniquePresentUsers / users.length) * 100) : 0;

  // Prepare chart data (Last 7 days mock or real aggregation)
  // Since we only have today's data in this simple context mostly, we will simulate a view or just show hourly breakdown for today.
  
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    count: 0
  }));

  presentToday.forEach(record => {
    const hour = new Date(record.timestamp).getHours();
    if (hourlyData[hour]) {
      hourlyData[hour].count++;
    }
  });

  // Filter out empty hours for cleaner chart if needed, or keep business hours 8-18
  const businessHoursData = hourlyData.slice(8, 20);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="p-6 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg bg-opacity-10 ${color.bg} ${color.text}`}>
        <Icon className="w-6 h-6" />
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Overview of attendance statistics and system status.</p>
        </div>
        <Link to="/registration">
          <Button icon={UserPlus}>Register New User</Button>
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={users.length} 
          icon={Users} 
          color={{ bg: 'bg-blue-500', text: 'text-blue-500' }} 
        />
        <StatCard 
          title="Present Today" 
          value={uniquePresentUsers} 
          icon={UserCheck} 
          color={{ bg: 'bg-emerald-500', text: 'text-emerald-500' }} 
        />
        <StatCard 
          title="Attendance Rate" 
          value={`${attendancePercentage}%`} 
          icon={Activity} 
          color={{ bg: 'bg-purple-500', text: 'text-purple-500' }} 
        />
        <StatCard 
          title="Last Scan" 
          value={presentToday.length > 0 ? new Date(presentToday[0].timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'} 
          icon={Clock} 
          color={{ bg: 'bg-orange-500', text: 'text-orange-500' }} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 p-6 min-h-[400px] flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Attendance Activity (Today)</h3>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={businessHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="hour" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ fill: '#1e293b' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                   {businessHoursData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#3b82f6" />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent List */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Live Logs</h3>
          <div className="space-y-4">
            {attendanceRecords.length === 0 ? (
              <p className="text-slate-500 text-sm">No attendance records found.</p>
            ) : (
              attendanceRecords.slice(0, 7).map((record) => (
                <div key={record.id} className="flex items-center justify-between pb-4 border-b border-slate-700 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                      {record.userName.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{record.userName}</p>
                      <p className="text-xs text-slate-500">{record.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-emerald-400">Present</p>
                    <p className="text-xs text-slate-500">{new Date(record.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;