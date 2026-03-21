
const skinsData = [
    {
        id: 1,
        name: "Karambit Doppler",
        game: "CS:GO",
        type: "knife",
        rarity: "legendary",
        price: 1850,
        color: "#FF6B6B",
        icon: "fa-gem",
        description: "Эксклюзивный нож с анимацией Doppler. Фаза 2 с розовым оттенком."
    },
    {
        id: 2,
        name: "Dragon Lore",
        game: "CS:GO",
        type: "awp",
        rarity: "legendary",
        price: 2499,
        color: "#FFD700",
        icon: "fa-dragon",
        description: "Легендарный скин для AWP. Один из самых желанных скинов в игре."
    },
    {
        id: 3,
        name: "Prime Vandal",
        game: "Valorant",
        type: "rifle",
        rarity: "rare",
        price: 49.99,
        color: "#4ECDC4",
        icon: "fa-shield-alt",
        description: "Премиум скин для Vandal с уникальной анимацией перезарядки."
    },
    {
        id: 4,
        name: "Butterfly Knife",
        game: "CS:GO",
        type: "knife",
        rarity: "legendary",
        price: 2100,
        color: "#9B59B6",
        icon: "fa-fan",
        description: "Нож-бабочка с уникальной анимацией inspect."
    },
    {
        id: 5,
        name: "Asiimov AWP",
        game: "CS:GO",
        type: "awp",
        rarity: "uncommon",
        price: 89.99,
        color: "#3498DB",
        icon: "fa-rocket",
        description: "Футуристичный скин в оранжево-белой цветовой схеме."
    },
    {
        id: 6,
        name: "M9 Bayonet",
        game: "CS:GO",
        type: "knife",
        rarity: "rare",
        price: 1250,
        color: "#E74C3C",
        icon: "fa-crosshairs",
        description: "Классический нож M9 Bayonet с эффектом Ультрафиолет."
    },
    {
        id: 7,
        name: "Reaver Knife",
        game: "Valorant",
        type: "knife",
        rarity: "rare",
        price: 79.99,
        color: "#8E44AD",
        icon: "fa-skull",
        description: "Мрачный нож в готическом стиле для Valorant."
    },
    {
        id: 8,
        name: "Sport Gloves",
        game: "CS:GO",
        type: "gloves",
        rarity: "legendary",
        price: 850,
        color: "#1ABC9C",
        icon: "fa-baseball-ball",
        description: "Спортивные перчатки с эффектом Pandora's Box."
    }
];


document.addEventListener('DOMContentLoaded', function() {
   
    loadSkins();
    
    
    initPriceSlider();
    
    
    initFAQ();
    
    
    initFilters();
    
    
    initSorting();
    
    
    initButtons();
});


function loadSkins(filteredData = null) {
    const skinsGrid = document.querySelector('.skins-grid');
    const data = filteredData || skinsData;
    
    skinsGrid.innerHTML = '';
    
    data.forEach(skin => {
        const skinCard = createSkinCard(skin);
        skinsGrid.appendChild(skinCard);
    });
}


function createSkinCard(skin) {
    const card = document.createElement('div');
    card.className = 'skin-card';
    card.dataset.id = skin.id;
    card.dataset.game = skin.game.toLowerCase();
    card.dataset.type = skin.type;
    card.dataset.rarity = skin.rarity;
    card.dataset.price = skin.price;
    
    
    let rarityColor, rarityText;
    switch(skin.rarity) {
        case 'common':
            rarityColor = '#ccc';
            rarityText = 'Обычный';
            break;
        case 'uncommon':
            rarityColor = '#87cefa';
            rarityText = 'Необычный';
            break;
        case 'rare':
            rarityColor = '#d8bfd8';
            rarityText = 'Редкий';
            break;
        case 'legendary':
            rarityColor = '#ffd700';
            rarityText = 'Легендарный';
            break;
    }
    
    card.innerHTML = `
        <div class="skin-image" style="color: ${skin.color};">
            <i class="fas ${skin.icon}"></i>
        </div>
        <div class="skin-info">
            <h3 class="skin-name">${skin.name}</h3>
            <div class="skin-game">
                <i class="fas fa-gamepad"></i> ${skin.game}
                <span class="skin-rarity" style="background-color: ${rarityColor}20; color: ${rarityColor};">${rarityText}</span>
            </div>
            <p class="skin-description">${skin.description}</p>
            <div class="skin-price">
                <div class="price">$${skin.price.toFixed(2)}</div>
                <button class="btn-buy" data-id="${skin.id}">
                    <i class="fas fa-shopping-cart"></i> Купить
                </button>
            </div>
        </div>
    `;
    
    return card;
}


