import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export const InvoicePrint = ({ order, onAfterPrint }) => {
  const hasPrinted = useRef(false);

  useEffect(() => {
    if (hasPrinted.current) return;
    hasPrinted.current = true;

    const handleAfterPrint = () => {
      window.removeEventListener("afterprint", handleAfterPrint);
      if (onAfterPrint) onAfterPrint();
    };

    window.addEventListener("afterprint", handleAfterPrint);
    window.print();
  }, []);

  if (!order) return null;

  const invoiceNumber = `INV-${new Date(order.created_at).getFullYear()}-${String(order.id).padStart(5, "0")}`;
  const date = new Date(order.created_at).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const tax = order.subtotal - order.subtotal / 1.21;

  return createPortal(
    <>
      <style>{`
        @media print {
          body > *:not(#playback-invoice-print) { display: none !important; }
          #playback-invoice-print { display: block !important; }
          @page { margin: 0; size: A4; }
        }

        #playback-invoice-print {
          display: none;
          font-family: 'Georgia', 'Times New Roman', serif;
          background: #ffffff;
          color: #1a1a1a;
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          box-sizing: border-box;
        }

        #playback-invoice-print .inv-header {
          background: #0f0f0f;
          padding: 28px 40px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        #playback-invoice-print .inv-header img {
          height: 36px;
          object-fit: contain;
        }

        #playback-invoice-print .inv-header-right {
          text-align: right;
        }

        #playback-invoice-print .inv-header-right p {
          color: #aaa;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0 0 4px;
          font-family: Arial, sans-serif;
        }

        #playback-invoice-print .inv-header-right h2 {
          color: #ffffff;
          font-size: 15px;
          font-weight: 400;
          margin: 0;
          letter-spacing: 1px;
          font-family: Arial, sans-serif;
        }

        #playback-invoice-print .inv-gold {
          height: 3px;
          background: linear-gradient(90deg, #d4af37, #f0d060, #d4af37);
        }

        #playback-invoice-print .inv-body {
          padding: 36px 40px;
        }

        #playback-invoice-print .inv-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 32px;
          gap: 24px;
        }

        #playback-invoice-print .inv-meta p {
          margin: 0 0 3px;
          font-size: 11px;
          font-family: Arial, sans-serif;
        }

        #playback-invoice-print .inv-meta-label {
          font-size: 9px !important;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #888 !important;
          margin-bottom: 6px !important;
        }

        #playback-invoice-print .inv-meta-value {
          font-size: 13px !important;
          color: #1a1a1a !important;
          font-weight: 600;
        }

        #playback-invoice-print hr {
          border: none;
          border-top: 1px solid #e5e5e5;
          margin: 0 0 24px;
        }

        #playback-invoice-print table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }

        #playback-invoice-print thead tr {
          border-bottom: 1.5px solid #0f0f0f;
        }

        #playback-invoice-print thead th {
          font-family: Arial, sans-serif;
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #888;
          padding: 0 0 10px;
          text-align: left;
          font-weight: 400;
        }

        #playback-invoice-print thead th:last-child {
          text-align: right;
        }

        #playback-invoice-print tbody tr {
          border-bottom: 1px solid #f0f0f0;
        }

        #playback-invoice-print tbody td {
          padding: 12px 0;
          font-family: Arial, sans-serif;
          font-size: 12px;
          color: #1a1a1a;
          vertical-align: middle;
        }

        #playback-invoice-print tbody td:last-child {
          text-align: right;
          font-weight: 600;
        }

        #playback-invoice-print .inv-totals {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 32px;
        }

        #playback-invoice-print .inv-totals-box {
          width: 240px;
        }

        #playback-invoice-print .inv-totals-row {
          display: flex;
          justify-content: space-between;
          font-family: Arial, sans-serif;
          font-size: 12px;
          color: #555;
          padding: 5px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        #playback-invoice-print .inv-totals-row.final {
          border-bottom: none;
          border-top: 1.5px solid #0f0f0f;
          padding-top: 10px;
          margin-top: 4px;
          font-size: 14px;
          font-weight: 700;
          color: #0f0f0f;
        }

        #playback-invoice-print .inv-address {
          background: #f7f7f7;
          border-left: 3px solid #d4af37;
          padding: 16px 20px;
          border-radius: 0 4px 4px 0;
          margin-bottom: 32px;
        }

        #playback-invoice-print .inv-address p {
          margin: 0 0 3px;
          font-family: Arial, sans-serif;
          font-size: 11px;
          color: #555;
        }

        #playback-invoice-print .inv-footer {
          border-top: 1px solid #e5e5e5;
          padding: 20px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        #playback-invoice-print .inv-footer p {
          font-family: Arial, sans-serif;
          font-size: 9px;
          color: #aaa;
          margin: 0;
          letter-spacing: 1px;
        }

        #playback-invoice-print .inv-badge {
          display: inline-block;
          background: #0f0f0f;
          color: #d4af37;
          font-family: Arial, sans-serif;
          font-size: 8px;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 2px;
        }
      `}</style>

      <div id="playback-invoice-print">

        {/* Header */}
        <div className="inv-header">
          <img
            src="https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vmini.png"
            alt="Playback"
          />
          <div className="inv-header-right">
            <p>Factura</p>
            <h2>{invoiceNumber}</h2>
          </div>
        </div>

        {/* Línea dorada */}
        <div className="inv-gold" />

        <div className="inv-body">

          {/* Meta */}
          <div className="inv-meta">
            <div>
              <p className="inv-meta-label">Emitida a</p>
              <p className="inv-meta-value">{order.user?.name} {order.user?.last_name}</p>
              <p style={{ fontSize: "11px", color: "#555", margin: "2px 0 0", fontFamily: "Arial, sans-serif" }}>
                {order.user?.email}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p className="inv-meta-label">Fecha</p>
              <p className="inv-meta-value">{date}</p>
              <p style={{ fontSize: "11px", color: "#555", margin: "2px 0 0", fontFamily: "Arial, sans-serif" }}>
                Pedido #{order.id}
              </p>
            </div>
          </div>

          <hr />

          {/* Tabla de productos */}
          <table>
            <thead>
              <tr>
                <th style={{ width: "50%" }}>Producto</th>
                <th>Precio unit.</th>
                <th>Uds.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.order_details?.map((d) => {
                const unitPrice = d.product.price * (1 - (d.product.discount || 0) / 100);
                const lineTotal = unitPrice * d.quantity;
                const name = d.product.name?.es || d.product.name?.en || d.product.name;

                return (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{name}</div>
                      {d.product.discount > 0 && (
                        <div style={{ fontSize: "10px", color: "#888" }}>Dto. {d.product.discount}%</div>
                      )}
                    </td>
                    <td>{unitPrice.toFixed(2)} €</td>
                    <td>×{d.quantity}</td>
                    <td>{lineTotal.toFixed(2)} €</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totales */}
          <div className="inv-totals">
            <div className="inv-totals-box">
              <div className="inv-totals-row">
                <span>Subtotal (IVA incl.)</span>
                <span>{order.subtotal?.toFixed(2)} €</span>
              </div>
              <div className="inv-totals-row">
                <span>IVA (21%)</span>
                <span>{tax.toFixed(2)} €</span>
              </div>
              <div className="inv-totals-row">
                <span>Gastos de envío</span>
                <span>{order.shipping_cost?.toFixed(2)} €</span>
              </div>
              <div className="inv-totals-row final">
                <span>Total pagado</span>
                <span>{order.total_price?.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Dirección de envío */}
          {order.shipping_address && (
            <div className="inv-address">
              <p style={{ fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "#888", marginBottom: "8px" }}>
                Dirección de envío
              </p>
              <p style={{ fontWeight: 600, color: "#1a1a1a", fontSize: "12px", marginBottom: "4px" }}>
                {order.shipping_address.full_name}
              </p>
              <p>{order.shipping_address.address}</p>
              <p>
                {order.shipping_address.postal_code} {order.shipping_address.city}
                {order.shipping_address.province ? `, ${order.shipping_address.province}` : ""}
              </p>
              <p>{order.shipping_address.country}</p>
              {order.shipping_address.phone && (
                <p style={{ marginTop: "4px", color: "#888" }}>{order.shipping_address.phone}</p>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="inv-footer">
          <p>PLAYBACK MARKETPLACE</p>
          <span className="inv-badge">Documento oficial</span>
          <p>Generado el {new Date().toLocaleDateString("es-ES")}</p>
        </div>

      </div>
    </>,
    document.body
  );
};