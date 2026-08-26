import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      
      // If government attempts to login here, deny and force hidden route.
      if (role === 'ADMIN') {
        setError('Government credentials not authorized on public portal.');
        setLoading(false);
        return;
      }

      login(token, role);
      
      if (role === 'FARMER') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/vet/dashboard');
      }
    } catch (err) {
      setError('Invalid credentials or network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8] font-sans">
      <div className="bg-white shadow-2xl border-t-[12px] border-[#003366] w-full max-w-md rounded-b-lg">
        <div className="px-8 pt-10 pb-6 border-b border-gray-200">
          <div className="flex justify-center mb-6 text-[#003366]">
            <div className="w-16 h-16 bg-[#003366] text-white rounded-full flex items-center justify-center font-serif font-bold text-3xl">
              PR
            </div>
          </div>
          <h1 className="text-3xl font-black text-center text-gray-900 uppercase tracking-widest">Public Portal</h1>
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Farmer & Veterinary Access</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 border-b border-red-200 text-center text-sm font-bold uppercase tracking-wider">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Registered Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-gray-300 border p-3 rounded-sm focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none bg-gray-50 font-medium"
              placeholder="farmer@pashuraksha.local"
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-gray-300 border p-3 rounded-sm focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none bg-gray-50 font-medium"
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className="w-full bg-[#003366] text-white font-bold p-4 uppercase tracking-widest hover:bg-[#002244] transition-colors rounded-sm shadow-md mt-2">
            Secure Authentication
          </button>
        </form>
        <div className="bg-gray-100 p-4 border-t border-gray-200 text-center rounded-b-lg">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Warning: Government System. Unauthorized Access is Strictly Prohibited.</p>
        </div>
      </div>
    </div>
  );
}