function initPriceSlider() {
    const minSlider = document.getElementById('minPrice');
    const maxSlider = document.getElementById('maxPrice');
    const minInput = document.getElementById('minInput');
    const maxInput = document.getElementById('maxInput');
    const priceValue = document.getElementById('priceValue');
    
    
    function updatePriceValue() {
        const min = parseInt(minSlider.value);
        const max = parseInt(maxSlider.value);
        priceValue.textContent = `$${min} - $${max}`;
        
        
        const minPercent = (min / 5000) * 100;
        const maxPercent = (max / 5000) * 100;
        document.querySelector('.slider-track').style.left = `${minPercent}%`;
        document.querySelector('.slider-track').style.right = `${100 - maxPercent}%`;
    }
    
    minSlider.addEventListener('input', function() {
        const min = parseInt(this.value);
        const max = parseInt(maxSlider.value);
        
        if (min > max) {
            this.value = max;
            minInput.value = max;
        } else {
            minInput.value = min;
        }
        
        updatePriceValue();
    });
    
    maxSlider.addEventListener('input', function() {
        const min = parseInt(minSlider.value);
        const max = parseInt(this.value);
        
        if (max < min) {
            this.value = min;
            maxInput.value = min;
        } else {
            maxInput.value = max;
        }
        
        updatePriceValue();
    });
    
    
    minInput.addEventListener('input', function() {
        let value = parseInt(this.value);
        if (isNaN(value)) value = 0;
        if (value < 0) value = 0;
        if (value > 5000) value = 5000;
        
        this.value = value;
        minSlider.value = value;
        updatePriceValue();
    });
    
    maxInput.addEventListener('input', function() {
        let value = parseInt(this.value);
        if (isNaN(value)) value = 5000;
        if (value < 0) value = 0;
        if (value > 5000) value = 5000;
        
        this.value = value;
        maxSlider.value = value;
        updatePriceValue();
    });
    
    
    updatePriceValue();
}

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            
            item.classList.toggle('active');
        });
    });
}


function initFilters() {
    const applyButton = document.querySelector('.btn-apply');
    const resetButton = document.querySelector('.btn-reset');
    
    applyButton.addEventListener('click', applyFilters);
    resetButton.addEventListener('click', resetFilters);
}

function applyFilters() {
    ы
    const selectedGames = [];
    document.querySelectorAll('input[name="game"]:checked').forEach(checkbox => {
        selectedGames.push(checkbox.value);
    });
    
    
    const selectedTypes = [];
    document.querySelectorAll('input[name="type"]:checked').forEach(checkbox => {
        selectedTypes.push(checkbox.value);
    });
    
    
    const selectedRarities = [];
    document.querySelectorAll('input[name="rarity"]:checked').forEach(checkbox => {
        selectedRarities.push(checkbox.value);
    });
    
    
    const minPrice = parseInt(document.getElementById('minInput').value);
    const maxPrice = parseInt(document.getElementById('maxInput').value);
    
    let filteredData = skinsData.filter(skin => {
        
        if (selectedGames.length > 0 && !selectedGames.includes(skin.game.toLowerCase())) {
            return false;
        }
        
       
        if (selectedTypes.length > 0 && !selectedTypes.includes(skin.type)) {
            return false;
        }
        
        
        if (selectedRarities.length > 0 && !selectedRarities.includes(skin.rarity)) {
            return false;
        }
        
        
        if (skin.price < minPrice || skin.price > maxPrice) {
            return false;
        }
        
        return true;
    });
    
    
    const sortBy = document.getElementById('sortBy').value;
    filteredData = sortSkins(filteredData, sortBy);
    
   
    loadSkins(filteredData);
    
    const count = filteredData.length;
    alert(`Найдено ${count} скин${getRussianPlural(count)}`);
}

function resetFilters() {
   
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
   
    document.getElementById('minPrice').value = 0;
    document.getElementById('maxPrice').value = 5000;
    document.getElementById('minInput').value = 0;
    document.getElementById('maxInput').value = 5000;

    document.getElementById('priceValue').textContent = '$0 - $5,000';
    document.querySelector('.slider-track').style.left = '0%';
    document.querySelector('.slider-track').style.right = '0%';

    document.getElementById('sortBy').value = 'popular';

    loadSkins();
}

function sortSkins(data, sortBy) {
    switch(sortBy) {
        case 'price-low':
            return [...data].sort((a, b) => a.price - b.price);
        case 'price-high':
            return [...data].sort((a, b) => b.price - a.price);
        case 'new':
            return [...data].sort((a, b) => b.id - a.id);
        case 'popular':
        default:
            return [...data].sort((a, b) => {
                
                return b.price - a.price;
            });
    }
}

function initSorting() {
    const sortSelect = document.getElementById('sortBy');
    
    sortSelect.addEventListener('change', function() {
        applyFilters();
    });
}

function initButtons() {
    
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-buy')) {
            const button = e.target.closest('.btn-buy');
            const skinId = button.dataset.id;
            const skin = skinsData.find(s => s.id == skinId);
            
            if (skin) {
                const confirmBuy = confirm(`Вы хотите купить "${skin.name}" за $${skin.price}?`);
                if (confirmBuy) {
                    alert(`Скин "${skin.name}" успешно куплен!`);
                }
            }
        }

        if (e.target.closest('.btn-shop')) {
            alert('Переход в защищённый режим покупки...');
        }

        if (e.target.closest('.btn-support')) {
            const email = document.getElementById('supportEmail').value;
            const message = document.getElementById('supportMessage').value;
            
            if (!email || !message) {
                alert('Пожалуйста, заполните все поля формы поддержки.');
                return;
            }
            
            alert('Ваше сообщение отправлено в службу поддержки. Ответим в течение 5 минут.');
            document.getElementById('supportEmail').value = '';
            document.getElementById('supportMessage').value = '';
        }
    });
}

function getRussianPlural(number) {
    if (number % 10 === 1 && number % 100 !== 11) {
        return '';
    } else if ([2, 3, 4].includes(number % 10) && ![12, 13, 14].includes(number % 100)) {
        return 'а';
    } else {
        return 'ов';
    }
}