// components/MedicalServicesForm.js (updated with branch_id: 1, pos_id: 1)
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function MedicalServicesForm({ setFormData }) {
    const [products, setProducts] = useState([{ quantity: '', description: '', unitPrice: '', discount: '', subtotal: '' }]);
    const [client, setClient] = useState({ name: '', documentType: 'id', documentNumber: '', email: '' });
    const [patientName, setPatientName] = useState('');
    const [additionalDiscount, setAdditionalDiscount] = useState('0');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const addProduct = () => {
        setProducts([...products, { quantity: '', description: '', unitPrice: '', discount: '', subtotal: '' }]);
    };

    const updateProduct = (index, field, value) => {
        const newProducts = [...products];
        newProducts[index][field] = value;
        if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
            const qty = parseFloat(newProducts[index].quantity) || 0;
            const price = parseFloat(newProducts[index].unitPrice) || 0;
            const disc = parseFloat(newProducts[index].discount) || 0;
            newProducts[index].subtotal = ((qty * price) - disc).toFixed(2);
        }
        setProducts(newProducts);
    };

    const calculateTotal = () => {
        const subtotalSum = products.reduce((sum, p) => sum + (parseFloat(p.subtotal) || 0), 0);
        const discount = parseFloat(additionalDiscount) || 0;
        return (subtotalSum - discount).toFixed(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const total = calculateTotal();
        const payload = {
            products: products.map((p, index) => ({
                product_code: `explicit-${index + 2}`,
                description: p.description,
                sin_product_code: 93122,
                sin_activity_code: 862010,
                category: "test category2",
                invoice_type: "facturaElectronicaHospitalClinica",
                measure_unit: "servicios",
                sin_measure_unit_code: 58,
                product_metadata: {
                    specialty: "test_specialty",
                    specialty_detail: "test_detail",
                    operation_room_number: 1,
                    doctor_specialty: "test_doc_specialty",
                    doctor_name: "test doctor",
                    doctor_nit: 392010028,
                    doctor_registration_number: "1234567",
                    doctor_invoice_number: 123
                },
                unit_price: parseFloat(p.unitPrice) || 0,
                quantity: parseFloat(p.quantity) || 0,
                discount: parseFloat(p.discount) || 0,
                subtotal: p.subtotal
            })),
            customer_id: 1,
            client: {
                name: client.name,
                email: client.email,
                sin_document_type: client.documentType === 'id' ? 1 : 2,
                document_number: client.documentNumber,
                client_code: client.documentNumber,
                exception_code: 0
            },
            branch_id: 1, // Updated to branch_id: 1
            pos_id: 1,   // Updated to pos_id: 1
            user_id: 1,
            doc_sector_id: 17,
            payment_method_id: 1,
            currency_id: 1,
            currency_conversion_factor: 1,
            total_amount: parseFloat(total),
            total_amount_iva: parseFloat(total),
            total_amount_currency: parseFloat(total),
            additional_discount: parseFloat(additionalDiscount) || 0,
            gift_card_amount: 0,
            patient_name: patientName,
            cashier_name: "scarlet jo",
            card_number: null,
            id_comp_int: 2533542,
            is_roll: 0,
            is_offline: true
        };

        try {
            console.log('Sending payload:', JSON.stringify(payload, null, 2));
            const response = await fetch(
                'https://prod-core-invoice-service-4z5dz4d2yq-uc.a.run.app/v1/api/orders/explicit?do_emit=1',
                {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer wqaevQPKrMVPvxlxuhpiURH0XoD2pUo6FTt2LB8EciI'
                    },
                    body: JSON.stringify(payload)
                }
            );

            console.log('Response status:', response.status);
            const responseData = await response.json();
            console.log('Response data:', responseData);

            if (!response.ok) {
                throw new Error(`Failed to submit invoice: ${response.statusText}`);
            }

            if (responseData.order && responseData.order.status === "PENDING") {
                toast.info("FACTURA PENDIENTE", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } else {
                toast.success("Factura enviada con éxito", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }

            setFormData(payload);
            setProducts([{ quantity: '', description: '', unitPrice: '', discount: '', subtotal: '' }]);
            setClient({ name: '', documentType: 'id', documentNumber: '', email: '' });
            setPatientName('');
            setAdditionalDiscount('0');
        } catch (err) {
            console.error('Error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="invoice-form" onSubmit={handleSubmit}>
            <h2>Nueva Factura - Prestaciones Médicas</h2>

            <div className="products-section">
                <h3>Servicios</h3>
                {products.map((product, index) => (
                    <div key={index} className="product-row">
                        <input
                            type="number"
                            placeholder="Cantidad"
                            value={product.quantity}
                            onChange={(e) => updateProduct(index, 'quantity', e.target.value)}
                            required
                            min="0"
                            step="1"
                        />
                        <input
                            type="text"
                            placeholder="Descripción"
                            value={product.description}
                            onChange={(e) => updateProduct(index, 'description', e.target.value)}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Precio Unitario"
                            value={product.unitPrice}
                            onChange={(e) => updateProduct(index, 'unitPrice', e.target.value)}
                            required
                            min="0"
                            step="0.01"
                        />
                        <input
                            type="number"
                            placeholder="Descuento"
                            value={product.discount}
                            onChange={(e) => updateProduct(index, 'discount', e.target.value)}
                            min="0"
                            step="0.01"
                        />
                        <span className="subtotal">Subtotal: {product.subtotal || '0.00'}</span>
                    </div>
                ))}
                <button type="button" className="add-product" onClick={addProduct}>
                    + Agregar Servicio
                </button>
            </div>

            <div className="client-section">
                <h3>Datos del Cliente</h3>
                <input
                    type="text"
                    placeholder="Nombre/Razón Social"
                    value={client.name}
                    onChange={(e) => setClient({ ...client, name: e.target.value })}
                    required
                />
                <select
                    value={client.documentType}
                    onChange={(e) => setClient({ ...client, documentType: e.target.value })}
                >
                    <option value="id">ID</option>
                    <option value="nit">NIT</option>
                </select>
                <input
                    type="text"
                    placeholder="Número de ID"
                    value={client.documentNumber}
                    onChange={(e) => setClient({ ...client, documentNumber: e.target.value })}
                    required
                />
                <input
                    type="email"
                    placeholder="Correo Electrónico"
                    value={client.email}
                    onChange={(e) => setClient({ ...client, email: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Nombre del Paciente"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                />
            </div>

            <div className="discount-section">
                <input
                    type="number"
                    placeholder="Descuento Adicional"
                    value={additionalDiscount}
                    onChange={(e) => setAdditionalDiscount(e.target.value)}
                    min="0"
                    step="0.01"
                />
                <span className="total">Total: {calculateTotal()}</span>
            </div>

            {error && <p className="error">{error}</p>}
            <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? 'Facturando...' : 'FACTURAR'}
            </button>

            <style jsx>{`
        .invoice-form {
          background-color: #ffffff;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 600px;
        }
        h2 {
          font-size: 1.5rem;
          color: #333;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        h3 {
          font-size: 1.2rem;
          color: #555;
          margin-bottom: 1rem;
        }
        .products-section, .client-section, .discount-section {
          margin-bottom: 1.5rem;
        }
        .product-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          align-items: center;
        }
        input, select {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
          width: 100%;
        }
        .product-row input {
          flex: 1;
        }
        .subtotal {
          font-size: 0.9rem;
          color: #666;
        }
        .add-product {
          background-color: #2196F3;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .add-product:hover {
          background-color: #1976D2;
        }
        .client-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .discount-section {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .total {
          font-size: 1rem;
          color: #333;
          font-weight: 500;
        }
        .error {
          color: #ff4444;
          text-align: center;
          margin: 1rem 0;
        }
        .submit-btn {
          background-color: #4CAF50;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          width: 100%;
        }
        .submit-btn:hover:not(:disabled) {
          background-color: #388E3C;
        }
        .submit-btn:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
        </form>
    );
}