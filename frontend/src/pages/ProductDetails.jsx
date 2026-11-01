import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowLeft, ArrowRight, CheckCircle2, PackageCheck, ShoppingBag } from 'lucide-react';
import { addToCart } from '../store/cartSlice.js';
import demoProducts from '../data/demoProducts.js';
import './ProductCatalog.css';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadProduct = async () => {
      setStatus('loading');
      setError('');
      setProduct(null);
      setQuantity(1);
      setAdded(false);

      const demoProduct = demoProducts.find((item) => item._id === id);
      if (demoProduct) {
        setProduct(demoProduct);
        setStatus('ready');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('This product could not be found.');
          }
          throw new Error('We could not load this product. Please try again.');
        }

        const data = await response.json();
        setProduct(data);
        setStatus('ready');
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load this product.');
          setStatus('error');
        }
      }
    };

    loadProduct();
    return () => controller.abort();
  }, [id]);

  if (status === 'loading') {
    return <div className="product-detail-state" role="status">Loading product details…</div>;
  }

  if (status === 'error') {
    return (
      <div className="product-detail-state" role="alert">
        <h1>Product unavailable</h1>
        <p>{error}</p>
        <Link to="/">Back to the collection</Link>
      </div>
    );
  }

  const isInStock = product.countInStock > 0;

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, qty: quantity }));
    setAdded(true);
  };

  return (
    <div className="product-detail-page">
      <Link to="/" className="product-detail-back">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to the collection
      </Link>

      <div className="product-detail-layout">
        <div className="product-detail-image">
          {product.image
            ? <img src={product.image} alt={product.name} />
            : <ShoppingBag className="product-detail-placeholder" size={58} aria-hidden="true" />}
        </div>

        <section className="product-detail-info" aria-labelledby="product-name">
          <p className="product-detail-category">{product.category}</p>
          <h1 id="product-name">{product.name}</h1>
          <p className="product-detail-brand">By {product.brand}</p>
          <p className="product-detail-price">{currency.format(product.price)}</p>
          <hr className="product-detail-divider" />

          <h2 className="product-detail-description-title">About this product</h2>
          <p className="product-detail-description">{product.description}</p>

          <p className={isInStock ? 'product-detail-stock' : 'product-detail-stock out'}>
            {isInStock
              ? <><CheckCircle2 size={16} aria-hidden="true" /> In stock — {product.countInStock} available</>
              : 'Currently out of stock'}
          </p>

          <div className="product-detail-purchase">
            <label className="product-detail-quantity" htmlFor="product-quantity">
              Quantity
              <select
                id="product-quantity"
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                disabled={!isInStock}
              >
                {Array.from({ length: Math.min(product.countInStock, 10) }, (_, index) => index + 1)
                  .map((count) => <option key={count} value={count}>{count}</option>)}
              </select>
            </label>
            <button
              type="button"
              className="product-detail-add"
              onClick={handleAddToCart}
              disabled={!isInStock}
            >
              <ShoppingBag size={17} aria-hidden="true" />
              {isInStock ? 'Add to cart' : 'Out of stock'}
            </button>
            {added && (
              <Link to="/cart" className="product-detail-cart-link" role="status">
                Added to cart — view cart <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
          </div>

          <p className="product-detail-shipping">
            <PackageCheck size={17} aria-hidden="true" />
            Shipping and taxes are calculated when checkout becomes available.
          </p>
        </section>
      </div>
    </div>
  );
}

export default ProductDetails;
