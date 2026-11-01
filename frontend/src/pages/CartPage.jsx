import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  LockKeyhole,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react';
import { addToCart, removeFromCart, updateCartQuantity } from '../store/cartSlice.js';
import './CartPage.css';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function CartPage() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const itemCount = cartItems.reduce((total, item) => total + item.qty, 0);
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.qty, 0);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationError, setRecommendationError] = useState('');
  const [checkoutNotice, setCheckoutNotice] = useState('');
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);

  const cartProductIds = useMemo(
    () => new Set(cartItems.map((item) => item._id)),
    [cartItems]
  );
  const cartCategories = useMemo(
    () => new Set(cartItems.map((item) => item.category).filter(Boolean)),
    [cartItems]
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadRecommendations = async () => {
      setIsLoadingRecommendations(true);
      setRecommendationError('');

      try {
        const response = await fetch(`${API_BASE_URL}/products`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Recommendations are unavailable right now.');
        }

        const products = await response.json();
        if (!Array.isArray(products)) {
          throw new Error('The products service returned an unexpected response.');
        }

        const availableProducts = products.filter(
          (product) => !cartProductIds.has(product._id) && product.countInStock > 0
        );
        availableProducts.sort(
          (first, second) =>
            Number(cartCategories.has(second.category)) - Number(cartCategories.has(first.category))
        );
        setRecommendations(availableProducts.slice(0, 3));
      } catch (error) {
        if (error.name !== 'AbortError') {
          setRecommendationError(
            error instanceof Error ? error.message : 'Recommendations are unavailable right now.'
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingRecommendations(false);
        }
      }
    };

    loadRecommendations();
    return () => controller.abort();
  }, [cartCategories, cartProductIds]);

  const handleQuantityChange = (item, qty) => {
    dispatch(updateCartQuantity({ id: item._id, qty }));
  };

  const handleCheckout = () => {
    setCheckoutNotice('Checkout is not available yet. Your cart is saved on this device.');
  };

  return (
    <div className="cart-page">
      <Link to="/" className="cart-back-link">
        <ChevronLeft size={17} aria-hidden="true" />
        Continue shopping
      </Link>

      <header className="cart-header">
        <div>
          <p className="cart-eyebrow">YOUR SELECTION</p>
          <h1>Your shopping cart</h1>
          <p className="cart-header-caption">
            {itemCount === 1 ? 'One lovely find, ready when you are.' : `${itemCount} items in your bag`}
          </p>
        </div>
        <div className="cart-count-badge" aria-label={`${itemCount} items`}>
          <ShoppingBag size={18} aria-hidden="true" />
          <span>{itemCount}</span>
        </div>
      </header>

      {cartItems.length === 0 ? (
        <section className="cart-empty">
          <div className="cart-empty-icon"><ShoppingBag size={30} aria-hidden="true" /></div>
          <h2>Your cart is waiting</h2>
          <p>Explore the shop and add something you love.</p>
          <Link to="/" className="cart-primary-link">
            Explore the shop <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items-panel" aria-labelledby="cart-items-title">
            <div className="cart-panel-heading">
              <h2 id="cart-items-title">Product details</h2>
              <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
            </div>

            <ul className="cart-items-list">
              {cartItems.map((item) => (
                <li className="cart-item" key={item._id}>
                  <div className="cart-product-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-product-details">
                    <div className="cart-product-topline">
                      <div>
                        <p className="cart-product-brand">{item.brand || item.category}</p>
                        <h3>{item.name}</h3>
                      </div>
                      <p className="cart-line-price">{currency.format(item.price * item.qty)}</p>
                    </div>
                    {item.category && <p className="cart-product-category">{item.category}</p>}
                    <p className={`cart-stock ${item.countInStock > 0 ? '' : 'cart-stock-out'}`}>
                      {item.countInStock > 0 ? 'In stock and ready to ship' : 'Currently out of stock'}
                    </p>
                    <div className="cart-item-actions">
                      <div className="cart-quantity-control" aria-label={`Quantity for ${item.name}`}>
                        <button
                          type="button"
                          aria-label={`Decrease ${item.name} quantity`}
                          onClick={() => handleQuantityChange(item, item.qty - 1)}
                          disabled={item.qty <= 1}
                        >
                          <Minus size={14} aria-hidden="true" />
                        </button>
                        <span aria-live="polite">{item.qty}</span>
                        <button
                          type="button"
                          aria-label={`Increase ${item.name} quantity`}
                          onClick={() => handleQuantityChange(item, item.qty + 1)}
                          disabled={item.countInStock > 0 && item.qty >= item.countInStock}
                        >
                          <Plus size={14} aria-hidden="true" />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="cart-remove-button"
                        onClick={() => dispatch(removeFromCart(item._id))}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-items-footer">
              <Check size={16} aria-hidden="true" />
              Your cart is saved on this device
            </div>
          </section>

          <aside className="cart-summary" aria-labelledby="cart-summary-title">
            <div className="cart-panel-heading">
              <h2 id="cart-summary-title">Order summary</h2>
            </div>
            <div className="cart-summary-lines">
              <div><span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span><strong>{currency.format(subtotal)}</strong></div>
              <div><span><Truck size={16} aria-hidden="true" /> Shipping</span><span className="cart-summary-note">Not calculated yet</span></div>
              <div><span>Estimated tax</span><span className="cart-summary-note">Not calculated yet</span></div>
            </div>
            <div className="cart-summary-total">
              <div><strong>Estimated total</strong><strong>{currency.format(subtotal)}</strong></div>
              <p>Before shipping and taxes</p>
            </div>
            <button type="button" className="cart-checkout-button" onClick={handleCheckout}>
              Continue to checkout <ArrowRight size={17} aria-hidden="true" />
            </button>
            {checkoutNotice && <p className="cart-checkout-notice" role="status">{checkoutNotice}</p>}
            <Link to="/" className="cart-continue-link">Continue browsing</Link>

            <div className="cart-trust-panel">
              <div className="cart-trust-row">
                <ShieldCheck size={19} aria-hidden="true" />
                <div><strong>Protected account access</strong><span>Your sign-in details stay private.</span></div>
              </div>
              <div className="cart-trust-row">
                <LockKeyhole size={18} aria-hidden="true" />
                <div><strong>No payment details stored</strong><span>Payment is not collected on this demo.</span></div>
              </div>
            </div>
          </aside>
        </div>
      )}

      <section className="cart-recommendations" aria-labelledby="cart-recommendations-title">
        <div className="cart-recommendations-heading">
          <div>
            <p className="cart-eyebrow">A LITTLE MORE TO LOVE</p>
            <h2 id="cart-recommendations-title">You might also like</h2>
          </div>
          <Link to="/" className="cart-view-all">Explore all <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>

        {isLoadingRecommendations && <p className="cart-recommendation-message">Finding picks for you…</p>}
        {!isLoadingRecommendations && recommendationError && (
          <p className="cart-recommendation-message" role="status">{recommendationError}</p>
        )}
        {!isLoadingRecommendations && !recommendationError && recommendations.length === 0 && (
          <p className="cart-recommendation-message">No recommendations are available right now.</p>
        )}
        {!isLoadingRecommendations && !recommendationError && recommendations.length > 0 && (
          <div className="cart-recommendations-grid">
            {recommendations.map((product) => (
              <article className="cart-recommendation-card" key={product._id}>
                <div className="cart-recommendation-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="cart-recommendation-info">
                  <p>{product.brand || product.category}</p>
                  <h3>{product.name}</h3>
                  <div className="cart-recommendation-bottom">
                    <strong>{currency.format(product.price)}</strong>
                    <button
                      type="button"
                      onClick={() => dispatch(addToCart({ ...product, qty: 1 }))}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <Plus size={16} aria-hidden="true" /> Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default CartPage;
