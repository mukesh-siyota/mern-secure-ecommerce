import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, ShoppingBag, Sparkles } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice.js';
import demoProducts from '../data/demoProducts.js';
import './ProductCatalog.css';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function ProductCatalog() {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [isShowingDemoProducts, setIsShowingDemoProducts] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      setStatus('loading');
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/products`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error('We could not load the products. Please try again.');
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('The products service returned an unexpected response.');
        }

        setIsShowingDemoProducts(data.length === 0);
        setProducts(data.length ? data : demoProducts);
        setStatus('ready');
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          const message = requestError instanceof Error ? requestError.message : 'Unable to load products.';
          setError(message);
          setIsShowingDemoProducts(true);
          setProducts(demoProducts);
          setStatus('ready');
        }
      }
    };

    loadProducts();
    return () => controller.abort();
  }, []);

  const categories = useMemo(
    () => ['All', ...new Set(products.map((product) => product.category).filter(Boolean))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = !normalizedSearch
        || [product.name, product.brand, product.category, product.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch));
      return matchesCategory && matchesSearch;
    });
  }, [products, search, selectedCategory]);

  return (
    <div className="catalog-page">
      <section className="catalog-hero">
        <div className="catalog-hero-copy">
          <span className="catalog-hero-kicker"><Sparkles size={14} aria-hidden="true" /> THE EVERYDAY EDIT</span>
          <h1>Find your next<br /><span>favorite thing.</span></h1>
          <p>Thoughtful picks, everyday essentials, and a little something just for you.</p>
          <a className="catalog-hero-button" href="#shop">
            Explore the collection <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
        <div className="catalog-hero-art" aria-hidden="true">
          <div className="catalog-orbit catalog-orbit-one" />
          <div className="catalog-orbit catalog-orbit-two" />
          <div className="catalog-hero-bag"><ShoppingBag size={86} strokeWidth={1.15} /></div>
          <span className="catalog-art-sparkle sparkle-one">✦</span>
          <span className="catalog-art-sparkle sparkle-two">✧</span>
          <span className="catalog-art-dot" />
        </div>
        <div className="catalog-hero-note"><span>01</span> Curated for you</div>
      </section>

      <section className="catalog-shop" id="shop" aria-labelledby="catalog-title">
        <div className="catalog-section-header">
          <div>
            <p className="catalog-eyebrow">THE GOOD STUFF</p>
            <h2 id="catalog-title">Shop the collection</h2>
            <p className="catalog-subtitle">A few great finds to make your day.</p>
          </div>
          <label className="catalog-search">
            <Search size={17} aria-hidden="true" />
            <span className="catalog-visually-hidden">Search products</span>
            <input
              type="search"
              placeholder="Search products"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>

        {categories.length > 1 && (
          <div className="catalog-filters" aria-label="Filter products by category">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={selectedCategory === category ? 'catalog-filter active' : 'catalog-filter'}
                aria-pressed={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {status === 'loading' && (
          <div className="catalog-message" role="status">Finding the good stuff…</div>
        )}
        {status === 'ready' && filteredProducts.length === 0 && (
          <div className="catalog-message">
            <strong>No matches found.</strong>
            <span>Try another search or choose a different category.</span>
          </div>
        )}
        {status === 'ready' && filteredProducts.length > 0 && (
          <>
            {isShowingDemoProducts && (
              <p className={error ? 'catalog-demo-note catalog-demo-note-warning' : 'catalog-demo-note'} role={error ? 'status' : undefined}>
                {error
                  ? `Could not load the product catalog (${error}). Showing sample products; add products to your database to show your own.`
                  : 'You’re viewing sample products. Add products to your database to show your own catalog.'}
              </p>
            )}
            <div className="catalog-grid">
              {filteredProducts.map((product) => (
                <article className="product-card" key={product._id}>
                  <Link
                    to={`/product/${product._id}`}
                    className="product-card-image"
                    aria-label={`View ${product.name} details`}
                  >
                    {product.image
                      ? <img src={product.image} alt={product.name} loading="lazy" />
                      : <span className="product-image-placeholder"><ShoppingBag size={36} /></span>}
                    {product.countInStock === 0 && <span className="product-sold-out">Sold out</span>}
                  </Link>
                  <div className="product-card-info">
                    <p className="product-card-category">{product.category}</p>
                    <Link to={`/product/${product._id}`} className="product-card-name">{product.name}</Link>
                    <p className="product-card-brand">{product.brand}</p>
                    <div className="product-card-bottom">
                      <strong>{currency.format(product.price)}</strong>
                      <button
                        type="button"
                        disabled={product.countInStock === 0}
                        onClick={() => dispatch(addToCart({ ...product, qty: 1 }))}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <ShoppingBag size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="catalog-promise" aria-label="Shopping benefits">
        <div><span className="promise-icon">✦</span><strong>Thoughtful finds</strong><p>Products picked with care.</p></div>
        <div><span className="promise-icon">♡</span><strong>Made for everyday</strong><p>Little things that feel just right.</p></div>
        <div><span className="promise-icon">↗</span><strong>Easy to explore</strong><p>Discover something new today.</p></div>
      </section>
    </div>
  );
}

export default ProductCatalog;
