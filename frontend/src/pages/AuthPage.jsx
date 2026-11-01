import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, ShoppingBag, UserRound } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice.js';
import './AuthPage.css';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users${isRegister ? '' : '/login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegister ? form : { email: form.email, password: form.password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to authenticate. Please try again.');
      }

      dispatch(setCredentials(data));
      navigate('/');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to connect. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-brand" aria-hidden="true">
          <ShoppingBag size={22} strokeWidth={2.2} />
        </div>
        <p className="auth-eyebrow">{isRegister ? 'JOIN THE COMMUNITY' : 'WELCOME BACK'}</p>
        <h1>{isRegister ? 'Create your account' : 'Sign in to your account'}</h1>
        <p className="auth-description">
          {isRegister
            ? 'A few details and you’ll be ready to find something you love.'
            : 'Enter your details below to continue shopping.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label htmlFor="username">Username</label>
              <div className="auth-input-wrap">
                <UserRound size={18} aria-hidden="true" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Your username"
                  value={form.username}
                  onChange={updateField}
                  required
                />
              </div>
            </>
          )}

          <label htmlFor="email">Email address</label>
          <div className="auth-input-wrap">
            <Mail size={18} aria-hidden="true" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={updateField}
              required
            />
          </div>

          <label htmlFor="password">Password</label>
          <div className="auth-input-wrap">
            <LockKeyhole size={18} aria-hidden="true" />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              placeholder="Enter your password"
              value={form.password}
              onChange={updateField}
              required
              minLength={isRegister ? 6 : undefined}
            />
          </div>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
            {!isSubmitting && <ArrowRight size={18} aria-hidden="true" />}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? 'Already have an account?' : 'New to MERN Shop?'}{' '}
          <Link to={isRegister ? '/login' : '/register'}>
            {isRegister ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
      </div>
    </section>
  );
}

export default AuthPage;
