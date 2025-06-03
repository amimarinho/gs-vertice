
// JavaScript para Brasil Unido - Portal de Prevenção a Desastres

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Função principal de inicialização
function initializeApp() {
    setActiveNavigation();
    loadFeaturedProjects();
    initializeAnimations();
    setupMobileMenu();
    
    // Verificar qual página estamos e carregar funcionalidades específicas
    const currentPage = getCurrentPage();
    
    switch(currentPage) {
        case 'index':
            initializeHomePage();
            break;
        case 'projetos':
            initializeProjectsPage();
            break;
        case 'voluntario':
            initializeVolunteerPage();
            break;
        case 'pontos-apoio':
            initializeSupportPointsPage();
            break;
        case 'reportar':
            initializeReportPage();
            break;
        case 'sobre':
            initializeAboutPage();
            break;
    }
}

// Obter página atual
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page.replace('.html', '') || 'index';
}

// Configurar navegação ativa
function setActiveNavigation() {
    const currentPage = getCurrentPage();
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href && href.includes(currentPage)) {
            link.classList.add('active');
        }
    });
}

// Carregar projetos em destaque na página inicial
function loadFeaturedProjects() {
    const featuredContainer = document.getElementById('featured-projects');
    if (!featuredContainer) return;
    
    // Pegar os 3 primeiros projetos como destaque
    const featuredProjects = projects.slice(0, 3);
    
    featuredContainer.innerHTML = featuredProjects.map(project => `
        <div class="col-md-6 col-lg-4">
            <div class="project-card">
                <div class="card-body p-4">
                    <div class="project-badges mb-3">
                        <span class="badge badge-area-${getAreaClass(project.area)}">${project.area}</span>
                        <span class="badge badge-type-${getTypeClass(project.type)}">${project.type}</span>
                    </div>
                    <h5 class="card-title">${project.name}</h5>
                    <p class="card-text text-muted mb-2">${project.institution}</p>
                    <p class="card-text">${truncateText(project.description, 120)}</p>
                    <div class="d-flex align-items-center text-muted mb-3">
                        <i class="fas fa-map-marker-alt me-1"></i>
                        <small>${project.location}</small>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-primary btn-sm flex-grow-1" onclick="showProjectDetails(${project.id})">
                            Saber Mais
                        </button>
                        ${project.url ? `
                            <a href="${project.url}" target="_blank" class="btn btn-outline-secondary btn-sm">
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Inicializar página inicial
function initializeHomePage() {
    // Animações de contadores para estatísticas
    animateCounters();
    
    // Efeitos de scroll suave para links internos
    const scrollLinks = document.querySelectorAll('a[href*="#"]');
    scrollLinks.forEach(link => {
        link.addEventListener('click', smoothScrollToElement);
    });
}

// Animação dos contadores nas estatísticas
function animateCounters() {
    const counters = document.querySelectorAll('.stats-number');
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
        const duration = 2000; // 2 segundos
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = formatNumber(Math.floor(current));
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = formatNumber(target);
            }
        };
        
        updateCounter();
    };
    
    // Observer para iniciar animação quando entrar na viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                animateCounter(counter);
                observer.unobserve(counter);
            }
        });
    });
    
    counters.forEach(counter => observer.observe(counter));
}

// Formatação de números
function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return num.toString();
}

// Configurar menu mobile
function setupMobileMenu() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        // Fechar menu ao clicar em um link
        const navLinks = navbarCollapse.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            });
        });
    }
}

