import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- KROK 1: Konfiguracja klienta Supabase ---
// Klucze są teraz wczytywane ze zmiennych środowiskowych.
// To bezpieczniejsza metoda, idealna do deploymentu na Vercel.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Utworzenie i eksport klienta Supabase.
// Dzięki temu będziemy mogli go używać w całej aplikacji.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Komponenty UI ---

// Komponent do wyświetlania powiadomień (np. o błędach lub sukcesie)
const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const baseClasses = "p-4 rounded-md my-4 text-sm shadow-lg flex justify-between items-center";
  const typeClasses = {
    success: "bg-green-100 border border-green-400 text-green-800",
    error: "bg-red-100 border border-red-400 text-red-800",
    info: "bg-blue-100 border border-blue-400 text-blue-800",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type] || typeClasses.info}`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 font-bold text-lg">&times;</button>
    </div>
  );
};


// Główny komponent do autentykacji (logowanie i rejestracja)
const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  const clearNotification = () => setNotification({ message: '', type: '' });

  // Funkcja obsługująca logowanie
  const handleLogin = async (e) => {
    e.preventDefault();
    clearNotification();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setNotification({ message: `Błąd logowania: ${error.message}`, type: 'error' });
    } else {
      // Powiadomienie o sukcesie nie jest konieczne, bo aplikacja przełączy widok
    }
    setLoading(false);
  };

  // Funkcja obsługująca rejestrację
  const handleSignup = async (e) => {
    e.preventDefault();
    clearNotification();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setNotification({ message: `Błąd rejestracji: ${error.message}`, type: 'error' });
    } else {
      setNotification({ message: 'Rejestracja pomyślna! Sprawdź email, aby potwierdzić konto.', type: 'success' });
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Witaj w aplikacji!</h1>
        <p className="text-center text-gray-500 mb-6">Zaloguj się lub utwórz konto</p>
        
        <Notification message={notification.message} type={notification.type} onClose={clearNotification} />

        <form>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Adres email
            </label>
            <input
              id="email"
              className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              placeholder="twoj@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Hasło
            </label>
            <input
              id="password"
              className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleLogin}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Logowanie...' : 'Zaloguj się'}
            </button>
            <button
              onClick={handleSignup}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:bg-green-300"
              disabled={loading}
            >
              {loading ? 'Rejestracja...' : 'Zarejestruj się'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Komponent dla zalogowanego użytkownika
const Account = ({ session, onSignOut }) => {
  return (
    <div className="w-full max-w-md">
       <div className="bg-white p-8 rounded-xl shadow-lg text-center">
         <h1 className="text-2xl font-bold text-gray-800 mb-4">Jesteś zalogowany!</h1>
         <p className="text-gray-600 mb-6">Twój email: <strong className="text-blue-600">{session.user.email}</strong></p>
         <button
            onClick={onSignOut}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
         >
           Wyloguj się
         </button>
       </div>
    </div>
  );
};

// Komponent do resetowania hasła
const PasswordReset = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const clearNotification = () => setNotification({ message: '', type: '' });

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        clearNotification();
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin, // Link w mailu przekieruje z powrotem do aplikacji
        });

        if (error) {
            setNotification({ message: `Błąd: ${error.message}`, type: 'error' });
        } else {
            setNotification({ message: 'Jeśli konto istnieje, wysłaliśmy link do resetu hasła na podany email.', type: 'success' });
        }
        setLoading(false);
    };

    return (
        <div className="w-full max-w-md">
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Resetowanie hasła</h1>
                <Notification message={notification.message} type={notification.type} onClose={clearNotification} />
                <form onSubmit={handlePasswordReset}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reset-email">
                            Adres email
                        </label>
                        <input
                            id="reset-email"
                            className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="email"
                            placeholder="twoj@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col space-y-3">
                        <button
                            type="submit"
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:bg-yellow-300"
                            disabled={loading}
                        >
                            {loading ? 'Wysyłanie...' : 'Wyślij link do resetu'}
                        </button>
                        <button
                            type="button"
                            onClick={onBack}
                            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                        >
                            Wróć do logowania
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Główny komponent aplikacji (App) ---
export default function App() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState('auth'); // 'auth', 'account', 'password_reset'

  // useEffect do sprawdzania sesji użytkownika przy starcie aplikacji
  useEffect(() => {
    // Sprawdź, czy jest już aktywna sesja
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setView(session ? 'account' : 'auth');
    });

    // Ustaw nasłuchiwanie na zmiany stanu autentykacji (logowanie, wylogowanie)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setView(session ? 'account' : 'auth');
    });

    // Zakończ subskrypcję, gdy komponent zostanie odmontowany
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
      await supabase.auth.signOut();
      // onAuthStateChange zajmie się resztą (zmianą sesji i widoku)
  }

  // Funkcja renderująca odpowiedni widok
  const renderView = () => {
      if (session && view === 'account') {
          return <Account key="account" session={session} onSignOut={handleSignOut} />;
      }
      if (view === 'password_reset') {
          return <PasswordReset key="password-reset" onBack={() => setView('auth')} />;
      }
      return <Auth key="auth" />;
  };

  return (
    // Kontener centrujący zawartość i nadający tło
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {renderView()}
      
      {/* Przycisk do przełączania na widok resetowania hasła */}
      {!session && view === 'auth' && (
        <button 
          onClick={() => setView('password_reset')} 
          className="mt-6 text-sm text-blue-500 hover:underline"
        >
          Nie pamiętasz hasła?
        </button>
      )}

      {/* Stopka */}
      <footer className="text-center mt-8 text-gray-400 text-xs">
          <p>Aplikacja startowa React + Supabase</p>
      </footer>
    </div>
  );
}
