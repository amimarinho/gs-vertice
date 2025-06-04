
// JavaScript específico para a página de pontos de apoio

let filteredSupportPoints = [];

// Inicializar página de pontos de apoio
function initializeSupportPointsPage() {
    loadAllSupportPoints();
    setupSupportFilters();
    setupSupportSearch();
    
    // Verificar se há um ponto específico na URL
    const hash = window.location.hash;
    if (hash.startsWith('#support-')) {
        const supportId = parseInt(hash.replace('#support-', ''));
        setTimeout(() => showSupportModal(supportId), 500);
    }
}

// Carregar todos os pontos de apoio
function loadAllSupportPoints() {
    filteredSupportPoints = [...supportPoints];
    renderSupportPoints();
    updateSupportResultsCount();
}

// Renderizar pontos de apoio na grade
function renderSupportPoints() {
    const grid = document.getElementById('supportPointsGrid');
    const noResults = document.getElementById('noSupportResults');
    
    if (filteredSupportPoints.length === 0) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    grid.innerHTML = filteredSupportPoints.map(point => `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100 ${getStatusCardClass(point.status)}">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div class="flex-grow-1">
                            <div class="d-flex align-items-center mb-2">
                                <i class="fas ${getTypeIcon(point.type)} text-primary me-2"></i>
                                <span class="badge ${getTypeBadgeClass(point.type)}">${point.type}</span>
                            </div>
                            <h5 class="card-title mb-0">${point.name}</h5>
                        </div>
                        <span class="badge ${getStatusBadgeClass(point.status)}">${point.status}</span>
                    </div>
                    
                    <p class="card-text mb-3">${point.description}</p>
                    
                    <div class="d-flex align-items-center text-muted mb-2">
                        <i class="fas fa-map-marker-alt me-2"></i>
                        <small>${point.address}</small>
                    </div>
                    
                    <div class="d-flex align-items-center text-muted mb-2">
                        <i class="fas fa-phone me-2"></i>
                        <small>${formatPhoneBR(point.phone)}</small>
                    </div>
                    
                    ${point.capacity ? `
                        <div class="d-flex align-items-center text-muted mb-3">
                            <i class="fas fa-users me-2"></i>
                            <small>Capacidade: ${point.capacity} pessoas</small>
                        </div>
                    ` : ''}
                    
                    <div class="d-flex gap-2">
                        <a href="tel:${point.phone.replace(/\D/g, '')}" class="btn btn-outline-primary btn-sm flex-grow-1">
                            <i class="fas fa-phone me-1"></i>
                            Ligar
                        </a>
                        <button class="btn btn-outline-secondary btn-sm" onclick="getDirections('${point.address}')">
                            <i class="fas fa-directions me-1"></i>
                            Rota
                        </button>
                        <button class="btn btn-outline-success btn-sm" onclick="shareSupport(${point.id})">
                            <i class="fas fa-share-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Configurar filtros de pontos de apoio
function setupSupportFilters() {
    const typeFilter = document.getElementById('typeFilter');
    const statusFilter = document.getElementById('statusFilter');
    const regionFilter = document.getElementById('regionFilter');
    
    [typeFilter, statusFilter, regionFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', applySupportFilters);
        }
    });
}

// Configurar busca de pontos de apoio
function setupSupportSearch() {
    const searchInput = document.getElementById('searchSupport');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(performSupportSearch, 300));
    }
}

// Aplicar filtros de pontos de apoio
function applySupportFilters() {
    const typeFilter = document.getElementById('typeFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const regionFilter = document.getElementById('regionFilter').value;
    const searchQuery = document.getElementById('searchSupport').value;
    
    filteredSupportPoints = supportPoints.filter(point => {
        const matchesType = !typeFilter || point.type === typeFilter;
        const matchesStatus = !statusFilter || point.status === statusFilter;
        const matchesRegion = !regionFilter || point.address.includes(regionFilter);
        const matchesSearch = !searchQuery || supportPointMatchesSearch(point, searchQuery);
        
        return matchesType && matchesStatus && matchesRegion && matchesSearch;
    });
    
    renderSupportPoints();
    updateSupportResultsCount();
}

// Realizar busca de pontos de apoio
function performSupportSearch() {
    applySupportFilters();
}

// Verificar se ponto de apoio corresponde à busca
function supportPointMatchesSearch(point, query) {
    const searchableFields = [
        point.name,
        point.description,
        point.address,
        point.type
    ];
    
    const queryLower = query.toLowerCase();
    return searchableFields.some(field => 
        field.toLowerCase().includes(queryLower)
    );
}

// Atualizar contador de resultados
function updateSupportResultsCount() {
    const resultsCount = document.getElementById('supportResultsCount');
    if (resultsCount) {
        const total = filteredSupportPoints.length;
        const totalPoints = supportPoints.length;
        
        if (total === totalPoints) {
            resultsCount.textContent = `Mostrando ${total} pontos de apoio`;
        } else {
            resultsCount.textContent = `Mostrando ${total} de ${totalPoints} pontos de apoio`;
        }
    }
}

// Limpar filtros de pontos de apoio
function clearSupportFilters() {
    document.getElementById('searchSupport').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('regionFilter').value = '';
    
    loadAllSupportPoints();
}

// Obter classe do card baseada no status
function getStatusCardClass(status) {
    switch(status) {
        case 'Emergência': return 'border-danger';
        case 'Lotado': return 'border-warning';
        case 'Ativo': return 'border-success';
        default: return '';
    }
}

// Obter classe do badge baseada no tipo
function getTypeBadgeClass(type) {
    const typeMap = {
        'Abrigo': 'bg-primary',
        'Hospital': 'bg-success',
        'Distribuição': 'bg-warning',
        'Bombeiros': 'bg-danger',
        'Defesa Civil': 'bg-info'
    };
    return typeMap[type] || 'bg-secondary';
}

// Obter classe do badge baseada no status
function getStatusBadgeClass(status) {
    const statusMap = {
        'Ativo': 'bg-success',
        'Lotado': 'bg-warning',
        'Emergência': 'bg-danger'
    };
    return statusMap[status] || 'bg-secondary';
}

// Obter ícone baseado no tipo
function getTypeIcon(type) {
    const iconMap = {
        'Abrigo': 'fa-home',
        'Hospital': 'fa-hospital',
        'Distribuição': 'fa-boxes',
        'Bombeiros': 'fa-fire',
        'Defesa Civil': 'fa-shield-alt'
    };
    return iconMap[type] || 'fa-map-marker-alt';
}

// Obter direções para um local
function getDirections(address) {
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
}

// Compartilhar ponto de apoio
function shareSupport(supportId) {
    const point = supportPoints.find(p => p.id === supportId);
    if (!point) return;
    
    const url = `${window.location.origin}${window.location.pathname}#support-${supportId}`;
    const title = `${point.name} - Brasil Unido`;
    const text = `Ponto de apoio: ${point.name} - ${point.address}`;
    
    shareContent(title, text, url);
}

// Alternar visualização do mapa (placeholder)
function toggleMapView() {
    showNotification('Visualização de mapa será implementada em breve!', 'info');
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    if (getCurrentPage() === 'pontos-apoio') {
        initializeSupportPointsPage();
    }
});

console.log('🏥 Página de pontos de apoio carregada com sucesso!');
