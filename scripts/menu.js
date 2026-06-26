const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');

function showCustomAlert(msg) {
    const overlay = document.getElementById('custom-alert');
    document.getElementById('custom-alert-message').textContent = msg;
    overlay.style.display = 'flex';
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });
}

document.getElementById('custom-alert-close').addEventListener('click', () => {
    const overlay = document.getElementById('custom-alert');
    overlay.classList.remove('active');
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 400);
});

let customConfirmCallback = null;

function showCustomConfirm(msg, callback) {
    const overlay = document.getElementById('custom-confirm');
    document.getElementById('custom-confirm-message').textContent = msg;
    customConfirmCallback = callback;
    overlay.style.display = 'flex';
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });
}

document.getElementById('custom-confirm-yes').addEventListener('click', () => {
    const overlay = document.getElementById('custom-confirm');
    overlay.classList.remove('active');
    setTimeout(() => {
        overlay.style.display = 'none';
        if (customConfirmCallback) customConfirmCallback();
    }, 400);
});

document.getElementById('custom-confirm-no').addEventListener('click', () => {
    const overlay = document.getElementById('custom-confirm');
    overlay.classList.remove('active');
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 400);
});

let totalSecondsSpent = parseInt(localStorage.getItem('fc_totalSecondsSpent')) || 0;
let gameTimerInterval = null;

function startTimer() {
    if (!gameTimerInterval) {
        gameTimerInterval = setInterval(() => {
            totalSecondsSpent++;
            localStorage.setItem('fc_totalSecondsSpent', totalSecondsSpent);
            updateTimerDisplay();
        }, 1000);
    }
}

const fileInput = document.getElementById('input-card-img');
const fileBtnText = document.getElementById('file-upload-btn-text');

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileBtnText.textContent = `✓ ${file.name}`;
        fileBtnText.classList.add('file-selected');

        const reader = new FileReader();
        reader.onload = function(event) {
            tempImgBase64 = event.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        resetFileInputElement();
    }
});

function resetFileInputElement() {
    fileInput.value = "";
    fileBtnText.innerHTML = `<span>Выбрать файл изображения</span>`;
    fileBtnText.classList.remove('file-selected');
    tempImgBase64 = "";
}

function stopTimer() {
    if (gameTimerInterval) {
        clearInterval(gameTimerInterval);
        gameTimerInterval = null;
        saveProgressToServer();
    }
}

function updateTimerDisplay() {
    const mins = String(Math.floor(totalSecondsSpent / 60)).padStart(2, '0');
    const secs = String(totalSecondsSpent % 60).padStart(2, '0');
    document.getElementById('stat-time').textContent = `${mins}:${secs}`;
}

function switchTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach(t => {
        t.classList.toggle('active', t.getAttribute('data-tab') === tabName);
    });

    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    const targetContent = document.getElementById(`tab-${tabName}`);
    if (targetContent) targetContent.classList.add('active');

    if (tabName === 'flashcards') {
        const session = window.currentUser?.activeSession;
        if (session && session.levelId) {
            if (gameScreen.style.display !== 'block') {
                activeLevelId = session.levelId;
                currentCardIndex = session.cardIndex || 0;
                knownWords.clear();
                if (session.knownWords) {
                    session.knownWords.forEach(idx => knownWords.add(idx));
                }
                isFlipped = false;
                flashcard.className = "card";
                applyCardContent();
                updateStats();
                endScreen.style.display = 'none';
                gameScreen.style.display = 'block';
            }
            startTimer();
            if (typeof applyCardContent === 'function') {
                applyCardContent(); // обновление содержимое карточки
            }
        } else {
            stopTimer();
        }
    } else {
        stopTimer();
    }

    if (tabName === 'home') {
        refreshActiveSessionWidget();
    }

    if (tabName === 'favorites') {
        renderFavoritesPage();
    }

    if (tabName === 'shop') {
        renderShopPage();
    }
}

document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.getAttribute('data-tab')));
});

const levelsData = {
    1: [
        { id: 'l1_1', ru: 'КОТ', en: 'CAT', img: 'assets/img/animals/cat.png' },
        { id: 'l1_2', ru: 'СОБАКА', en: 'DOG', img: 'assets/img/animals/dog.png' },
        { id: 'l1_3', ru: 'МЕДВЕДЬ', en: 'BEAR', img: 'assets/img/animals/bear.png' },
        { id: 'l1_4', ru: 'ОСЁЛ', en: 'DONKEY', img: 'assets/img/animals/donkey.png' },
        { id: 'l1_5', ru: 'ЛЯГУШКА', en: 'FROG', img: 'assets/img/animals/frog.png' },
        { id: 'l1_6', ru: 'ОБЕЗЬЯНА', en: 'MONKEY', img: 'assets/img/animals/monkey.png' }
    ],
    2: [
        { id: 'l2_1', ru: 'КЛУБНИКА', en: 'STRAWBERRY', img: 'assets/img/food/strawberry.png' },
        { id: 'l2_2', ru: 'ЛАПША', en: 'NOODLES', img: 'assets/img/food/noodles.png' },
        { id: 'l2_3', ru: 'ХЛЕБ', en: 'BREAD', img: 'assets/img/food/bread.png' },
        { id: 'l2_4', ru: 'КОНФЕТА', en: 'CANDY', img: 'assets/img/food/candy.png' },
        { id: 'l2_5', ru: 'МОЛОКО', en: 'MILK', img: 'assets/img/food/milk.png' }
    ],
    3: [
        { id: 'l3_1', ru: 'СЧАСТЛИВЫЙ', en: 'HAPPY', img: 'assets/img/emotes/happy.png' },
        { id: 'l3_2', ru: 'ГРУСТНЫЙ', en: 'SADNESS', img: 'assets/img/emotes/sad.png' },
        { id: 'l3_3', ru: 'ЗЛОЙ', en: 'ANGRY', img: 'assets/img/emotes/angry.png' },
        { id: 'l3_4', ru: 'КРУТОЙ', en: 'COOL', img: 'assets/img/emotes/cool.png' },
        { id: 'l3_5', ru: 'УДИВЛЕННЫЙ', en: 'SURPRISED', img: 'assets/img/emotes/surprised.png' },
    ],
    4: [
        { id: 'l4_1', ru: 'КУРТКА', en: 'JACKET', img: 'assets/img/clothes/jacket.png' },
        { id: 'l4_2', ru: 'ОБУВЬ', en: 'SHOES', img: 'assets/img/clothes/shoes.png' },
        { id: 'l4_3', ru: 'ШТАНЫ', en: 'PANTS', img: 'assets/img/clothes/pants.png' },
        { id: 'l4_4', ru: 'ШОРТЫ', en: 'SHORTS', img: 'assets/img/clothes/shorts.png' },
        { id: 'l4_5', ru: 'СВИТЕР', en: 'SWEATER', img: 'assets/img/clothes/sweater.png' },
        { id: 'l4_6', ru: 'ФУТБОЛКА', en: 'T-SHIRT', img: 'assets/img/clothes/t-shirt.png' }
    ],
    5: [
        { id: 'l5_stub', ru: '', en: '', img: '' }
    ]
};

let customDecks = JSON.parse(localStorage.getItem('fc_customDecks')) || {};

const shopAvatars = [
    { id: 'monkey', name: 'Обезьянка', cost: 0, img: 'assets/img/animals/monkey.png' },
    { id: 'cat', name: 'Котёнок', cost: 1, img: 'assets/img/animals/cat.png' },
    { id: 'dog', name: 'Щенок', cost: 1, img: 'assets/img/animals/dog.png' },
    { id: 'frog', name: 'Лягушонок', cost: 2, img: 'assets/img/animals/frog.png' },
    { id: 'bear', name: 'Медвежонок', cost: 3, img: 'assets/img/animals/bear.png' },
    { id: 'donkey', name: 'Ослик', cost: 3, img: 'assets/img/animals/donkey.png' }
];

let starsCurrency = parseInt(localStorage.getItem('fc_starsCurrency')) || 0;
let currentAvatarId = localStorage.getItem('fc_currentAvatarId') || 'monkey';
let purchasedAvatarIds = JSON.parse(localStorage.getItem('fc_purchasedAvatarIds')) || ['monkey'];

const defaultProgress = {
    1: { highestStars: 0, learnedWordsCount: 0, isCompleted: false, isLocked: false },
    2: { highestStars: 0, learnedWordsCount: 0, isCompleted: false, isLocked: true },
    3: { highestStars: 0, learnedWordsCount: 0, isCompleted: false, isLocked: true },
    4: { highestStars: 0, learnedWordsCount: 0, isCompleted: false, isLocked: true },
    5: { highestStars: 0, learnedWordsCount: 0, isCompleted: false, isLocked: true }
};

let profileProgress = JSON.parse(localStorage.getItem('fc_profileProgress')) || defaultProgress;
const savedFavorites = JSON.parse(localStorage.getItem('fc_favoriteWordIds')) || [];
const favoriteWordIds = new Set(savedFavorites);

function saveFavoritesToLocalStorage() {
    localStorage.setItem('fc_favoriteWordIds', JSON.stringify(Array.from(favoriteWordIds)));
}

function saveProgressToLocalStorage() {
    localStorage.setItem('fc_profileProgress', JSON.stringify(profileProgress));
    localStorage.setItem('fc_starsCurrency', starsCurrency);
    localStorage.setItem('fc_currentAvatarId', currentAvatarId);
    localStorage.setItem('fc_purchasedAvatarIds', JSON.stringify(purchasedAvatarIds));
    localStorage.setItem('fc_customDecks', JSON.stringify(customDecks));
}

function updateHeaderAvatarImage() {
    const currentAvObj = shopAvatars.find(a => a.id === currentAvatarId);
    if (currentAvObj) {
        document.getElementById('header-avatar').src = currentAvObj.img;
    }
}

const levelThresholds = [0, 3, 6, 15, 30, 50, 80, 120, 180, 250, 350, 500];

function updateProfileLevel(totalStars) {
    let level = 1;
    for (let i = 0; i < levelThresholds.length; i++) {
        if (totalStars >= levelThresholds[i]) {
            level = i + 1;
        }
    }
    if (level > levelThresholds.length) level = levelThresholds.length;

    const currentThreshold = levelThresholds[level - 1];
    const nextThreshold = level < levelThresholds.length ? levelThresholds[level] : currentThreshold;
    const progress = nextThreshold > currentThreshold ? (totalStars - currentThreshold) / (nextThreshold - currentThreshold) * 100 : 100;

    document.getElementById('profile-level-number').textContent = level;
    document.getElementById('profile-progress-fill').style.width = Math.min(progress, 100) + '%';
}


let isReverseTranslation = false;
let activeLevelId = "1";
let currentCardIndex = 0;
let isFlipped = false;
const knownWords = new Set();

const flashcard = document.getElementById('flashcard');
const btnDontKnow = document.getElementById('btn-dont-know');
const btnKnow = document.getElementById('btn-know');
const btnRestart = document.getElementById('btn-restart');
const btnToMenu = document.getElementById('btn-to-menu');

const progressText = document.getElementById('progress-text');
const progressFill = document.getElementById('progress-fill');
const starsRating = document.getElementById('stars-rating');
const endStarsRating = document.getElementById('end-stars-rating');
const endResultText = document.getElementById('end-result-text');

function getStarsCount(knownCount, totalCount) {
    if(totalCount === 0) return 0;
    const ratio = knownCount / totalCount;
    if (ratio >= 0.8) return 3;
    if (ratio >= 0.5) return 2;
    if (ratio >= 0.1) return 1;
    return 0;
}

function buildStarsHtml(count) {
    let html = '';
    for (let i = 0; i < 3; i++) {
        const isActive = i < count ? 'active' : '';
        html += `<img src="assets/img/nav/reviews.png" class="star-img-icon ${isActive}" alt="Рейтинг">`;
    }
    return html;
}

function getLevelCards(lvlId) {
    if (String(lvlId).startsWith('custom_')) {
        return customDecks[lvlId] ? customDecks[lvlId].cards : [];
    }
    return levelsData[lvlId] || [];
}

function refreshActiveSessionWidget() {
    const sessionContainer = document.getElementById('current-session-container');
    const sessionData = window.currentUser?.activeSession;

    if (!sessionData || !sessionData.levelId) {
        sessionContainer.style.display = 'none';
        return;
    }

    const sessionLvlId = sessionData.levelId;
    const cards = getLevelCards(sessionLvlId);
    if (!cards || cards.length === 0) {
        sessionContainer.style.display = 'none';
        return;
    }

    let title = "";
    if (String(sessionLvlId).startsWith('custom_')) {
        title = customDecks[sessionLvlId] ? customDecks[sessionLvlId].title : "Моя колода";
    } else {
        const names = { 1: "ЖИВОТНЫЕ", 2: "ЕДА", 3: "ЭМОЦИИ", 4: "ОДЕЖДА" };
        title = names[sessionLvlId] || "Уровень " + sessionLvlId;
    }

    const idx = sessionData.cardIndex || 0;
    const known = sessionData.knownWords || [];
    document.getElementById('current-session-title').textContent = title.toUpperCase();
    document.getElementById('current-session-progress-text').textContent =
        `Карточка ${Math.min(idx + 1, cards.length)} из ${cards.length} (Изучено: ${known.length})`;
    sessionContainer.style.display = 'block';
}

document.getElementById('btn-continue-session').addEventListener('click', () => {
    const sessionData = window.currentUser?.activeSession;
    if (!sessionData || !sessionData.levelId) return;

    activeLevelId = sessionData.levelId;
    currentCardIndex = sessionData.cardIndex || 0;
    const savedKnown = sessionData.knownWords || [];

    knownWords.clear();
    savedKnown.forEach(idx => knownWords.add(idx));

    isFlipped = false;
    flashcard.className = "card";
    applyCardContent();
    updateStats();

    endScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    switchTab('flashcards');
});

function refreshGlobalStatistics() {
    if (profileProgress[1].isCompleted) profileProgress[2].isLocked = false;
    if (!profileProgress[2].isLocked && profileProgress[2].isCompleted) profileProgress[3].isLocked = false;
    if (!profileProgress[3].isLocked && profileProgress[3].isCompleted) profileProgress[4].isLocked = false;

    for (let deckId in customDecks) {
        if (!profileProgress[deckId]) {
            profileProgress[deckId] = { highestStars: 0, learnedWordsCount: 0, isCompleted: false, isLocked: false };
        }
    }

    let totalStarsSum = 0;
    let totalWordsSum = 0;
    let completedThemesCount = 0;
    let totalMaxWordsInGame = 0;
    let openLevelsCount = 0;

    let totalStarsEarned = 0;

    //считаем все звёзды
    for (let lvlId in profileProgress) {
        if (profileProgress.hasOwnProperty(lvlId)) {
            totalStarsEarned += (profileProgress[lvlId].highestStars || 0);
        }
    }

    const flashcardsTabIcon = document.getElementById('nav-tab-flashcards');
    if (flashcardsTabIcon) {
        if (totalStarsEarned === 0) {
            //если нет никакой звезды, скрываем вкладку
            flashcardsTabIcon.classList.add('nav-tab-hidden');
        } else {
            //если пройдена хотя бы 1 звезда, показываем обратно
            flashcardsTabIcon.classList.remove('nav-tab-hidden');
        }
    }

    for (let lvlId in levelsData) {
        if (!profileProgress[lvlId].isLocked && parseInt(lvlId) !== 5) openLevelsCount++;
        if (parseInt(lvlId) !== 5) totalMaxWordsInGame += levelsData[lvlId].length;
    }
    for (let deckId in customDecks) {
        totalMaxWordsInGame += customDecks[deckId].cards.length;
    }

    let maxPossibleStarsForOpenLevels = openLevelsCount * 3;

    for (let lvlId in profileProgress) {
        if (String(lvlId) === '5') continue;

        if (!String(lvlId).startsWith('custom_')) {
            totalStarsSum += profileProgress[lvlId].highestStars;
        }

        totalWordsSum += profileProgress[lvlId].learnedWordsCount;
        if (profileProgress[lvlId].isCompleted) completedThemesCount++;
    }

    saveProgressToLocalStorage();

    updateProfileLevel(totalStarsSum);

    for (let lvlId = 1; lvlId <= 5; lvlId++) {
        const cardEl = document.getElementById(`card-l${lvlId}`);
        const statusEl = document.getElementById(`status-l${lvlId}`);
        const lvlProg = profileProgress[lvlId];

        if (lvlProg.isLocked) {
            cardEl.className = "level-card locked setup-card";
            statusEl.textContent = "Закрыто";
        } else {
            cardEl.className = "level-card bg-white setup-card";
            if (lvlProg.highestStars > 0) {
                statusEl.innerHTML = `<div class="level-stars-inline">${buildStarsHtml(lvlProg.highestStars)}</div>`;
            } else {
                statusEl.textContent = 'Доступно';
            }
        }

        const totalLvlWords = levelsData[lvlId].length;
        const percent = totalLvlWords > 0 ? Math.round((lvlProg.learnedWordsCount / totalLvlWords) * 100) : 0;
        const barEl = document.getElementById(`bar-l${lvlId}`);
        const txtEl = document.getElementById(`percent-l${lvlId}`);
        if (barEl && txtEl) {
            barEl.style.height = `${percent}%`;
            txtEl.textContent = `${percent}%`;
        }
    }

    const customContainer = document.getElementById('user-decks-container');
    const chartContainer = document.getElementById('chart-bars-container');

    customContainer.innerHTML = '';
    document.querySelectorAll('.custom-chart-column').forEach(el => el.remove());

    const customDeckKeys = Object.keys(customDecks);

    customDeckKeys.forEach(deckId => {
        const deck = customDecks[deckId];
        const prog = profileProgress[deckId] || { highestStars: 0, learnedWordsCount: 0 };

        const deckCard = document.createElement('div');
        deckCard.className = "level-card bg-white setup-card";
        deckCard.setAttribute('data-level', deckId);

        let statusHtml = 'Доступно';
        if (prog.highestStars > 0) {
            statusHtml = `<div class="level-stars-inline">${buildStarsHtml(prog.highestStars)}</div>`;
        }

        deckCard.innerHTML = `
                <button class="deck-edit-btn" data-id="${deckId}">Изменить</button>
                <div class="level-num">МОЯ КОЛОДА</div>
                <h2 class="fw-bold" style="font-size: 20px; word-break: break-all;">${deck.title.toUpperCase()}</h2>
                <div class="level-status">${statusHtml}</div>
            `;
        customContainer.appendChild(deckCard);

        const totalCards = deck.cards.length;
        const customPercent = totalCards > 0 ? Math.round((prog.learnedWordsCount / totalCards) * 100) : 0;

        const chartCol = document.createElement('div');
        chartCol.className = "chart-column custom-chart-column";
        chartCol.innerHTML = `
                <div class="chart-bar-wrapper">
                    <div class="chart-bar" style="height: ${customPercent}%; background-color: #1e1e1c;">
                        <span class="bar-percentage">${customPercent}%</span>
                    </div>
                </div>
                <span class="chart-label" style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 70px;">${deck.title}</span>
            `;
        chartContainer.appendChild(chartCol);
    });

    document.getElementById('home-total-stars').textContent = totalStarsSum;
    document.getElementById('home-max-possible-stars').textContent = maxPossibleStarsForOpenLevels;
    document.getElementById('stat-stars').textContent = `${totalStarsSum} / ${maxPossibleStarsForOpenLevels}`;
    document.getElementById('stat-words').textContent = `${totalWordsSum} / ${totalMaxWordsInGame}`;
    document.getElementById('stat-themes').textContent = `${completedThemesCount} / ${4 + customDeckKeys.length}`;
    document.getElementById('shop-balance-count').textContent = starsCurrency;

    updateTimerDisplay();
    updateHeaderAvatarImage();
    refreshActiveSessionWidget();
}

function updateStats() {
    const currentLevelCards = getLevelCards(activeLevelId);
    const knownCount = knownWords.size;
    const totalCount = currentLevelCards.length;

    progressText.textContent = `Изучено: ${knownCount} / ${totalCount}`;
    progressFill.style.width = `${totalCount > 0 ? (knownCount / totalCount) * 100 : 0}%`;
    starsRating.innerHTML = buildStarsHtml(getStarsCount(knownCount, totalCount));
}

function applyCardContent() {
    const currentLevelCards = getLevelCards(activeLevelId);
    if (!currentLevelCards || currentLevelCards.length === 0) return;
    const currentData = currentLevelCards[currentCardIndex];

    const frontImg = document.getElementById('front-card-img');
    const frontText = document.querySelector('.card-front .card-text');
    const backImg = document.getElementById('back-card-img');
    const backText = document.querySelector('.card-back .card-text');

    if (!isReverseTranslation) {
        frontText.textContent = currentData.ru;
        backText.textContent = currentData.en;
    } else {
        frontText.textContent = currentData.en;
        backText.textContent = currentData.ru;
    }

    if (currentData.img && currentData.img.trim() !== "") {
        frontImg.src = backImg.src = currentData.img;
        frontImg.style.display = backImg.style.display = "block";
    } else {
        frontImg.style.display = backImg.style.display = "none";
    }
    frontImg.alt = backImg.alt = currentData.en || "Card image";

    document.querySelectorAll('.btn-fav-toggle').forEach(btn => {
        btn.classList.toggle('in-fav', favoriteWordIds.has(currentData.id));
    });
}

function renderShopPage() {
    const container = document.getElementById('shop-items-container');
    container.innerHTML = '';
    document.getElementById('shop-balance-count').textContent = starsCurrency;

    shopAvatars.forEach(av => {
        const itemCard = document.createElement('div');
        itemCard.className = 'shop-item-card bg-white';

        const isPurchased = purchasedAvatarIds.includes(av.id);
        const isActive = currentAvatarId === av.id;

        let actionBtnHtml = '';
        if (isActive) {
            actionBtnHtml = `<button class="shop-btn btn-active-avatar" disabled>ВЫБРАН</button>`;
        } else if (isPurchased) {
            actionBtnHtml = `<button class="shop-btn btn-select-avatar" onclick="selectAvatar('${av.id}')">ВЫБРАТЬ</button>`;
        } else {
            const canBuy = starsCurrency >= av.cost;
            const disabledStr = canBuy ? '' : 'disabled';
            actionBtnHtml = `
                        <button class="shop-btn btn-buy-avatar" ${disabledStr} onclick="buyAvatar('${av.id}', ${av.cost})">
                            КУПИТЬ ЗА ${av.cost}
                            <img src="assets/img/nav/reviews.png" class="star-img-icon active" style="width: 16px; height: 16px;" alt="Звезд">
                        </button>`;
        }

        itemCard.innerHTML = `
                    <img src="${av.img}" class="shop-item-img" alt="${av.name}">
                    <h3>${av.name}</h3>
                    <div class="shop-item-action-wrapper">
                        ${actionBtnHtml}
                    </div>
                `;
        container.appendChild(itemCard);
    });
}

window.buyAvatar = function(avatarId, cost) {
    if (starsCurrency >= cost && !purchasedAvatarIds.includes(avatarId)) {
        starsCurrency -= cost;
        purchasedAvatarIds.push(avatarId);
        currentAvatarId = avatarId;
        saveProgressToLocalStorage();
        saveProgressToServer();
        refreshGlobalStatistics();
        renderShopPage();
    }
};

window.selectAvatar = function(avatarId) {
    if (purchasedAvatarIds.includes(avatarId)) {
        currentAvatarId = avatarId;
        saveProgressToLocalStorage();
        saveProgressToServer();
        refreshGlobalStatistics();
        renderShopPage();
    }
};

document.querySelectorAll('.btn-fav-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentLevelCards = getLevelCards(activeLevelId);
        if (!currentLevelCards || currentLevelCards.length === 0) return;
        const currentData = currentLevelCards[currentCardIndex];

        if (favoriteWordIds.has(currentData.id)) {
            favoriteWordIds.delete(currentData.id);
        } else {
            favoriteWordIds.add(currentData.id);
        }

        saveFavoritesToLocalStorage();
        saveProgressToServer();

        document.querySelectorAll('.btn-fav-toggle').forEach(b => {
            b.classList.toggle('in-fav', favoriteWordIds.has(currentData.id));
        });
    });
});

function renderFavoritesPage() {
    const container = document.getElementById('fav-grid-container');
    const emptyMsg = document.getElementById('fav-empty-msg');
    container.innerHTML = '';

    if (favoriteWordIds.size === 0) {
        emptyMsg.style.display = 'block';
        return;
    }
    emptyMsg.style.display = 'none';

    for (let lvlId in levelsData) {
        levelsData[lvlId].forEach(word => {
            if (favoriteWordIds.has(word.id) && word.id !== 'l5_stub') {
                createFavCardDOM(container, word);
            }
        });
    }
    for (let deckId in customDecks) {
        customDecks[deckId].cards.forEach(word => {
            if (favoriteWordIds.has(word.id)) {
                createFavCardDOM(container, word);
            }
        });
    }
}

function createFavCardDOM(container, word) {
    const favCard = document.createElement('div');
    favCard.className = 'fav-word-card bg-white';
    let imgHtml = (word.img && word.img !== "") ? `<img src="${word.img}" alt="${word.en}">` : `<div style="height: 100px; background: #c5bcb7; border-radius: 8px; margin-bottom: 10px;"></div>`;

    favCard.innerHTML = `
                <button class="fav-card-remove" onclick="removeFavoriteDirectly('${word.id}')">
                    <img src="assets/img/nav/reviews.png" alt="Удалить">
                </button>
                ${imgHtml}
                <h3>${word.ru}</h3>
                <p>${word.en}</p>
            `;
    container.appendChild(favCard);
}

window.removeFavoriteDirectly = function(wordId) {
    favoriteWordIds.delete(wordId);
    saveFavoritesToLocalStorage();
    saveProgressToServer();
    renderFavoritesPage();
    applyCardContent();
};

function startLevel(levelId) {
    if (!String(levelId).startsWith('custom_') && (profileProgress[levelId].isLocked || parseInt(levelId) === 5)) return;

    const cards = getLevelCards(levelId);
    if(cards.length === 0) {
        showCustomAlert("В этой колоде пока нет карточек!");
        return;
    }

    activeLevelId = levelId;
    currentCardIndex = 0;
    knownWords.clear();
    isFlipped = false;

    if (window.currentUser) {
        window.currentUser.activeSession = {
            levelId: activeLevelId,
            cardIndex: currentCardIndex,
            knownWords: []
        };
        saveProgressToServer();
    }

    flashcard.className = "card";
    applyCardContent();
    updateStats();

    endScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    switchTab('flashcards');
}

document.getElementById('levels-container').addEventListener('click', (e) => {
    const card = e.target.closest('.setup-card');
    if (card) {
        const lvl = card.getAttribute('data-level');
        startLevel(lvl);
    }
});

document.getElementById('user-decks-container').addEventListener('click', (e) => {
    const editBtn = e.target.closest('.deck-edit-btn');
    if (editBtn) {
        e.stopPropagation();
        const idToEdit = editBtn.getAttribute('data-id');
        openModalForEditing(idToEdit);
        return;
    }

    const card = e.target.closest('.setup-card');
    if (card) {
        const lvl = card.getAttribute('data-level');
        startLevel(lvl);
    }
});

let isAnimating = false;
flashcard.addEventListener('click', () => {
    if (isAnimating) return;
    isAnimating = true;

    isFlipped = !isFlipped;
    flashcard.classList.toggle('flipped', isFlipped);

    setTimeout(() => {
        isAnimating = false;
    }, 500);
});

function nextCardWithAnimation(isWordKnown) {
    if (isAnimating) return;
    isAnimating = true;

    if (isWordKnown) {
        flashcard.classList.add('swipe-right');
        knownWords.add(currentCardIndex);
    } else {
        flashcard.classList.add('swipe-left');
    }

    updateStats();

    setTimeout(() => {
        
        
        currentCardIndex++;
        const cardsLength = getLevelCards(activeLevelId).length;

        
        
        localStorage.setItem('fc_activeSessionCardIdx', currentCardIndex);
        
        if (currentCardIndex >= cardsLength) {
            showEndScreen();
            isAnimating = false;
            return;
        }

        if (window.currentUser && window.currentUser.activeSession) {
            window.currentUser.activeSession.cardIndex = currentCardIndex;
            window.currentUser.activeSession.knownWords = Array.from(knownWords);
            saveProgressToServer();
        }

        isFlipped = false;
        flashcard.className = "card reset-position";
        applyCardContent();

        setTimeout(() => {
            flashcard.classList.remove('reset-position');
            isAnimating = false;
        }, 50);

    }, 450);
}

function showEndScreen() {
    gameScreen.style.display = 'none';
    endScreen.style.display = 'flex';

    const knownCount = knownWords.size;
    const totalCount = getLevelCards(activeLevelId).length;
    const earnedStars = getStarsCount(knownCount, totalCount);

    endStarsRating.innerHTML = buildStarsHtml(earnedStars);
    endResultText.textContent = `Вы изучили ${knownCount} из ${totalCount} слов`;

    const prevStars = profileProgress[activeLevelId].highestStars || 0;

    if (!String(activeLevelId).startsWith('custom_')) {
        if (earnedStars > prevStars) {
            starsCurrency += (earnedStars - prevStars);
        }
    }

    profileProgress[activeLevelId].highestStars = Math.max(prevStars, earnedStars);
    profileProgress[activeLevelId].learnedWordsCount = Math.max(profileProgress[activeLevelId].learnedWordsCount || 0, knownCount);

    if (earnedStars >= 2) {
        profileProgress[activeLevelId].isCompleted = true;
    }

    if (window.currentUser) {
        window.currentUser.activeSession = { levelId: null, cardIndex: 0, knownWords: [] };
    }

    saveProgressToLocalStorage();
    saveProgressToServer();
    refreshGlobalStatistics();
}

btnDontKnow.addEventListener('click', () => nextCardWithAnimation(false));
btnKnow.addEventListener('click', () => nextCardWithAnimation(true));

btnRestart.addEventListener('click', () => startLevel(activeLevelId));
btnToMenu.addEventListener('click', () => switchTab('home'));

document.getElementById('btn-reset-progress').addEventListener('click', () => {
    showCustomConfirm('Вы уверены, что хотите полностью обнулить игровой прогресс и удалить кастомные колоды?', () => {
        localStorage.clear();
        totalSecondsSpent = 0;
        starsCurrency = 0;
        currentAvatarId = 'monkey';
        purchasedAvatarIds = ['monkey'];
        customDecks = {};

        profileProgress = {
            1: { highestStars: 0, learnedWordsCount: 0, isCompleted: false, isLocked: false },
            2: { highestStars: 0, learnedWordsCount: 0, isCompleted: false, isLocked: true },
            3: { highestStars: 0, learnedWordsCount: 0, isCompleted: false, isLocked: true },
            4: { highestStars: 0, learnedWordsCount: 0, isCompleted: false, isLocked: true },
            5: { highestStars: 0, learnedWordsCount: 0, isCompleted: false, isLocked: true }
        };
        favoriteWordIds.clear();

        activeLevelId = null;
        currentCardIndex = 0;
        knownWords.clear();

        // сброс текущего прогресса, чтобы не отправить старую инфу на сервер
        if (window.currentUser) {
            window.currentUser.activeSession = { levelId: null, cardIndex: 0, knownWords: [] };
        }

        localStorage.removeItem('fc_activeSessionLvlId');
        localStorage.removeItem('fc_activeSessionCardIdx');
        localStorage.removeItem('fc_activeSessionKnownWords');

        saveProgressToLocalStorage();
        saveProgressToServer();
        saveFavoritesToLocalStorage();
        refreshGlobalStatistics();
        switchTab('home');
        showCustomAlert('Прогресс успешно сброшен!');
    });
});

const deckModal = document.getElementById('create-deck');
const openModalBtn = document.getElementById('open-create-deck-btn');
const closeModalBtn = document.getElementById('close-create-deck-btn');
const addCardBtn = document.getElementById('add-card-to-list-btn');
const saveDeckBtn = document.getElementById('save-full-deck-btn');
const modalTitleText = document.getElementById('popup-title-text');

let tempCardsArray = [];
let tempImgBase64 = "";
let currentEditingDeckId = null;

function openDeckModal() {
    deckModal.style.display = 'flex';
    requestAnimationFrame(() => {
        deckModal.classList.add('active');
    });
}

function closeDeckModal() {
    deckModal.classList.remove('active');
    setTimeout(() => {
        deckModal.style.display = 'none';
    }, 400);
}

openModalBtn.addEventListener('click', () => {
    currentEditingDeckId = null;
    modalTitleText.textContent = "Новая колода";
    tempCardsArray = [];
    document.getElementById('input-deck-name').value = "";
    clearCardInputs();
    renderTempCardsPreview();
    openDeckModal();
});

function openModalForEditing(deckId) {
    currentEditingDeckId = deckId;
    const targetDeck = customDecks[deckId];
    if (!targetDeck) return;

    modalTitleText.textContent = "Редактирование колоды";
    document.getElementById('input-deck-name').value = targetDeck.title;
    tempCardsArray = JSON.parse(JSON.stringify(targetDeck.cards));

    clearCardInputs();
    renderTempCardsPreview();
    openDeckModal();
}

closeModalBtn.addEventListener('click', closeDeckModal);

function clearCardInputs() {
    document.getElementById('input-card-word').value = "";
    document.getElementById('input-card-trans').value = "";
    resetFileInputElement();
}

addCardBtn.addEventListener('click', () => {
    const wordValue = document.getElementById('input-card-word').value.trim();
    const transValue = document.getElementById('input-card-trans').value.trim();

    if (wordValue === "" || transValue === "") {
        showCustomAlert("Пожалуйста, заполните обязательные поля: Название и Перевод карточки.");
        return;
    }

    const newCard = {
        id: 'c_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        ru: wordValue.toUpperCase(),
        en: transValue.toUpperCase(),
        img: tempImgBase64
    };

    tempCardsArray.push(newCard);
    clearCardInputs();
    renderTempCardsPreview();
});

function renderTempCardsPreview() {
    const previewContainer = document.getElementById('cards-preview-container');
    previewContainer.innerHTML = "";
    if(tempCardsArray.length === 0) {
        previewContainer.innerHTML = `<span style="color: #1e1e1c; font-style: italic; font-size: 13px; opacity: 0.6;">Список пуст. Добавьте хотя бы одну карточку...</span>`;
        return;
    }
    tempCardsArray.forEach((c, idx) => {
        const div = document.createElement('div');
        div.className = "preview-item";
        div.innerHTML = `<span>${idx + 1}. <b>${c.ru}</b> — ${c.en}</span> <span style="color: #1e1e1c; font-weight: 900; cursor: pointer; text-decoration: underline;" onclick="removeTempCard(${idx})">Удалить</span>`;
        previewContainer.appendChild(div);
    });
}

window.removeTempCard = function(index) {
    tempCardsArray.splice(index, 1);
    renderTempCardsPreview();
};

