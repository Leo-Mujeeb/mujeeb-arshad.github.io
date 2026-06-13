// ===== GALLERY FUNCTIONALITY =====

// Image database structure
const imageDatabase = {
    categories: ['NDVI', 'LST', 'NDBSI', 'WETNESS', 'RSEI', 'PC1', 'WATER'],
    months: ['03', '05', '09', '12'],
    years: ['2021', '2022', '2023', '2024', '2025'],
    types: ['', '_MASK', '_normalization'],
    changeDetection: [
        'CHANGE_DETECTION_03_2021-2025.jpg',
        'CHANGE_DETECTION_05_2021-2025.jpg',
        'CHANGE_DETECTION_09_2021-2025.jpg',
        'CHANGE_DETECTION_12_2021-2025.jpg'
    ]
};

// Generate image paths dynamically
function generateImagePaths() {
    const images = [];
    
    // Regular year-wise images
    imageDatabase.years.forEach(year => {
        imageDatabase.categories.forEach(category => {
            imageDatabase.months.forEach(month => {
                imageDatabase.types.forEach(type => {
                    if (category === 'RSEI' || category === 'PC1' || category === 'WATER') {
                        if (type === '') {
                            const fileName = `${category}_CLASS_${month}_${year.slice(2)}.jpg`;
                            if (category === 'WATER') {
                                const waterFile = `WATER_MASK_${month}_${year.slice(2)}.jpg`;
                                images.push({
                                    year: year,
                                    category: category,
                                    month: month,
                                    type: 'Masked',
                                    path: `Images/${year}/${waterFile}`,
                                    title: `${category} - ${getMonthName(month)} ${year}`,
                                    description: `${category} Masked Analysis`
                                });
                            } else if (category === 'PC1') {
                                const pc1File = `PC1_${month}_${year.slice(2)}.jpg`;
                                images.push({
                                    year: year,
                                    category: category,
                                    month: month,
                                    type: 'PCA Result',
                                    path: `Images/${year}/${pc1File}`,
                                    title: `${category} - ${getMonthName(month)} ${year}`,
                                    description: `Principal Component Analysis Result`
                                });
                            } else {
                                images.push({
                                    year: year,
                                    category: category,
                                    month: month,
                                    type: 'Classification',
                                    path: `Images/${year}/${fileName}`,
                                    title: `${category} Classification - ${getMonthName(month)} ${year}`,
                                    description: `RSEI Classification Map`
                                });
                            }
                        }
                    } else {
                        const typeName = type === '' ? 'Original' : type === '_MASK' ? 'Masked' : 'Normalized';
                        const fileName = `${category}${type}_${month}_${year.slice(2)}.jpg`;
                        images.push({
                            year: year,
                            category: category,
                            month: month,
                            type: typeName,
                            path: `Images/${year}/${fileName}`,
                            title: `${category} ${typeName} - ${getMonthName(month)} ${year}`,
                            description: `${category} ${typeName} Analysis for ${getMonthName(month)} ${year}`
                        });
                    }
                });
            });
        });
    });
    
    // Add change detection images
    imageDatabase.changeDetection.forEach(file => {
        const month = file.match(/_(\d{2})_/)[1];
        images.push({
            year: 'change',
            category: 'CHANGE',
            month: month,
            type: '2021-2025',
            path: `Images/${file}`,
            title: `Change Detection - ${getMonthName(month)} (2021-2025)`,
            description: `5-Year Change Detection Analysis for ${getMonthName(month)}`
        });
    });
    
    return images;
}

// Helper function to get month name
function getMonthName(month) {
    const months = {
        '03': 'March',
        '05': 'May',
        '09': 'September',
        '12': 'December'
    };
    return months[month] || month;
}

// Current filter state
let currentFilters = {
    year: 'all',
    category: 'all'
};

let allImages = [];
let filteredImages = [];
let currentImageIndex = 0;

// Initialize gallery
function initGallery() {
    allImages = generateImagePaths();
    filteredImages = allImages;
    renderGallery();
    setupEventListeners();
    updateImageCount();
}

// Render gallery
function renderGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    
    if (!galleryGrid) return;
    
    if (filteredImages.length === 0) {
        galleryGrid.innerHTML = `
            <div class="gallery-empty">
                <i class="fas fa-images"></i>
                <h3>No images found</h3>
                <p>Try adjusting your filters</p>
            </div>
        `;
        return;
    }
    
    galleryGrid.innerHTML = filteredImages.map((img, index) => `
        <div class="gallery-item" data-index="${index}" onclick="openModal(${index})">
            <img src="${img.path}" alt="${img.title}" loading="lazy" 
                 onerror="this.parentElement.style.display='none'">
            <div class="gallery-item-overlay">
                <div class="gallery-item-title">${img.title}</div>
                <div class="gallery-item-meta">${img.description}</div>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Year filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilters.year = btn.dataset.year;
            applyFilters();
        });
    });
    
    // Category filter buttons
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilters.category = btn.dataset.category;
            applyFilters();
        });
    });
    
    // Modal controls
    const modal = document.getElementById('imageModal');
    const closeBtn = document.querySelector('.modal-close');
    const prevBtn = document.querySelector('.modal-prev');
    const nextBtn = document.querySelector('.modal-next');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => navigateModal(-1));
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => navigateModal(1));
    }
    
    // Close modal on background click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') navigateModal(-1);
        if (e.key === 'ArrowRight') navigateModal(1);
    });
}

// Apply filters
function applyFilters() {
    filteredImages = allImages.filter(img => {
        const yearMatch = currentFilters.year === 'all' || img.year === currentFilters.year;
        const categoryMatch = currentFilters.category === 'all' || img.category === currentFilters.category;
        return yearMatch && categoryMatch;
    });
    
    renderGallery();
    updateImageCount();
}

// Update image count
function updateImageCount() {
    const totalImagesEl = document.getElementById('totalImages');
    if (totalImagesEl) {
        totalImagesEl.textContent = filteredImages.length;
    }
}

// Open modal
function openModal(index) {
    currentImageIndex = index;
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    
    if (modal && modalImg && filteredImages[index]) {
        const img = filteredImages[index];
        modalImg.src = img.path;
        modalTitle.textContent = img.title;
        modalDescription.textContent = img.description;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Navigate modal
function navigateModal(direction) {
    currentImageIndex += direction;
    
    if (currentImageIndex < 0) {
        currentImageIndex = filteredImages.length - 1;
    } else if (currentImageIndex >= filteredImages.length) {
        currentImageIndex = 0;
    }
    
    openModal(currentImageIndex);
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGallery);
} else {
    initGallery();
}

// Console message
console.log('%c🖼️ Gallery Module Loaded', 'font-size: 14px; font-weight: bold; color: #D4AF37;');
console.log(`%cTotal images available: ${allImages.length}`, 'font-size: 12px; color: #E6C34E;');
