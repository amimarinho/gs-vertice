

// JavaScript específico para a página de projetos

let filteredProjects = [...projects];
let currentSort = 'relevance';

// Inicializar página de projetos
function initializeProjectsPage() {
    loadAllProjects();
    setupFilters();
    setupSearch();
    setupSorting();
    
    // Verificar se há um projeto específico na URL
    const hash = window.location.hash;
    if (hash.startsWith('#project-')) {
        const projectId = parseInt(hash.replace('#project-', ''));
        setTimeout(() => showProjectModal(projectId), 500);
    }
}

// Carregar todos os projetos
function loadAllProjects() {
    filteredProjects = [...projects];
    renderProjects();
    updateResultsCount();
}

// Renderizar projetos na grade
function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    const noResults = document.getElementById('noResults');
    
    if (filteredProjects.length === 0) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    grid.innerHTML = filteredProjects.map(project => `
        <div class="col-md-6 col-lg-4">
            <div class="project-card h-100">
                <div class="card-body p-4">
                    <div class="project-badges mb-3">
                        <span class="badge badge-area-${getAreaClass(project.area)}">${project.area}</span>
                        <span class="badge badge-type-${getTypeClass(project.type)}">${project.type}</span>
                    </div>
                    <h5 class="card-title">${project.name}</h5>
                    <p class="card-text text-muted mb-2 fw-medium">${project.institution}</p>
                    <p class="card-text mb-3">${truncateText(project.description, 120)}</p>
                    
                    <div class="d-flex align-items-center text-muted mb-2">
                        <i class="fas fa-map-marker-alt me-2"></i>
                        <small>${project.location}</small>
                    </div>
                    
                    <div class="d-flex align-items-center text-muted mb-3">
                        <i class="fas fa-calendar me-2"></i>
                        <small>Atualizado em ${formatDateBR(project.lastUpdate)}</small>
                    </div>
                    
                    <div class="d-flex gap-2 mt-auto">
                        <button class="btn btn-outline-primary btn-sm flex-grow-1" onclick="showProjectModal(${project.id})">
                            <i class="fas fa-info-circle me-1"></i>
                            Detalhes
                        </button>
                        ${project.url ? `
                            <a href="${project.url}" target="_blank" class="btn btn-outline-secondary btn-sm" title="Visitar site oficial">
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                        ` : ''}
                        <button class="btn btn-outline-success btn-sm" onclick="shareProject(${project.id})" title="Compartilhar projeto">
                            <i class="fas fa-share-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Configurar filtros
function setupFilters() {
    const areaFilter = document.getElementById('areaFilter');
    const typeFilter = document.getElementById('typeFilter');
    const locationFilter = document.getElementById('locationFilter');
    
    [areaFilter, typeFilter, locationFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', applyFilters);
        }
    });
}

// Configurar busca
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(performSearch, 300));
    }
}

// Configurar ordenação
function setupSorting() {
    const sortButtons = document.querySelectorAll('input[name="sortBy"]');
    sortButtons.forEach(button => {
        button.addEventListener('change', (e) => {
            currentSort = e.target.value;
            sortAndRenderProjects();
        });
    });
}

// Aplicar filtros
function applyFilters() {
    const areaFilter = document.getElementById('areaFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const locationFilter = document.getElementById('locationFilter').value;
    const searchQuery = document.getElementById('searchInput').value;
    
    filteredProjects = projects.filter(project => {
        const matchesArea = !areaFilter || project.area === areaFilter;
        const matchesType = !typeFilter || project.type === typeFilter;
        const matchesLocation = !locationFilter || project.location.includes(locationFilter);
        const matchesSearch = !searchQuery || projectMatchesSearch(project, searchQuery);
        
        return matchesArea && matchesType && matchesLocation && matchesSearch;
    });
    
    sortAndRenderProjects();
}

// Realizar busca
function performSearch() {
    applyFilters();
}

// Verificar se projeto corresponde à busca
function projectMatchesSearch(project, query) {
    const searchableFields = [
        project.name,
        project.institution,
        project.description,
        project.area,
        project.type,
        project.location
    ];
    
    const queryLower = query.toLowerCase();
    return searchableFields.some(field => 
        field.toLowerCase().includes(queryLower)
    );
}

// Ordenar e renderizar projetos
function sortAndRenderProjects() {
    switch (currentSort) {
        case 'date':
            filteredProjects.sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));
            break;
        case 'name':
            filteredProjects.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'relevance':
        default:
            // Manter ordem original para relevância
            break;
    }
    
    renderProjects();
    updateResultsCount();
}

// Atualizar contador de resultados
function updateResultsCount() {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        const total = filteredProjects.length;
        const totalProjects = projects.length;
        
        if (total === totalProjects) {
            resultsCount.textContent = `Mostrando ${total} projetos`;
        } else {
            resultsCount.textContent = `Mostrando ${total} de ${totalProjects} projetos`;
        }
    }
}

// Limpar filtros
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('areaFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('locationFilter').value = '';
    
    // Reset sort to relevance
    document.getElementById('sortRelevance').checked = true;
    currentSort = 'relevance';
    
    loadAllProjects();
}

// Mostrar modal do projeto
function showProjectModal(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const modal = new bootstrap.Modal(document.getElementById('projectModal'));
    const modalTitle = document.getElementById('projectModalTitle');
    const modalBody = document.getElementById('projectModalBody');
    const modalLink = document.getElementById('projectModalLink');
    
    modalTitle.textContent = project.name;
    
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-8">
                <div class="project-badges mb-3">
                    <span class="badge badge-area-${getAreaClass(project.area)} me-2">${project.area}</span>
                    <span class="badge badge-type-${getTypeClass(project.type)}">${project.type}</span>
                </div>
                
                <h6 class="text-muted mb-2">Instituição Responsável</h6>
                <p class="fw-medium mb-3">${project.institution}</p>
                
                <h6 class="text-muted mb-2">Descrição</h6>
                <p class="mb-3">${project.description}</p>
                
                <h6 class="text-muted mb-2">Localização</h6>
                <p class="mb-3">
                    <i class="fas fa-map-marker-alt text-muted me-2"></i>
                    ${project.location}
                </p>
                
                ${project.contact ? `
                    <h6 class="text-muted mb-2">Contato</h6>
                    <p class="mb-3">
                        <i class="fas fa-envelope text-muted me-2"></i>
                        <a href="mailto:${project.contact}">${project.contact}</a>
                    </p>
                ` : ''}
                
                <h6 class="text-muted mb-2">Última Atualização</h6>
                <p class="mb-0">
                    <i class="fas fa-calendar text-muted me-2"></i>
                    ${formatDateBR(project.lastUpdate)}
                </p>
            </div>
            <div class="col-md-4">
                <div class="bg-light p-3 rounded">
                    <h6 class="mb-3">Ações Rápidas</h6>
                    <div class="d-grid gap-2">
                        <button class="btn btn-outline-primary btn-sm" onclick="shareProject(${project.id})">
                            <i class="fas fa-share-alt me-1"></i>
                            Compartilhar
                        </button>
                        <button class="btn btn-outline-success btn-sm" onclick="saveProject(${project.id})">
                            <i class="fas fa-bookmark me-1"></i>
                            Salvar
                        </button>
                        ${project.contact ? `
                            <a href="mailto:${project.contact}" class="btn btn-outline-secondary btn-sm">
                                <i class="fas fa-envelope me-1"></i>
                                Contatar
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    if (project.url) {
        modalLink.href = project.url;
        modalLink.style.display = 'inline-block';
    } else {
        modalLink.style.display = 'none';
    }
    
    modal.show();
    
    // Atualizar URL sem recarregar página
    history.pushState(null, null, `#project-${projectId}`);
}

