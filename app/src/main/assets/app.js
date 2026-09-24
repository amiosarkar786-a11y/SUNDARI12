// SUNDARI App Core JavaScript
let cart = 2;
let wishlist = 3;
window.sundariCartItems = [{id: 1, qty: 1}, {id: 2, qty: 1}];
window.sundariWishlistIds = [1, 2, 3];

function getProducts() {
  if (window.products && Array.isArray(window.products) && window.products.length > 0) {
    return window.products;
  }
  if (typeof products !== 'undefined' && Array.isArray(products) && products.length > 0) {
    window.products = products;
    return products;
  }
  return [];
}

const cats = [
  ['Mobiles', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=250&q=80'],
  ['Accessories', 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=250&q=80'],
  ['Fashion', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=250&q=80'],
  ['Sarees', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=250&q=80'],
  ['Beauty', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=250&q=80'],
  ['Jewellery', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=250&q=80'],
  ['Kitchen', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=250&q=80'],
  ['Home & Living', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=250&q=80']
];

function toast(x) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = x;
  t.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

function productCard(p) {
  return `<article class="card" onclick="openProduct(${p.id})">
    <div class="cardpic"><img src="${p.img}" alt="${p.name}" loading="lazy" decoding="async">
      <button class="heart" onclick="event.stopPropagation();toggleWish(${p.id},this)">♡</button>
      <span class="off">${p.off}</span>
    </div>
    <div class="body"><b>${p.name}</b>
      <div><span class="price">${p.price}</span><span class="old">${p.old}</span></div>
      <div class="stars">★ ${p.rating}　(8.4k)</div>
      <button class="add" onclick="event.stopPropagation();addCart(${p.id})">Add to Cart</button>
    </div>
  </article>`;
}

function render() {
  const allProds = getProducts();

  const catsBox = document.getElementById('cats');
  if (catsBox) {
    catsBox.innerHTML = cats.map(c =>
      `<div class="cat" onclick="openCategoryByName('${c[0]}')"><img class="catimg" src="${c[1]}" alt="${c[0]}" loading="lazy" decoding="async"><span>${c[0]}</span></div>`
    ).join('');
  }

  const flashBox = document.getElementById('flash');
  if (flashBox && allProds.length > 0) {
    flashBox.innerHTML = allProds.slice(0, 12).map(productCard).join('');
  }

  const trendBox = document.getElementById('trend');
  if (trendBox && allProds.length > 0) {
    trendBox.innerHTML = allProds.slice(12, 32).map(p =>
      `<div class="trend" onclick="openProduct(${p.id})"><img src="${p.img}" alt="${p.name}" loading="lazy" decoding="async"><span>${p.name}<br><b>${p.price}</b></span></div>`
    ).join('');
  }
}

// Infinite continuous feed
let feedIndex = 0;
const FEED_BATCH = 40;

function feedCard(p) {
  return `<article class="feedCard" onclick="openProduct(${p.id})">
    <img src="${p.img}" alt="${p.name}" loading="lazy" decoding="async">
    <div class="feedInfo">
      <div class="feedName">${p.name}</div>
      <span class="feedCat">${p.cat}</span>
      <div><span class="feedPrice">${p.price}</span><span class="feedOld">${p.old}</span></div>
      <div class="feedRating">★ ${p.rating} · ${p.off}</div>
      <button class="feedAdd" onclick="event.stopPropagation();addCart(${p.id})">Add to Cart</button>
    </div>
  </article>`;
}

function loadMoreProducts() {
  const grid = document.getElementById('continuousGrid');
  const allProds = getProducts();
  if (!grid || allProds.length === 0) return;
  const end = Math.min(feedIndex + FEED_BATCH, allProds.length);
  grid.insertAdjacentHTML('beforeend', allProds.slice(feedIndex, end).map(feedCard).join(''));
  feedIndex = end;
  const loader = document.getElementById('feedLoader');
  if (loader && feedIndex >= allProds.length) {
    loader.textContent = '✓ You have reached the end • All 1000 products loaded';
    loader.style.padding = '24px 12px 36px';
    loader.style.color = '#7a606d';
    loader.style.fontWeight = '600';
    window.removeEventListener('scroll', feedScroll);
  }
}

function feedScroll() {
  const loader = document.getElementById('feedLoader');
  if (!loader) return;
  if (loader.getBoundingClientRect().top < window.innerHeight + 800) {
    loadMoreProducts();
  }
}

function scrollHome() {
  closeModal();
  window.scrollTo({top: 0, behavior: 'smooth'});
}

function shopPage() { openListing('All Products'); }
function dealsPage() { openListing('Mega Deals & Offers'); }

function promoPage(name) {
  openListing(name);
}

function voice() { toast('Voice search ready 🎙️'); }
function visualSearch() { toast('Camera visual search ready 📷'); }

function doSearch() {
  const q = (document.getElementById('q').value || '').trim().toLowerCase();
  if (!q) { toast('Please enter a product name'); return; }
  const matches = (window.products || []).filter(p => (p.name + ' ' + p.cat).toLowerCase().includes(q));
  document.getElementById('modalTitle').textContent = 'Search Results';
  document.getElementById('modalBody').innerHTML = matches.length
    ? `<p style="margin:0 0 10px;font-size:12px;color:#78636d">${matches.length} products found for "${q}"</p><div class="miniGrid">${matches.slice(0, 50).map(p => `<div class="mini" onclick="openProduct(${p.id})"><img src="${p.img}" alt="${p.name}"><b>${p.name}</b><small>${p.price}</small></div>`).join('')}</div>`
    : `<div class="empty">No matching products found.<br><br>Try search for Mobile, Beauty, Saree, Shoes or Fashion.</div>`;
  showModal();
}

function openListing(title) {
  document.getElementById('modalTitle').textContent = title;
  const list = window.products || [];
  document.getElementById('modalBody').innerHTML = `
    <p style="margin:0 0 10px;color:#78636d;font-size:12px">${title} (${list.length} available)</p>
    <div class="miniGrid">${list.slice(0, 40).map(p => `
      <div class="mini" onclick="openProduct(${p.id})"><img src="${p.img}" alt="${p.name}"><b>${p.name}</b><small>${p.price}</small></div>
    `).join('')}</div>`;
  showModal();
}

function openCategoryByName(name) {
  const list = (window.products || []).filter(p => p.cat === name);
  document.getElementById('modalTitle').textContent = name;
  document.getElementById('modalBody').innerHTML = `
    <p style="margin:0 0 10px;color:#78636d;font-size:12px">${list.length} products in ${name}</p>
    <div class="miniGrid">${list.slice(0, 40).map(p => `
      <div class="mini" onclick="openProduct(${p.id})"><img src="${p.img}" alt="${p.name}"><b>${p.name}</b><small>${p.price}</small></div>
    `).join('')}</div>`;
  showModal();
}

function showModal() {
  document.getElementById('modal').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modal').classList.remove('show');
  document.body.style.overflow = '';
}

// Cart Management
function getCartItems() {
  if (!window.sundariCartItems) window.sundariCartItems = [];
  return window.sundariCartItems;
}
function cartItemCount() {
  return getCartItems().reduce((n, x) => n + x.qty, 0);
}
function addCart(id) {
  const items = getCartItems();
  const found = items.find(x => x.id === id);
  if (found) found.qty++;
  else items.push({id: id, qty: 1});
  cart = cartItemCount();
  updateBadges();
  const ppb = document.getElementById('ppCartBadge');
  if (ppb) ppb.textContent = cartItemCount();
  const p = (window.products || []).find(x => x.id === id);
  toast((p ? p.name : 'Product') + ' added to Cart 🛒');
}
function updateBadges() {
  const acts = document.querySelectorAll('.act .badge');
  if (acts[0]) acts[0].textContent = (window.sundariWishlistIds || []).length;
  if (acts[2]) acts[2].textContent = cartItemCount();
}
function money(v) {
  return '₹' + Number(v || 0).toLocaleString('en-IN');
}
function cartPage() {
  renderCartFull();
  const el = document.getElementById('cartFull');
  el.classList.add('show');
  el.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeCartFull() {
  const el = document.getElementById('cartFull');
  if (el) el.classList.remove('show');
  document.body.style.overflow = '';
}
function renderCartFull() {
  const items = getCartItems();
  const box = document.getElementById('cartScroll');
  const count = cartItemCount();
  document.getElementById('cartTopCount').textContent = count + ' ' + (count === 1 ? 'item' : 'items');
  document.querySelector('.cartCheckout').style.display = count ? 'block' : 'none';
  if (!items.length) {
    box.innerHTML = `<div class="cartEmpty"><div class="cartEmptyIcon">🛒</div><b>Your cart is empty</b><p>Add products you love and they will appear here.</p><button class="cartShopBtn" onclick="closeCartFull();scrollHome()">Start Shopping</button></div>`;
    return;
  }
  let subtotal = 0, mrp = 0;
  const rows = items.map((ci, idx) => {
    const p = (window.products || []).find(x => x.id === ci.id);
    if (!p) return '';
    const price = Number(String(p.price).replace(/[^\d]/g, '')) || 0;
    const old = Number(String(p.old).replace(/[^\d]/g, '')) || price;
    subtotal += price * ci.qty;
    mrp += old * ci.qty;
    return `<div class="cartItem">
      <img class="cartItemImg" src="${p.img}" alt="${p.name}">
      <div class="cartItemMain">
        <div class="cartItemName">${p.name}</div>
        <div class="cartItemMeta">${p.cat} · ★ ${p.rating} · ${p.off}</div>
        <div class="cartItemPrice"><b>${money(price * ci.qty)}</b><del>${money(old * ci.qty)}</del><span>Save ${money((old - price) * ci.qty)}</span></div>
        <div class="qtyRow">
          <button class="qtyBtn" onclick="changeCartQty(${idx}, -1)">−</button><span class="qtyNum">${ci.qty}</span><button class="qtyBtn" onclick="changeCartQty(${idx}, 1)">+</button>
        </div>
      </div>
      <button class="removeItem" onclick="removeCartItem(${idx})" aria-label="Remove">✕</button>
    </div>`;
  }).join('');
  const discount = Math.max(0, mrp - subtotal), delivery = subtotal >= 499 ? 0 : 49, total = subtotal + delivery;
  box.innerHTML = `
    <div class="cartDelivery" onclick="openDeliveryLocation()"><div class="pin">📍</div><div><b>Deliver to Lucknow - 226001</b><small>Delivery available to this pincode</small></div><div class="arrow">›</div></div>
    <div class="cartItemsBox">${rows}</div>
    <div class="cartOffer"><b>🎟️ Have a coupon?</b><p>Apply code for instant savings</p><div class="cartCoupon"><input id="cartCouponInput" placeholder="Enter coupon code"><button onclick="applyCartCoupon()">APPLY</button></div></div>
    <div class="cartSummary"><h3>Price Details</h3>
      <div class="sumRow"><span>Price (${count} items)</span><span>${money(mrp)}</span></div>
      <div class="sumRow"><span>Discount</span><span style="color:#16834b">− ${money(discount)}</span></div>
      <div class="sumRow"><span>Delivery Charges</span><span>${delivery ? '₹49' : 'FREE'}</span></div>
      <div class="sumRow total"><span>Total Amount</span><b>${money(total)}</b></div>
    </div>`;
}
function changeCartQty(index, delta) {
  const items = getCartItems();
  if (!items[index]) return;
  items[index].qty += delta;
  if (items[index].qty <= 0) items.splice(index, 1);
  updateBadges();
  renderCartFull();
}
function removeCartItem(index) {
  getCartItems().splice(index, 1);
  updateBadges();
  renderCartFull();
  toast('Item removed from cart');
}
function applyCartCoupon() {
  const input = document.getElementById('cartCouponInput');
  if (!input || !input.value.trim()) { toast('Please enter a coupon code'); return; }
  toast('Coupon SUNDARI10 applied! Extra 10% off ✓');
}
function cartCheckout() {
  if (!sundariRequireLoginForPurchase()) return;
  sdOpenCheckout();
}

// Product Detail Page
let ppImageIndex = 0;
let ppImageUrls = [];
let ppRelatedIndex = 0;

function setupProductImageCarousel(p) {
  ppImageIndex = 0;
  const list = window.products || [];
  const related = list.filter(x => x.id !== p.id && x.cat === p.cat).slice(0, 4);
  ppImageUrls = [p.img, ...related.map(x => x.img)].slice(0, 5);
  while (ppImageUrls.length < 5) ppImageUrls.push(p.img);

  const viewport = document.getElementById('ppImageViewport');
  if (viewport) {
    viewport.innerHTML = ppImageUrls.map((url, i) => `
      <div class="ppSlide">
        <img class="ppMainImage" src="${url}" alt="${p.name} ${i+1}">
      </div>`).join('');
  }

  const thumbRow = document.getElementById('ppThumbRow');
  if (thumbRow) {
    thumbRow.innerHTML = ppImageUrls.map((url, i) => `
      <button class="ppThumb ${i===0?'active':''}" type="button" onclick="ppGoImage(${i})">
        <img src="${url}" alt="">
      </button>`).join('');
  }

  const dots = document.getElementById('ppDots');
  if (dots) {
    dots.innerHTML = ppImageUrls.map((_, i) => `
      <button class="ppDot ${i===0?'active':''}" type="button" onclick="ppGoImage(${i})"></button>
    `).join('');
  }
}
function ppSetImageState(index, scroll = true) {
  ppImageIndex = index;
  const viewport = document.getElementById('ppImageViewport');
  if (viewport && scroll) viewport.scrollTo({left: index * viewport.clientWidth, behavior: 'smooth'});
  document.querySelectorAll('.ppDot').forEach((el, i) => el.classList.toggle('active', i === index));
  document.querySelectorAll('.ppThumb').forEach((el, i) => el.classList.toggle('active', i === index));
  const count = document.getElementById('ppImageCount');
  if (count) count.textContent = (index + 1) + ' / ' + ppImageUrls.length;
}
function ppGoImage(i) { ppSetImageState(i, true); }
function ppNextImage() { ppSetImageState((ppImageIndex + 1) % ppImageUrls.length, true); }
function ppPrevImage() { ppSetImageState((ppImageIndex - 1 + ppImageUrls.length) % ppImageUrls.length, true); }

function openProduct(id) {
  const p = (window.products || []).find(x => x.id === id);
  if (!p) return;
  window.currentProductId = id;
  const page = document.getElementById('productPage');
  page.classList.add('show');
  page.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  document.getElementById('ppTitle').textContent = p.name;
  setupProductImageCarousel(p);
  document.getElementById('ppPrice').textContent = p.price;
  document.getElementById('ppOld').textContent = p.old;
  document.getElementById('ppRating').textContent = '★ ' + p.rating;
  document.getElementById('ppBigRating').textContent = p.rating + ' ★';
  document.getElementById('ppCartBadge').textContent = cartItemCount();

  const wish = window.sundariWishlistIds || [];
  const liked = wish.includes(id);
  const heart = document.getElementById('ppHeartTop');
  if (heart) { heart.textContent = liked ? '♥' : '♡'; heart.style.color = liked ? '#df2f43' : '#454550'; }

  const similar = (window.products || []).filter(x => x.id !== id && x.cat === p.cat).slice(0, 3);
  document.getElementById('ppSimilarTitle').textContent = similar.length + ' Similar Products';
  document.getElementById('ppSimilarRow').innerHTML = similar.map((x, i) =>
    `<div class="ppSimilarCard ${i===0?'active':''}" onclick="openProduct(${x.id})"><img src="${x.img}" alt="${x.name}"></div>`
  ).join('');

  const rec = (window.products || []).filter(x => x.id !== id).slice(0, 6);
  document.getElementById('ppRecRow').innerHTML = rec.map(x =>
    `<div class="ppRecCard" onclick="openProduct(${x.id})">
      <img src="${x.img}" alt="${x.name}">
      <div class="ppRecInfo"><div class="ppRecName">${x.name}</div>
      <div class="ppRecPrice">${x.price}<span class="ppRecOld">${x.old}</span></div>
      <span class="ppRecRating">★ ${x.rating}</span></div>
    </div>`
  ).join('');

  setupRelatedProducts(p);
  renderCustomerReviewPhotos(id);
  document.getElementById('productPageInner').scrollTop = 0;
}
function closeProductPage() {
  const page = document.getElementById('productPage');
  if (page) page.classList.remove('show');
  document.body.style.overflow = '';
}
function ppToggleWish() {
  if (!window.currentProductId) return;
  toggleWish(window.currentProductId);
  const liked = (window.sundariWishlistIds || []).includes(window.currentProductId);
  const heart = document.getElementById('ppHeartTop');
  if (heart) { heart.textContent = liked ? '♥' : '♡'; heart.style.color = liked ? '#df2f43' : '#454550'; }
}
function ppAddToCart() {
  if (!window.currentProductId) return;
  addCart(window.currentProductId);
}
function ppBuyNow() {
  if (!sundariRequireLoginForPurchase()) return;
  if (!window.currentProductId) return;
  addCart(window.currentProductId);
  closeProductPage();
  cartPage();
}
function ppShare() {
  const p = (window.products || []).find(x => x.id === window.currentProductId);
  if (navigator.share) {
    navigator.share({title: p ? p.name : 'SUNDARI', text: 'Check out this product on SUNDARI', url: location.href}).catch(() => {});
  } else toast('Product link copied to clipboard ✓');
}
function ppSearch() {
  closeProductPage();
  const q = document.getElementById('q');
  if (q) q.focus();
}

function ppToggleAdditionalDetails() {
  const btn = document.getElementById('ppAdditionalToggle');
  const panel = document.getElementById('ppAdditionalPanel');
  if (!btn || !panel) return;
  const isHidden = panel.hasAttribute('hidden');
  if (isHidden) panel.removeAttribute('hidden');
  else panel.setAttribute('hidden', '');
  btn.classList.toggle('open', isHidden);
}

function setupRelatedProducts(current) {
  const grid = document.getElementById('ppRelatedGrid');
  if (!grid || !window.products) return;
  const related = window.products.filter(x => x.id !== current.id && x.cat === current.cat).slice(0, 12);
  grid.innerHTML = related.map(p => `
    <article class="ppRelatedCard" onclick="openProduct(${p.id})">
      <div class="ppRelatedPic">
        <img src="${p.img}" alt="${p.name}">
        <span class="ppRelatedOff">${p.off}</span>
        <button class="ppRelatedHeart" type="button" onclick="event.stopPropagation();toggleWish(${p.id},this)">♡</button>
      </div>
      <div class="ppRelatedBody">
        <span class="ppRelatedName">${p.name}</span>
        <div class="ppRelatedPriceRow"><span class="ppRelatedPrice">${p.price}</span><span class="ppRelatedOld">${p.old}</span></div>
        <div class="ppRelatedRating">★ ${p.rating}</div>
        <button class="ppRelatedAdd" type="button" onclick="event.stopPropagation();addCart(${p.id})">Add to Cart</button>
      </div>
    </article>`).join('');
}

// Reviews & Customer Photos
let reviewRating = 5;
let pendingReviewFiles = [];

function setReviewRating(n) {
  reviewRating = n;
  document.querySelectorAll('#ppReviewStars .ppStarBtn').forEach((b, i) => b.classList.toggle('active', i < n));
}
function openCustomerReview() {
  const p = (window.products || []).find(x => x.id === window.currentProductId);
  document.getElementById('ppReviewProductName').textContent = p ? p.name : 'Product';
  document.getElementById('ppReviewText').value = '';
  document.getElementById('ppSelectedPhotos').innerHTML = '';
  pendingReviewFiles = [];
  setReviewRating(5);
  document.getElementById('ppReviewModalOverlay').classList.add('show');
}
function closeCustomerReview() {
  document.getElementById('ppReviewModalOverlay').classList.remove('show');
}
function previewReviewPhotos(event) {
  const files = [...(event.target.files || [])];
  pendingReviewFiles.push(...files);
  const box = document.getElementById('ppSelectedPhotos');
  box.innerHTML = '';
  pendingReviewFiles.forEach(file => {
    const url = URL.createObjectURL(file);
    const div = document.createElement('div');
    div.className = 'ppSelectedPhoto';
    div.innerHTML = `<img src="${url}" alt="Customer photo">`;
    box.appendChild(div);
  });
  if (files.length) toast(files.length + ' photo(s) selected ✓');
}
function submitCustomerReview() {
  const text = document.getElementById('ppReviewText').value.trim();
  if (!text && !pendingReviewFiles.length) {
    toast('Please enter review feedback or attach photos');
    return;
  }
  closeCustomerReview();
  toast('✓ Thank you! Review submitted successfully');
}
function renderCustomerReviewPhotos(id) {
  const feed = document.getElementById('ppCustomerPhotoFeed');
  const count = document.getElementById('ppCustomerPhotoCount');
  if (!feed) return;
  const list = (window.products || []).slice(0, 6);
  if (count) count.textContent = list.length + ' customer photos';
  feed.innerHTML = list.map((p, i) => `
    <button class="ppCustomerPhoto" type="button" onclick="openReviewDetailPhoto('${encodeURIComponent(p.img)}')">
      <img src="${p.img}" alt="Customer photo">
      <span class="ppCustomerPhotoName">Customer ${i+1}</span>
    </button>`).join('');
}
function openReviewDetailPhoto(encoded) {
  const src = decodeURIComponent(encoded);
  const p = (window.products || []).find(x => x.id === window.currentProductId);
  const container = document.getElementById('reviewDetailContent');
  if (container) {
    container.innerHTML = `
      <section class="reviewCustomerHero">
        <div class="reviewCustomerHead">
          <div class="reviewCustomerAvatar">C</div>
          <div>
            <div class="reviewCustomerName">Verified SUNDARI Customer</div>
            <div class="reviewVerified">✓ Verified Purchase</div>
            <div class="reviewDate">Purchased recently • Lucknow, UP</div>
          </div>
        </div>
      </section>
      ${p ? `
      <div class="reviewProductCard">
        <img src="${p.img}" alt="${p.name}">
        <div>
          <div class="reviewProductName">${p.name}</div>
          <div style="font-size:12px;font-weight:800;color:#9b1853;margin-top:4px">${p.price}</div>
        </div>
      </div>` : ''}
      <section class="reviewDetailSection">
        <div style="display:flex;align-items:center">
          <span class="reviewRatingBadge">4.8 ★</span>
          <span class="reviewStars">★★★★★</span>
        </div>
        <div class="reviewFeedbackTitle">Superb quality, exactly as shown in photos!</div>
        <div class="reviewFeedbackText">The fabric and build quality exceeded my expectations. Fast delivery and original product. Completely satisfied with this purchase!</div>
        <div class="reviewDetailPhotos">
          <button class="reviewDetailPhoto" type="button" onclick="openReviewLightbox('${encodeURIComponent(src)}')">
            <img src="${src}" alt="Customer photo full">
          </button>
        </div>
        <div class="reviewHelpful">
          <span>Was this review helpful?</span>
          <button type="button" onclick="toast('Thanks for your feedback! ✓')">👍 Helpful (42)</button>
        </div>
      </section>
      <button class="reviewAllButton" type="button" onclick="closeReviewDetailPage()">Back to Product</button>
    `;
    const page = document.getElementById('reviewDetailPage');
    if (page) page.classList.add('show');
  } else {
    openReviewLightbox(encoded);
  }
}
function openReviewLightbox(encoded) {
  const src = decodeURIComponent(encoded);
  const lb = document.getElementById('ppLightboxImg');
  if (lb) lb.src = src;
  const box = document.getElementById('ppLightbox');
  if (box) box.classList.add('show');
}
function closeReviewDetailPage() {
  const page = document.getElementById('reviewDetailPage');
  if (page) page.classList.remove('show');
}
function closeReviewLightbox() {
  const box = document.getElementById('ppLightbox');
  if (box) box.classList.remove('show');
}

// Checkout flow
let sdCheckoutItems = [];
let sdCheckoutStep = 0;
let sdCheckoutReturn = 'yes';
let sdCheckoutPayment = 'phonepe';
let sdPaymentConfirmed = false;
let sdCheckoutSize = 'Free Size';

function sdMoney(n) { return '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN'); }
function sdGetCheckoutData() {
  const raw = getCartItems();
  sdCheckoutItems = raw.map(ci => {
    const p = (window.products || []).find(x => x.id === ci.id);
    return p ? {...ci, p} : null;
  }).filter(Boolean);
  return sdCheckoutItems;
}
function sdCalc() {
  const subtotal = sdCheckoutItems.reduce((s, x) => s + (Number(String(x.p.price).replace(/[^\d]/g, '')) || 0) * x.qty, 0);
  const mrp = sdCheckoutItems.reduce((s, x) => s + (Number(String(x.p.old).replace(/[^\d]/g, '')) || 0) * x.qty, 0);
  const offer = 3;
  const total = Math.max(0, subtotal - (sdCheckoutReturn === 'no' ? 3 : 0));
  return {subtotal, mrp, discount: Math.max(0, mrp - subtotal), offer, total};
}
function sundariIsLoggedIn() {
  return localStorage.getItem('sundariLoggedIn') === '1';
}
function sundariRequireLoginForPurchase() {
  if (sundariIsLoggedIn()) return true;
  openAuthPage('login');
  return false;
}
function sdOpenCheckout() {
  if (!sundariRequireLoginForPurchase()) return;
  if (!cartItemCount()) { toast('Your cart is empty'); return; }
  sdGetCheckoutData();
  sdCheckoutStep = 0;
  sdCheckoutReturn = 'yes';
  sdCheckoutPayment = 'phonepe';
  sdPaymentConfirmed = false;
  document.getElementById('sdCheckout').classList.add('show');
  sdShowPreference();
}
function sdShowPreference() {
  document.getElementById('sdPreferenceView').style.display = 'block';
  document.getElementById('sdReviewView').style.display = 'none';
  document.getElementById('sdPaymentView').style.display = 'none';
  document.getElementById('sdSuccessView').style.display = 'none';
  document.getElementById('sdCheckoutTitle').textContent = 'SELECT PREFERENCES';
  document.getElementById('sdStepPill').style.display = 'none';
  const c = sdCalc();
  document.getElementById('sdYesPrice').textContent = sdMoney(c.subtotal);
  document.getElementById('sdNoPrice').textContent = sdMoney(Math.max(0, c.subtotal - 3));
}
function sdSelectSize(btn) {
  document.querySelectorAll('.sdSizeBtn').forEach(x => x.classList.remove('sdSelected'));
  btn.classList.add('sdSelected');
}
function sdSelectReturn(v, btn) {
  sdCheckoutReturn = v;
  document.querySelectorAll('.sdReturnChoice').forEach(x => x.classList.remove('sdReturnSelected'));
  btn.classList.add('sdReturnSelected');
}
function sdShowReturnDetails() {
  toast('All issues easy returns allows hassle-free returns on eligible items.');
}
function sdGoToReview() {
  sdCheckoutStep = 1;
  document.getElementById('sdPreferenceView').style.display = 'none';
  document.getElementById('sdReviewView').style.display = 'block';
  document.getElementById('sdPaymentView').style.display = 'none';
  document.getElementById('sdSuccessView').style.display = 'none';
  document.getElementById('sdCheckoutTitle').textContent = 'REVIEW YOUR ORDER';
  document.getElementById('sdStepPill').style.display = 'block';
  document.getElementById('sdStepPill').textContent = 'STEP 1/2';
  sdRenderReview();
}
function sdRenderReview() {
  const c = sdCalc();
  const rows = sdCheckoutItems.map(x => `
    <div class="sdReviewItem">
      <img class="sdReviewImg" src="${x.p.img}" alt="${x.p.name}">
      <div class="sdReviewInfo">
        <span class="sdBuyBadge">SPECIAL OFFER</span>
        <div class="sdReviewName">${x.p.name}</div>
        <div class="sdReviewPrice">${sdMoney(Number(String(x.p.price).replace(/[^\d]/g, '')) * x.qty)} <del>${x.p.old}</del> <span>${x.p.off}</span></div>
        <div class="sdReviewMeta">${sdCheckoutReturn === 'yes' ? 'All issue easy returns' : 'Wrong/defect item returns'}<br>Size: ${sdCheckoutSize} • Qty: ${x.qty}</div>
      </div>
    </div>`).join('');
  document.getElementById('sdReviewContent').innerHTML = `
    ${rows}
    <div class="sdSeller">Sold by: <b>SUNDARI Direct</b></div>
    <div class="sdDeliveryBox">
      <div class="sdDeliveryTitle"><span class="sdTruck">🚚</span> Estimated Delivery by <b>Saturday, 3-5 days</b></div>
      <div class="sdAddress">Lucknow - 226001, Uttar Pradesh<button type="button" class="sdChange" onclick="openAddressesPage()">Change</button></div>
    </div>
    <div class="sdPriceAccordion" id="sdPriceAccordion">
      <button class="sdPriceRow sdPriceToggle" type="button" onclick="sdTogglePriceDetails()">
        <span>Price Details</span>
        <span class="sdPriceRight"><b>${sdMoney(c.total)}</b> <span>⌄</span></span>
      </button>
      <div class="sdPriceDropdown" id="sdPriceDropdown">
        <div class="sdPriceDetailLine"><span>Product Price</span><b>${sdMoney(c.mrp)}</b></div>
        <div class="sdPriceDetailLine"><span>Discount</span><b style="color:#168e72">− ${sdMoney(c.discount)}</b></div>
        <div class="sdPriceDetailLine sdGrandTotal"><span>Total Amount</span><b>${sdMoney(c.total)}</b></div>
      </div>
    </div>`;
  document.getElementById('sdReviewTotal').textContent = sdMoney(c.total);
}
function sdTogglePriceDetails() {
  const acc = document.getElementById('sdPriceAccordion');
  if (acc) acc.classList.toggle('open');
}
function sdTogglePaymentPrice() {
  const acc = document.getElementById('sdPaymentPriceAccordion');
  if (acc) acc.classList.toggle('open');
}
function sdPriceDetails() {
  const accPay = document.getElementById('sdPaymentPriceAccordion');
  if (accPay) {
    accPay.classList.toggle('open');
    accPay.scrollIntoView({behavior: 'smooth', block: 'center'});
  } else {
    sdTogglePriceDetails();
  }
}
function sdGoToPayment() {
  sdCheckoutStep = 2;
  document.getElementById('sdReviewView').style.display = 'none';
  document.getElementById('sdPaymentView').style.display = 'block';
  document.getElementById('sdCheckoutTitle').textContent = 'PAYMENT METHOD';
  document.getElementById('sdStepPill').textContent = 'STEP 2/2';
  sdRenderPayments();
}
function sdRenderPayments() {
  const c = sdCalc(), total = c.total;
  const pm = document.getElementById('sdPaymentMethods');
  if (!pm) return;
  const methods = [
    {id: 'phonepe', name: 'PhonePe Secure Payment', icon: 'पे', sub: 'Instant UPI / GPay / PhonePe App', phonepe: true},
    {id: 'qr', name: 'UPI QR / Scan & Pay', icon: '▦', sub: 'Scan QR with any UPI app', qr: true},
    {id: 'cod', name: 'Cash on Delivery', icon: '💵', sub: 'Pay upon delivery', cod: true}
  ];
  pm.innerHTML = methods.map(m => {
    const selected = sdCheckoutPayment === m.id;
    return `
      <div class="sdPayOptionCard ${selected ? 'sdPaySelected' : ''}">
        <div class="sdPayOptionHead" onclick="sdSelectPayment('${m.id}')">
          <span class="sdPayOptionIcon ${m.phonepe ? 'phonepe' : ''}">${m.icon}</span>
          <div class="sdPayOptionText">
            <b>${m.name}</b>
            <small>${m.sub}</small>
          </div>
          <span class="sdPayOptionAmount">${sdMoney(total)}</span>
          <span class="sdPayRadio"></span>
        </div>
        ${selected && m.phonepe ? `
          <div class="sdPayOptionBody">
            <div class="sdPayOrderAmount"><span>Total Order Amount</span><strong>${sdMoney(total)}</strong></div>
            <button type="button" class="sdPpButton" onclick="sdStartPhonePePayment()">Pay Securely with PhonePe →</button>
          </div>` : ''}
        ${selected && m.qr ? `
          <div class="sdPayOptionBody">
            <div class="sdPayQrBox">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALkAAAC5AQAAAABc1qPxAAAB8klEQVR42uWYQa6cMAyGfwNS2JkbhIuUvB6rEq8wwxwszEnCDcIuSAx/F/OW7daV2uziLL4k/m3HEeK341bhD+PfWVhFpH3iJlIBOD52Eams4EISA+rk4t5AIyYyml3JLj2wn/4I3bjtFV7S2vrjqdIz6uw1/g0xTCskP3D8tIUrE9jd+uNTjp4RNYsZnCIC2U6vSwbeuv+wgYMkyZWku3T+mpKzDXzl6QFdWKAn3PW2GcEjpsSVpy/AlAp0IYINvAJUQvute2yt5FcP4CV2gpONaa8wogzqEkKGd2YZbtBma8PWwN0Br/ed6ais1H4B4KUL3QWgDKiTldorAFOSOmM7vvMEhDOs4ryCZHhe+xHKKktyt26EneCeX2UMLmqDVjbp3d3Q576EXLNInlIJXAwzXMREDLqkAmVCIFmCFfxCzRIyfAGAMiiTVXqtAD36lt2UlHn0umyzWT0HozKRGZ4rl1QkW8Z52BpIpVzBDmiBH+Gwq+d5YoHO71xXBj29neCizh6S61Sg55dRrOAk+d4B9ASEpicH4CLqVCSPnmse4cwEJyQR3m+pZmuhM/bKtGNZ5VNcxOhBabxdnK8Z3l1KkhnAgNE7w3oOQLZ5kw9lcnc87DsW+LJ2D+wTmYw7lqeKKPOrb9fuJu3TBi7/7bfIL7nxP6+jl+BaAAAAAElFTkSuQmCC" alt="UPI QR">
              <div class="sdPayUpiLine">UPI ID: <b>amiyo.sarkar@ptyes</b></div>
              <div class="sdLegacyActions">
                <button type="button" onclick="sdOpenUpiApp('amiyo.sarkar@ptyes', ${total})">Open UPI App</button>
                <button type="button" onclick="sdCopyUpi('amiyo.sarkar@ptyes')">Copy UPI ID</button>
              </div>
              <button type="button" class="sdPaymentDoneBtn ${sdPaymentConfirmed ? 'confirmed' : ''}" onclick="sdConfirmPayment('qr')">
                ${sdPaymentConfirmed ? '✓ Payment Confirmed' : '✓ I Have Paid'}
              </button>
            </div>
          </div>` : ''}
      </div>`;
  }).join('');
  document.getElementById('sdPaymentTotal').textContent = sdMoney(total);
  const payMrp = document.getElementById('sdPayDetailMrp');
  if (payMrp) payMrp.textContent = sdMoney(c.mrp);
  const payDisc = document.getElementById('sdPayDetailDiscount');
  if (payDisc) payDisc.textContent = '− ' + sdMoney(c.discount);
  const payTot = document.getElementById('sdPayDetailTotal');
  if (payTot) payTot.textContent = sdMoney(total);
  const payCount = document.getElementById('sdPaymentItemCount');
  if (payCount) payCount.textContent = sdCheckoutItems.reduce((sum, item) => sum + item.qty, 0);
}
function sdSelectPayment(id) {
  sdCheckoutPayment = id;
  sdPaymentConfirmed = (id === 'cod');
  sdRenderPayments();
}
function sdConfirmPayment(method) {
  sdPaymentConfirmed = true;
  sdRenderPayments();
  toast('Payment confirmed ✓ Click Place Order to finish.');
}
function sdOpenUpiApp(upi, amount) {
  const url = `upi://pay?pa=${encodeURIComponent(upi)}&pn=SUNDARI&am=${amount}&cu=INR`;
  window.location.href = url;
}
function sdCopyUpi(upi) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(upi).then(() => toast('UPI ID copied ✓'));
  } else toast(upi);
}
function sdStartPhonePePayment() {
  const c = sdCalc();
  const upi = `upi://pay?pa=amiyo.sarkar@ptyes&pn=SUNDARI&am=${c.total}&cu=INR`;
  window.location.href = upi;
  sdPaymentConfirmed = true;
  sdRenderPayments();
}
function sdCheckoutBack() {
  if (sdCheckoutStep === 0) {
    document.getElementById('sdCheckout').classList.remove('show');
  } else if (sdCheckoutStep === 1) {
    sdShowPreference();
  } else if (sdCheckoutStep === 2) {
    sdGoToReview();
  }
}
function sdFinishCheckout() {
  document.getElementById('sdCheckout').classList.remove('show');
  scrollHome();
}
function sdPlaceOrder() {
  if (!sundariRequireLoginForPurchase()) return;
  if (!sdPaymentConfirmed && sdCheckoutPayment !== 'cod') {
    toast('Please complete payment or select Cash on Delivery.');
    return;
  }
  const c = sdCalc();
  const orderId = 'SD-' + Date.now().toString().slice(-8);
  document.getElementById('sdOrderId').textContent = orderId;
  document.getElementById('sdOrderPayment').textContent = sdCheckoutPayment === 'phonepe' ? 'PhonePe UPI' : (sdCheckoutPayment === 'qr' ? 'UPI QR' : 'Cash on Delivery');
  document.getElementById('sdOrderAmount').textContent = sdMoney(c.total);

  // Save to Orders history
  const savedOrders = JSON.parse(localStorage.getItem('sundariOrders') || '[]');
  savedOrders.unshift({
    id: orderId,
    date: new Date().toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'}),
    status: 'To Ship',
    total: c.total,
    payment: sdCheckoutPayment,
    items: sdCheckoutItems.map(x => ({
      id: x.p.id, name: x.p.name, img: x.p.img, cat: x.p.cat,
      price: Number(String(x.p.price).replace(/[^\d]/g, '')) || 0,
      old: Number(String(x.p.old).replace(/[^\d]/g, '')) || 0,
      off: x.p.off, qty: x.qty
    }))
  });
  localStorage.setItem('sundariOrders', JSON.stringify(savedOrders));

  document.getElementById('sdPaymentView').style.display = 'none';
  document.getElementById('sdSuccessView').style.display = 'block';
  document.getElementById('sdCheckoutTitle').textContent = 'ORDER CONFIRMED';
  document.getElementById('sdStepPill').style.display = 'none';

  // Clear cart
  window.sundariCartItems = [];
  updateBadges();
}

// Reselling Feature
function sdResellInfo() {
  openResellStartPage();
}
function openResellStartPage() {
  const p = (sdCheckoutItems[0] && sdCheckoutItems[0].p) || (window.products && window.products[0]);
  if (!p) return;
  const page = document.getElementById('sdResellStartPage');
  document.getElementById('sdRspImg').src = p.img;
  document.getElementById('sdRspName').textContent = p.name;
  document.getElementById('sdRspBase').textContent = p.price;
  document.getElementById('sdRspPreviewName').textContent = p.name;
  updateResellStartPage();
  page.classList.add('show');
}
function closeResellStartPage() {
  document.getElementById('sdResellStartPage').classList.remove('show');
}
function updateResellStartPage() {
  const input = document.getElementById('sdRspPrice');
  const val = Number(input.value) || 0;
  document.getElementById('sdRspCustomer').textContent = '₹' + val;
  document.getElementById('sdRspPreviewPrice').innerHTML = '₹' + val + ' <small>customer price</small>';
}
function activateResellFromStart() {
  const input = document.getElementById('sdRspPrice');
  if (!input.value) { toast('Please enter your selling price'); return; }
  document.getElementById('sdRspActiveBanner').style.display = 'block';
  toast('✓ Reselling is active for this product');
}
function shareResellFromStart() {
  if (navigator.share) {
    navigator.share({title: 'SUNDARI Product', text: 'Check out this product on SUNDARI', url: location.href}).catch(() => {});
  } else copyResellFromStart();
}
function copyResellFromStart() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(location.href).then(() => toast('Customer product link copied ✓'));
  } else toast('Product link copied ✓');
}

// Wishlist
function toggleWish(id, btn) {
  let ids = window.sundariWishlistIds || [];
  const idx = ids.indexOf(id);
  if (idx >= 0) {
    ids.splice(idx, 1);
    toast('Removed from Wishlist');
  } else {
    ids.push(id);
    toast('Added to Wishlist ❤️');
  }
  window.sundariWishlistIds = ids;
  if (btn) btn.textContent = idx >= 0 ? '♡' : '♥';
  updateBadges();
}
function openWishlistPage() {
  renderWishlist();
  document.getElementById('wishlistPage').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeWishlistPage() {
  document.getElementById('wishlistPage').classList.remove('show');
  document.body.style.overflow = '';
}
function renderWishlist() {
  const ids = window.sundariWishlistIds || [];
  const list = (window.products || []).filter(p => ids.includes(p.id));
  const grid = document.getElementById('wishlistGrid');
  const empty = document.getElementById('wishlistEmpty');
  document.getElementById('wishlistCountText').textContent = list.length + ' items';
  if (!list.length) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  grid.innerHTML = list.map(p => `
    <article class="wishlistCard">
      <div class="wishlistImgWrap">
        <img class="wishlistImg" src="${p.img}" alt="${p.name}">
        <button class="wishlistRemove" onclick="toggleWish(${p.id});renderWishlist()">♥</button>
      </div>
      <div class="wishlistCardBody">
        <div class="wishlistName" onclick="openProduct(${p.id})">${p.name}</div>
        <div class="wishlistPrice">${p.price}<span class="wishlistOld">${p.old}</span></div>
        <div class="wishlistOff">${p.off}</div>
        <div class="wishlistActions">
          <button class="wishlistViewBtn" onclick="openProduct(${p.id})">View</button>
          <button class="wishlistCartBtn" onclick="addCart(${p.id})">Add to Cart</button>
        </div>
      </div>
    </article>`).join('');
}

// Orders Page
let currentOrderFilter = 'all';
function openOrdersPage() {
  renderOrdersPage();
  document.getElementById('sundariOrdersPage').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeOrdersPage() {
  document.getElementById('sundariOrdersPage').classList.remove('show');
  document.body.style.overflow = '';
}
function setOrderFilter(filter, btn) {
  currentOrderFilter = filter;
  document.querySelectorAll('#ordersTabs button').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderOrdersPage();
}
function renderOrdersPage() {
  const list = document.getElementById('ordersList');
  const empty = document.getElementById('ordersEmpty');
  const orders = JSON.parse(localStorage.getItem('sundariOrders') || '[]');
  if (!orders.length) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  list.innerHTML = orders.map(o => `
    <article class="orderCard">
      <div class="orderCardHead">
        <span class="orderId">Order ${o.id}</span>
        <span class="orderDate">${o.date}</span>
        <span class="orderStatus delivered">${o.status}</span>
      </div>
      ${o.items.map(it => `
        <div class="orderMain">
          <img class="orderImg" src="${it.img}" alt="${it.name}">
          <div class="orderInfo">
            <div class="orderName">${it.name}</div>
            <div class="orderMeta">Qty: ${it.qty}</div>
            <div class="orderPrice">${money(it.price * it.qty)}</div>
          </div>
        </div>`).join('')}
      <div class="orderBottom">
        <div class="orderTotal">Total <b>${money(o.total)}</b></div>
        <div class="orderActions">
          <button class="orderBtn" onclick="toast('Tracking order ${o.id}: On Schedule ✓')">Track</button>
          <button class="orderBtn primary" onclick="toast('Order item re-added to cart')">Buy Again</button>
        </div>
      </div>
    </article>`).join('');
}

// Auth modal
function openTopAccountAuth() {
  if (sundariIsLoggedIn()) openAccountPage();
  else openAuthPage('login');
}
function openAuthPage(tab) {
  switchAuthTab(tab || 'login');
  document.getElementById('sundariAuthPage').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeAuthPage() {
  document.getElementById('sundariAuthPage').classList.remove('show');
  document.body.style.overflow = '';
}
function switchAuthTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('authLoginTab').classList.toggle('active', isLogin);
  document.getElementById('authSignupTab').classList.toggle('active', !isLogin);
  document.getElementById('authLoginForm').classList.toggle('active', isLogin);
  document.getElementById('authSignupForm').classList.toggle('active', !isLogin);
}
function submitAuthLogin(e) {
  e.preventDefault();
  localStorage.setItem('sundariLoggedIn', '1');
  localStorage.setItem('sundariCustomerName', 'Demo Customer');
  closeAuthPage();
  toast('✓ Login successful! Welcome to SUNDARI');
}
function submitAuthSignup(e) {
  e.preventDefault();
  const name = document.getElementById('authSignupName').value;
  localStorage.setItem('sundariLoggedIn', '1');
  localStorage.setItem('sundariCustomerName', name || 'Customer');
  closeAuthPage();
  toast('✓ Account created! Welcome to SUNDARI');
}
function toggleAuthPassword(id, btn) {
  const inp = document.getElementById(id);
  if (!inp) return;
  const show = inp.type === 'text';
  inp.type = show ? 'password' : 'text';
}

// Account Page
function openAccountPage() {
  const name = localStorage.getItem('sundariCustomerName') || 'SUNDARI Customer';
  document.getElementById('accountCustomerName').textContent = name;
  document.getElementById('accountPage').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeAccountPage() {
  document.getElementById('accountPage').classList.remove('show');
  document.body.style.overflow = '';
}
function accountEditName() {
  const current = localStorage.getItem('sundariCustomerName') || 'SUNDARI Customer';
  const next = prompt('Enter your name:', current);
  if (next) {
    localStorage.setItem('sundariCustomerName', next);
    document.getElementById('accountCustomerName').textContent = next;
    toast('Name updated ✓');
  }
}
function accountUploadPhoto(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function() {
    const img = document.getElementById('accountAvatarImg');
    if (img) {
      img.src = reader.result;
      img.style.display = 'block';
    }
    toast('Profile photo updated ✓');
  };
  reader.readAsDataURL(file);
}
function accountLogout() {
  localStorage.removeItem('sundariLoggedIn');
  closeAccountPage();
  toast('Logged out successfully');
}
function accountQuick(name) {
  toast(name + ' opened ✓');
}

// Addresses & Profile Pages
function openAddressesPage() {
  document.getElementById('sundariAddressesPage').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeAddressesPage() {
  document.getElementById('sundariAddressesPage').classList.remove('show');
  document.body.style.overflow = '';
}
function openAddAddressForm() {
  document.getElementById('sundariAddAddressPage').classList.add('show');
}
function closeAddAddressForm() {
  document.getElementById('sundariAddAddressPage').classList.remove('show');
}
function selectAddressType(btn) {
  document.querySelectorAll('.typeBtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
function saveNewAddress() {
  closeAddAddressForm();
  toast('✓ Address saved successfully');
}
function openPaymentMethodsPage() {
  document.getElementById('sundariPaymentPage').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closePaymentMethodsPage() {
  document.getElementById('sundariPaymentPage').classList.remove('show');
  document.body.style.overflow = '';
}
function openPaymentForm() {
  document.getElementById('sundariPaymentFormPage').classList.add('show');
}
function closePaymentForm() {
  document.getElementById('sundariPaymentFormPage').classList.remove('show');
}
function selectPaymentType(btn) {
  document.querySelectorAll('.paymentTypeBtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const kind = btn.dataset.kind;
  document.getElementById('paymentCardFields').style.display = kind === 'card' ? 'block' : 'none';
  document.getElementById('paymentUpiFields').style.display = kind === 'upi' ? 'block' : 'none';
  document.getElementById('paymentQrFields').style.display = kind === 'qr' ? 'block' : 'none';
  document.getElementById('paymentBankFields').style.display = kind === 'bank' ? 'block' : 'none';
  document.getElementById('paymentCodFields').style.display = kind === 'cod' ? 'block' : 'none';
}
function savePaymentMethod() {
  closePaymentForm();
  toast('✓ Payment method saved');
}

function openProfilePage() {
  const name = localStorage.getItem('sundariCustomerName') || 'SUNDARI Customer';
  document.getElementById('profileNameInput').value = name;
  document.getElementById('profilePageName').textContent = name;
  document.getElementById('sundariProfilePage').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeProfilePage() {
  document.getElementById('sundariProfilePage').classList.remove('show');
  document.body.style.overflow = '';
}
function saveProfileDetails() {
  const name = document.getElementById('profileNameInput').value;
  if (name) {
    localStorage.setItem('sundariCustomerName', name);
    document.getElementById('profilePageName').textContent = name;
    toast('✓ Profile details saved');
  }
}
function saveProfilePagePhoto(e) {
  accountUploadPhoto(e);
}

// Delivery Location & Pincode
function openDeliveryLocation() {
  document.getElementById('deliveryLocationModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeDeliveryLocation() {
  document.getElementById('deliveryLocationModal').classList.remove('show');
  document.body.style.overflow = '';
}
function checkDeliveryPincode() {
  const pin = document.getElementById('deliveryPincodeInput').value;
  const res = document.getElementById('deliveryPincodeResult');
  if (pin && pin.length === 6) {
    res.className = 'deliveryPincodeResult show ok';
    res.textContent = '✓ Delivery is available to pincode ' + pin + ' within 2-4 business days.';
  } else {
    res.className = 'deliveryPincodeResult show err';
    res.textContent = 'Please enter a valid 6-digit pincode';
  }
}
function useCurrentDeliveryLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(() => {
      toast('Location detected: Lucknow, Uttar Pradesh ✓');
      closeDeliveryLocation();
    }, () => {
      toast('Please enter your 6-digit pincode manually.');
    });
  } else toast('Please enter your 6-digit pincode manually.');
}

// Live Countdown Timers
(function initTimers() {
  let seconds = 4 * 3600 + 17 * 60 + 20;
  setInterval(() => {
    seconds = Math.max(0, seconds - 1);
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');

    const hh = document.getElementById('ppHH');
    const mm = document.getElementById('ppMM');
    const ss = document.getElementById('ppSS');
    if (hh) hh.textContent = h;
    if (mm) mm.textContent = m;
    if (ss) ss.textContent = s;

    const timer = document.getElementById('timer');
    if (timer) timer.textContent = `${h}:${m}:${s}`;
  }, 1000);
})();

// Document Ready Initialization
let appInitialized = false;

function initApp() {
  const prods = getProducts();
  render();
  loadMoreProducts();

  if (!appInitialized) {
    window.addEventListener('scroll', feedScroll, {passive: true});
    updateBadges();

    const searchInput = document.getElementById('q');
    if (searchInput) {
      searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') doSearch();
      });
    }
    appInitialized = true;
  }

  // If products are not yet available, retry shortly
  if (prods.length === 0) {
    setTimeout(initApp, 50);
  }
}

// Global Resilience Error Handlers
window.addEventListener('error', function (e) {
  console.warn('Recovered from resource/script error:', e.message || e);
  return true;
});
window.addEventListener('unhandledrejection', function (e) {
  console.warn('Unhandled promise rejection recovered:', e.reason);
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(initApp);
  });
} else {
  requestAnimationFrame(initApp);
}
window.addEventListener('load', initApp);
