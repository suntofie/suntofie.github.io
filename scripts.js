let bookmarksData = JSON.parse(localStorage.getItem('bookmarksData')) || defaultBookmarks;

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
    if (themeSelect) {
        themeSelect.value = themeName;
    }
}

// Function to apply search engine
function applySearchEngine(engineKey) {
    currentSearchEngine = engineKey;
    localStorage.setItem('currentSearchEngine', engineKey);
    
    const searchEngineSelect = document.getElementById('search-engine-select');
    if (searchEngineSelect) {
        searchEngineSelect.value = engineKey;
    }
}

// Function to apply language
function applyLanguage(langCode) {
    currentLanguage = langCode;
    localStorage.setItem('currentLanguage', langCode);
    
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.value = langCode;
    }
    
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
    
    // Update prompt prefix
    const promptPrefix = document.getElementById('prompt-prefix');
    if (promptPrefix) promptPrefix.textContent = t.promptPrefix;
    
    // Update datetime title
    const datetimeTitle = document.querySelector('.datetime-title');
    if (datetimeTitle) {
        datetimeTitle.textContent = t.datetimeTitle;
    }
    
    // Update search hint
    const searchHint = document.getElementById('search-hint');
    if (searchHint) {
        searchHint.textContent = t.searchHint;
    }
    
    // Update modal content if open
    if (settingsModal && settingsModal.classList.contains('show')) {
        renderModalContent();
    }
}

// Function to create datetime category
function createDateTimeCategory() {
    const bookmarksContainer = document.getElementById('bookmarks-container');
    if (!bookmarksContainer) return null;

    // Удаляем старую datetime категорию если есть
    const oldDateTime = document.getElementById('datetime-category');
    if (oldDateTime) {
        oldDateTime.remove();
    }

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

    // Вставляем в начало контейнера
    bookmarksContainer.insertBefore(datetimeDiv, bookmarksContainer.firstChild);

    return datetimeDiv;
}

// Function to update the clock and date with locale support
function updateDateTime() {
    const now = new Date();

    // Format time for 12-hour clock with AM/PM (for English) or 24-hour for others
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

    // Format date based on language
    const dateOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    };

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
    
    // Сохраняем datetime категорию если она есть
    const datetimeCategory = document.getElementById('datetime-category');
    
    bookmarksContainer.innerHTML = '';

    // Восстанавливаем datetime категорию
    if (datetimeCategory) {
        bookmarksContainer.appendChild(datetimeCategory);
    } else {
        createDateTimeCategory();
    }

    // Адаптивное количество колонок
    const width = window.innerWidth;
    let columns = 1;
    
    if (width >= 1024) columns = 4;
    else if (width >= 768) columns = 3;
    else if (width >= 480) columns = 2;
    else columns = 1;
    
    bookmarksContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

    bookmarksData.forEach(categoryData => {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('category');

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
            if (link.starred) {
                a.classList.add('starred-link');
            }
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

        // Показываем кнопку переключения только если ссылок больше, чем на одной странице
        if (categoryData.allOriginalLinks.length > linksPerPage) {
            const toggleButton = document.createElement('button');
            toggleButton.classList.add('toggle-links-button');
            toggleButton.textContent = '›';
            toggleButton.title = 'Show more links';
            
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
                    const currentLi = categoryData.allOriginalLinks[i];
                    const currentLinkData = categoryData.links[i];
                    const aElement = currentLi.querySelector('a');
                    
                    if (aElement) {
                        if (currentLinkData.starred) {
                            aElement.classList.add('starred-link');
                        } else {
                            aElement.classList.remove('starred-link');
                        }
                    }
                    linksDiv.appendChild(currentLi);
                }
            });

            categoryDiv.appendChild(toggleButton);
        }

        bookmarksContainer.appendChild(categoryDiv);
    });
}

// Settings Modal Logic
let settingsButton, settingsModal, closeButton, modalCategoriesContainer, addCategoryButton, saveSettingsButton;

