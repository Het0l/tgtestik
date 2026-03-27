const rates = { USD: 1, RUB: 83.13, EUR: 0.864 };
let currentCurrency = localStorage.getItem('currency') || 'USD';
let currentLang = localStorage.getItem('language') || 'ru';

function updatePrices() {
    document.querySelectorAll('.price').forEach(el => {
        const baseUSD = parseFloat(el.getAttribute('data-base')) || 0;
        const converted = (baseUSD * rates[currentCurrency]).toFixed(2);
        const symbol = currentCurrency === 'USD' ? '$' : currentCurrency === 'RUB' ? '₽' : '€';
        el.textContent = symbol + converted;
    });
}

function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-ru]').forEach(el => {
        const attr = lang === 'ru' ? 'ru' : 'en';
        if (el.hasAttribute(`data-${attr}`)) el.textContent = el.getAttribute(`data-${attr}`);
    });
    document.querySelectorAll('.btn-buy a').forEach(a => {
        a.textContent = lang === 'ru' ? 'Купить' : 'Buy';
    });
    const si = document.getElementById('search-input');
    if (si) si.placeholder = lang === 'ru' ? 'Поиск предметов...' : 'Search items...';
    const pmin = document.getElementById('price-min');
    const pmax = document.getElementById('price-max');
    if (pmin) pmin.placeholder = lang === 'ru' ? 'от' : 'min';
    if (pmax) pmax.placeholder = lang === 'ru' ? 'до' : 'max';
}

function initPage() {
    const curSelect = document.getElementById('currency');
    const langSelect = document.getElementById('language');
    if (curSelect) curSelect.value = currentCurrency;
    if (langSelect) langSelect.value = currentLang;
    switchLanguage(currentLang);
    updatePrices();
}

    // ========== ПОИСК И ФИЛЬТРЫ ==========
    const searchInput   = document.getElementById('search-input');
    const searchClear   = document.getElementById('search-clear');
    const noResults     = document.getElementById('no-results');
    const priceMin      = document.getElementById('price-min');
    const priceMax      = document.getElementById('price-max');
    const sortSelect    = document.getElementById('sort-select');
    const resetBtn      = document.getElementById('reset-filters');
    const grid          = document.querySelector('.skins-grid');

    function getCardPriceUSD(card) {
        const priceEl = card.querySelector('.price');
        return priceEl ? parseFloat(priceEl.getAttribute('data-base')) || 0 : 0;
    }

    function checkFiltersActive() {
        const active = searchInput.value.trim() || priceMin.value || priceMax.value || sortSelect.value;
        resetBtn.classList.toggle('visible', !!active);
        searchClear.style.display = searchInput.value.trim() ? 'block' : 'none';
    }

    function applyFilters() {
        const query   = searchInput.value.trim().toLowerCase();
        const minUSD  = priceMin.value !== '' ? parseFloat(priceMin.value) / rates[currentCurrency] : null;
        const maxUSD  = priceMax.value !== '' ? parseFloat(priceMax.value) / rates[currentCurrency] : null;
        const sort    = sortSelect.value;

        const cards = Array.from(document.querySelectorAll('.skin-card'));

        // Фильтрация
        let visible = 0;
        cards.forEach(card => {
            const name    = (card.querySelector('.skin-name')?.textContent || '').toLowerCase();
            const priceV  = getCardPriceUSD(card);
            const nameOk  = !query || name.includes(query);
            const minOk   = minUSD === null || priceV >= minUSD;
            const maxOk   = maxUSD === null || priceV <= maxUSD;
            const match   = nameOk && minOk && maxOk;
            card.style.display = match ? '' : 'none';
            if (match) visible++;
        });

        noResults.style.display = visible === 0 ? 'block' : 'none';

        // Сортировка видимых карточек
        if (sort) {
            const visibleCards = cards.filter(c => c.style.display !== 'none');
            visibleCards.sort((a, b) => {
                const pa = getCardPriceUSD(a);
                const pb = getCardPriceUSD(b);
                return sort === 'asc' ? pa - pb : pb - pa;
            });
            visibleCards.forEach(card => grid.appendChild(card));
        }

        checkFiltersActive();
    }

    searchInput.addEventListener('input', applyFilters);
    priceMin.addEventListener('input', applyFilters);
    priceMax.addEventListener('input', applyFilters);
    sortSelect.addEventListener('change', applyFilters);

    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        applyFilters();
        searchInput.focus();
    });

    resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        priceMin.value = '';
        priceMax.value = '';
        sortSelect.value = '';
        applyFilters();
    });

