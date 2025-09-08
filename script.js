// --- JAVASCRIPT COMPLETO E ATUALIZADO ---

const firebaseConfig = {
    apiKey: "AIzaSyB9rM4TwAhSPU_e96W0xqg1IDYENFup5i8",
    authDomain: "catalogo-de-festas.firebaseapp.com",
    projectId: "catalogo-de-festas",
    storageBucket: "catalogo-de-festas.firebasestorage.app",
    messagingSenderId: "652648205775",
    appId: "1:652648205775:web:9837a525048bb819a096ba"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const themesCollection = db.collection('themes');
const quotesCollection = db.collection('solicitacoes');

document.addEventListener('DOMContentLoaded', () => {

    let themes = [];
    let currentUser = null;

    const kitDetails = {
        bronze: { price: 'R$ 150,00' },
        prata: { price: 'R$ 250,00' },
        ouro: { price: 'R$ 300,00' }
    };

    // --- ELEMENTOS DA PÁGINA ---
    const loginScreen = document.getElementById('loginScreen');
    const mainContent = document.getElementById('mainContent');
    const reportsScreen = document.getElementById('reportsScreen');
    const rentalsScreen = document.getElementById('rentalsScreen');
    const monthlyRentalsContainer = document.getElementById('monthlyRentalsContainer');
    const formModal = document.getElementById('formModal');
    const closeFormModalBtn = document.getElementById('closeFormModalBtn');

    // Elementos do Cabeçalho
    const navLinks = document.querySelectorAll('.nav-link');
    const homeLink = document.getElementById('homeLink');
    const loginLink = document.getElementById('loginLink');
    const reportsLink = document.getElementById('reportsLink');
    const rentalsLink = document.getElementById('rentalsLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileHomeLink = document.getElementById('mobileHomeLink');
    const mobileLoginLink = document.getElementById('mobileLoginLink');
    const mobileReportsLink = document.getElementById('mobileReportsLink');
    const mobileRentalsLink = document.getElementById('mobileRentalsLink');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    const adminControls = document.getElementById('adminControls');
    const addThemeBtn = document.getElementById('addThemeBtn');
    const catalogContainer = document.getElementById('theme-catalog');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const kitFilter = document.getElementById('kitFilter');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    const viewAllKitsBtn = document.getElementById('viewAllKitsBtn');
    const addThemeForm = document.getElementById('addThemeForm');
    const formTitle = document.getElementById('formTitle');
    const formMessage = document.getElementById('formMessage');
    const categoryList = document.getElementById('categoryList');
    const themeModal = document.getElementById('themeModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalThemeName = document.getElementById('modalThemeName');
    const modalScheduledDatesContainer = document.getElementById('modalScheduledDatesContainer');
    const modalKitsContainer = document.getElementById('modalKitsContainer');
    const imageModal = document.getElementById('imageModal');
    const closeImageModalBtn = document.getElementById('closeImageModalBtn');
    const lightboxImage = document.getElementById('lightboxImage');
    const rentalModal = document.getElementById('rentalModal');
    const closeRentalModalBtn = document.getElementById('closeRentalModalBtn');
    const rentalForm = document.getElementById('rentalForm');
    const rentalThemeInfo = document.getElementById('rentalThemeInfo');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const quoteModal = document.getElementById('quoteModal');
    const closeQuoteModalBtn = document.getElementById('closeQuoteModalBtn');
    const quoteForm = document.getElementById('quoteForm');
    const quoteThemeInfo = document.getElementById('quoteThemeInfo');
    const reportMonthSelect = document.getElementById('reportMonth');
    const reportYearSelect = document.getElementById('reportYear');
    const downloadReportBtn = document.getElementById('downloadReportBtn');
    const alertModal = document.getElementById('alertModal');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');
    const closeAlertBtn = document.getElementById('closeAlertBtn');

    // Elementos do Carrossel
    const featuredSection = document.getElementById('featured-section');
    const featuredContainer = document.getElementById('featured-container');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    let editingThemeId = null;
    let currentRentalData = {};
    let currentQuoteData = {};
    let carouselIndex = 0;

    // --- SETUP INICIAL ---
    function initialize() {
        populateDateSelectors();

        auth.onAuthStateChanged(user => {
            currentUser = user;
            updateUIBasedOnAuthState(user);
            fetchThemes();
        });

        // Listeners de navegação
        [homeLink, mobileHomeLink].forEach(el => el.addEventListener('click', (e) => showScreen(e, 'catalog')));
        [reportsLink, mobileReportsLink].forEach(el => el.addEventListener('click', (e) => showScreen(e, 'reports')));
        [rentalsLink, mobileRentalsLink].forEach(el => el.addEventListener('click', (e) => showScreen(e, 'rentals')));
        [loginLink, mobileLoginLink].forEach(el => el.addEventListener('click', (e) => showScreen(e, 'login')));
        [logoutBtn, mobileLogoutBtn].forEach(el => el.addEventListener('click', () => auth.signOut()));

        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const icons = mobileMenuBtn.querySelectorAll('svg');
            icons[0].classList.toggle('hidden');
            icons[1].classList.toggle('hidden');
        });

        // Listeners dos Filtros e Modais
        searchInput.addEventListener('input', () => updateView({ scrollToKits: true }));
        categoryFilter.addEventListener('change', () => updateView({ scrollToKits: true }));
        kitFilter.addEventListener('change', () => updateView({ scrollToKits: true }));

        clearFiltersBtn.addEventListener('click', () => {
            searchInput.value = '';
            categoryFilter.value = 'todas';
            kitFilter.value = 'todos';
            updateView();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        viewAllKitsBtn.addEventListener('click', () => {
            searchInput.value = '';
            categoryFilter.value = 'todas';
            kitFilter.value = 'todos';
            updateView({ scrollToKits: true, forceHideFeatured: true });
        });

        downloadReportBtn.addEventListener('click', downloadReport);
        closeAlertBtn.addEventListener('click', () => alertModal.classList.add('hidden'));
        closeFormModalBtn.addEventListener('click', () => formModal.classList.add('hidden'));

        // Listeners do Carrossel
        prevBtn.addEventListener('click', () => moveCarousel(-1));
        nextBtn.addEventListener('click', () => moveCarousel(1));
    }

    function populateDateSelectors() {
        const currentYear = new Date().getFullYear();
        const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        reportMonthSelect.innerHTML = '';
        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index + 1;
            option.textContent = month;
            reportMonthSelect.appendChild(option);
        });
        reportMonthSelect.value = new Date().getMonth() + 1;
        reportYearSelect.innerHTML = '';
        for (let year = currentYear; year >= 2023; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            reportYearSelect.appendChild(option);
        }
    }

    // --- LÓGICA DE NAVEGAÇÃO E UI ---
    function showScreen(e, screenName) {
        if (e) e.preventDefault();
        mainContent.classList.add('hidden');
        loginScreen.classList.add('hidden');
        reportsScreen.classList.add('hidden');
        rentalsScreen.classList.add('hidden');
        navLinks.forEach(link => link.classList.remove('active'));
        if (screenName === 'catalog') {
            mainContent.classList.remove('hidden');
            homeLink.classList.add('active');
            mobileHomeLink.classList.add('active');
        } else if (screenName === 'login') {
            loginScreen.classList.remove('hidden');
        } else if (screenName === 'reports') {
            reportsScreen.classList.remove('hidden');
            reportsLink.classList.add('active');
            mobileReportsLink.classList.add('active');
        } else if (screenName === 'rentals') {
            rentalsScreen.classList.remove('hidden');
            displayMonthlyRentals();
            rentalsLink.classList.add('active');
            mobileRentalsLink.classList.add('active');
        }
        mobileMenu.classList.add('hidden');
        const icons = mobileMenuBtn.querySelectorAll('svg');
        icons[0].classList.remove('hidden');
        icons[1].classList.add('hidden');
    }

    function updateUIBasedOnAuthState(user) {
        const isAdmin = !!user;
        loginLink.classList.toggle('hidden', isAdmin);
        mobileLoginLink.classList.toggle('hidden', isAdmin);
        logoutBtn.classList.toggle('hidden', !isAdmin);
        mobileLogoutBtn.classList.toggle('hidden', !isAdmin);
        reportsLink.classList.toggle('hidden', !isAdmin);
        mobileReportsLink.classList.toggle('hidden', !isAdmin);
        rentalsLink.classList.toggle('hidden', !isAdmin);
        mobileRentalsLink.classList.toggle('hidden', !isAdmin);
        adminControls.classList.toggle('hidden', !isAdmin);
        if (!isAdmin) {
            showScreen(null, 'catalog');
        }
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                showScreen(null, 'catalog');
            })
            .catch(error => {
                loginMessage.textContent = "Email ou senha inválidos.";
                console.error("Erro de login:", error);
            });
    });

    // --- LÓGICA PRINCIPAL (CRUD, FILTROS, ETC.) ---
    function fetchThemes() {
        loadingIndicator.classList.remove('hidden');
        catalogContainer.innerHTML = '';
        themesCollection.orderBy('name').onSnapshot(snapshot => {
            themes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            populateCategoryFilter();
            setupFeaturedCarousel();
            updateView();
            loadingIndicator.classList.add('hidden');
        }, error => {
            console.error("Erro ao buscar temas: ", error);
            loadingIndicator.textContent = "Erro ao carregar temas.";
        });
    }

    function populateCategoryFilter() {
        const categories = [...new Set(themes.map(theme => theme.category).filter(Boolean))].sort();
        const currentCategory = categoryFilter.value;
        categoryFilter.innerHTML = '<option value="todas">Todas as Categorias</option>';
        categoryList.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option.cloneNode(true));
            categoryList.appendChild(option);
        });
        categoryFilter.value = currentCategory;
    }

    function createThemeCard(theme, isFeatured = false) {
        const isRentedToday = isThemeRentedOnDate(theme, new Date().toISOString().split('T')[0]);

        const cardContent = document.createElement('div');
        cardContent.className = `theme-card bg-surface rounded-xl shadow-md overflow-hidden flex flex-col h-full`;

        let availableKitsHtml = (theme.kits || []).map(kit =>
            `<span class="kit-badge kit-badge-${kit.charAt(0).toLowerCase()}">${kit.charAt(0).toUpperCase()}</span>`
        ).join(' ');

        // A ESTRUTURA HTML (desktop vs mobile) é controlada via CSS, mas a estrutura base é esta:
        cardContent.innerHTML = `
            <div class="relative">
                <img src="${theme.coverImage || 'https://placehold.co/400x300/e2e8f0/adb5bd?text=Sem+Imagem'}" alt="Foto do tema ${theme.name}" class="w-full h-48 object-cover ${isRentedToday ? 'opacity-50' : ''}">
                ${isRentedToday ? '<div class="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center"><span class="text-texto-invertido font-bold text-lg">INDISPONÍVEL</span></div>' : ''}
            </div>
            <div class="p-4 flex flex-col flex-grow">
                <div class="desktop-card-header">
                     <h3 class="text-lg font-bold text-texto-principal flex-1 pr-2 min-w-0">${theme.name}</h3>
                     <div class="flex flex-shrink-0 gap-1">
                        ${availableKitsHtml}
                    </div>
                </div>
                <div class="mobile-card-header">
                    <h3 class="text-lg font-bold text-texto-principal min-w-0">${theme.name}</h3>
                    <p class="text-sm text-texto-secundario">${theme.category || 'Sem Categoria'}</p>
                    <div class="flex gap-2 mt-2">
                        ${availableKitsHtml}
                    </div>
                </div>
                <p class="desktop-card-category text-sm text-texto-secundario mb-4">${theme.category || 'Sem Categoria'}</p>
                <div class="mt-auto">
                    <button class="details-btn w-full btn-gradient btn-primaria text-texto-invertido font-bold py-2 px-4 rounded-lg" data-id="${theme.id}">
                        Ver detalhes
                    </button>
                </div>
            </div>
        `;
        cardContent.querySelector('.details-btn').addEventListener('click', () => openThemeModal(theme.id));

        if (isFeatured) {
            const wrapper = document.createElement('div');
            wrapper.className = 'flex-shrink-0 w-1/2 sm:w-1/3 lg:w-1/4 p-2';
            wrapper.appendChild(cardContent);
            return wrapper;
        }

        return cardContent;
    }

    function displayFilteredThemes() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeCategory = categoryFilter.value;
        const activeKit = kitFilter.value;
        let filteredThemes = themes;
        if (activeCategory !== 'todas') {
            filteredThemes = filteredThemes.filter(theme => theme.category === activeCategory);
        }
        if (activeKit !== 'todos') {
            filteredThemes = filteredThemes.filter(theme => theme.kits && theme.kits.includes(activeKit));
        }
        if (searchTerm) {
            filteredThemes = filteredThemes.filter(theme =>
                theme.name.toLowerCase().includes(searchTerm) ||
                (theme.category && theme.category.toLowerCase().includes(searchTerm))
            );
        }
        catalogContainer.innerHTML = '';
        if (filteredThemes.length === 0) {
            catalogContainer.innerHTML = `<p class="col-span-full text-center text-texto-secundario">Nenhum tema encontrado para os filtros selecionados.</p>`;
            return;
        }
        filteredThemes.forEach(theme => {
            catalogContainer.appendChild(createThemeCard(theme));
        });
    }

    function updateView(options = {}) {
        const { scrollToKits = false, forceHideFeatured = false } = options;
        const searchTerm = searchInput.value.toLowerCase();
        const activeCategory = categoryFilter.value;
        const activeKit = kitFilter.value;
        const isAnyFilterActive = searchTerm || activeCategory !== 'todas' || activeKit !== 'todos';
        const featuredThemes = themes.filter(theme => theme.featured);
        if (isAnyFilterActive || forceHideFeatured) {
            featuredSection.classList.add('hidden');
        } else {
            featuredSection.classList.toggle('hidden', featuredThemes.length === 0);
        }
        displayFilteredThemes();
        if (scrollToKits) {
            document.getElementById('all-kits-title').scrollIntoView({ behavior: 'smooth' });
        }
    }

    function displayMonthlyRentals() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const monthlyRentals = [];
        themes.forEach(theme => {
            (theme.rentals || []).forEach(rental => {
                const rentalStartDate = new Date(rental.startDate);
                if (rentalStartDate.getUTCFullYear() === currentYear && rentalStartDate.getUTCMonth() === currentMonth) {
                    monthlyRentals.push({ ...rental, themeName: theme.name });
                }
            });
        });
        monthlyRentals.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        if (monthlyRentals.length === 0) {
            monthlyRentalsContainer.innerHTML = '<p class="text-center text-texto-secundario">Nenhum item alugado para este mês.</p>';
            return;
        }
        monthlyRentalsContainer.innerHTML = monthlyRentals.map(rental => `
            <div class="bg-surface p-4 rounded-lg shadow-md flex justify-between items-center">
                <div>
                    <p class="font-bold text-texto-principal">${rental.themeName} (Kit ${rental.kit})</p>
                    <p class="text-sm text-texto-secundario">Cliente: ${rental.clientName || 'Não informado'}</p>
                </div>
                <div class="text-right">
                    <p class="font-semibold text-primaria">${new Date(rental.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                    <p class="text-sm text-texto-secundario">a ${new Date(rental.endDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                </div>
            </div>
        `).join('');
    }

    // --- LÓGICA DO CARROSSEL ---
    function setupFeaturedCarousel() {
        const featuredThemes = themes.filter(theme => theme.featured);
        featuredContainer.innerHTML = '';
        if (featuredThemes.length > 0) {
            featuredThemes.forEach(theme => {
                featuredContainer.appendChild(createThemeCard(theme, true));
            });
            featuredSection.classList.remove('hidden');
            updateCarousel();
        } else {
            featuredSection.classList.add('hidden');
        }
    }

    function getItemsPerPage() {
        if (window.innerWidth < 640) return 2;
        if (window.innerWidth < 1024) return 3;
        return 4;
    }

    function moveCarousel(direction) {
        const carouselItems = featuredContainer.children.length;
        if (carouselItems === 0) return;

        const itemsPerPage = getItemsPerPage();
        const maxIndex = Math.ceil(carouselItems / itemsPerPage) - 1;

        carouselIndex = Math.max(0, Math.min(carouselIndex + direction, maxIndex));
        updateCarousel();
    }

    function updateCarousel() {
        const itemsPerPage = getItemsPerPage();
        const percentageOffset = carouselIndex * (100 / itemsPerPage);
        featuredContainer.style.transform = `translateX(-${percentageOffset}%)`;
    }

    window.addEventListener('resize', () => {
        carouselIndex = 0;
        setupFeaturedCarousel();
    });

    addThemeBtn.addEventListener('click', () => {
        editingThemeId = null;
        formTitle.textContent = "Adicionar Novo Tema";
        addThemeForm.reset();
        formModal.classList.remove('hidden');
    });

    addThemeForm.addEventListener('submit', async e => {
        e.preventDefault();
        formMessage.textContent = "";
        const name = document.getElementById('themeName').value;
        const category = document.getElementById('themeCategory').value;
        const featured = document.getElementById('themeFeatured').checked;
        const coverImage = document.getElementById('themeCoverImage').value;
        const kits = Array.from(addThemeForm.querySelectorAll('input[name="kits"]:checked')).map(cb => cb.value);
        const images = {
            bronze: document.getElementById('themeImageBronze').value,
            prata: document.getElementById('themeImagePrata').value,
            ouro: document.getElementById('themeImageOuro').value,
        };
        if (kits.length === 0) {
            formMessage.textContent = "Selecione pelo menos um kit.";
            return;
        }
        const themeData = { name, category, coverImage, kits, images, featured };
        try {
            if (editingThemeId) {
                const themeRef = themesCollection.doc(editingThemeId);
                const doc = await themeRef.get();
                const existingRentals = doc.exists ? doc.data().rentals : [];
                themeData.rentals = existingRentals || [];
                await themeRef.update(themeData);
            } else {
                themeData.rentals = [];
                await themesCollection.add(themeData);
            }
            addThemeForm.reset();
            formModal.classList.add('hidden');
        } catch (error) {
            console.error("Erro ao salvar tema: ", error);
            formMessage.textContent = "Erro ao salvar. Tente novamente.";
        }
    });

    // --- LÓGICA DOS MODAIS E REGRAS DE ALUGUER ---
    function showAlert(message, title = 'Aviso') {
        alertTitle.textContent = title;
        alertMessage.textContent = message;
        alertModal.classList.remove('hidden');
    }

    function isThemeRentedOnDate(theme, checkStartDate, checkEndDate = null) {
        if (!theme.rentals || theme.rentals.length === 0) return false;
        const startCheck = new Date(checkStartDate + 'T00:00:00');
        const endCheck = checkEndDate ? new Date(checkEndDate + 'T00:00:00') : startCheck;
        return theme.rentals.some(rental => {
            const rentalStart = new Date(rental.startDate + 'T00:00:00');
            const rentalEnd = new Date(rental.endDate + 'T00:00:00');
            return startCheck <= rentalEnd && endCheck >= rentalStart;
        });
    }

    function openThemeModal(id) {
        const theme = themes.find(t => t.id === id);
        if (!theme) return;

        modalThemeName.textContent = theme.name;
        modalKitsContainer.innerHTML = '';
        modalScheduledDatesContainer.innerHTML = '';

        if (theme.rentals && theme.rentals.length > 0) {
            const rentalsSection = document.createElement('div');
            rentalsSection.className = 'pb-4 border-b text-center';
            let rentalsListHtml = '<h5 class="font-semibold mb-2 text-lg">Datas Agendadas</h5>';
            rentalsListHtml += '<ul class="list-none text-sm text-texto-secundario space-y-1">';
            theme.rentals.forEach((rental, index) => {
                const deleteButton = currentUser ?
                    `<button class="delete-rental-btn text-erro hover:text-red-700 font-bold ml-4" data-theme-id="${theme.id}" data-rental-index="${index}">Excluir</button>` : '';
                rentalsListHtml += `
                    <li class="flex justify-center items-center">
                        <span>
                            <b>${currentUser ? (rental.clientName || 'Cliente') + ` (Kit ${rental.kit})` : 'Indisponível'}:</b> 
                            ${new Date(rental.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} a ${new Date(rental.endDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </span>
                        ${deleteButton}
                    </li>
                `;
            });
            rentalsListHtml += '</ul>';
            rentalsSection.innerHTML = rentalsListHtml;
            modalScheduledDatesContainer.appendChild(rentalsSection);
        }

        (theme.kits || []).forEach(kit => {
            const kitImage = theme.images?.[kit] || 'https://placehold.co/400x300/e2e8f0/adb5bd?text=Sem+Imagem';
            const kitDiv = document.createElement('div');
            kitDiv.className = 'modal-kit-card';
            let actionButton;
            if (currentUser) {
                actionButton = `<button class="rent-btn modal-action-btn btn-gradient btn-primaria" data-theme-id="${theme.id}" data-kit="${kit}">Agendar</button>`;
            } else {
                const whatsappIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>`;
                actionButton = `<button class="quote-btn modal-action-btn btn-gradient btn-primaria" data-theme-id="${theme.id}" data-kit="${kit}">Solicitar Orçamento ${whatsappIcon}</button>`;
            }
            const kitName = kit.charAt(0).toUpperCase() + kit.slice(1);
            kitDiv.innerHTML = `
                <img src="${kitImage}" alt="Imagem do Kit ${kitName}" class="w-full object-cover rounded-lg shadow-md kit-image" data-src="${kitImage}">
                <p class="modal-kit-title mt-4">Pegue Monte - ${theme.name}</p>
                <span class="kit-tag kit-tag-${kit}">${kitName}</span>
                <p class="kit-price">${kitDetails[kit]?.price || ''}</p>
                <p class="kit-obs">Obs: Clique na imagem para ver ela completa.</p>
                ${actionButton}
            `;
            modalKitsContainer.appendChild(kitDiv);
        });

        if (currentUser) {
            const adminButtons = document.createElement('div');
            adminButtons.className = 'mt-6 pt-4 border-t flex flex-wrap gap-4 justify-center';
            adminButtons.innerHTML = `
                <button class="edit-btn btn-gradient btn-secundaria text-texto-principal" data-theme-id="${theme.id}">Editar Tema</button>
                <button class="delete-btn btn-gradient btn-erro" data-theme-id="${theme.id}">Excluir Tema</button>
            `;
            modalKitsContainer.appendChild(adminButtons);
        }

        themeModal.classList.remove('hidden');
        setTimeout(() => {
            themeModal.classList.remove('opacity-0');
            themeModal.querySelector('.modal-content').classList.remove('scale-95');
        }, 10);
    }

    closeModalBtn.addEventListener('click', () => {
        themeModal.classList.add('opacity-0');
        themeModal.querySelector('.modal-content').classList.add('scale-95');
        setTimeout(() => themeModal.classList.add('hidden'), 300);
    });

    modalKitsContainer.addEventListener('click', e => handleModalInteraction(e));
    modalScheduledDatesContainer.addEventListener('click', e => handleModalInteraction(e));

    function handleModalInteraction(e) {
        const targetButton = e.target.closest('button');
        if (e.target.classList.contains('kit-image')) {
            lightboxImage.src = e.target.dataset.src;
            imageModal.classList.remove('hidden');
            setTimeout(() => imageModal.classList.remove('opacity-0'), 10);
            return;
        }
        if (!targetButton) return;
        const dataset = targetButton.dataset;
        if (targetButton.classList.contains('edit-btn')) {
            const id = dataset.themeId;
            const theme = themes.find(t => t.id === id);
            editingThemeId = id;
            formTitle.textContent = "Editar Tema";
            addThemeForm.themeName.value = theme.name;
            addThemeForm.themeCategory.value = theme.category || '';
            addThemeForm.themeFeatured.checked = theme.featured || false;
            addThemeForm.themeCoverImage.value = theme.coverImage;
            addThemeForm.querySelectorAll('input[name="kits"]').forEach(cb => {
                cb.checked = (theme.kits || []).includes(cb.value);
            });
            addThemeForm.themeImageBronze.value = theme.images?.bronze || '';
            addThemeForm.themeImagePrata.value = theme.images?.prata || '';
            addThemeForm.themeImageOuro.value = theme.images?.ouro || '';
            formModal.classList.remove('hidden');
            closeModalBtn.click();
        }
        if (targetButton.classList.contains('delete-btn')) {
            const id = dataset.themeId;
            if (confirm('Tem a certeza que quer excluir este tema?')) {
                themesCollection.doc(id).delete();
                closeModalBtn.click();
            }
        }
        if (targetButton.classList.contains('rent-btn')) {
            currentRentalData.themeId = dataset.themeId;
            currentRentalData.kit = dataset.kit;
            const theme = themes.find(t => t.id === currentRentalData.themeId);
            rentalThemeInfo.textContent = `Agendar: ${theme.name} (Kit ${currentRentalData.kit})`;
            rentalModal.classList.remove('hidden');
        }
        if (targetButton.classList.contains('quote-btn')) {
            currentQuoteData.themeId = dataset.themeId;
            currentQuoteData.kit = dataset.kit;
            const theme = themes.find(t => t.id === currentQuoteData.themeId);
            quoteThemeInfo.textContent = `Orçamento: ${theme.name} (Kit ${currentQuoteData.kit})`;
            quoteModal.classList.remove('hidden');
        }
        if (targetButton.classList.contains('delete-rental-btn')) {
            const themeId = dataset.themeId;
            const rentalIndex = parseInt(dataset.rentalIndex, 10);
            if (confirm('Tem a certeza que quer excluir este agendamento?')) {
                deleteRental(themeId, rentalIndex);
            }
        }
    }

    closeImageModalBtn.addEventListener('click', () => {
        imageModal.classList.add('opacity-0');
        setTimeout(() => imageModal.classList.add('hidden'), 300);
    });

    closeRentalModalBtn.addEventListener('click', () => rentalModal.classList.add('hidden'));

    rentalForm.addEventListener('submit', async e => {
        e.preventDefault();
        const clientName = document.getElementById('rentalClientName').value;
        const clientPhone = document.getElementById('rentalClientPhone').value;
        const startDate = e.target.startDate.value;
        const endDate = e.target.endDate.value;
        if (startDate > endDate) {
            showAlert('A data de fim deve ser depois da data de início.', 'Data Inválida');
            return;
        }
        const themeRef = themesCollection.doc(currentRentalData.themeId);
        try {
            await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(themeRef);
                if (!doc.exists) throw "Tema não encontrado!";
                const themeData = doc.data();
                if (isThemeRentedOnDate(themeData, startDate, endDate)) {
                    showAlert('Este tema já está agendado para este período. Por favor, verifique as datas.', 'Conflito de Agendamento');
                    throw new Error("Conflito de agendamento!");
                }
                const rentals = themeData.rentals || [];
                rentals.push({
                    kit: currentRentalData.kit,
                    startDate,
                    endDate,
                    clientName,
                    clientPhone
                });
                transaction.update(themeRef, { rentals });
            });
            rentalModal.classList.add('hidden');
            rentalForm.reset();
            closeModalBtn.click();
        } catch (error) {
            console.error("Erro no agendamento: ", error);
            if (error.message !== "Conflito de agendamento!") {
                showAlert("Não foi possível agendar. Tente novamente.", "Erro");
            }
        }
    });

    closeQuoteModalBtn.addEventListener('click', () => quoteModal.classList.add('hidden'));

    quoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const clientName = document.getElementById('clientName').value;
        const clientPhone = document.getElementById('clientPhone').value;
        const eventDate = document.getElementById('eventDate').value;
        const theme = themes.find(t => t.id === currentQuoteData.themeId);
        if (isThemeRentedOnDate(theme, eventDate)) {
            showAlert(`O tema "${theme.name}" não está disponível para a data selecionada. Por favor, escolha outra data.`);
            return;
        }
        const kitImage = theme.images?.[currentQuoteData.kit] || theme.coverImage || '';
        const businessPhoneNumber = "5534988435876";
        const formattedDate = new Date(eventDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        const message = `Olá, meu nome é *${clientName}* e estou entrando em contato através do site *Pegue e Monte*.  \n\nGostaria de *solicitar um orçamento* para o tema *"${theme.name}" (Kit ${currentQuoteData.kit})*, com data prevista para *${formattedDate}*.  \n\nSegue meu contato para retorno: *${clientPhone}*.  \n\nVeja a foto do kit que escolhi: ${kitImage}  \n\nAguardo seu retorno com as informações completas do orçamento e formas de pagamento.  \nMuito obrigado pela atenção!`;
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${businessPhoneNumber}&text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        quotesCollection.add({
            clientName,
            clientPhone,
            eventDate,
            themeName: theme.name,
            kit: currentQuoteData.kit,
            kitImage: kitImage,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pendente'
        }).catch(error => {
            console.error("Erro ao salvar solicitação em segundo plano:", error);
        });
        quoteModal.classList.add('hidden');
        quoteForm.reset();
        closeModalBtn.click();
    });

    async function downloadReport() {
        const year = parseInt(reportYearSelect.value, 10);
        const month = parseInt(reportMonthSelect.value, 10);
        const reportRentals = [];
        themes.forEach(theme => {
            if (theme.rentals && theme.rentals.length > 0) {
                theme.rentals.forEach(rental => {
                    const rentalStartDate = new Date(rental.startDate);
                    if (rentalStartDate.getUTCFullYear() === year && rentalStartDate.getUTCMonth() + 1 === month) {
                        reportRentals.push({ ...rental, themeName: theme.name });
                    }
                });
            }
        });
        if (reportRentals.length === 0) {
            showAlert('Nenhum agendamento encontrado para este mês.');
            return;
        }
        reportRentals.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Nome do Cliente,Telefone,Tema,Kit,Data de Inicio,Data de Fim\r\n";
        reportRentals.forEach(rental => {
            const row = [
                `"${rental.clientName || ''}"`,
                `"${rental.clientPhone || ''}"`,
                `"${rental.themeName}"`,
                `"${rental.kit}"`,
                `"${new Date(rental.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}"`,
                `"${new Date(rental.endDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}"`
            ].join(',');
            csvContent += row + "\r\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `relatorio_agendamentos_${year}_${month}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async function deleteRental(themeId, rentalIndex) {
        const themeRef = themesCollection.doc(themeId);
        try {
            await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(themeRef);
                if (!doc.exists) throw "Tema não encontrado!";
                const rentals = doc.data().rentals || [];
                rentals.splice(rentalIndex, 1);
                transaction.update(themeRef, { rentals });
            });
            closeModalBtn.click();
            const theme = themes.find(t => t.id === themeId);
            if (theme) openThemeModal(theme.id);
        } catch (error) {
            console.error("Erro ao excluir agendamento:", error);
            showAlert("Não foi possível excluir o agendamento. Tente novamente.", "Erro");
        }
    }

    // Inicializa a aplicação
    initialize();
});

