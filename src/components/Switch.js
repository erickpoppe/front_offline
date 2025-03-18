// components/Switch.js
import { useState, useEffect } from 'react';

export default function Switch({ endpoint, onActivate, isAnySwitchActive, reset }) {
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (reset) {
            setIsActive(false);
        }
    }, [reset]);

    const handleSwitchChange = async () => {
        if (isActive || isAnySwitchActive) return;

        setIsLoading(true);
        setError(null);

        const payload = {
            customer_id: 1,
            event_code: 2,
            description: "evento de prueba Erick"
        };

        try {
            const response = await fetch(endpoint.url, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Request failed for POS ${endpoint.posId}`);
            }

            const responseData = await response.json();
            console.log('Activation response:', responseData);

            // Extract event_id from response (adjust key based on actual response)
            const eventId = responseData.event_id || responseData.id || null;
            if (!eventId) {
                throw new Error('No event_id found in activation response');
            }

            setIsActive(true);
            onActivate(eventId);
        } catch (err) {
            setError(err.message);
            console.error('Activation error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="switch-container">
            <label className="switch">
                <input
                    type="checkbox"
                    checked={isActive}
                    onChange={handleSwitchChange}
                    disabled={isLoading || isActive || isAnySwitchActive}
                />
                <span className="slider"></span>
            </label>

            <div className={`led ${isActive ? 'active' : ''}`}></div>

            <div className="status-text">
                {isLoading && <span className="loading">Loading...</span>}
                {error && <span className="error">Error: {error}</span>}
                {!isLoading && !error && isActive && <span className="active">Activated</span>}
                {!isLoading && !error && !isActive && <span className="inactive">Inactive</span>}
            </div>

            <style jsx>{`
        .switch-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ddd;
          border-radius: 12px;
          transition: background-color 0.3s;
          cursor: ${isActive || isLoading || isAnySwitchActive ? 'not-allowed' : 'pointer'};
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          border-radius: 50%;
          transition: transform 0.3s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        input:checked + .slider {
          background-color: #4CAF50;
        }
        input:checked + .slider:before {
          transform: translateX(26px);
        }
        .led {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #bbb;
          transition: background-color 0.3s;
        }
        .led.active {
          background-color: #ff4444;
          box-shadow: 0 0 6px #ff4444;
        }
        .status-text {
          font-size: 0.9rem;
        }
        .loading {
          color: #888;
        }
        .error {
          color: #ff4444;
        }
        .active {
          color: #4CAF50;
        }
        .inactive {
          color: #888;
        }
      `}</style>
        </div>
    );
}