document.addEventListener('DOMContentLoaded', () => {
    initPage();

    document.getElementById('currency')?.addEventListener('change', e => {
        currentCurrency = e.target.value;
        localStorage.setItem('currency', currentCurrency);
        updatePrices();
        renderCart();
    });
    document.getElementById('language')?.addEventListener('change', e => {
        switchLanguage(e.target.value);
    });

    // ========== КОРЗИНА И ИЗБРАННОЕ ==========
    let cart = JSON.parse(localStorage.getItem('aura_cart') || '[]');
    let favs = JSON.parse(localStorage.getItem('aura_favs') || '[]');

    // Данные товаров из карточек
    function getItemData(id) {
        const card = document.querySelector(`.skin-card[data-id="${id}"]`);
        if (!card) return null;
        return {
            id,
            name: card.dataset.name,
            game: card.dataset.game,
            icon: card.dataset.icon,
            iconColor: card.dataset.iconColor,
            base: parseFloat(card.dataset.base)
        };
    }

    function save() {
        localStorage.setItem('aura_cart', JSON.stringify(cart));
        localStorage.setItem('aura_favs', JSON.stringify(favs));
    }

    function formatPrice(baseUSD) {
        const sym = currentCurrency === 'USD' ? '$' : currentCurrency === 'RUB' ? '₽' : '€';
        return sym + (baseUSD * rates[currentCurrency]).toFixed(2);
    }

    // Бейджи
    function updateBadges() {
        const cartCount = cart.reduce((s, i) => s + i.qty, 0);
        const favCount  = favs.length;
        const cb = document.getElementById('cart-badge');
        const fb = document.getElementById('fav-badge');
        cb.textContent = cartCount;
        cb.style.display = cartCount > 0 ? 'flex' : 'none';
        fb.textContent = favCount;
        fb.style.display = favCount > 0 ? 'flex' : 'none';
    }

    // Рендер избранного
    function renderFavs() {
        const body  = document.getElementById('fav-body');
        const empty = document.getElementById('fav-empty');
        // Удаляем старые элементы (кроме empty)
        body.querySelectorAll('.panel-item').forEach(el => el.remove());

        if (favs.length === 0) { empty.style.display = ''; return; }
        empty.style.display = 'none';

        favs.forEach(item => {
            const inCart = cart.some(c => c.id === item.id);
            const el = document.createElement('div');
            el.className = 'panel-item';
            el.dataset.id = item.id;
            el.innerHTML = `
                <div class="panel-item-icon"><i class="fas ${item.icon}" style="color:${item.iconColor}"></i></div>
                <div class="panel-item-info">
                    <div class="panel-item-name">${item.name}</div>
                    <div class="panel-item-game">${item.game}</div>
                    <div class="panel-item-price">${formatPrice(item.base)}</div>
                </div>
                <div class="panel-item-actions">
                    <button class="panel-item-actions btn-remove-item" title="Удалить" data-action="rem-fav" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
                    <button class="panel-item-actions btn-move-item" title="${inCart ? 'Уже в корзине' : 'В корзину'}" data-action="fav-to-cart" data-id="${item.id}">
                        <i class="fas ${inCart ? 'fa-check' : 'fa-cart-plus'}"></i>
                    </button>
                </div>`;
            body.appendChild(el);
        });
        updateBadges();
    }

    // Рендер корзины
    function renderCart() {
        const body   = document.getElementById('cart-body');
        const empty  = document.getElementById('cart-empty');
        const footer = document.getElementById('cart-footer');
        body.querySelectorAll('.panel-item').forEach(el => el.remove());

        if (cart.length === 0) {
            empty.style.display = '';
            footer.style.display = 'none';
            return;
        }
        empty.style.display = 'none';
        footer.style.display = '';

        let total = 0;
        cart.forEach(item => {
            total += item.base * item.qty;
            const el = document.createElement('div');
            el.className = 'panel-item';
            el.dataset.id = item.id;
            el.innerHTML = `
                <div class="panel-item-icon"><i class="fas ${item.icon}" style="color:${item.iconColor}"></i></div>
                <div class="panel-item-info">
                    <div class="panel-item-name">${item.name}</div>
                    <div class="panel-item-game">${item.game}</div>
                    <div class="panel-item-qty">
                        <button class="qty-btn" data-action="qty-dec" data-id="${item.id}">−</button>
                        <span class="qty-val">${item.qty}</span>
                        <button class="qty-btn" data-action="qty-inc" data-id="${item.id}">+</button>
                    </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;">
                    <div class="panel-item-price">${formatPrice(item.base * item.qty)}</div>
                    <div class="panel-item-actions">
                        <button class="btn-remove-item" data-action="rem-cart" data-id="${item.id}" title="Удалить"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>`;
            body.appendChild(el);
        });

        document.getElementById('cart-total').textContent = formatPrice(total);
        updateBadges();
    }

    // Обновить кнопки на карточках
    function syncCardButtons() {
        document.querySelectorAll('.btn-fav').forEach(btn => {
            const inFav = favs.some(f => f.id === btn.dataset.id);
            btn.classList.toggle('active-fav', inFav);
        });
        document.querySelectorAll('.btn-cart').forEach(btn => {
            const inCart = cart.some(c => c.id === btn.dataset.id);
            btn.classList.toggle('active-cart', inCart);
        });
    }

    // Открыть/закрыть панели
    const overlay = document.getElementById('panel-overlay');
    function openPanel(id) {
        document.getElementById(id).classList.add('open');
        overlay.classList.add('open');
    }
    function closeAll() {
        document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('open'));
        overlay.classList.remove('open');
    }

    document.getElementById('btn-open-fav').addEventListener('click', () => { renderFavs(); openPanel('panel-fav'); });
    document.getElementById('btn-open-cart').addEventListener('click', () => { renderCart(); openPanel('panel-cart'); });
    document.getElementById('close-fav').addEventListener('click', closeAll);
    document.getElementById('close-cart').addEventListener('click', closeAll);
    overlay.addEventListener('click', closeAll);

    // Делегирование событий — кнопки на карточках
    document.addEventListener('click', e => {
        // Добавить в избранное
        const favBtn = e.target.closest('.btn-fav');
        if (favBtn) {
            const id   = favBtn.dataset.id;
            const idx  = favs.findIndex(f => f.id === id);
            if (idx === -1) { const d = getItemData(id); if (d) favs.push(d); }
            else favs.splice(idx, 1);
            save(); syncCardButtons(); updateBadges(); return;
        }

        // Добавить в корзину
        const cartBtn = e.target.closest('.btn-cart');
        if (cartBtn) {
            const id  = cartBtn.dataset.id;
            const idx = cart.findIndex(c => c.id === id);
            if (idx === -1) { const d = getItemData(id); if (d) cart.push({...d, qty: 1}); }
            else cart.splice(idx, 1);
            save(); syncCardButtons(); updateBadges(); renderCart(); return;
        }

        // Действия внутри панелей
        const action = e.target.closest('[data-action]')?.dataset.action;
        const id     = e.target.closest('[data-action]')?.dataset.id;
        if (!action) return;

        if (action === 'rem-fav') {
            favs = favs.filter(f => f.id !== id);
            save(); syncCardButtons(); renderFavs(); updateBadges();
        }
        if (action === 'fav-to-cart') {
            const inCart = cart.some(c => c.id === id);
            if (!inCart) { const d = favs.find(f => f.id === id); if (d) cart.push({...d, qty: 1}); }
            save(); syncCardButtons(); renderFavs(); renderCart(); updateBadges();
        }
        if (action === 'rem-cart') {
            cart = cart.filter(c => c.id !== id);
            save(); syncCardButtons(); renderCart(); updateBadges();
        }
        if (action === 'qty-inc') {
            const item = cart.find(c => c.id === id);
            if (item) item.qty++;
            save(); renderCart();
        }
        if (action === 'qty-dec') {
            const item = cart.find(c => c.id === id);
            if (item && item.qty > 1) item.qty--;
            else cart = cart.filter(c => c.id !== id);
            save(); syncCardButtons(); renderCart(); updateBadges();
        }
    });

    // Инициализация
    syncCardButtons();
    updateBadges();
});
