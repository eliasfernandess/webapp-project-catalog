// --- SCRIPT ATUALIZADO PARA SUPORTAR MÚLTIPLAS PÁGINAS ---

document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURAÇÃO DO FIREBASE ---
    const firebaseConfig = {
        apiKey: "AIzaSyB9rM4TwAhSPU_e96W0xqg1IDYENFup5i8",
        authDomain: "catalogo-de-festas.firebaseapp.com",
        projectId: "catalogo-de-festas",
        storageBucket: "catalogo-de-festas.appspot.com",
        messagingSenderId: "652648205775",
        appId: "1:652648205775:web:9837a525048bb819a096ba"
    };

    // --- INICIALIZAÇÃO DO FIREBASE ---
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();
    const themesCollection = db.collection('themes');
    const quotesCollection = db.collection('solicitacoes');

    // --- VARIÁVEIS GLOBAIS ---
    let themes = [];
    let currentUser = null;
    let currentQuoteData = {};

    const kitDetails = {
        bronze: { price: 'R$ 150,00', color: 'bg-red-500' },
        prata: { price: 'R$ 250,00', color: 'bg-gray-400' },
        ouro: { price: 'R$ 300,00', color: 'bg-yellow-500' }
    };

    const kitBadgeColors = {
        bronze: { bg: 'bg-black', text: 'text-white' },
        prata: { bg: 'bg-yellow-400', text: 'text-black' },
        ouro: { bg: 'bg-orange-400', text: 'text-white' }
    };

    // --- ROTEAMENTO DE PÁGINA ---
    // Verifica qual página está carregada e chama a função de inicialização correspondente.
    if (document.getElementById('theme-catalog')) {
        initCatalogPage();
    } else if (document.getElementById('product-details-container')) {
        initDetailsPage();
    }

    // --- LÓGICA DA PÁGINA DE CATÁLOGO (index.html) ---
    function initCatalogPage() {
        // --- ELEMENTOS DA PÁGINA DO CATÁLOGO ---
        const loginLink = document.getElementById('loginLink');
        const adminPanelLink = document.getElementById('adminPanelLink');
        const logoutBtn = document.getElementById('logoutBtn');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileLoginLink = document.getElementById('mobileLoginLink');
        const mobileAdminPanelLink = document.getElementById('mobileAdminPanelLink');
        const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
        const adminControls = document.getElementById('adminControls');
        const catalogContainer = document.getElementById('theme-catalog');
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const filterButtonsContainer = document.getElementById('filterButtons');
        const loadingIndicator = document.getElementById('loadingIndicator');
        const loginForm = document.getElementById('loginForm'); // Supondo que a tela de login possa aparecer

        // Inicializa a autenticação e busca os temas
        auth.onAuthStateChanged(user => {
            currentUser = user;
            updateUIBasedOnAuthState(user);
            fetchThemes();
        });

        // Listeners de eventos
        mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
        categoryFilter.addEventListener('change', filterAndSearch);
        searchInput.addEventListener('keyup', filterAndSearch);
        filterButtonsContainer.addEventListener('click', e => {
            if (e.target.tagName === 'BUTTON') {
                filterButtonsContainer.querySelector('.active-filter').classList.remove('active-filter', 'bg-yellow-400', 'text-purple-700');
                e.target.classList.add('active-filter', 'bg-yellow-400', 'text-purple-700');
                filterAndSearch();
            }
        });

        function updateUIBasedOnAuthState(user) {
            const isAdmin = !!user;
            loginLink?.classList.toggle('hidden', isAdmin);
            adminPanelLink?.classList.toggle('hidden', !isAdmin);
            logoutBtn?.classList.toggle('hidden', !isAdmin);
            mobileLoginLink?.classList.toggle('hidden', isAdmin);
            mobileAdminPanelLink?.classList.toggle('hidden', !isAdmin);
            mobileLogoutBtn?.classList.toggle('hidden', !isAdmin);
            adminControls?.classList.toggle('hidden', !isAdmin);

            // Adiciona listener de logout
            [logoutBtn, mobileLogoutBtn].forEach(el => {
                if (el) el.addEventListener('click', () => auth.signOut());
            });
        }

        function fetchThemes() {
            loadingIndicator.classList.remove('hidden');
            catalogContainer.innerHTML = '';

            themesCollection.orderBy('name').onSnapshot(snapshot => {
                themes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                populateCategoryFilter();
                filterAndSearch();
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
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
            categoryFilter.value = currentCategory;
        }

        function displayThemes(themesToDisplay) {
            catalogContainer.innerHTML = '';
            if (themesToDisplay.length === 0) {
                catalogContainer.innerHTML = `<p class="col-span-full text-center text-texto-secundario">Nenhum tema encontrado.</p>`;
                return;
            }

            themesToDisplay.forEach(theme => {
                const card = document.createElement('div');
                card.className = "bg-white shadow-md rounded-xl overflow-hidden";

                const availableKitsHtml = (theme.kits || [])
                    .map(kit => `<span class="px-2 py-1 ${kitBadgeColors[kit]?.bg || 'bg-gray-500'} ${kitBadgeColors[kit]?.text || 'text-white'} text-xs rounded">${kit.charAt(0).toUpperCase()}</span>`)
                    .join('');

                card.innerHTML = `
                    <img src="${theme.coverImage || 'https://placehold.co/400x300/e2e8f0/adb5bd?text=Sem+Imagem'}" alt="${theme.name}" class="w-full h-32 object-cover">
                    <div class="p-3">
                        <h3 class="font-semibold text-gray-800 truncate">${theme.name}</h3>
                        <p class="text-xs text-gray-500">${theme.category || 'Sem Categoria'}</p>
                        <div class="flex gap-2 my-2 h-6 items-center">
                            ${availableKitsHtml}
                        </div>
                        <a href="detalhes.html?id=${theme.id}" class="block text-center w-full bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-medium py-2 rounded-lg text-sm">
                            Ver detalhes
                        </a>
                    </div>
                `;
                catalogContainer.appendChild(card);
            });
        }

        function filterAndSearch() {
            const searchTerm = searchInput.value.toLowerCase();
            const activeCategory = categoryFilter.value;
            const activeKit = filterButtonsContainer.querySelector('.active-filter').dataset.kit;

            let filteredThemes = themes;

            if (activeCategory !== 'todas') {
                filteredThemes = filteredThemes.filter(t => t.category === activeCategory);
            }
            if (activeKit !== 'todos') {
                filteredThemes = filteredThemes.filter(t => t.kits && t.kits.includes(activeKit));
            }
            if (searchTerm) {
                filteredThemes = filteredThemes.filter(t =>
                    t.name.toLowerCase().includes(searchTerm) ||
                    (t.category && t.category.toLowerCase().includes(searchTerm))
                );
            }
            displayThemes(filteredThemes);
        }
    }

    // --- LÓGICA DA PÁGINA DE DETALHES (detalhes.html) ---
    function initDetailsPage() {
        const themeId = new URLSearchParams(window.location.search).get('id');
        if (!themeId) {
            window.location.href = 'index.html';
            return;
        }

        const headerThemeName = document.getElementById('header-theme-name');
        const themeImage = document.getElementById('theme-image');
        const themeName = document.getElementById('theme-name');
        const kitsContainer = document.getElementById('kits-container');

        let currentTheme = null;

        themesCollection.doc(themeId).get().then(doc => {
            if (!doc.exists) {
                themeName.textContent = "Tema não encontrado.";
                return;
            }
            currentTheme = { id: doc.id, ...doc.data() };

            // Popula as informações do tema na página
            headerThemeName.textContent = currentTheme.name;
            themeImage.src = currentTheme.coverImage || 'https://placehold.co/600x400/e2e8f0/adb5bd?text=Sem+Imagem';
            themeName.textContent = `Pegue e Monte - ${currentTheme.name}`;

            // Cria os cards para cada kit disponível
            kitsContainer.innerHTML = '';
            if (!currentTheme.kits || currentTheme.kits.length === 0) {
                kitsContainer.innerHTML = '<p class="text-texto-secundario">Nenhum kit disponível para este tema.</p>';
                return;
            }

            currentTheme.kits.forEach(kit => {
                const kitData = kitDetails[kit];
                if (!kitData) return;

                const kitCard = document.createElement('div');
                kitCard.className = "bg-white shadow-md rounded-xl p-4";
                kitCard.innerHTML = `
                    <span class="${kitData.color} text-white text-xs px-2 py-1 rounded capitalize">${kit}</span>
                    <p class="text-lg font-bold text-pink-600 mt-2">${kitData.price}</p>
                    <button data-kit="${kit}" class="quote-btn mt-3 w-full bg-fuchsia-500 hover:bg-fuchsia-600 text-white py-2 rounded-lg">
                        Solicitar Orçamento
                    </button>
                `;
                kitsContainer.appendChild(kitCard);
            });
        }).catch(error => {
            console.error("Erro ao buscar detalhes do tema:", error);
            themeName.textContent = "Erro ao carregar o tema.";
        });

        // Adiciona listener para os botões de orçamento
        kitsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('quote-btn')) {
                const kit = e.target.dataset.kit;
                currentQuoteData = { theme: currentTheme, kit: kit };

                const quoteThemeInfo = document.getElementById('quoteThemeInfo');
                const quoteModal = document.getElementById('quoteModal');

                quoteThemeInfo.textContent = `Orçamento: ${currentTheme.name} (Kit ${kit})`;
                quoteModal.classList.remove('hidden');
            }
        });

        // Inicializa os modais nesta página também
        initModals(() => currentTheme); // Passa uma função para obter o tema atual
    }

    // --- LÓGICA COMPARTILHADA (MODAIS, ETC.) ---
    function initModals(getThemeCallback) {
        const alertModal = document.getElementById('alertModal');
        const closeAlertBtn = document.getElementById('closeAlertBtn');
        const quoteModal = document.getElementById('quoteModal');
        const closeQuoteModalBtn = document.getElementById('closeQuoteModalBtn');
        const quoteForm = document.getElementById('quoteForm');

        closeAlertBtn?.addEventListener('click', () => alertModal.classList.add('hidden'));

        closeQuoteModalBtn?.addEventListener('click', () => quoteModal.classList.add('hidden'));

        quoteForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            const clientName = document.getElementById('clientName').value;
            const clientPhone = document.getElementById('clientPhone').value;
            const eventDate = document.getElementById('eventDate').value;

            const theme = getThemeCallback ? getThemeCallback() : currentQuoteData.theme;
            const kit = currentQuoteData.kit;

            if (!theme || !kit) {
                showAlert("Ocorreu um erro. Tente novamente.", "Erro");
                return;
            }

            const kitImage = theme.images?.[kit] || theme.coverImage || '';
            const businessPhoneNumber = "5534988435876";
            const formattedDate = new Date(eventDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

            const message = `Olá, meu nome é *${clientName}* e gostaria de solicitar um orçamento para o tema *"${theme.name}" (Kit ${kit})*, para o dia *${formattedDate}*. Meu contato é *${clientPhone}*. Imagem de referência: ${kitImage}`;
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${businessPhoneNumber}&text=${encodeURIComponent(message)}`;

            window.open(whatsappUrl, '_blank');

            // Salva a solicitação no Firestore
            quotesCollection.add({
                clientName, clientPhone, eventDate,
                themeName: theme.name, kit: kit, kitImage: kitImage,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pendente'
            });

            quoteModal.classList.add('hidden');
            quoteForm.reset();
        });
    }

    function showAlert(message, title = 'Aviso') {
        const alertModal = document.getElementById('alertModal');
        const alertTitle = document.getElementById('alertTitle');
        const alertMessage = document.getElementById('alertMessage');
        alertTitle.textContent = title;
        alertMessage.textContent = message;
        alertModal.classList.remove('hidden');
    }
});

