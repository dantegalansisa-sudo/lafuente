import { useState } from 'react';
import type { CartItem } from '../hooks/useCart';

interface CheckoutFormProps {
  items: CartItem[];
  totalPrice: number;
  onOrderSent: () => void;
}

export default function CheckoutForm({ items, totalPrice, onOrderSent }: CheckoutFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<'Delivery' | 'Pick-up'>('Delivery');
  const [address, setAddress] = useState('');
  const [sector, setSector] = useState('');
  const [notes, setNotes] = useState('');

  const buildWhatsAppMessage = () => {
    const line = `━━━━━━━━━━━━━━━━━━━━`;
    let msg = '';

    // Header
    msg += `*LA FUENTE SUPERMARKET*\n`;
    msg += `_Nuevo pedido_\n`;
    msg += `${line}\n\n`;

    // Customer info
    msg += `*DATOS DEL CLIENTE*\n\n`;
    msg += `   Nombre: *${name}*\n`;
    msg += `   Telefono: *${phone}*\n`;
    msg += `   Entrega: *${deliveryType}*\n`;
    if (deliveryType === 'Delivery') {
      msg += `   Direccion: *${address}*\n`;
      if (sector) msg += `   Sector: *${sector}*\n`;
    }

    // Products
    msg += `\n${line}\n\n`;
    msg += `*PRODUCTOS (${items.length})*\n\n`;
    items.forEach((item, i) => {
      const num = String(i + 1).padStart(2, '0');
      const subtotal = (item.price * item.qty).toFixed(2);
      msg += `   ${num}. ${item.name}\n`;
      msg += `         ${item.qty} x RD$${item.price.toFixed(2)} = *RD$${subtotal}*\n\n`;
    });

    // Total
    msg += `${line}\n\n`;
    msg += `   *TOTAL: RD$${totalPrice.toFixed(2)}*\n`;

    // Notes
    if (notes) {
      msg += `\n${line}\n\n`;
      msg += `   *Notas:* ${notes}\n`;
    }

    // Footer
    msg += `\n${line}\n`;
    msg += `_Pedido enviado desde lafuentesupermarket.com_`;

    return `https://wa.me/18095933919?text=${encodeURIComponent(msg)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    if (deliveryType === 'Delivery' && !address.trim()) return;

    const url = buildWhatsAppMessage();
    window.open(url, '_blank');
    onOrderSent();
  };

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <div className="checkout-form__group">
        <label className="checkout-form__label">Nombre completo</label>
        <input
          className="checkout-form__input"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Tu nombre"
          required
        />
      </div>

      <div className="checkout-form__group">
        <label className="checkout-form__label">Telefono / WhatsApp</label>
        <input
          className="checkout-form__input"
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="809-000-0000"
          required
        />
      </div>

      <div className="checkout-form__group">
        <label className="checkout-form__label">Tipo de entrega</label>
        <div className="checkout-form__radio-group">
          <label className={`checkout-form__radio ${deliveryType === 'Delivery' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="deliveryType"
              value="Delivery"
              checked={deliveryType === 'Delivery'}
              onChange={() => setDeliveryType('Delivery')}
            />
            🚚 Delivery
          </label>
          <label className={`checkout-form__radio ${deliveryType === 'Pick-up' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="deliveryType"
              value="Pick-up"
              checked={deliveryType === 'Pick-up'}
              onChange={() => setDeliveryType('Pick-up')}
            />
            🏪 Pick-up
          </label>
        </div>
      </div>

      {deliveryType === 'Delivery' && (
        <>
          <div className="checkout-form__group">
            <label className="checkout-form__label">Direccion</label>
            <input
              className="checkout-form__input"
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Tu direccion"
              required
            />
          </div>
          <div className="checkout-form__group">
            <label className="checkout-form__label">Sector / Barrio</label>
            <input
              className="checkout-form__input"
              type="text"
              value={sector}
              onChange={e => setSector(e.target.value)}
              placeholder="Tu sector"
            />
          </div>
        </>
      )}

      <div className="checkout-form__group">
        <label className="checkout-form__label">Notas adicionales</label>
        <textarea
          className="checkout-form__input"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Alguna nota especial para tu pedido?"
          rows={3}
        />
      </div>

      <button type="submit" className="checkout-form__submit">
        🛒 ENVIAR PEDIDO POR WHATSAPP
      </button>
    </form>
  );
}