saveDeckBtn.addEventListener('click', () => {
    const deckName = document.getElementById('input-deck-name').value.trim();
    if (deckName === "") {
        showCustomAlert("Пожалуйста, укажите название колоды!");
        return;
    }
    if (tempCardsArray.length === 0) {
        showCustomAlert("Нельзя сохранить пустую колоду! Добавьте в неё хотя бы одну карточку.");
        return;
    }

    if (currentEditingDeckId === null) {
        const uniqueDeckId = "custom_" + Date.now();
        customDecks[uniqueDeckId] = {
            title: deckName,
            cards: tempCardsArray
        };
        profileProgress[uniqueDeckId] = {
            highestStars: 0,
            learnedWordsCount: 0,
            isCompleted: false,
            isLocked: false
        };
        showCustomAlert(`Колода "${deckName}" успешно создана!`);
    } else {
        customDecks[currentEditingDeckId].title = deckName;
        customDecks[currentEditingDeckId].cards = tempCardsArray;

        if (profileProgress[currentEditingDeckId].learnedWordsCount > tempCardsArray.length) {
            profileProgress[currentEditingDeckId].learnedWordsCount = 0;
            profileProgress[currentEditingDeckId].highestStars = 0;
            profileProgress[currentEditingDeckId].isCompleted = false;
        }
        showCustomAlert(`Колода "${deckName}" успешно обновлена!`);
    }

    saveProgressToLocalStorage();
    saveProgressToServer();
    refreshGlobalStatistics();
    closeDeckModal();
});

document.querySelectorAll('.lang-select').forEach(wrapper => {
    const trigger = wrapper.querySelector('.lang-select-trigger');
    const options = wrapper.querySelectorAll('.custom-option');

    if (!trigger || !options.length) return;

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        wrapper.classList.toggle('open');
    });

    options.forEach(option => {
        option.addEventListener('click', function() {
            options.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');

            trigger.querySelector('span').textContent = this.textContent;
            wrapper.classList.remove('open');

            const selectedValue = this.getAttribute('data-value');
            isReverseTranslation = (selectedValue === 'en-ru');

            const triggerSpan = document.querySelector('.lang-select-trigger span');
            triggerSpan.textContent = isReverseTranslation ? 'Английский' : 'Русский';

            if (typeof applyCardContent === 'function') {
                applyCardContent();
            }

            // сохранение настроек
            if (window.currentUser) {
                window.currentUser.translationDirection = selectedValue;
                saveProgressToServer();
            }

        });
    });
});

window.addEventListener('click', () => {
    document.querySelectorAll('.lang-select').forEach(wrapper => {
        wrapper.classList.remove('open');
    });
});
const tutorialSlides = [
    {"title": "Выбор уровня", "caption": "Здесь можно выбрать тему для изучения. Уровни открываются после прохождения предыдущих. Также можно создать свою колоду карточек."}, 
    {"title": "Флеш-карточки", "caption": "Нажимайте «Знаю» или «Не знаю» для каждой карточки. Нажми на саму карточку, чтобы перевернуть её и увидеть перевод. Звёздочка сверху справа добавляет слово в избранное."}, 
    {"title": "Избранные слова", "caption": "Сюда попадают все слова, отмеченные звёздочкой во время игры"}, 
    {"title": "Статистика", "caption": "Здесь отображается прогресс профиля: время в игре, заработанные звёзды, выученные слова и пройденные темы."}, 
    {"title": "Магазин аватаров", "caption": "Зарабатывайте звёзды за прохождение уровней и тратьте их на покупку новых аватарок для своего профиля"}, 
    {"title": "Настройки", "caption": "Можно изменить направление перевода - показывать карточки с русского или с английского. Удачи!"}
];

const tutorialImages = [
    'assets/img/tutorial/slide1.png',
    'assets/img/tutorial/slide2.png',
    'assets/img/tutorial/slide3.png',
    'assets/img/tutorial/slide4.png',
    'assets/img/tutorial/slide5.png',
    'assets/img/tutorial/slide6.png'
];

let tutCurrentStep = 0;

function buildTutDots() {
    const dotsEl = document.getElementById('tut-dots');
    dotsEl.innerHTML = '';
    tutorialSlides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.style.cssText = `width:10px;height:10px;border-radius:50%;background:${i === tutCurrentStep ? '#1e1e1c' : '#c5bcb7'}; transition: background 0.25s; cursor: pointer;`;
        dot.addEventListener('click', () => { tutCurrentStep = i; showTutStep(); });
        dotsEl.appendChild(dot);
    });
}

function showTutStep() {
    const s = tutorialSlides[tutCurrentStep];
    document.getElementById('tut-title').textContent = s.title;
    document.getElementById('tut-caption').textContent = s.caption;
    document.getElementById('tut-img').src = tutorialImages[tutCurrentStep];
    document.getElementById('tut-next').textContent =
        tutCurrentStep === tutorialSlides.length - 1 ? 'Завершить ✓' : 'Далее →';
    document.getElementById('tut-prev').style.opacity = tutCurrentStep === 0 ? '0.3' : '1';
    buildTutDots();
}

function startTutorial() {
    tutCurrentStep = 0;
    const modal = document.getElementById('tutorial-popup');
    modal.style.display = 'flex';
    showTutStep();
}

function endTutorial() {
    document.getElementById('tutorial-popup').style.display = 'none';
    switchTab('home');
    if (window.currentUser) {
        window.currentUser.hasSeenTutorial = true;
        fetch('http://localhost:5001/user', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(window.currentUser)
        }).catch(err => console.error("err", err));
    }
}

document.getElementById('tut-next').addEventListener('click', () => {
    if (tutCurrentStep < tutorialSlides.length - 1) {
        tutCurrentStep++;
        showTutStep();
    } else {
        endTutorial();
    }
});

document.getElementById('tut-prev').addEventListener('click', () => {
    if (tutCurrentStep > 0) {
        tutCurrentStep--;
        showTutStep();
    }
});

document.getElementById('tut-skip').addEventListener('click', endTutorial);

