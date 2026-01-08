let universitiesData = [];
let filteredData = [];
let currentFilter = 'all';
let currentSearch = '';
let currentModalIndex = 0;
let uniqueUniversities = 0;



// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Загрузка данных из JSON
    loadUniversitiesData();
    
    // Инициализация элементов управления
    initGalleryControls();
    
    // Инициализация модального окна
    initModal();
});

// Загрузка данных университетов из JSON
async function loadUniversitiesData() {
    try {
        const response = await fetch('data/universities.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        universitiesData = await response.json();
        
        // Сортируем по дате (новые первыми)
        universitiesData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Инициализация отфильтрованных данных
        filteredData = [...universitiesData];
        
        // Обновление интерфейса
        updateGallery();
        updateStatistics();
        
        console.log(`Загружено ${universitiesData.length} университетов для галереи`);
    } catch (error) {
        console.error('Ошибка загрузки данных для галереи:', error);
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
    
    // Сортируем по дате
    universitiesData.sort((a, b) => new Date(b.date) - new Date(a.date));
    filteredData = [...universitiesData];
    
    updateGallery();
    updateStatistics();
}

// Инициализация элементов управления галереей
function initGalleryControls() {
    // Фильтры
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Убираем активный класс со всех кнопок
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Добавляем активный класс нажатой кнопке
            this.classList.add('active');
            
            // Применяем фильтр
            currentFilter = this.dataset.filter;
            applyFilters();
        });
    });
    
    // Поиск
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', function() {
        currentSearch = this.value.toLowerCase().trim();
        applyFilters();
        
        // Добавляем задержку для дебаунса
        clearTimeout(searchInput.timeout);
        searchInput.timeout = setTimeout(() => {
            applyFilters();
        }, 300);
    });
    
    // Кнопка поделиться
    document.getElementById('share-btn').addEventListener('click', shareImage);
    
    // Кнопка скачать
    document.getElementById('download-btn').addEventListener('click', downloadImage);
}

// Применение фильтров и поиска
function applyFilters() {
    // Начинаем с полного набора данных
    let results = [...universitiesData];
    
    // Применяем фильтр по региону
    if (currentFilter !== 'all') {
        results = results.filter(university => {
            if (currentFilter === 'russia') return university.country === 'Россия';
            if (currentFilter === 'spb') return university.city === 'Санкт-Петербург';
            if (currentFilter === 'msk') return university.city === 'Москва';
            if (currentFilter === 'world') return university.country !== "Россия";
            return true;
        });
    }
    
    // Применяем поиск
    if (currentSearch) {
        results = results.filter(university => {
            const searchStr = `${university.name} ${university.city} ${university.country} ${university.comment}`.toLowerCase();
            return searchStr.includes(currentSearch);
        });
    }
    
    // Обновляем отфильтрованные данные
    filteredData = results;
    
    // Обновляем галерею
    updateGallery();
}