// Compartilhar projeto
function shareProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const url = `${window.location.origin}${window.location.pathname}#project-${projectId}`;
    const title = `${project.name} - Brasil Unido`;
    const text = `Confira este projeto de prevenção a desastres: ${project.name}`;
    
    shareContent(title, text, url);
}

// Salvar projeto (localStorage)
function saveProject(projectId) {
    const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    
    if (!savedProjects.includes(projectId)) {
        savedProjects.push(projectId);
        localStorage.setItem('savedProjects', JSON.stringify(savedProjects));
        showNotification('Projeto salvo com sucesso!', 'success');
    } else {
        showNotification('Projeto já estava salvo', 'info');
    }
}

// Carregar projetos salvos
function getSavedProjects() {
    const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    return projects.filter(project => savedProjects.includes(project.id));
}

// Exportar dados dos projetos filtrados
function exportProjectsData() {
    const dataStr = JSON.stringify(filteredProjects, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'projetos-brasil-unido.json';
    link.click();
    
    showNotification('Dados exportados com sucesso!', 'success');
}

// Event listener para fechar modal e limpar URL
document.getElementById('projectModal').addEventListener('hidden.bs.modal', () => {
    history.pushState(null, null, window.location.pathname);
});

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    if (getCurrentPage() === 'projetos') {
        initializeProjectsPage();
    }
});

console.log('📊 Página de projetos carregada com sucesso!');