let isLoginMode = true;
const authModal = document.getElementById('auth-modal');
const authTitle = document.getElementById('auth-title');
const authActionBtn = document.getElementById('btn-auth-action');
const authSwitchBtn = document.getElementById('btn-auth-switch');
const authErrorMsg = document.getElementById('auth-error-msg');

authSwitchBtn.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    authErrorMsg.style.display = 'none';
    if (isLoginMode) {
        authTitle.textContent = "Вход в аккаунт";
        authActionBtn.textContent = "ВОЙТИ";
        authSwitchBtn.textContent = "Нет аккаунта? Зарегистрироваться";
    } else {
        authTitle.textContent = "Регистрация";
        authActionBtn.textContent = "СОЗДАТЬ АККАУНТ";
        authSwitchBtn.textContent = "Уже есть аккаунт? Войти";
    }
});

//отправка формы
authActionBtn.addEventListener('click', () => {
    const login = document.getElementById('auth-login').value.trim();
    const password = document.getElementById('auth-password').value.trim();

    if (!login || !password) {
        showAuthError("Пожалуйста, заполните все поля.");
        return;
    }

    const endpoint = isLoginMode ? '/login' : '/register';
    const bodyData = isLoginMode ? { login, password } : { login, password, username: login };
    //тут POST отправляем
    fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
    })
        .then(async (res) => {
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Неверные данные");
            }
            return res.json();
        })
        .then(userData => {
            localStorage.setItem('fc_savedLogin', userData.login);
            startApplication(userData);
        })
        .catch(err => {
            showAuthError(err.message);
        });
});

function updateTranslationDirectionUI() {
    const triggerSpan = document.querySelector('.lang-select-trigger span');
    const options = document.querySelectorAll('.custom-option');
    const selectedValue = isReverseTranslation ? 'en-ru' : 'ru-en';

    //меняем текст в самом триггере
    triggerSpan.textContent = isReverseTranslation ? 'Английский' : 'Русский';

    options.forEach(opt => {
        opt.classList.toggle('selected', opt.getAttribute('data-value') === selectedValue);
    });
}

function showAuthError(msg) {
    authErrorMsg.textContent = msg;
    authErrorMsg.style.display = 'block';
}
function startApplication(userData) {
    window.currentUser = userData;

    if (!window.currentUser.activeSession) {
        window.currentUser.activeSession = {
            levelId: null,
            cardIndex: 0,
            knownWords: []
        };
    }

    // вытаскиваем уровень, на котором остановились, из JSON
    if (userData.activeSession && userData.activeSession.levelId) {
        activeLevelId = userData.activeSession.levelId;
        currentCardIndex = userData.activeSession.cardIndex || 0;
        knownWords.clear();
        if (userData.activeSession.knownWords) {
            userData.activeSession.knownWords.forEach(idx => knownWords.add(idx));
        }
    } else {
        activeLevelId = null;
        currentCardIndex = 0;
        knownWords.clear();
    }

    authModal.style.display = 'none';

    const appContent = document.getElementById('app-content');
    if (appContent) {
        requestAnimationFrame(() => {
            appContent.classList.add('active');
        });
    }
    
    //направление языка
    const direction = userData.translationDirection || 'ru-en';
    isReverseTranslation = (direction === 'en-ru');
    updateTranslationDirectionUI();
    //выставляем либо уже существующие значения либо изначальные
    starsCurrency = userData.starsCurrency || 0;
    currentAvatarId = userData.currentAvatarId || 'monkey';
    purchasedAvatarIds = userData.purchasedAvatarIds || ['monkey'];
    profileProgress = userData.profileProgress || {};

    favoriteWordIds.clear();
    if (userData.favoriteWordIds) {
        userData.favoriteWordIds.forEach(id => favoriteWordIds.add(id));
    }

    customDecks = userData.customDecks || {};
    totalSecondsSpent = userData.totalSecondsSpent || 0;

    //обновление данных пользователя
    refreshGlobalStatistics();
    refreshActiveSessionWidget();

    switchTab('home');

    if (userData.hasSeenTutorial === false) {
        startTutorial();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    switchTab('home');

    //провера уже зарегистрированного юхера
    const savedLogin = localStorage.getItem('fc_savedLogin');
    if (savedLogin) {
        fetch(`http://localhost:5001/user/${savedLogin}`)
            .then(res => {
                if (!res.ok) throw new Error("Сессия истекла");
                return res.json();
            })
            .then(userData => {
                startApplication(userData);
            })
            .catch(() => {
                authModal.style.display = 'flex';
            });
    } else {
        authModal.style.display = 'flex';
    }
});

function saveProgressToServer() {
    if (!window.currentUser) return;

    window.currentUser.starsCurrency = starsCurrency;
    window.currentUser.currentAvatarId = currentAvatarId;
    window.currentUser.purchasedAvatarIds = purchasedAvatarIds;
    window.currentUser.profileProgress = profileProgress;
    window.currentUser.favoriteWordIds = Array.from(favoriteWordIds);
    window.currentUser.customDecks = customDecks;
    window.currentUser.totalSecondsSpent = totalSecondsSpent;

    //"готовим" текущую прогресс для бэка
    window.currentUser.activeSession = {
        levelId: activeLevelId,
        cardIndex: currentCardIndex,
        knownWords: Array.from(knownWords)
    };

    //посылаем PUT запрос на сервер
    fetch('http://localhost:5001/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(window.currentUser)
    })
        .then(res => {
            if (!res.ok) throw new Error("Не удалось сохранить прогресс");
            console.log("Ggg");
        })
        .catch(err => console.error("err", err));
}

document.getElementById('btn-logout').addEventListener('click', () => {
    showCustomConfirm('Вы уверены, что хотите выйти из аккаунта?', () => {
        localStorage.removeItem('fc_activeSessionLvlId');
        localStorage.removeItem('fc_activeSessionCardIdx');
        localStorage.removeItem('fc_activeSessionKnownWords');
        localStorage.removeItem('fc_savedLogin');

        if (window.currentUser) {
            window.currentUser.activeSession = null;
        }

        // перезагружаем страницу, чтобы сбросить память
        location.reload();
    });
});