// Обновление галереи
function updateGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    
    // Очищаем галерею
    galleryGrid.innerHTML = '';
    
    // Если нет результатов
    if (filteredData.length === 0) {
        galleryGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>Ничего не найдено</h3>
                <p>Попробуйте изменить фильтры или поисковый запрос</p>
            </div>
        `;
        return;
    }
    
    // Создаем элементы галереи
    filteredData.forEach((university, index) => {
        const galleryItem = createGalleryItem(university, index);
        galleryGrid.appendChild(galleryItem);
    });
    
    // Обновляем статистику в навигации
    document.getElementById('total-photos').textContent = filteredData.length;
}

// Создание элемента галереи
function createGalleryItem(university, index) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.dataset.index = index;
    
    // Определяем тег региона
    let regionTag = 'Другое';
    if (university.country === 'Россия') regionTag = 'Россия';
    else if (['Франция', 'Великобритания', 'Германия'].includes(university.country)) regionTag = 'Европа';
    else if (['США', 'Канада'].includes(university.country)) regionTag = 'Северная Америка';
    
    // Форматируем дату
    const date = new Date(university.date);
    const formattedDate = date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    item.innerHTML = `
        <div class="item-image-container">
            <img src="${university.photoUrl}" alt="${university.name}" class="item-image" onerror="this.src='https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'">
            <div class="item-overlay">
                <div class="item-info">
                    <h3 class="item-university">${university.name}</h3>
                    <div class="item-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${university.city}, ${university.country}</span>
                    </div>
                    <div class="item-date">${formattedDate}</div>
                </div>
            </div>
        </div>
        <div class="item-content">
            <p class="item-comment">${university.comment}</p>
            <div class="item-tags">
                <span class="item-tag">${university.country}</span>
            </div>
        </div>
    `;
    
    // Добавляем обработчик клика
    item.addEventListener('click', () => openModal(index));
    
    return item;
}

// Обновление статистики
function updateStatistics() {
    if (universitiesData.length === 0) return;
    
    // Уникальные университеты (по ID)
    const universityEntries = universitiesData.filter(item => item.type === "university");
    const uniqueUniversityNames = [...new Set(universityEntries.map(item => item.name))];
    uniqueUniversities = uniqueUniversityNames.length;
    document.getElementById('stats-universities').textContent = uniqueUniversityNames.length;
    
    // Уникальные города
    const cities = [...new Set(universitiesData.map(u => u.city))];
    document.getElementById('stats-cities').textContent = cities.length;
    
    // Уникальные страны
    const countries = [...new Set(universitiesData.map(u => u.country))];
    document.getElementById('stats-countries').textContent = countries.length;
}

// Инициализация модального окна
function initModal() {
    const modal = document.getElementById('image-modal');
    const closeBtn = document.getElementById('modal-close');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    // Закрытие модального окна
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Навигация
    prevBtn.addEventListener('click', showPrevImage);
    nextBtn.addEventListener('click', showNextImage);
    
    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') showPrevImage();
        if (e.key === 'ArrowRight') showNextImage();
    });
}

// Открытие модального окна
function openModal(index) {
    if (filteredData.length === 0) return;
    
    currentModalIndex = index;
    const university = filteredData[index];
    const modal = document.getElementById('image-modal');
    
    // Заполняем данные
    document.getElementById('modal-image').src = university.photoUrl;
    document.getElementById('modal-university').textContent = university.name;
    document.getElementById('modal-location').textContent = `${university.city}, ${university.country}`;
    document.getElementById('modal-id').textContent = `#${university.id.toString().padStart(3, '0')}`;
    document.getElementById('modal-comment').textContent = university.comment;
    
    // Форматируем дату
    const date = new Date(university.date);
    const formattedDate = date.toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    document.getElementById('modal-date').textContent = formattedDate;
    
    // Показываем модальное окно
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Обновляем состояние кнопок навигации
    updateNavButtons();
}

// Закрытие модального окна
function closeModal() {
    const modal = document.getElementById('image-modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Показать предыдущее изображение
function showPrevImage() {
    if (filteredData.length === 0) return;
    
    currentModalIndex = (currentModalIndex - 1 + filteredData.length) % filteredData.length;
    openModal(currentModalIndex);
}

// Показать следующее изображение
function showNextImage() {
    if (filteredData.length === 0) return;
    
    currentModalIndex = (currentModalIndex + 1) % filteredData.length;
    openModal(currentModalIndex);
}

// Обновление состояния кнопок навигации
function updateNavButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    // Всегда активны, так как галерея циклическая
}

// Поделиться изображением
function shareImage() {
    const university = filteredData[currentModalIndex];
    const shareText = `Фото захвата университета ${university.name} (${university.city}, ${university.country}) - проект "ИТМО: Расширение территории"`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: `Захват ${university.name}`,
            text: shareText,
            url: shareUrl,
        })
        .catch(console.error);
    } else {
        // Fallback для браузеров без поддержки Web Share API
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
            .then(() => {
                alert('Ссылка скопирована в буфер обмена!');
            })
            .catch(console.error);
    }
}

// Скачать изображение
function downloadImage() {
    const university = filteredData[currentModalIndex];
    const imageUrl = university.photoUrl;
    const fileName = `itmo-capture-${university.id}-${university.name.replace(/\s+/g, '-').toLowerCase()}.jpg`;
    
    // Создаем временную ссылку для скачивания
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}