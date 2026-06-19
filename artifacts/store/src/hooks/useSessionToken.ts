import { useEffect, useState } from 'react';

function generateToken(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useSessionToken(): string {
  const [token, setToken] = useState('');

  useEffect(() => {
    try {
      let stored = localStorage.getItem('sz_session_token');
      if (!stored) {
        stored = generateToken();
        localStorage.setItem('sz_session_token', stored);
      }
      setToken(stored);
    } catch {
      setToken(generateToken());
    }
  }, []);

  return token;
}
