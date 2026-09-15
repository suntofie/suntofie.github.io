let showHiddenCategories = false; // По умолчанию скрытые папки не видны
// Initial bookmark data load logic is now inside loadBookmarks()
let bookmarksData = [];
let currentUser = localStorage.getItem('currentUser') || null;

// --- AUTHORIZATION LOGIC ---
async function loadBookmarks() {
    // If user is not logged in, try local storage, then default
    if (!currentUser) {
        const local = localStorage.getItem('bookmarksData');
        return local ? JSON.parse(local) : defaultBookmarks;
    }

    // 2. Если Пользователь — грузим с сервера
    try {
        const response = await fetch('/api/bookmarks', {
            headers: { 'Authorization': currentUser }
        });
        
        if (!response.ok) {
            console.warn('Сервер вернул ошибку, берем дефолт');
            return defaultBookmarks; 
        }
        
        const data = await response.json();
        
        if (!data) return defaultBookmarks;

        // --- НОВАЯ ЛОГИКА: Проверяем, есть ли настройки внутри данных ---
        if (data.settings) {
            // Если есть настройки — применяем их сразу!
            if (data.settings.theme) applyTheme(data.settings.theme);
            if (data.settings.lang) applyLanguage(data.settings.lang);
            if (data.settings.search) applySearchEngine(data.settings.search);
        }

        // Возвращаем только закладки (если структура новая) или данные целиком (если старая)
        return data.bookmarks || data; 

    } catch (e) {
        console.error('Ошибка загрузки:', e);
        return defaultBookmarks;
    }
}

// Адаптивное количество ссылок на страницу
function getLinksPerPage() {
    const width = window.innerWidth;
    if (width < 480) return 3;
    if (width < 768) return 4;
    if (width < 1024) return 5;
    return 6;
}

// Theme functionality
let currentTheme = localStorage.getItem('currentTheme') || 'gruvbox-dark';
// Language functionality
let currentLanguage = localStorage.getItem('currentLanguage') || 'en';
// Search engine functionality
let currentSearchEngine = localStorage.getItem('currentSearchEngine') || 'duckduckgo';

// Function to apply theme
function applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    currentTheme = themeName;
    localStorage.setItem('currentTheme', themeName);
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) themeSelect.value = themeName;
}

// Function to apply search engine
function applySearchEngine(engineKey) {
    currentSearchEngine = engineKey;
    localStorage.setItem('currentSearchEngine', engineKey);
    const searchEngineSelect = document.getElementById('search-engine-select');
    if (searchEngineSelect) searchEngineSelect.value = engineKey;
}

// Function to apply language
function applyLanguage(langCode) {
    currentLanguage = langCode;
    localStorage.setItem('currentLanguage', langCode);
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) languageSelect.value = langCode;
    updateTextContent();
}

// Function to update all text content based on current language
function updateTextContent() {
    const t = translations[currentLanguage];
    // Update modal texts
    const h2 = document.querySelector('h2');
    const langTitle = document.querySelector('.language-selector-section h3');
    const themeTitle = document.querySelector('.theme-selector-section h3');
    const searchEngineTitle = document.querySelector('.search-engine-selector-section h3');
    const addCatBtn = document.getElementById('add-category-button');
    const saveBtn = document.getElementById('save-settings-button');
    
    if (h2) h2.textContent = t.editBookmarks;
    if (langTitle) langTitle.textContent = t.selectLanguage;
    if (themeTitle) themeTitle.textContent = t.selectTheme;
    if (searchEngineTitle) searchEngineTitle.textContent = t.selectSearchEngine;
    if (addCatBtn) addCatBtn.textContent = t.addCategory;
    if (saveBtn) saveBtn.textContent = t.saveChanges;

    const promptPrefix = document.getElementById('prompt-prefix');
    if (promptPrefix) promptPrefix.textContent = t.promptPrefix;

    const datetimeTitle = document.querySelector('.datetime-title');
    if (datetimeTitle) datetimeTitle.textContent = t.datetimeTitle;

    const searchHint = document.getElementById('search-hint');
    if (searchHint) searchHint.textContent = t.searchHint;

    if (settingsModal && settingsModal.classList.contains('show')) {
        renderModalContent();
    }
}

