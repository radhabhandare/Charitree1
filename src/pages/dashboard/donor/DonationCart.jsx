import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './DonationCart.css';

const DonationCart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [donationMethod, setDonationMethod] = useState('ecommerce');
  const [courierDetails, setCourierDetails] = useState({
    courierName: '',
    trackingId: '',
    receiptImage: null
  });
  const [selfDeliveryDetails, setSelfDeliveryDetails] = useState({
    deliveryDate: '',
    deliveryTime: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('donationCart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  };

  const saveCart = (items) => {
    localStorage.setItem('donationCart', JSON.stringify(items));
    setCartItems(items);
  };

  const updateQuantity = (index, quantity) => {
    const newCart = [...cartItems];
    if (quantity <= 0) {
      newCart.splice(index, 1);
    } else {
      newCart[index].quantity = quantity;
    }
    saveCart(newCart);
  };

  const removeItem = (index) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    saveCart(newCart);
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const donationData = {
        items: cartItems.map(item => ({
          name: item.itemName,
          quantity: item.quantity,
          schoolId: item.schoolId
        })),
        schoolId: cartItems[0].schoolId,
        donationMethod,
        courierDetails: donationMethod === 'courier' ? courierDetails : null,
        selfDeliveryDetails: donationMethod === 'self_delivery' ? selfDeliveryDetails : null
      };

      const response = await api.post('/donations', donationData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        localStorage.removeItem('donationCart');
        alert('Donation initiated successfully!');
        navigate('/donor/history');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to process donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="donation-cart">
        <div className="cart-header">
          <button className="back-btn" onClick={() => navigate('/donor/browse')}>← Continue Shopping</button>
          <h1>Your Donation Cart</h1>
        </div>
        <div className="empty-cart">
          <span className="empty-icon">🛒</span>
          <h3>Your cart is empty</h3>
          <p>Browse schools and add items to donate</p>
          <button className="browse-btn" onClick={() => navigate('/donor/browse')}>Browse Schools</button>
        </div>
      </div>
    );
  }

  return (
    <div className="donation-cart">
      <div className="cart-header">
        <button className="back-btn" onClick={() => navigate('/donor/browse')}>← Continue Shopping</button>
        <h1>Your Donation Cart</h1>
        <span className="cart-count">{getTotalItems()} items</span>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>School</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, index) => (
                <tr key={index}>
                  <td className="item-name">{item.itemName}</td>
                  <td className="school-name">{item.schoolName}</td>
                  <td className="item-quantity">
                    <input
                      type="number"
                      min="1"
                      max={item.maxQuantity}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(index, parseInt(e.target.value))}
                    />
                  </td>
                  <td className="item-actions">
                    <button className="remove-btn" onClick={() => removeItem(index)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="delivery-options">
          <h3>Choose Delivery Method</h3>
          
          <div className="method-options">
            <label className={`method-option ${donationMethod === 'ecommerce' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="donationMethod"
                value="ecommerce"
                checked={donationMethod === 'ecommerce'}
                onChange={(e) => setDonationMethod(e.target.value)}
              />
              <div className="method-icon">🛒</div>
              <div className="method-info">
                <strong>E-commerce Donation</strong>
                <p>Pay online, items shipped directly to school</p>
              </div>
            </label>

            <label className={`method-option ${donationMethod === 'courier' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="donationMethod"
                value="courier"
                checked={donationMethod === 'courier'}
                onChange={(e) => setDonationMethod(e.target.value)}
              />
              <div className="method-icon">📦</div>
              <div className="method-info">
                <strong>Courier Donation</strong>
                <p>Ship items yourself, share tracking details</p>
              </div>
            </label>

            <label className={`method-option ${donationMethod === 'self_delivery' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="donationMethod"
                value="self_delivery"
                checked={donationMethod === 'self_delivery'}
                onChange={(e) => setDonationMethod(e.target.value)}
              />
              <div className="method-icon">🚗</div>
              <div className="method-info">
                <strong>Self Delivery</strong>
                <p>Schedule a visit to deliver in person</p>
              </div>
            </label>
          </div>

          {donationMethod === 'courier' && (
            <div className="courier-details">
              <h4>Courier Details</h4>
              <div className="form-group">
                <label>Courier Name</label>
                <input
                  type="text"
                  value={courierDetails.courierName}
                  onChange={(e) => setCourierDetails({...courierDetails, courierName: e.target.value})}
                  placeholder="e.g., DTDC, BlueDart, etc."
                />
              </div>
              <div className="form-group">
                <label>Tracking ID</label>
                <input
                  type="text"
                  value={courierDetails.trackingId}
                  onChange={(e) => setCourierDetails({...courierDetails, trackingId: e.target.value})}
                  placeholder="Enter tracking number"
                />
              </div>
              <div className="form-group">
                <label>Receipt/Screenshot (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCourierDetails({...courierDetails, receiptImage: e.target.files[0]})}
                />
              </div>
            </div>
          )}

          {donationMethod === 'self_delivery' && (
            <div className="self-delivery-details">
              <h4>Schedule Delivery</h4>
              <div className="form-group">
                <label>Delivery Date</label>
                <input
                  type="date"
                  value={selfDeliveryDetails.deliveryDate}
                  onChange={(e) => setSelfDeliveryDetails({...selfDeliveryDetails, deliveryDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label>Preferred Time</label>
                <select
                  value={selfDeliveryDetails.deliveryTime}
                  onChange={(e) => setSelfDeliveryDetails({...selfDeliveryDetails, deliveryTime: e.target.value})}
                >
                  <option value="">Select time</option>
                  <option value="9am-11am">9:00 AM - 11:00 AM</option>
                  <option value="11am-1pm">11:00 AM - 1:00 PM</option>
                  <option value="1pm-3pm">1:00 PM - 3:00 PM</option>
                  <option value="3pm-5pm">3:00 PM - 5:00 PM</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={selfDeliveryDetails.notes}
                  onChange={(e) => setSelfDeliveryDetails({...selfDeliveryDetails, notes: e.target.value})}
                  placeholder="Any special instructions..."
                  rows="3"
                />
              </div>
            </div>
          )}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-details">
            <div className="summary-row">
              <span>Total Items:</span>
              <span>{getTotalItems()}</span>
            </div>
            <div className="summary-row">
              <span>Schools:</span>
              <span>{new Set(cartItems.map(i => i.schoolId)).size}</span>
            </div>
          </div>
          <button 
            className="checkout-btn" 
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Complete Donation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonationCart;