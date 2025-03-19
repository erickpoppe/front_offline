// pages/index.js
import { useState, useEffect } from 'react';
import Switch from '../components/Switch';
import DeactivationSwitch from '../components/DeactivationSwitch';
import InvoiceForm from '../components/InvoiceForm';
import MedicalServicesForm from '../components/MedicalServicesForm';
import Login from '../components/Login';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Home() {
    const [formData, setFormData] = useState(null);
    const [counter, setCounter] = useState(67); // Counter for display, starts at 47
    const [eventId, setEventId] = useState(null); // Tracks the current event ID from response
    const [batchId, setBatchId] = useState(8); // Tracks batch ID, starts at 6
    const [isSwitchActive, setIsSwitchActive] = useState(false); // Tracks activation switch
    const [activeForm, setActiveForm] = useState(null); // Tracks which form to display
    const [resetActivation, setResetActivation] = useState(false); // Signal to reset activation switch
    const [resetDeactivation, setResetDeactivation] = useState(false); // Signal to reset deactivation switch

    const handleSwitchActivation = (newEventId) => {
        if (!newEventId) {
            console.error('No event_id received from activation');
            return;
        }
        setCounter(prev => prev + 1);
        setEventId(newEventId);
        setIsSwitchActive(true);
        setActiveForm('ventaFarmacia');
        setResetActivation(false);
        setResetDeactivation(true);
    };

    const handleSwitchDeactivation = (codigoRecepcion) => {
        toast.success(`Evento desactivado con éxito. Código: ${codigoRecepcion}`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
        setCounter(67);
        setIsSwitchActive(false);
        setActiveForm(null);
        setResetActivation(true);
        setResetDeactivation(false);
    };

    const handleEmitOfflineDocSector1 = async () => {
        if (!eventId) {
            toast.error('No event_id available for emitting offline invoices');
            return;
        }

        const payload = {
            customer_id: 1,
            branch_id: 1,
            event_id: eventId,
            pos_id: 1,
            doc_sector: 1
        };

        try {
            const response = await fetch(
                `https://prod-core-invoice-service-4z5dz4d2yq-uc.a.run.app/invoices/emit/offline?customer_id=1&branch_id=1&pos_id=1&event_id=${eventId}&doc_sector=1`,
                {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                throw new Error('Failed to emit offline invoices for doc_sector 1');
            }

            const responseData = await response.json();
            console.log('Emit offline doc_sector 1 response:', responseData);

            if (responseData.siat_response?.transaccion === true) {
                const receptionCode = responseData.siat_response.codigoRecepcion;
                const invoices = responseData.batch?.invoices?.invoices || [];
                toast.success(`Reception Code: ${receptionCode}, Invoices: ${invoices.join(', ')}`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } else {
                throw new Error('Transaction failed for doc_sector 1');
            }
        } catch (err) {
            toast.error(`Error: ${err.message}`);
            console.error('Emit offline doc_sector 1 error:', err);
        }
    };

    const handleEmitOfflineDocSector17 = async () => {
        if (!eventId) {
            toast.error('No event_id available for emitting offline invoices');
            return;
        }

        const payload = {
            customer_id: 1,
            branch_id: 1,
            event_id: eventId,
            pos_id: 1,
            doc_sector: 17
        };

        try {
            const response = await fetch(
                `https://prod-core-invoice-service-4z5dz4d2yq-uc.a.run.app/invoices/emit/offline?customer_id=1&branch_id=1&pos_id=1&event_id=${eventId}&doc_sector=17`,
                {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                throw new Error('Failed to emit offline invoices for doc_sector 17');
            }

            const responseData = await response.json();
            console.log('Emit offline doc_sector 17 response:', responseData);

            if (responseData.siat_response?.transaccion === true) {
                const receptionCode = responseData.siat_response.codigoRecepcion;
                const invoices = responseData.batch?.invoices?.invoices || [];
                toast.success(`Reception Code: ${receptionCode}, Invoices: ${invoices.join(', ')}`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } else {
                throw new Error('Transaction failed for doc_sector 17');
            }
        } catch (err) {
            toast.error(`Error: ${err.message}`);
            console.error('Emit offline doc_sector 17 error:', err);
        }
    };

    const handleValidateBatch = async () => {
        const url = `https://prod-core-invoice-service-4z5dz4d2yq-uc.a.run.app/invoices/emit/validate?batch_id=${batchId}&customer_id=1&branch_id=1&pos_id=1`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                }
            });

            const responseText = await response.text();
            console.log(`Validate batch request: GET ${url}`);
            console.log(`Response status: ${response.status}`);
            console.log(`Response text: ${responseText}`);

            if (!response.ok) {
                throw new Error(`Failed to validate batch (Status: ${response.status})`);
            }

            const responseData = JSON.parse(responseText);
            console.log('Validate batch response:', responseData);

            if (responseData.siat_response?.transaccion === true) {
                const codigoEstado = responseData.siat_response.codigoEstado;
                const invoices = responseData.batch?.invoices?.invoices || [];
                if (codigoEstado === 908) {
                    toast.success(`Exitosamente emitida. Number of Invoices: ${invoices.length}`, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                } else {
                    const errorMessage = responseData.siat_response.mensajesList?.length > 0
                        ? responseData.siat_response.mensajesList[0].descripcion
                        : 'Unknown error';
                    toast.error(`Error Code: ${codigoEstado}, Message: ${errorMessage}`, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                }
                setBatchId(prev => prev + 1);
            } else {
                throw new Error('Transaction failed during validation');
            }
        } catch (err) {
            toast.error(`Error: ${err.message}`);
            console.error('Validate batch error:', err);
        }
    };

    return (
        <div className="container">
            <div className="sidebar">
                <h1>Evento Offline</h1>
                <div className="counter">Counter: {counter}</div>
                <div className="switches">
                    <div className="switch-group">
                        <h2>Activar Evento</h2>
                        <Switch
                            endpoint={{ url: 'https://prod-core-invoice-service-4z5dz4d2yq-uc.a.run.app/operations/events/start?customer_id=1&branch_id=1&pos_id=1', posId: 1 }}
                            onActivate={handleSwitchActivation}
                            isAnySwitchActive={isSwitchActive}
                            reset={resetActivation}
                        />
                    </div>
                </div>
            </div>
            <div className="main-content">
                {isSwitchActive ? (
                    <>
                        <div className="form-toggle-buttons">
                            <button
                                className={`toggle-btn ${activeForm === 'ventaFarmacia' ? 'active' : ''}`}
                                onClick={() => setActiveForm('ventaFarmacia')}
                            >
                                Venta Farmacia
                            </button>
                            <button
                                className={`toggle-btn ${activeForm === 'prestacionesMedicas' ? 'active' : ''}`}
                                onClick={() => setActiveForm('prestacionesMedicas')}
                            >
                                Prestaciones Médicas
                            </button>
                        </div>
                        {activeForm === 'ventaFarmacia' && <InvoiceForm setFormData={setFormData} />}
                        {activeForm === 'prestacionesMedicas' && <MedicalServicesForm setFormData={setFormData} />}
                    </>
                ) : (
                    <p>Por favor, active el evento offline para mostrar los formularios.</p>
                )}
            </div>
            <div className="right-sidebar">
                <h1>Desactivar Evento</h1>
                <DeactivationSwitch
                    eventId={eventId}
                    isActivationSwitchActive={isSwitchActive}
                    onDeactivate={handleSwitchDeactivation}
                    reset={resetDeactivation}
                />
                <div className="emit-buttons">
                    <button
                        className="emit-btn"
                        onClick={handleEmitOfflineDocSector1}
                        disabled={!eventId}
                    >
                        Emit Offline (Doc Sector 1)
                    </button>
                    <button
                        className="emit-btn"
                        onClick={handleEmitOfflineDocSector17}
                        disabled={!eventId}
                    >
                        Emit Offline (Doc Sector 17)
                    </button>
                    <button
                        className="emit-btn"
                        onClick={handleValidateBatch}
                        disabled={!eventId}
                    >
                        Validate Batch (Batch ID: {batchId})
                    </button>
                </div>
            </div>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            <style jsx>{`
        .container {
          display: flex;
          min-height: 100vh;
          background-color: #f5f5f5;
        }
        .sidebar, .right-sidebar {
          width: 300px;
          padding: 20px;
          background-color: #ffffff;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        }
        .right-sidebar {
          box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
        }
        h1 {
          font-size: 1.5rem;
          color: #333;
          margin-bottom: 1rem;
          text-align: left;
        }
        .counter {
          font-size: 1.2rem;
          color: #2196F3;
          margin-bottom: 1.5rem;
          font-weight: 500;
        }
        .switches {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .switch-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        h2 {
          font-size: 1.1rem;
          color: #555;
          margin: 0;
          font-weight: 500;
        }
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
        }
        .form-toggle-buttons {
          margin-bottom: 20px;
          display: flex;
          gap: 10px;
        }
        .toggle-btn {
          padding: 10px 20px;
          font-size: 1rem;
          border: none;
          border-radius: 4px;
          background-color: #ddd;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .toggle-btn.active {
          background-color: #2196F3;
          color: white;
        }
        .toggle-btn:hover:not(.active) {
          background-color: #ccc;
        }
        p {
          font-size: 1rem;
          color: #666;
        }
        .emit-buttons {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .emit-btn {
          padding: 10px;
          font-size: 1rem;
          border: none;
          border-radius: 4px;
          background-color: #2196F3;
          color: white;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .emit-btn:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .emit-btn:hover:not(:disabled) {
          background-color: #1976D2;
        }
      `}</style>
        </div>
    );
}

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if already authenticated (e.g., from localStorage)
        const authStatus = localStorage.getItem('isAuthenticated');
        if (authStatus === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true'); // Persist login state
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated'); // Clear login state
    };

    return (
        <>
            {isAuthenticated ? (
                <>
                    <Home />
                    <button
                        onClick={handleLogout}
                        style={{
                            position: 'fixed',
                            top: '10px',
                            right: '10px',
                            padding: '5px 10px',
                            backgroundColor: '#ff4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Logout
                    </button>
                </>
            ) : (
                <Login onLogin={handleLogin} />
            )}
        </>
    );
}