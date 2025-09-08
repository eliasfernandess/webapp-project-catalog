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
        bronze: { price: 'R$ 150,00', class: 'bg-orange-300 text-orange-900' },
        prata: { price: 'R$ 250,00', class: 'bg-gray-300 text-gray-800' },
        ouro: { price: 'R$ 300,00', class: 'bg-yellow-400 text-yellow-900' }
    };

    // --- ELEMENTOS DA PÁGINA ---
    const loginScreen = document.getElementById('loginScreen');
    const mainContent = document.getElementById('mainContent');
    const homeLink = document.getElementById('homeLink');
    const loginLink = document.getElementById('loginLink');
    const adminPanelLink = document.getElementById('adminPanelLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileHomeLink = document.getElementById('mobileHomeLink');
    const mobileLoginLink = document.getElementById('mobileLoginLink');
    const mobileAdminPanelLink = document.getElementById('mobileAdminPanelLink');
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
    const resetKitsBtn = document.getElementById('resetKitsBtn');
    const addThemeFormContainer = document.getElementById('addThemeFormContainer');
    const addThemeForm = document.getElementById('addThemeForm');
    const formTitle = document.getElementById('formTitle');
    const formMessage = document.getElementById('formMessage');
    const categoryList = document.getElementById('categoryList');
    const themeModal = document.getElementById('themeModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalThemeName = document.getElementById('modalThemeName');
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

    let editingThemeId = null;
    let currentRentalData = {};
    let currentQuoteData = {};

    // --- SETUP INICIAL ---
    function initialize() {
        populateDateSelectors();

        auth.onAuthStateChanged(user => {
            currentUser = user;
            updateUIBasedOnAuthState(user);
            fetchThemes();
        });

        // Listeners de navegação e filtros
        [loginLink, mobileLoginLink].forEach(el => el.addEventListener('click', showLoginScreen));
        [homeLink, mobileHomeLink, adminPanelLink, mobileAdminPanelLink].forEach(el => el.addEventListener('click', showCatalog));
        [logoutBtn, mobileLogoutBtn].forEach(el => el.addEventListener('click', () => auth.signOut()));
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenuBtn.querySelectorAll('svg').forEach(icon => icon.classList.toggle('hidden'));
        });
        searchInput.addEventListener('input', filterAndSearch);
        categoryFilter.addEventListener('change', filterAndSearch);
        kitFilter.addEventListener('change', filterAndSearch);
        clearFiltersBtn.addEventListener('click', () => {
            searchInput.value = '';
            categoryFilter.value = 'todas';
            kitFilter.value = 'todos';
            filterAndSearch();
        });
        resetKitsBtn.addEventListener('click', () => {
            kitFilter.value = 'todos';
            filterAndSearch();
        });
        downloadReportBtn.addEventListener('click', downloadReport);
        closeAlertBtn.addEventListener('click', () => alertModal.classList.add('hidden'));
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
    function updateUIBasedOnAuthState(user) {
        const isAdmin = !!user;
        loginLink.classList.toggle('hidden', isAdmin);
        adminPanelLink.classList.toggle('hidden', !isAdmin);
        logoutBtn.classList.toggle('hidden', !isAdmin);
        mobileLoginLink.classList.toggle('hidden', isAdmin);
        mobileAdminPanelLink.classList.toggle('hidden', !isAdmin);
        mobileLogoutBtn.classList.toggle('hidden', !isAdmin);
        adminControls.classList.toggle('hidden', !isAdmin);
        showCatalog();
    }

    function showLoginScreen(e) {
        if (e) e.preventDefault();
        mainContent.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        mobileMenu.classList.add('hidden');
    }

    function showCatalog(e) {
        if (e) e.preventDefault();
        loginScreen.classList.add('hidden');
        mainContent.classList.remove('hidden');
        mobileMenu.classList.add('hidden');
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        auth.signInWithEmailAndPassword(email, password)
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

    function displayThemes(themesToDisplay) {
        catalogContainer.innerHTML = '';
        if (themesToDisplay.length === 0 && !loadingIndicator.classList.contains('hidden')) {
            catalogContainer.innerHTML = `<p class="col-span-full text-center text-texto-secundario">Nenhum tema encontrado para os filtros selecionados.</p>`;
            return;
        }
        themesToDisplay.forEach(theme => {
            const isRentedToday = isThemeRentedOnDate(theme, new Date().toISOString().split('T')[0]);
            const card = document.createElement('div');
            card.className = `theme-card bg-surface rounded-xl shadow-md overflow-hidden flex flex-col`;

            let availableKitsHtml = (theme.kits || []).map(kit =>
                `<span class="kit-badge kit-badge-${kit.charAt(0).toLowerCase()}">${kit.charAt(0).toUpperCase()}</span>`
            ).join(' ');

            card.innerHTML = `
                <div class="relative">
                    <img src="${theme.coverImage || 'https://placehold.co/400x300/e2e8f0/adb5bd?text=Sem+Imagem'}" alt="Foto do tema ${theme.name}" class="w-full h-48 object-cover ${isRentedToday ? 'opacity-50' : ''}">
                    ${isRentedToday ? '<div class="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center"><span class="text-texto-invertido font-bold text-lg">INDISPONÍVEL</span></div>' : ''}
                </div>
                <div class="p-4 flex flex-col flex-grow">
                    <div class="flex justify-between items-start">
                         <h3 class="text-lg font-bold text-texto-principal flex-1 pr-2">${theme.name}</h3>
                         <div class="flex flex-shrink-0 gap-2">
                            ${availableKitsHtml}
                        </div>
                    </div>
                    <p class="text-sm text-texto-secundario mb-4">${theme.category || 'Sem Categoria'}</p>
                    <div class="mt-auto">
                        <button class="details-btn w-full bg-primaria text-texto-invertido font-bold py-2 px-4 rounded-lg hover:bg-primaria-escura transition" data-id="${theme.id}">
                            Ver detalhes
                        </button>
                    </div>
                </div>
            `;
            card.querySelector('.details-btn').addEventListener('click', () => openThemeModal(theme.id));
            catalogContainer.appendChild(card);
        });
    }

    function filterAndSearch() {
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
        displayThemes(filteredThemes);
    }

    addThemeBtn.addEventListener('click', () => {
        editingThemeId = null;
        formTitle.textContent = "Adicionar Novo Tema";
        addThemeForm.reset();
        addThemeFormContainer.classList.toggle('hidden');
    });

    addThemeForm.addEventListener('submit', async e => {
        e.preventDefault();
        formMessage.textContent = "";
        const name = document.getElementById('themeName').value;
        const category = document.getElementById('themeCategory').value;
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
        const themeData = { name, category, coverImage, kits, images };
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
            addThemeFormContainer.classList.add('hidden');
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

        (theme.kits || []).forEach(kit => {
            const kitImage = theme.images?.[kit] || 'https://placehold.co/400x300/e2e8f0/adb5bd?text=Sem+Imagem';
            const kitDiv = document.createElement('div');
            kitDiv.className = 'modal-kit-card';

            let actionButton;
            if (currentUser) {
                actionButton = `
                    <button class="rent-btn modal-action-btn bg-primaria text-texto-invertido hover:bg-primaria-escura" data-theme-id="${theme.id}" data-kit="${kit}">
                        Agendar
                    </button>`;
            } else {
                const whatsappIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>`;
                actionButton = `
                    <button class="quote-btn modal-action-btn bg-primaria text-texto-invertido hover:bg-primaria-escura" data-theme-id="${theme.id}" data-kit="${kit}">
                        Solicitar Orçamento ${whatsappIcon}
                    </button>`;
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

        // Manter botões de admin e lista de agendamentos
        if (currentUser) {
            const adminSection = document.createElement('div');
            adminSection.className = 'mt-6 pt-4 border-t';

            const adminButtons = `
                <div class="flex flex-wrap gap-4 justify-center">
                    <button class="edit-btn bg-secundaria hover:bg-amber-500 text-texto-principal font-bold px-4 py-2 rounded-lg" data-theme-id="${theme.id}">Editar Tema</button>
                    <button class="delete-btn bg-erro hover:bg-red-600 text-texto-invertido px-4 py-2 rounded-lg" data-theme-id="${theme.id}">Excluir Tema</button>
                </div>
            `;

            let rentalsListHtml = '';
            if (theme.rentals && theme.rentals.length > 0) {
                rentalsListHtml += '<h5 class="font-semibold mb-2 mt-6 text-lg text-center">Agendamentos do Tema:</h5>';
                rentalsListHtml += '<ul class="list-disc list-inside text-sm text-texto-secundario space-y-2">';
                theme.rentals.forEach((rental, index) => {
                    rentalsListHtml += `
                        <li class="flex justify-between items-center">
                            <span>
                                <b>${rental.clientName || 'Cliente'}</b> (Kit ${rental.kit}): 
                                ${new Date(rental.startDate).toLocaleDateString()} a ${new Date(rental.endDate).toLocaleDateString()}
                            </span>
                            <button class="delete-rental-btn text-erro hover:text-red-700 font-bold" data-theme-id="${theme.id}" data-rental-index="${index}">
                                Excluir
                            </button>
                        </li>
                    `;
                });
                rentalsListHtml += '</ul>';
            }

            adminSection.innerHTML = adminButtons + rentalsListHtml;
            modalKitsContainer.appendChild(adminSection);
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

    modalKitsContainer.addEventListener('click', e => {
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
            addThemeForm.themeCoverImage.value = theme.coverImage;
            addThemeForm.querySelectorAll('input[name="kits"]').forEach(cb => {
                cb.checked = (theme.kits || []).includes(cb.value);
            });
            addThemeForm.themeImageBronze.value = theme.images?.bronze || '';
            addThemeForm.themeImagePrata.value = theme.images?.prata || '';
            addThemeForm.themeImageOuro.value = theme.images?.ouro || '';
            addThemeFormContainer.classList.remove('hidden');
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
    });

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
                    throw "Conflito de agendamento!";
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
            if (error !== "Conflito de agendamento!") {
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

