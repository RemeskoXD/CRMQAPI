import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Nesprávné přihlašovací údaje');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (em: string) => {
    setEmail(em);
    setPassword('admin123');
    setError('');
    setLoading(true);
    try {
      await login(em, 'admin123');
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Chyba');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-gold rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-gold/20">
            <span className="text-brand-dark font-bold text-xl">CQ</span>
          </div>
          <h1 className="text-2xl font-bold text-white">CRMQ</h1>
          <p className="text-gray-500 mt-1 text-sm">Servis oken &middot; Garážová vrata &middot; Stínění</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="input" placeholder="vas@email.cz" required autoFocus />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Heslo</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                className="input pr-10" placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2.5 rounded-lg border border-red-100">{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            <LogIn size={16} />
            {loading ? 'Přihlašuji...' : 'Přihlásit se'}
          </button>
        </form>

        {/* Demo quick logins */}
        <div className="mt-6">
          <p className="text-xs text-gray-600 text-center mb-3">Demo přístupy:</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { email: 'admin@crmq.cz', label: 'Admin', color: 'bg-red-500/10 text-red-400 hover:bg-red-500/20' },
              { email: 'marek@crmq.cz', label: 'Team Leader', color: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' },
              { email: 'andrej@crmq.cz', label: 'Obchodník', color: 'bg-green-500/10 text-green-400 hover:bg-green-500/20' },
              { email: 'petr@crmq.cz', label: 'Technik', color: 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20' },
              { email: 'eva@crmq.cz', label: 'Analytik', color: 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20' },
              { email: 'lucie@crmq.cz', label: 'Infolinka', color: 'bg-pink-500/10 text-pink-400 hover:bg-pink-500/20' },
              { email: 'martin@crmq.cz', label: 'Účetní', color: 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20' },
            ].map(acc => (
              <button key={acc.email} onClick={() => quickLogin(acc.email)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${acc.color}`}>
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
