// components/DeactivationSwitch.js
import { useState, useEffect } from 'react';

export default function DeactivationSwitch({ eventId, isActivationSwitchActive, onDeactivate, reset }) {
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (reset) {
            setIsActive(false);
        }
    }, [reset]);

    const handleSwitchChange = async () => {
        if (isActive || !isActivationSwitchActive || !eventId) return;

        setIsLoading(true);
        setError(null);

        const payload = {
            event_id: eventId // Use the passed eventId directly
        };

        try {
            const response = await fetch(
                `https://prod-core-invoice-service-4z5dz4d2yq-uc.a.run.app/operations/events/end?customer_id=1&branch_id=1&pos_id=1&event_id=${eventId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                throw new Error('Failed to deactivate event');
            }

            const responseData = await response.json();
            console.log('Deactivation response:', responseData);

            if (responseData.transaccion === true) {
                setIsActive(true);
                onDeactivate(responseData.codigoRecepcionEventoSignificativo);
            } else {
                throw new Error('Transaction failed');
            }
        } catch (err) {
            setError(err.message);
            console.error('Deactivation error:', err);
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
                    disabled={isLoading || isActive || !isActivationSwitchActive || !eventId}
                />
                <span className="slider"></span>
            </label>

            <div className={`led ${isActive ? 'active' : ''}`}></div>

            <div className="status-text">
                {isLoading && <span className="loading">Loading...</span>}
                {error && <span className="error">Error: {error}</span>}
                {!isLoading && !error && isActive && <span className="active">Deactivated</span>}
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
          cursor: ${isActive || isLoading || !isActivationSwitchActive ? 'not-allowed' : 'pointer'};
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
          background-color: #ff4444; /* Red for deactivation */
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
          background-color: #4CAF50; /* Green when deactivated */
          box-shadow: 0 0 6px #4CAF50;
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