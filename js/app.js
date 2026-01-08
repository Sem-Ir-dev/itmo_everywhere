let universitiesData = [];
let statistics = {
    totalPhotos: 0,
    uniqueUniversities: 0,
    uniqueCities: 0,
    uniqueCountries: 0,
    russiaUniversities: 0,
    spbUniversities: 0,
    russiaPercent: 0,
    spbPercent: 0
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Загрузка данных из JSON
    loadUniversitiesData();
    
    // Инициализация прогресс-баров
    setTimeout(() => {
        // Проценты будут установлены после загрузки данных
        animateProgressBar('russia-progress', 'russia-percent', 0);
        animateProgressBar('spb-progress', 'spb-percent', 0);
    }, 800);
    
    // Обработка кнопки "Показать карту"
    document.getElementById('show-map-btn').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('expansion-map-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
    });
});

// Загрузка данных университетов из JSON
async function loadUniversitiesData() {
    try {
        const response = await fetch('data/universities.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        universitiesData = await response.json();
        
        // Обновление статистики
        updateStatistics();
        
        // Инициализация карты после загрузки данных
        if (typeof initMap === 'function') {
            initMap(universitiesData);
        }
        
        console.log(`Загружено ${universitiesData.length} фотографий`);
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        // Загрузка fallback данных
        loadFallbackData();
    }
}

// Fallback данные на случай ошибки загрузки JSON
function loadFallbackData() {
    universitiesData = [
        {
            "id": 1,
            "type": "university",
            "name": "МФТИ",
            "city": "Москва",
            "country": "Россия",
            "lat": 55.929698,
            "lng": 37.517838,
            "comment": "Когда уже откроют филиал итмо в долгопрудном??",
            "photoUrl": "data/images/msk_mfti_1.jpg",
            "date": "2024-11-05"
        },
        {
            "id": 2,
            "type": "university",
            "name": "ВШЭ, Спб школа гуманитарных наук и искусств",
            "city": "Санкт-Петербург",
            "country": "Россия",
            "lat": 59.922893,
            "lng": 30.303302,
            "comment": "вшэ сосат?",
            "photoUrl": "data/images/spb_wshe_1.jpg",
            "date": "2025-04-07"
        },
        {
            "id": 3,
            "type": "university",
            "name": "Политехнический университет Петра Великого",
            "city": "Санкт-Петербург",
            "country": "Россия",
            "lat": 60.007194,
            "lng": 30.372921,
            "comment": "",
            "photoUrl": "data/images/spb_politeh_1.jpg",
            "date": "2025-10-18"
        }
    ];
    
    updateStatistics();
    
    if (typeof initMap === 'function') {
        initMap(universitiesData);
    }
}

// Обновление всей статистики
function updateStatistics() {
    if (!universitiesData || universitiesData.length === 0) return;
    
    // Сбрасываем статистику
    statistics = {
        totalPhotos: 0,
        uniqueUniversities: 0,
        uniqueCities: 0,
        uniqueCountries: 0,
        russiaUniversities: 0,
        spbUniversities: 0,
        russiaPercent: 0,
        spbPercent: 0
    };
    
    // Общее количество фотографий
    statistics.totalPhotos = universitiesData.length;
    
    // Уникальные университеты (только type: "university")
    const universityEntries = universitiesData.filter(item => item.type === "university");
    const uniqueUniversityNames = [...new Set(universityEntries.map(item => item.name))];
    statistics.uniqueUniversities = uniqueUniversityNames.length;
    
    // Уникальные города (все типы)
    const uniqueCities = [...new Set(universitiesData.map(item => item.city))];
    statistics.uniqueCities = uniqueCities.length;
    
    // Уникальные страны (все типы)
    const uniqueCountries = [...new Set(universitiesData.map(item => item.country))];
    statistics.uniqueCountries = uniqueCountries.length;
    
    // Университеты в России (только type: "university" и country: "Россия")
    const russiaUniversityEntries = universityEntries.filter(item => 
        item.country === "Россия" || item.country === "Russia"
    );
    const uniqueRussiaUniversities = [...new Set(russiaUniversityEntries.map(item => item.name))];
    statistics.russiaUniversities = uniqueRussiaUniversities.length;
    
    // Университеты в Санкт-Петербурге
    const spbUniversityEntries = universityEntries.filter(item => item.city === "Санкт-Петербург");
    const uniqueSpbUniversities = [...new Set(spbUniversityEntries.map(item => item.name))];
    statistics.spbUniversities = uniqueSpbUniversities.length;
    
    // Проценты (1150 вузов в России, 72 вуза в СПб)
    const totalRussiaUniversities = 1150;
    const totalSpbUniversities = 72;
    
    statistics.russiaPercent = Math.min(100, Math.round((statistics.russiaUniversities / totalRussiaUniversities) * 100));
    statistics.spbPercent = Math.min(100, Math.round((statistics.spbUniversities / totalSpbUniversities) * 100));
    
    // Обновляем интерфейс
    updateUIStatistics();
    
    // Обновляем прогресс-бары
    setTimeout(() => {
        animateProgressBar('russia-progress', 'russia-percent', statistics.russiaPercent);
        animateProgressBar('spb-progress', 'spb-percent', statistics.spbPercent);
    }, 100);
}

// Обновление статистики в интерфейсе
function updateUIStatistics() {
    // Hero блок
    document.getElementById('universities-count').textContent = statistics.uniqueUniversities;
    document.getElementById('cities-count').textContent = statistics.uniqueCities;
    document.getElementById('countries-count').textContent = statistics.uniqueCountries;
    document.getElementById('photos-count').textContent = statistics.totalPhotos;
    
    // Блок прогресса
    document.getElementById('russia-percent').textContent = statistics.russiaPercent + '%';
    document.getElementById('russia-count').textContent = statistics.russiaUniversities;
    document.getElementById('spb-percent').textContent = statistics.spbPercent + '%';
    document.getElementById('spb-count').textContent = statistics.spbUniversities;
    
    // Карта
    if (document.getElementById('map-universities-count')) {
        document.getElementById('map-universities-count').textContent = statistics.uniqueUniversities;
    }

    // Последний захват
    if (universitiesData.length > 0) {
        const lastUniversity = universitiesData[universitiesData.length - 1];
        document.getElementById('last-capture').textContent = lastUniversity.name;
    }
}

// Анимация прогресс-баров
function animateProgressBar(barId, percentId, targetPercent) {
    const bar = document.getElementById(barId);
    const percentElement = document.getElementById(percentId);
    
    let currentPercent = 0;
    const increment = targetPercent / 60;
    
    const interval = setInterval(() => {
        currentPercent += increment;
        if (currentPercent >= targetPercent) {
            currentPercent = targetPercent;
            clearInterval(interval);
        }
        
        bar.style.width = currentPercent + '%';
        percentElement.textContent = Math.round(currentPercent) + '%';
    }, 20);
}