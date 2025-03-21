// components/InvoiceForm.js
import { useState } from 'react';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

export default function InvoiceForm({ setFormData }) {
    const [products, setProducts] = useState([{ productCode: '', description: '', quantity: '', unitPrice: '', discount: '', subtotal: '' }]);
    const [client, setClient] = useState({ name: '', email: '', documentNumber: '' });
    const [lastInvoiceNumber, setLastInvoiceNumber] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const addProduct = () => {
        setProducts([...products, { productCode: '', description: '', quantity: '', unitPrice: '', discount: '', subtotal: '' }]);
    };

    const updateProduct = (index, field, value) => {
        const newProducts = [...products];
        newProducts[index][field] = value;
        if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
            const qty = parseFloat(newProducts[index].quantity) || 1;
            const price = parseFloat(newProducts[index].unitPrice) || 0;
            const disc = parseFloat(newProducts[index].discount) || 0;
            newProducts[index].subtotal = ((qty * price) - disc).toFixed(2);
        }
        setProducts(newProducts);
    };

    const calculateTotal = () => {
        return products.reduce((sum, p) => sum + (parseFloat(p.subtotal) || 0), 0).toFixed(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (products.some(p => !p.quantity || !p.description || !p.unitPrice)) {
            toast.error('Todos los productos deben tener cantidad, descripción y precio');
            return;
        }
        if (!client.name || !client.documentNumber || !client.email) {
            toast.error('Por favor complete todos los campos del cliente');
            return;
        }

        setIsLoading(true);

        const total = calculateTotal();
        const payload = {
            products: products.map((p, index) => ({
                product_code: p.productCode || `explicit-${index + 1}`,
                description: p.description || 'med 1',
                sin_product_code: 35260,
                sin_activity_code: 477311,
                category: 'test category',
                invoice_type: 'facturaElectronicaCompraVenta',
                measure_unit: 'unidad',
                sin_measure_unit_code: 57,
                product_metadata: { serial_number: '', imei: '' },
                unit_price: parseFloat(p.unitPrice) || 100.0,
                quantity: parseInt(p.quantity) || 1,
                discount: parseFloat(p.discount) || 0,
                subtotal: p.subtotal || '0.00',
            })),
            customer_id: 1,
            client: {
                name: client.name || 'perico de los palotes',
                email: client.email || 'eduardo.laruta@gmail.com',
                sin_document_type: 1,
                document_number: client.documentNumber || '123456',
                client_code: 'palotes123',
                exception_code: 0,
            },
            branch_id: 1,
            pos_id: 1,
            user_id: 1,
            doc_sector_id: 1,
            payment_method_id: 1,
            currency_id: 1,
            currency_conversion_factor: 1,
            total_amount: parseFloat(total),
            total_amount_iva: parseFloat(total),
            total_amount_currency: parseFloat(total),
            additional_discount: 0,
            gift_card_amount: 0,
            cashier_name: 'scarlet jo',
            card_number: null,
            id_comp_int: 2533542,
            is_roll: 1,
            is_offline: true,
        };

        try {
            const url = 'https://prod-core-invoice-service-4z5dz4d2yq-uc.a.run.app/v1/api/orders/explicit?do_emit=1';
            console.log('Sending request to:', url);
            console.log('Payload:', JSON.stringify(payload, null, 2));

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer wqaevQPKrMVPvxlxuhpiURH0XoD2pUo6FTt2LB8EciI',
                },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json();
            console.log('Response:', responseData);

            if (!response.ok) {
                throw new Error(`Failed to submit invoice (Status: ${response.status})`);
            }

            const invoiceNumber = responseData.emission_response?.invoice_number;
            if (invoiceNumber) {
                setLastInvoiceNumber(invoiceNumber);
                toast.success(`Factura enviada con éxito. Invoice Number: ${invoiceNumber}`, {
                    position: 'top-right',
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                setFormData(payload);
            } else {
                throw new Error('No invoice number found in response');
            }

            setProducts([{ productCode: '', description: '', quantity: '', unitPrice: '', discount: '', subtotal: '' }]);
            setClient({ name: '', email: '', documentNumber: '' });
        } catch (err) {
            toast.error(`Error al facturar: ${err.message}`);
            console.error('Invoice submission error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrintPDF = async () => {
        if (!lastInvoiceNumber) {
            toast.error('No invoice number available. Please submit an invoice first.');
            return;
        }

        try {
            const pdfUrl = `https://prod-core-invoice-service-4z5dz4d2yq-uc.a.run.app/invoices/pdf?invoice_number=${lastInvoiceNumber}&customer_id=1&is_roll=1`;
            const token = 'wqaevQPKrMVPvxlxuhpiURH0XoD2pUo6FTt2LB8EciI';

            const response = await fetch(pdfUrl, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch PDF (Status: ${response.status})`);
            }

            const pdfBlob = await response.blob();
            const pdfObjectUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfObjectUrl, '_blank');
        } catch (err) {
            toast.error(`Error fetching PDF: ${err.message}`);
            console.error('PDF fetch error:', err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="invoice-form">
            <h2>Venta Farmacia</h2>

            <div className="products-section">
                <h3>Productos</h3>
                {products.map((product, index) => (
                    <div key={index} className="product-row">
                        <input
                            type="text"
                            placeholder="Código del producto"
                            value={product.productCode}
                            onChange={(e) => updateProduct(index, 'productCode', e.target.value)}
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
                            placeholder="Cantidad"
                            value={product.quantity}
                            onChange={(e) => updateProduct(index, 'quantity', e.target.value)}
                            min="1"
                            step="1"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Precio unitario"
                            value={product.unitPrice}
                            onChange={(e) => updateProduct(index, 'unitPrice', e.target.value)}
                            min="0"
                            step="0.01"
                            required
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
                    + Agregar Producto
                </button>
            </div>

            <div className="client-section">
                <h3>Cliente</h3>
                <input
                    type="text"
                    placeholder="Nombre del cliente"
                    value={client.name}
                    onChange={(e) => setClient({ ...client, name: e.target.value })}
                    required
                />
                <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={client.email}
                    onChange={(e) => setClient({ ...client, email: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Número de documento"
                    value={client.documentNumber}
                    onChange={(e) => setClient({ ...client, documentNumber: e.target.value })}
                    required
                />
            </div>

            <div className="total-section">
                <span className="total">Total: {calculateTotal()}</span>
            </div>

            <div className="button-group">
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Facturando...' : 'FACTURAR'}
                </button>
                <button type="button" onClick={handlePrintPDF} disabled={!lastInvoiceNumber || isLoading}>
                    Print PDF
                </button>
            </div>

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
                .products-section, .client-section, .total-section {
                    margin-bottom: 1.5rem;
                }
                h3 {
                    font-size: 1.2rem;
                    color: #555;
                    margin-bottom: 1rem;
                }
                .product-row {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1rem;
                    align-items: center;
                }
                input {
                    padding: 0.5rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 0.9rem;
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
                    transition: background-color 0.3s;
                }
                .add-product:hover {
                    background-color: #1976D2;
                }
                .client-section {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .total-section {
                    text-align: right;
                }
                .total {
                    font-size: 1rem;
                    color: #333;
                    font-weight: 500;
                }
                .button-group {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
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
                button:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }
                button:hover:not(:disabled) {
                    background-color: #1976D2;
                }
            `}</style>
        </form>
    );
}

InvoiceForm.propTypes = {
    setFormData: PropTypes.func.isRequired,
};