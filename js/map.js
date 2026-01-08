// Инициализация карты
function initMap(universitiesData) {
    if (!universitiesData || universitiesData.length === 0) {
        console.error('Нет данных для отображения на карте');
        return;
    }
    
    // Фильтруем только университеты для отображения на карте
    const universityEntries = universitiesData.filter(item => item.type === "university");
    
    if (universityEntries.length === 0) {
        console.warn('Нет университетов для отображения на карте');
        // Создаем пустую карту с центром на России
        const map = L.map('expansion-map').setView([61.5240, 105.3188], 3);
        
        // Добавление темного слоя карты
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);
        
        return;
    }
    
    // Создание карты с центром на России
    const map = L.map('expansion-map').setView([61.5240, 105.3188], 3);
    
    // Добавление темного слоя карты
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
    
    // Добавление маркеров для каждого университета
    universityEntries.forEach(university => {
        addUniversityMarker(university, map);
    });
    
    // Масштабирование карты, чтобы показать все маркеры
    const bounds = L.latLngBounds(universityEntries.map(u => [u.lat, u.lng]));
    map.fitBounds(bounds, { padding: [50, 50] });
}

// Добавление маркера университета на карту
function addUniversityMarker(university, map) {
    // Создание кастомного маркера
    const customMarker = L.divIcon({
        className: 'university-marker',
        html: '<i class="fas fa-university"></i>',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    });
    
    // Создание попапа с информацией
    const popupContent = createPopupContent(university);
    
    // Добавление маркера на карту
    const marker = L.marker([university.lat, university.lng], { 
        icon: customMarker,
        title: university.name
    });
    
    marker.addTo(map)
        .bindPopup(popupContent);
}

// Создание содержимого для попапа
function createPopupContent(university) {
    return `
        <div class="university-popup">
            <img src="${university.photoUrl}" alt="${university.name}" class="university-photo" onerror="this.src='https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'">
            <div class="university-info">
                <div class="university-name">${university.name}</div>
                <div class="university-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${university.city}, ${university.country}</span>
                </div>
                <div class="university-comment">${university.comment}</div>
            </div>
        </div>
    `;
}