// Render content inside the modal
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
        categoryTitleInput.addEventListener('change', (e) => {
            category.title = e.target.value;
        });
        categoryHeader.appendChild(categoryTitleInput);

        const deleteCategoryButton = document.createElement('button');
        deleteCategoryButton.classList.add('delete-button');
        deleteCategoryButton.textContent = t.deleteCategory;
        deleteCategoryButton.addEventListener('click', () => {
            const confirmDelete = document.createElement('div');
            confirmDelete.classList.add('custom-confirm');
            confirmDelete.innerHTML = `
                <p>${t.confirmDelete}</p>
                <button id="confirm-yes">${t.confirmYes}</button>
                <button id="confirm-no">${t.confirmNo}</button>
            `;
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
            starButton.title = link.starred ? t.unstarLink : t.starLink;
            if (link.starred) {
                starButton.classList.add('is-starred');
            }
            starButton.addEventListener('click', () => {
                link.starred = !link.starred;
                renderModalContent();
            });
            linkItem.appendChild(starButton);

            const linkTextInput = document.createElement('input');
            linkTextInput.type = 'text';
            linkTextInput.value = link.text;
            linkTextInput.placeholder = t.linkText;
            linkTextInput.addEventListener('change', (e) => {
                link.text = e.target.value;
            });
            linkItem.appendChild(linkTextInput);

            const linkUrlInput = document.createElement('input');
            linkUrlInput.type = 'url';
            linkUrlInput.value = link.url;
            linkUrlInput.placeholder = t.linkUrl;
            linkUrlInput.addEventListener('change', (e) => {
                link.url = e.target.value;
            });
            linkItem.appendChild(linkUrlInput);

            const deleteLinkButton = document.createElement('button');
            deleteLinkButton.classList.add('delete-button');
            deleteLinkButton.textContent = t.deleteLink;
            deleteLinkButton.addEventListener('click', () => {
                category.links.splice(linkIndex, 1);
                renderModalContent();
            });
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
    // 1. Если в строке есть пробелы — это точно поисковый запрос
    if (string.includes(' ')) return false;

    try {
        // 2. Пробуем прочитать как полный URL (например, пользователь вставил https://ya.ru)
        const url = new URL(string);
        return ['http:', 'https:'].includes(url.protocol);
    } catch (_) {
        // 3. Если протокола нет, проверяем "похожесть" на домен
        // Считаем ссылкой, ТОЛЬКО если есть точка (google.com) или это localhost
        if (string.includes('.') || string === 'localhost') {
            try {
                new URL('https://' + string);
                return true;
            } catch (_) {
                return false;
            }
        }
        // 4. Одно слово без точек (например "погода") — это поиск
        return false;
    }
}
// Function to handle window resize
function handleResize() {
    renderBookmarks();
    updateDateTime();
    
    // Адаптируем размер шрифта для datetime
    const datetimeContent = document.getElementById('current-datetime');
    if (datetimeContent) {
        const width = window.innerWidth;
        if (width < 480) {
            datetimeContent.style.fontSize = '1.1em';
        } else if (width < 768) {
            datetimeContent.style.fontSize = '1.2em';
        } else {
            datetimeContent.style.fontSize = '1.4em';
        }
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    settingsButton = document.getElementById('settings-button');
    settingsModal = document.getElementById('settings-modal');
    closeButton = settingsModal?.querySelector('.close-button');
    modalCategoriesContainer = document.getElementById('modal-categories');
    addCategoryButton = document.getElementById('add-category-button');
    saveSettingsButton = document.getElementById('save-settings-button');
    searchTextElement = document.getElementById('search-text');
    blinkerElement = document.getElementById('blinker');

    // Apply initial settings
    applyLanguage(currentLanguage);
    applyTheme(currentTheme);
    applySearchEngine(currentSearchEngine);
    
    // Создаем datetime категорию перед рендером закладок
    createDateTimeCategory();
    renderBookmarks();
    updateDateTime();
    
    // Start clock
    setInterval(updateDateTime, 1000);

    // Initialize selectors
    const languageSelect = document.getElementById('language-select');
    const themeSelect = document.getElementById('theme-select');
    const searchEngineSelect = document.getElementById('search-engine-select');
    
    if (languageSelect) {
        languageSelect.value = currentLanguage;
        languageSelect.addEventListener('change', (e) => {
            applyLanguage(e.target.value);
        });
    }
    
    if (themeSelect) {
        themeSelect.value = currentTheme;
        themeSelect.addEventListener('change', (e) => {
            applyTheme(e.target.value);
        });
    }

    if (searchEngineSelect) {
        searchEngineSelect.value = currentSearchEngine;
        searchEngineSelect.addEventListener('change', (e) => {
            applySearchEngine(e.target.value);
        });
    }

    // Settings modal event listeners
    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            settingsModal.classList.add('show');
            renderModalContent();
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            settingsModal.classList.remove('show');
        });
    }

    if (settingsModal) {
        settingsModal.addEventListener('click', (event) => {
            if (event.target === settingsModal) {
                settingsModal.classList.remove('show');
            }
        });
    }

    if (addCategoryButton) {
        addCategoryButton.addEventListener('click', () => {
            bookmarksData.push({ title: 'New Category', links: [{ text: '', url: '', starred: false }] });
            renderModalContent();
        });
    }

    if (saveSettingsButton) {
        saveSettingsButton.addEventListener('click', () => {
            localStorage.setItem('bookmarksData', JSON.stringify(bookmarksData));
            localStorage.setItem('currentLanguage', currentLanguage);
            localStorage.setItem('currentTheme', currentTheme);
            localStorage.setItem('currentSearchEngine', currentSearchEngine);
            settingsModal.classList.remove('show');
            renderBookmarks();
        });
    }

    // Search functionality
    document.addEventListener('keydown', (event) => {
        if (!settingsModal || !settingsModal.classList.contains('show')) {
            if (event.key === 'Backspace' || event.key === 'Enter' || event.key.length === 1) {
                event.preventDefault();
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
            } else if (event.key.length === 1) {
                searchQuery += event.key;
            }
            if (searchTextElement) {
                searchTextElement.textContent = searchQuery;
            }
        }
    });

// Переменная для хранения таймера
let resizeTimeout;

// Handle window resize with Debounce
window.addEventListener('resize', () => {
    // Сбрасываем предыдущий таймер, если он был
    clearTimeout(resizeTimeout);
    
    // Устанавливаем новый таймер. Функция выполнится только тогда,
    // когда пользователь перестанет менять размер окна на 200мс.
    resizeTimeout = setTimeout(() => {
        handleResize();
    }, 200);
});

// Событие 'orientationchange' устарело. 
// В 99% случаев 'resize' срабатывает и при повороте экрана, 
// поэтому отдельный слушатель можно просто удалить.

    // Проверяем поддержку touch events для мобильных устройств
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
        
        // Оптимизация для touch устройств
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            link.style.minHeight = '44px';
            link.style.display = 'flex';
            link.style.alignItems = 'center';
        });
    }
});

// Добавляем поддержку PWA (Progressive Web App) features
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
            console.log('SW registered: ', registration);
        }).catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}

// Добавляем поддержку установки как PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Optionally, send analytics event that PWA install promo was shown.
    console.log('PWA install prompt available');
});

// Функция для показа промта установки
function showInstallPrompt() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
        });
    }
}