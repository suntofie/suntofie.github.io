// Language translations
const translations = {
    en: {
        promptPrefix: " > ",
        editBookmarks: "Edit Bookmarks",
        selectLanguage: "Select Language",
        selectTheme: "Select Theme",
        selectSearchEngine: "Select Search Engine",
        addCategory: "Add New Category",
        saveChanges: "Save Changes",
        deleteCategory: "Delete Category",
        deleteLink: "Delete Link",
        addLink: "Add Link",
        linkText: "Link Text",
        linkUrl: "Link URL",
        confirmDelete: "Are you sure you want to delete this category?",
        confirmYes: "Yes",
        confirmNo: "No",
        starLink: "Star Link",
        unstarLink: "Unstar Link",
        datetimeTitle: "Date & Time",
        searchHint: "Type to search • Enter to confirm"
    },
    ru: {
        promptPrefix: " > ",
        editBookmarks: "Редактировать закладки",
        selectLanguage: "Выбрать язык",
        selectTheme: "Выбрать тему",
        selectSearchEngine: "Выбрать поисковую систему",
        addCategory: "Добавить категорию",
        saveChanges: "Сохранить изменения",
        deleteCategory: "Удалить категорию",
        deleteLink: "Удалить ссылку",
        addLink: "Добавить ссылку",
        linkText: "Текст ссылки",
        linkUrl: "URL ссылки",
        confirmDelete: "Вы уверены, что хотите удалить эту категорию?",
        confirmYes: "Да",
        confirmNo: "Нет",
        starLink: "Добавить в избранное",
        unstarLink: "Убрать из избранного",
        datetimeTitle: "Дата и Время",
        searchHint: "Печатайте для поиска • Enter для подтверждения"
    },
    es: {
        promptPrefix: " > ",
        editBookmarks: "Editar marcadores",
        selectLanguage: "Seleccionar idioma",
        selectTheme: "Seleccionar tema",
        selectSearchEngine: "Seleccionar buscador",
        addCategory: "Añadir categoría",
        saveChanges: "Guardar cambios",
        deleteCategory: "Eliminar categoría",
        deleteLink: "Eliminar enlace",
        addLink: "Añadir enlace",
        linkText: "Texto del enlace",
        linkUrl: "URL del enlace",
        confirmDelete: "¿Estás seguro de que quieres eliminar esta categoría?",
        confirmYes: "Sí",
        confirmNo: "No",
        starLink: "Marcar enlace",
        unstarLink: "Desmarcar enlace",
        datetimeTitle: "Fecha y Hora",
        searchHint: "Escribe para buscar • Enter para confirmar"
    },
    fr: {
        promptPrefix: " > ",
        editBookmarks: "Modifier les favoris",
        selectLanguage: "Sélectionner la langue",
        selectTheme: "Sélectionner le thème",
        selectSearchEngine: "Sélectionner le moteur de recherche",
        addCategory: "Ajouter une catégorie",
        saveChanges: "Enregistrer les modifications",
        deleteCategory: "Supprimer la catégorie",
        deleteLink: "Supprimer le lien",
        addLink: "Ajouter un lien",
        linkText: "Texte du lien",
        linkUrl: "URL du lien",
        confirmDelete: "Êtes-vous sûr de vouloir supprimer cette catégorie?",
        confirmYes: "Oui",
        confirmNo: "Non",
        starLink: "Étoiler le lien",
        unstarLink: "Désétoiler le lien",
        datetimeTitle: "Date et Heure",
        searchHint: "Tapez pour rechercher • Entrée pour confirmer"
    },
    de: {
        promptPrefix: " > ",
        editBookmarks: "Lesezeichen bearbeiten",
        selectLanguage: "Sprache auswählen",
        selectTheme: "Thema auswählen",
        selectSearchEngine: "Suchmaschine auswählen",
        addCategory: "Kategorie hinzufügen",
        saveChanges: "Änderungen speichern",
        deleteCategory: "Kategorie löschen",
        deleteLink: "Link löschen",
        addLink: "Link hinzufügen",
        linkText: "Link-Text",
        linkUrl: "Link-URL",
        confirmDelete: "Sind Sie sicher, dass Sie diese Kategorie löschen möchten?",
        confirmYes: "Ja",
        confirmNo: "Nein",
        starLink: "Link favorisieren",
        unstarLink: "Link entfavorisieren",
        datetimeTitle: "Datum und Uhrzeit",
        searchHint: "Tippen zum Suchen • Enter zum Bestätigen"
    },
    ja: {
        promptPrefix: " > ",
        editBookmarks: "ブックマークを編集",
        selectLanguage: "言語を選択",
        selectTheme: "テーマを選択",
        selectSearchEngine: "検索エンジンを選択",
        addCategory: "新しいカテゴリを追加",
        saveChanges: "変更を保存",
        deleteCategory: "カテゴリを削除",
        deleteLink: "リンクを削除",
        addLink: "リンクを追加",
        linkText: "リンクテキスト",
        linkUrl: "リンクURL",
        confirmDelete: "このカテゴリを削除してもよろしいですか？",
        confirmYes: "はい",
        confirmNo: "いいえ",
        starLink: "リンクをスター付け",
        unstarLink: "リンクのスターを外す",
        datetimeTitle: "日付と時刻",
        searchHint: "入力して検索 • Enterで確定"
    }
};

// Search engines configuration
const searchEngines = {
    duckduckgo: {
        name: 'DuckDuckGo',
        url: 'https://duckduckgo.com/?q='
    },
    google: {
        name: 'Google',
        url: 'https://www.google.com/search?q='
    },
    bing: {
        name: 'Bing',
        url: 'https://www.bing.com/search?q='
    },
    yandex: {
        name: 'Yandex',
        url: 'https://yandex.com/search/?text='
    },
    startpage: {
        name: 'Startpage',
        url: 'https://www.startpage.com/sp/search?query='
    },
    searx: {
        name: 'SearX',
        url: 'https://searx.org/?q='
    }
};

// Initial bookmark data (example structure)
const defaultBookmarks = [
    {
        title: "Social",
        links: [
            { text: "Reddit", url: "https://reddit.com", starred: false },
            { text: "Twitter", url: "https://twitter.com", starred: false },
            { text: "Facebook", url: "https://facebook.com", starred: false },
            { text: "Instagram", url: "https://instagram.com", starred: false },
            { text: "LinkedIn", url: "https://linkedin.com", starred: false }
        ]
    },
    {
        title: "Work",
        links: [
            { text: "Gmail", url: "https://gmail.com", starred: true },
            { text: "Drive", url: "https://drive.google.com", starred: false },
            { text: "Calendar", url: "https://calendar.google.com", starred: false },
            { text: "Slack", url: "https://slack.com", starred: false },
            { text: "Trello", url: "https://trello.com", starred: false }
        ]
    },
    {
        title: "Dev",
        links: [
            { text: "GitHub", url: "https://github.com", starred: true },
            { text: "GitLab", url: "https://gitlab.com", starred: false },
            { text: "StackOverflow", url: "https://stackoverflow.com", starred: true },
            { text: "MDN", url: "https://developer.mozilla.org", starred: false },
            { text: "npm", url: "https://npmjs.com", starred: false }
        ]
    },
    {
        title: "Media",
        links: [
            { text: "YouTube", url: "https://youtube.com", starred: true },
            { text: "Netflix", url: "https://netflix.com", starred: false },
            { text: "Spotify", url: "https://spotify.com", starred: false },
            { text: "Twitch", url: "https://twitch.tv", starred: false },
            { text: "SoundCloud", url: "https://soundcloud.com", starred: false }
        ]
    }
];