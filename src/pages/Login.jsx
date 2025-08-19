import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorDetail, setErrorDetail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleFailCount, setGoogleFailCount] = useState(0);
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Note: Redirect handling removed for now to simplify the login process
  // Will be re-implemented once the basic login flow is working properly

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/unauthorized-domain':
        return 'Google sign-in is not authorized for this domain. Please contact support.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed';
      case 'auth/popup-blocked':
        return 'Sign-in popup was blocked. Please allow popups for this site.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      default:
        return errorCode;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setErrorDetail('');
      // Basic client-side validation for tests
      if (!email) {
        setError('Failed to sign in');
        setErrorDetail('Email is required');
        return;
      }
      if (!password) {
        setError('Failed to sign in');
        setErrorDetail('Password is required');
        return;
      }
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to sign in');
      setErrorDetail(error?.message || getErrorMessage(error?.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setErrorDetail('');
      setLoading(true);
      
      console.log('Starting Google sign-in...');
      
      // Use the auth context's loginWithGoogle function
      const result = await loginWithGoogle();
      
      if (result) {
        console.log('Google sign-in successful:', result);
        navigate('/');
      } else {
        // Google sign-in failed
        setError('Failed to sign in with Google');
        setErrorDetail('Google sign-in was not completed. Please try again.');
      }
      
    } catch (error) {
      console.error('Google login error:', error);
      const errorMessage = error?.message || getErrorMessage(error?.code);
      setError('Failed to sign in with Google');
      setErrorDetail(errorMessage);
      
      // Special handling for unauthorized domain
      if (error.code === 'auth/unauthorized-domain') {
        setErrorDetail(`Google sign-in is not authorized for this domain.

To fix this:
1. Go to Firebase Console > Authentication > Sign-in method
2. Click on Google
3. Add these domains to "Authorized domains":
   - localhost
   - todo-list-e7788.web.app
   - todo.cox-fam.com`);
      }
      
      // Special handling for extension conflicts
      if (error.code === 'auth/popup-closed-by-user' || 
          error.code === 'auth/popup-blocked' ||
          error.message?.includes('popup')) {
        setGoogleFailCount(prev => prev + 1);
        setErrorDetail(`Popup blocked or closed. This often happens due to browser extensions.

Try:
1. Disable browser extensions temporarily
2. Use incognito/private browsing mode
3. Or use email/password login instead`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded whitespace-pre-line">
            <div>{error}</div>
            {errorDetail && <div>{errorDetail}</div>}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign in'}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-300">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2">Sign in with Google</span>
              </button>
              <p className="mt-2 text-xs text-gray-400 text-center">
                Having issues? Try incognito mode or disable browser extensions
              </p>
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                <p className="font-medium mb-1">Chrome Users:</p>
                <p>If popup doesn't work, the app will automatically use redirect method.</p>
                <p>This may take a few extra seconds but will work reliably.</p>
              </div>
              
              {/* Alternative sign-in options when Google fails */}
              {(error && error.includes('Google')) || googleFailCount > 0 ? (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    {googleFailCount > 1 ? 'Google sign-in still having issues?' : 'Google sign-in having issues?'} Try these alternatives:
                  </p>
                  <div className="space-y-2 text-xs text-blue-700">
                    <p>• <strong>Email/Password:</strong> Use the form above</p>
                    <p>• <strong>Incognito Mode:</strong> Open in private browsing</p>
                    <p>• <strong>Disable Extensions:</strong> Temporarily turn off browser extensions</p>
                    <p>• <strong>Different Browser:</strong> Try Chrome, Firefox, or Safari</p>
                  </div>
                  {googleFailCount > 1 && (
                    <p className="mt-2 text-xs text-blue-600 font-medium">
                      💡 Tip: Email/password login is often more reliable than Google sign-in
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <div className="text-center">
            <div>Don't have an account?</div>
            <Link
              to="/register"
              onClick={(e) => { e.preventDefault(); navigate('/register'); }}
              className="font-medium text-blue-300 hover:text-blue-200"
            >
              Sign up
            </Link>
          </div>
          <div className="text-center mt-2">
            <Link
              to="/"
              onClick={(e) => { e.preventDefault(); navigate('/'); }}
              className="font-medium text-blue-300 hover:text-blue-200"
            >
              Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;