// Function to create datetime category
function createDateTimeCategory() {
    const bookmarksContainer = document.getElementById('bookmarks-container');
    if (!bookmarksContainer) return null;

    const oldDateTime = document.getElementById('datetime-category');
    if (oldDateTime) oldDateTime.remove();

    const datetimeDiv = document.createElement('div');
    datetimeDiv.id = 'datetime-category';
    datetimeDiv.classList.add('category', 'datetime-category');

    const titleDiv = document.createElement('div');
    titleDiv.classList.add('datetime-title');
    titleDiv.textContent = translations[currentLanguage].datetimeTitle;

    const contentDiv = document.createElement('div');
    contentDiv.id = 'current-datetime';
    contentDiv.classList.add('datetime-content');

    datetimeDiv.appendChild(titleDiv);
    datetimeDiv.appendChild(contentDiv);

    bookmarksContainer.insertBefore(datetimeDiv, bookmarksContainer.firstChild);
    return datetimeDiv;
}

// Function to update the clock
function updateDateTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    let timeString;

    if (currentLanguage === 'en') {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        timeString = `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
    } else {
        timeString = `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`;
    }

    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    let dateString;
    try {
        dateString = now.toLocaleDateString(currentLanguage, dateOptions);
    } catch (e) {
        dateString = now.toLocaleDateString('en-US', dateOptions);
    }

    const datetimeElement = document.getElementById('current-datetime');
    if (datetimeElement) {
        datetimeElement.innerHTML = `${dateString}<br>${timeString}`;
    }
}

// Function to render bookmarks
function renderBookmarks() {
    const bookmarksContainer = document.getElementById('bookmarks-container');
    if (!bookmarksContainer) return;

    const datetimeCategory = document.getElementById('datetime-category');
    bookmarksContainer.innerHTML = '';
    if (datetimeCategory) {
        bookmarksContainer.appendChild(datetimeCategory);
    } else {
        createDateTimeCategory();
    }

    const width = window.innerWidth;
    let columns = 1;
    if (width >= 1024) columns = 4;
    else if (width >= 768) columns = 3;
    else if (width >= 480) columns = 2;
    else columns = 1;
    bookmarksContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

    if (!bookmarksData) return; // Safety check

      bookmarksData.forEach(categoryData => {
        // 1. Пропускаем, если скрыта
        if (categoryData.hidden && !showHiddenCategories) {
            return;
        }

        // 2. Создаем элемент ОДИН раз
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('category');

        // 3. Если скрытая папка показана — добавляем рамку
        if (categoryData.hidden) {
            categoryDiv.style.border = '1px dashed #ff5555'; // Яркая рамка
            categoryDiv.title = 'Эта папка скрыта';
        }
        const linksDiv = document.createElement('div');
        linksDiv.classList.add('links');
        const titleLi = document.createElement('li');
        titleLi.classList.add('title');
        titleLi.textContent = categoryData.title;
        linksDiv.appendChild(titleLi);

        categoryData.allOriginalLinks = categoryData.links.map(link => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = link.url;
            a.textContent = link.text;
            a.target = "_self";
            if (link.starred) a.classList.add('starred-link');
            li.appendChild(a);
            return li;
        });

        categoryData.currentPage = 0;
        const linksPerPage = getLinksPerPage();
        const startIndex = categoryData.currentPage * linksPerPage;
        const endIndex = startIndex + linksPerPage;

        for (let i = startIndex; i < endIndex && i < categoryData.allOriginalLinks.length; i++) {
            linksDiv.appendChild(categoryData.allOriginalLinks[i]);
        }
        categoryDiv.appendChild(linksDiv);

        if (categoryData.allOriginalLinks.length > linksPerPage) {
            const toggleButton = document.createElement('button');
            toggleButton.classList.add('toggle-links-button');
            toggleButton.textContent = '›';
            toggleButton.addEventListener('click', () => {
                const linksPerPage = getLinksPerPage();
                categoryData.currentPage++;
                if (categoryData.currentPage * linksPerPage >= categoryData.allOriginalLinks.length) {
                    categoryData.currentPage = 0;
                }
                linksDiv.innerHTML = '';
                linksDiv.appendChild(titleLi);
                const newStartIndex = categoryData.currentPage * linksPerPage;
                const newEndIndex = newStartIndex + linksPerPage;
                for (let i = newStartIndex; i < newEndIndex && i < categoryData.allOriginalLinks.length; i++) {
                    linksDiv.appendChild(categoryData.allOriginalLinks[i]);
                }
            });
            categoryDiv.appendChild(toggleButton);
        }
        bookmarksContainer.appendChild(categoryDiv);
    });
}

// Settings Modal Logic
let settingsButton, settingsModal, closeButton, modalCategoriesContainer, addCategoryButton, saveSettingsButton;

function renderModalContent() {
    if (!modalCategoriesContainer) return;
    modalCategoriesContainer.innerHTML = '';
    const t = translations[currentLanguage];

    bookmarksData.forEach((category, categoryIndex) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('modal-category-item');
        categoryDiv.dataset.categoryIndex = categoryIndex;

        const categoryHeader = document.createElement('div');
        categoryHeader.classList.add('modal-category-header');
        
        const categoryTitleInput = document.createElement('input');
        categoryTitleInput.type = 'text';
        categoryTitleInput.value = category.title;
        categoryTitleInput.classList.add('category-title-input');
        categoryTitleInput.addEventListener('change', (e) => { category.title = e.target.value; });
        categoryHeader.appendChild(categoryTitleInput);
// --- ВСТАВИТЬ КНОПКУ СКРЫТИЯ ЗДЕСЬ (ТОЛЬКО ОДИН РАЗ) ---
        const hiddenToggle = document.createElement('button');
        hiddenToggle.textContent = category.hidden ? '🔓' : '🔒'; // Или иконки
        hiddenToggle.classList.add('hidden-toggle-btn');
        if (category.hidden) hiddenToggle.classList.add('is-hidden');
        
        hiddenToggle.addEventListener('click', () => {
            category.hidden = !category.hidden;
            renderModalContent();
        });
        categoryHeader.appendChild(hiddenToggle);
        // -------------------------------------------------------
        const deleteCategoryButton = document.createElement('button');
        deleteCategoryButton.classList.add('delete-button');
        deleteCategoryButton.textContent = t.deleteCategory;
        deleteCategoryButton.addEventListener('click', () => {
             const confirmDelete = document.createElement('div');
             confirmDelete.classList.add('custom-confirm');
             confirmDelete.innerHTML = `<p>${category.title} - ${t.confirmDelete}</p><button id="confirm-yes">${t.yes}</button><button id="confirm-no">${t.no}</button>`;
             document.body.appendChild(confirmDelete);
             document.getElementById('confirm-yes').addEventListener('click', () => {
                 bookmarksData.splice(categoryIndex, 1);
                 renderModalContent();
                 document.body.removeChild(confirmDelete);
             });
             document.getElementById('confirm-no').addEventListener('click', () => {
                 document.body.removeChild(confirmDelete);
             });
        });
        categoryHeader.appendChild(deleteCategoryButton);
        categoryDiv.appendChild(categoryHeader);

        const linksList = document.createElement('div');
        linksList.classList.add('modal-links-list');

        category.links.forEach((link, linkIndex) => {
            const linkItem = document.createElement('div');
            linkItem.classList.add('modal-link-item');
            
            const starButton = document.createElement('button');
            starButton.classList.add('star-button');
            starButton.innerHTML = link.starred ? '★' : '☆';
            if (link.starred) starButton.classList.add('is-starred');
            starButton.addEventListener('click', () => { link.starred = !link.starred; renderModalContent(); });
            linkItem.appendChild(starButton);

            const linkTextInput = document.createElement('input');
            linkTextInput.type = 'text';
            linkTextInput.value = link.text;
            linkTextInput.placeholder = t.linkText;
            linkTextInput.addEventListener('change', (e) => { link.text = e.target.value; });
            linkItem.appendChild(linkTextInput);

            const linkUrlInput = document.createElement('input');
            linkUrlInput.type = 'url';
            linkUrlInput.value = link.url;
            linkUrlInput.placeholder = t.linkUrl;
            linkUrlInput.addEventListener('change', (e) => { link.url = e.target.value; });
            linkItem.appendChild(linkUrlInput);

            const deleteLinkButton = document.createElement('button');
            deleteLinkButton.classList.add('delete-button');
            deleteLinkButton.textContent = t.deleteLink;
            deleteLinkButton.addEventListener('click', () => { category.links.splice(linkIndex, 1); renderModalContent(); });
            linkItem.appendChild(deleteLinkButton);
            
            linksList.appendChild(linkItem);
        });

        const addLinkButton = document.createElement('button');
        addLinkButton.classList.add('add-link-button');
        addLinkButton.textContent = t.addLink;
        addLinkButton.addEventListener('click', () => {
            category.links.push({ text: '', url: '', starred: false });
            renderModalContent();
        });
        linksList.appendChild(addLinkButton);
        categoryDiv.appendChild(linksList);
        modalCategoriesContainer.appendChild(categoryDiv);
    });
}

// Search bar functionality
let searchTextElement, blinkerElement;
let searchQuery = '';

function isValidUrl(string) {
    if (string.includes(' ')) return false;
    try {
        const url = new URL(string);
        return ['http:', 'https:'].includes(url.protocol);
    } catch (_) {
        if (string.includes('.') || string === 'localhost') {
            try { new URL('https://' + string); return true; } catch (_) { return false; }
        }
        return false;
    }
}

// Function to handle window resize
function handleResize() {
    renderBookmarks();
    updateDateTime();
    // Font size logic moved to CSS
}

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 200);
});

if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        link.style.minHeight = '44px';
        link.style.display = 'flex';
        link.style.alignItems = 'center';
    });
}

// --- INITIALIZE EVERYTHING ---
document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Load Data FIRST
    bookmarksData = await loadBookmarks();

    // 2. Initialize DOM elements
    settingsButton = document.getElementById('settings-button');
    settingsModal = document.getElementById('settings-modal');
    closeButton = settingsModal?.querySelector('.close-button');
    modalCategoriesContainer = document.getElementById('modal-categories');
    addCategoryButton = document.getElementById('add-category-button');
    saveSettingsButton = document.getElementById('save-settings-button');
    searchTextElement = document.getElementById('search-text');
    blinkerElement = document.getElementById('blinker');

    const toggleHiddenBtn = document.getElementById('toggle-hidden-button');
if (toggleHiddenBtn) {
    toggleHiddenBtn.addEventListener('click', () => {
        showHiddenCategories = !showHiddenCategories; 
        
        // Просто переключаем класс "active"
        toggleHiddenBtn.classList.toggle('active', showHiddenCategories);
        
        // Меняем текст (иконку)
        toggleHiddenBtn.textContent = showHiddenCategories ? '🔓' : '🔒';
        
        renderBookmarks();
    });
}

    const languageSelect = document.getElementById('language-select');
    const themeSelect = document.getElementById('theme-select');
    const searchEngineSelect = document.getElementById('search-engine-select');

    // 3. Login Logic
    const loginBtn = document.getElementById('login-button');
    const loginModal = document.getElementById('login-modal');
    const loginClose = document.getElementById('login-close');
    const submitLogin = document.getElementById('submit-login');

    if (loginBtn) {
        if (currentUser) {
            loginBtn.textContent = 'Exit'; 
            loginBtn.title = 'Logout ' + currentUser;
        } else {
            loginBtn.textContent = 'Login';
            loginBtn.title = 'Login';
        }

        loginBtn.addEventListener('click', () => {
            if (currentUser) {
                localStorage.removeItem('currentUser');
                location.reload();
            } else {
                loginModal.classList.add('show');
            }
        });
    }
    if (loginClose) loginClose.addEventListener('click', () => loginModal.classList.remove('show'));
    if (submitLogin) {
        submitLogin.addEventListener('click', async () => {
            const username = document.getElementById('username-input').value;
            const password = document.getElementById('password-input').value;
            const status = document.getElementById('login-status');
            
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({username, password})
                });
                const data = await res.json();
                if (data.success) {
                    localStorage.setItem('currentUser', data.token);
                    status.style.color = 'green';
                    status.textContent = 'Success!';
                    setTimeout(() => location.reload(), 500);
                } else {
                    status.style.color = 'red';
                    status.textContent = data.message;
                }
            } catch(e) { 
                console.error(e);
                status.textContent = 'Network Error'; 
            }
        });
    }

    // 4. Apply Settings
    applyLanguage(currentLanguage);
    applyTheme(currentTheme);
    applySearchEngine(currentSearchEngine);

    createDateTimeCategory();
    renderBookmarks();
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // 5. Selectors Event Listeners
    if (languageSelect) {
        languageSelect.value = currentLanguage;
        languageSelect.addEventListener('change', (e) => applyLanguage(e.target.value));
    }
    if (themeSelect) {
        themeSelect.value = currentTheme;
        themeSelect.addEventListener('change', (e) => applyTheme(e.target.value));
    }
    if (searchEngineSelect) {
        searchEngineSelect.value = currentSearchEngine;
        searchEngineSelect.addEventListener('change', (e) => applySearchEngine(e.target.value));
    }

    // 6. Settings Modal Listeners
    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            settingsModal.classList.add('show');
            renderModalContent();
        });
    }
    if (closeButton) {
        closeButton.addEventListener('click', () => settingsModal.classList.remove('show'));
    }
    if (settingsModal) {
        settingsModal.addEventListener('click', (event) => {
            if (event.target === settingsModal) settingsModal.classList.remove('show');
        });
    }
    if (addCategoryButton) {
        addCategoryButton.addEventListener('click', () => {
            bookmarksData.push({ title: 'New Category', links: [{ text: '', url: '', starred: false }] });
            renderModalContent();
        });
    }
    
    // --- UPDATED SAVE LOGIC ---
    if (saveSettingsButton) {
        saveSettingsButton.addEventListener('click', async () => {
            // Сохраняем локально (на всякий случай, и для гостей)
            localStorage.setItem('currentLanguage', currentLanguage);
            localStorage.setItem('currentTheme', currentTheme);
            localStorage.setItem('currentSearchEngine', currentSearchEngine);
            
            if (currentUser) {
                // --- НОВАЯ ЛОГИКА: Собираем полный профиль ---
                const userProfile = {
                    settings: {
                        theme: currentTheme,
                        lang: currentLanguage,
                        search: currentSearchEngine
                    },
                    bookmarks: bookmarksData
                };

                try {
                    const res = await fetch('/api/bookmarks', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': currentUser
                        },
                        body: JSON.stringify(userProfile) // Отправляем профиль, а не просто закладки
                    });
                    
                    if (res.ok) {
                        // Опционально: можно показать уведомление
                        // alert('Все настройки сохранены в облаке!'); 
                    } else {
                        alert('Ошибка сохранения на сервере!');
                    }
                } catch (e) {
                    alert('Ошибка сети!');
                }
            } else {
                // Для гостей сохраняем закладки локально
                localStorage.setItem('bookmarksData', JSON.stringify(bookmarksData));
            }
            
            settingsModal.classList.remove('show');
            renderBookmarks();
        });
    }

    // 7. Search Listener
    document.addEventListener('keydown', (event) => {
        if (!settingsModal || !settingsModal.classList.contains('show')) {
            if (event.key === 'Backspace' || event.key === 'Enter' || event.key.length === 1) {
                if (!event.metaKey && !event.ctrlKey && !event.altKey) {
                    // Prevent typing if special keys are pressed, but allow default shortcuts
                }
            }
            if (event.key === 'Backspace') {
                searchQuery = searchQuery.slice(0, -1);
            } else if (event.key === 'Enter') {
                const trimmedQuery = searchQuery.trim();
                if (trimmedQuery !== '') {
                    if (isValidUrl(trimmedQuery)) {
                        let urlToOpen = trimmedQuery;
                        if (!urlToOpen.startsWith('http://') && !urlToOpen.startsWith('https://')) {
                            urlToOpen = `https://${urlToOpen}`;
                        }
                        window.open(urlToOpen, '_self');
                    } else {
                        const searchUrl = searchEngines[currentSearchEngine].url + encodeURIComponent(trimmedQuery);
                        window.open(searchUrl, '_self');
                    }
                }
                searchQuery = '';
            } else if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
                searchQuery += event.key;
            }
            if (searchTextElement) {
                searchTextElement.textContent = searchQuery;
            }
        }
    });
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
}
