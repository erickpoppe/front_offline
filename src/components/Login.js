// components/Login.js
import { useState } from 'react';

export default function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Hardcoded credentials for simplicity
        const validUsername = 'admin';
        const validPassword = 'password123';

        if (username === validUsername && password === validPassword) {
            onLogin(); // Call the onLogin callback to set authenticated state
            setError('');
        } else {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="login-container">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit">Login</button>
            </form>

            <style jsx>{`
        .login-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: #f5f5f5;
        }
        h1 {
          font-size: 2rem;
          color: #333;
          margin-bottom: 2rem;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 300px;
          background-color: #ffffff;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .input-group {
          display: flex;
          flex-direction: column;
        }
        label {
          font-size: 1rem;
          color: #555;
          margin-bottom: 0.5rem;
        }
        input {
          padding: 0.5rem;
          font-size: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .error {
          color: #ff4444;
          font-size: 0.9rem;
          text-align: center;
        }
        button {
          padding: 0.75rem;
          font-size: 1rem;
          background-color: #2196F3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        button:hover {
          background-color: #1976D2;
        }
      `}</style>
        </div>
    );
}