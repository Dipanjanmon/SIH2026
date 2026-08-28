import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function GovLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/v1/auth/login', {
        email,
        password
      });
      
      const { token, role } = response.data;
      
      if (role !== 'ADMIN') {
        setError('Unauthorized credentials.');
        setLoading(false);
        return;
      }

      login(token, role);
      navigate('/ahd/surveillance-hq');
    } catch (err) {
      setError('Invalid clearance key or network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f16] font-sans">
      <div className="bg-[#121820] shadow-2xl border-t-[4px] border-[#cc0000] w-full max-w-md rounded-sm">
        <div className="px-8 pt-10 pb-6 border-b border-[#1c2430]">
          <h1 className="text-2xl font-black text-center text-white uppercase tracking-widest">AHD Secure Node</h1>
          <p className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">Department of Animal Husbandry & Dairying</p>
        </div>
        
        {error && (
          <div className="bg-red-900/30 text-red-500 p-4 border-b border-red-900/50 text-center text-sm font-bold uppercase tracking-wider">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">AHD Clearance ID</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-[#1c2430] border p-3 rounded-sm focus:ring-1 focus:ring-[#cc0000] focus:border-transparent outline-none bg-[#0a0f16] text-white font-mono"
              placeholder="id@pashuraksha.gov"
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Clearance Key</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-[#1c2430] border p-3 rounded-sm focus:ring-1 focus:ring-[#cc0000] focus:border-transparent outline-none bg-[#0a0f16] text-white font-mono"
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className="w-full bg-[#cc0000] text-white font-bold p-4 uppercase tracking-widest hover:bg-[#aa0000] transition-colors rounded-sm shadow-md mt-2">
            Initialize Access
          </button>
        </form>
      </div>
    </div>
  );
}
