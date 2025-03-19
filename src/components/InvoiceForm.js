// components/InvoiceForm.js
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function InvoiceForm({ setFormData }) {
    const [formState, setFormState] = useState({
        productCode: '',
        description: '',
        quantity: '',
        unitPrice: '',
        discount: '',
        clientName: '',
        clientEmail: '',
        documentNumber: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            explicit_products: [
                {
                    product_code: formState.productCode || 'explicit-1',
                    description: formState.description || 'med 1',
                    sin_product_code: 35260,
                    sin_activity_code: 477311,
                    category: 'test category',
                    invoice_type: 'facturaElectronicaCompraVenta',
                    measure_unit: 'unidad',
                    sin_measure_unit_code: 57,
                    product_metadata: { serial_number: '', imei: '' },
                    quantity: parseInt(formState.quantity) || 1,
                    unit_price: formState.unitPrice || '100.0',
                    discount: formState.discount || '10.0',
                    subtotal: ((parseFloat(formState.unitPrice) || 100) * (parseInt(formState.quantity) || 1) - (parseFloat(formState.discount) || 10)).toFixed(2),
                },
            ],
            explicit_client: {
                name: formState.clientName || 'perico de los palotes',
                email: formState.clientEmail || 'eduardo.laruta@gmail.com',
                sin_document_type: 1,
                document_number: formState.documentNumber || '123456',
                complement: null,
                client_code: 'palotes123',
                exception_code: 0,
            },
            customer_id: 1,
            branch_id: 1,
            pos_id: 1,
            doc_sector_id: 1,
            payment_method_id: 1,
            currency_id: 1,
            currency_conversion_factor: '1',
            cashier_name: 'scarlet jo',
            is_offline: true,
            additional_discount: '0',
        };

        try {
            const response = await fetch(
                'https://prod-core-invoice-service-4z5dz4d2yq-uc.a.run.app/invoices/emit/offline?customer_id=1&branch_id=1&pos_id=1&event_id=54&doc_sector=1',
                {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to submit invoice');
            }

            const responseData = await response.json();
            console.log('Invoice submission response:', responseData);

            const invoiceNumber = responseData.emission_response?.invoice_number;
            if (invoiceNumber) {
                toast.success(`Factura enviada con éxito. Invoice Number: ${invoiceNumber}. Generando PDF en 7 segundos...`, {
                    position: "top-right",
                    autoClose: 7000, // Match the delay for user feedback
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });

                // Wait 7 seconds before fetching the PDF
                setTimeout(async () => {
                    try {
                        const pdfUrl = `https://prod-core-invoice-service-4z5dz4d2yq-uc.a.run.app/invoices/pdf?invoice_number=${invoiceNumber}&customer_id=1&is_roll=1`;
                        const token = 'wqaevQPKrMVPvxlxuhpiURH0XoD2pUo6FTt2LB8EciI'; // Replace with secure method in production

                        const pdfResponse = await fetch(pdfUrl, {
                            method: 'GET',
                            headers: {
                                'accept': 'application/json',
                                'Authorization': `Bearer ${token}`,
                            },
                        });

                        if (!pdfResponse.ok) {
                            throw new Error('Failed to fetch PDF after delay');
                        }

                        const pdfBlob = await pdfResponse.blob();
                        const pdfObjectUrl = URL.createObjectURL(pdfBlob);
                        window.open(pdfObjectUrl, '_blank');
                    } catch (pdfErr) {
                        toast.error(`Error fetching PDF: ${pdfErr.message}`);
                        console.error('PDF fetch error:', pdfErr);
                    }
                }, 7000); // 7 seconds delay

                setFormData(responseData.order); // Pass order data to parent if needed
            } else {
                throw new Error('No invoice number found in response');
            }

            // Reset form
            setFormState({
                productCode: '',
                description: '',
                quantity: '',
                unitPrice: '',
                discount: '',
                clientName: '',
                clientEmail: '',
                documentNumber: '',
            });
        } catch (err) {
            toast.error(`Error: ${err.message}`);
            console.error('Invoice submission error:', err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="invoice-form">
            <h2>Venta Farmacia</h2>

            <div className="form-section">
                <h3>Producto</h3>
                <input
                    type="text"
                    name="productCode"
                    value={formState.productCode}
                    onChange={handleChange}
                    placeholder="Código del producto"
                />
                <input
                    type="text"
                    name="description"
                    value={formState.description}
                    onChange={handleChange}
                    placeholder="Descripción"
                />
                <input
                    type="number"
                    name="quantity"
                    value={formState.quantity}
                    onChange={handleChange}
                    placeholder="Cantidad"
                    min="1"
                />
                <input
                    type="text"
                    name="unitPrice"
                    value={formState.unitPrice}
                    onChange={handleChange}
                    placeholder="Precio unitario"
                />
                <input
                    type="text"
                    name="discount"
                    value={formState.discount}
                    onChange={handleChange}
                    placeholder="Descuento"
                />
            </div>

            <div className="form-section">
                <h3>Cliente</h3>
                <input
                    type="text"
                    name="clientName"
                    value={formState.clientName}
                    onChange={handleChange}
                    placeholder="Nombre del cliente"
                />
                <input
                    type="email"
                    name="clientEmail"
                    value={formState.clientEmail}
                    onChange={handleChange}
                    placeholder="Correo electrónico"
                />
                <input
                    type="text"
                    name="documentNumber"
                    value={formState.documentNumber}
                    onChange={handleChange}
                    placeholder="Número de documento"
                />
            </div>

            <button type="submit">FACTURAR</button>

            <style jsx>{`
        .invoice-form {
          width: 100%;
          max-width: 600px;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        h2 {
          font-size: 1.5rem;
          color: #333;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        .form-section {
          margin-bottom: 1.5rem;
        }
        h3 {
          font-size: 1.2rem;
          color: #555;
          margin-bottom: 1rem;
        }
        input {
          display: block;
          width: 100%;
          padding: 0.5rem;
          margin-bottom: 1rem;
          font-size: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
        }
        button {
          width: 100%;
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
        </form>
    );
}