// Scroll suave para elementos
function smoothScrollToElement(e) {
    const href = e.currentTarget.getAttribute('href');
    if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// Inicializar animações de entrada
function initializeAnimations() {
    const animatedElements = document.querySelectorAll('.stats-card, .project-card, .help-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => observer.observe(el));
}

// Funções utilitárias para classificação de badges
function getAreaClass(area) {
    const areaMap = {
        'Hidrometeorológica': 'hidro',
        'Geológica': 'geo',
        'Incêndios': 'fire',
        'Tecnológica': 'tech',
        'Saúde': 'health',
        'Educação': 'edu'
    };
    return areaMap[area] || 'default';
}

function getTypeClass(type) {
    const typeMap = {
        'Monitoramento': 'monitor',
        'Alerta': 'alert',
        'Resposta': 'response',
        'Prevenção': 'prevention',
        'Educação': 'education'
    };
    return typeMap[type] || 'default';
}

// Truncar texto
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Mostrar detalhes do projeto (modal ou redirecionamento)
function showProjectDetails(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Por enquanto, vamos redirecionar para a página de projetos
    window.location.href = `projetos.html#project-${projectId}`;
}

// Funções específicas de páginas (serão implementadas nos respectivos arquivos HTML)
function initializeProjectsPage() {
    console.log('Inicializando página de projetos');
}

function initializeVolunteerPage() {
    console.log('Inicializando página de voluntariado');
}

function initializeSupportPointsPage() {
    console.log('Inicializando página de pontos de apoio');
}

function initializeReportPage() {
    console.log('Inicializando página de reportar');
}

function initializeAboutPage() {
    console.log('Inicializando página sobre');
}

// Função de busca global
function globalSearch(query) {
    const results = [];
    
    // Buscar em projetos
    projects.forEach(project => {
        if (project.name.toLowerCase().includes(query.toLowerCase()) ||
            project.description.toLowerCase().includes(query.toLowerCase()) ||
            project.institution.toLowerCase().includes(query.toLowerCase())) {
            results.push({
                type: 'project',
                data: project,
                relevance: calculateRelevance(query, project)
            });
        }
    });
    
    // Buscar em pontos de apoio
    supportPoints.forEach(point => {
        if (point.name.toLowerCase().includes(query.toLowerCase()) ||
            point.address.toLowerCase().includes(query.toLowerCase()) ||
            point.type.toLowerCase().includes(query.toLowerCase())) {
            results.push({
                type: 'support-point',
                data: point,
                relevance: calculateRelevance(query, point)
            });
        }
    });
    
    // Ordenar por relevância
    return results.sort((a, b) => b.relevance - a.relevance);
}

// Calcular relevância da busca
function calculateRelevance(query, item) {
    let relevance = 0;
    const queryLower = query.toLowerCase();
    
    // Verificar correspondência no nome (peso maior)
    if (item.name && item.name.toLowerCase().includes(queryLower)) {
        relevance += 10;
    }
    
    // Verificar correspondência na descrição
    if (item.description && item.description.toLowerCase().includes(queryLower)) {
        relevance += 5;
    }
    
    // Verificar correspondência em outros campos
    Object.values(item).forEach(value => {
        if (typeof value === 'string' && value.toLowerCase().includes(queryLower)) {
            relevance += 1;
        }
    });
    
    return relevance;
}

// Validação de formulários
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'Este campo é obrigatório');
            isValid = false;
        } else {
            clearFieldError(field);
        }
    });
    
    // Validação específica para email
    const emailFields = form.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
        if (field.value && !isValidEmail(field.value)) {
            showFieldError(field, 'Por favor, insira um email válido');
            isValid = false;
        }
    });
    
    return isValid;
}

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Mostrar erro em campo
function showFieldError(field, message) {
    clearFieldError(field);
    field.classList.add('is-invalid');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

// Limpar erro de campo
function clearFieldError(field) {
    field.classList.remove('is-invalid');
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Mostrar toast/notificação
function showNotification(message, type = 'success') {
    // Criar container de notificações se não existir
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    
    // Criar notificação
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    container.appendChild(notification);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Função para copiar texto para clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Texto copiado para a área de transferência!', 'success');
    }).catch(() => {
        showNotification('Erro ao copiar texto', 'danger');
    });
}

// Função para compartilhar (Web Share API ou fallback)
function shareContent(title, text, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: text,
            url: url
        }).catch(console.error);
    } else {
        // Fallback: copiar URL
        copyToClipboard(url);
    }
}

// Loading states
function showLoading(element) {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    if (element) {
        element.classList.add('loading');
    }
}

function hideLoading(element) {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    if (element) {
        element.classList.remove('loading');
    }
}

// Debounce para otimizar buscas
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Função para formatar data brasileira
function formatDateBR(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Função para formatar telefone brasileiro
function formatPhoneBR(phone) {
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
}

// Função para detectar dispositivo móvel
function isMobile() {
    return window.innerWidth <= 768;
}

// Event listeners globais
window.addEventListener('resize', debounce(() => {
    // Reajustar layouts responsivos se necessário
    console.log('Window resized');
}, 250));

// Interceptar formulários para prevenir envio padrão
document.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Form submission intercepted:', e.target.id);
});

// Console log de boas-vindas
console.log('🇧🇷 Brasil Unido - Portal de Prevenção a Desastres carregado com sucesso!');
console.log('📊 Projetos carregados:', projects.length);
console.log('🏥 Pontos de apoio carregados:', supportPoints.length);
