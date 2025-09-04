// --- JAVASCRIPT COM NOVA NAVEGAÇÃO, CATEGORIAS, BLOQUEIO DE TEMA E RELATÓRIOS ---

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

    // Elementos do Cabeçalho (Desktop)
    const homeLink = document.getElementById('homeLink');
    const loginLink = document.getElementById('loginLink');
    const adminPanelLink = document.getElementById('adminPanelLink');
    const logoutBtn = document.getElementById('logoutBtn');

    // Elementos do Cabeçalho (Mobile)
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
    const categoryFilter = document.getElementById('categoryFilter');
    const filterButtonsContainer = document.getElementById('filterButtons');
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

        [loginLink, mobileLoginLink].forEach(el => el.addEventListener('click', showLoginScreen));
        [homeLink, mobileHomeLink, adminPanelLink, mobileAdminPanelLink].forEach(el => el.addEventListener('click', showCatalog));
        [logoutBtn, mobileLogoutBtn].forEach(el => el.addEventListener('click', () => auth.signOut()));

        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenuBtn.querySelectorAll('svg').forEach(icon => icon.classList.toggle('hidden'));
        });

        downloadReportBtn.addEventListener('click', downloadReport);
        categoryFilter.addEventListener('change', filterAndSearch);
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
        if (user) {
            loginLink.classList.add('hidden');
            adminPanelLink.classList.remove('hidden');
            logoutBtn.classList.remove('hidden');
            mobileLoginLink.classList.add('hidden');
            mobileAdminPanelLink.classList.remove('hidden');
            mobileLogoutBtn.classList.remove('hidden');
            adminControls.classList.remove('hidden');
        } else {
            loginLink.classList.remove('hidden');
            adminPanelLink.classList.add('hidden');
            logoutBtn.classList.add('hidden');
            mobileLoginLink.classList.remove('hidden');
            mobileAdminPanelLink.classList.add('hidden');
            mobileLogoutBtn.classList.add('hidden');
            adminControls.classList.add('hidden');
        }
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
        const categories = [...new Set(themes.map(theme => theme.category).filter(Boolean))];
        categories.sort();

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
            catalogContainer.innerHTML = `<p class="col-span-full text-center text-gray-500">Nenhum tema encontrado para os filtros selecionados.</p>`;
        }

        themesToDisplay.forEach(theme => {
            const isRentedToday = isThemeRentedOnDate(theme, new Date().toISOString().split('T')[0]);

            const card = document.createElement('div');
            card.className = `theme-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group`;
            card.dataset.id = theme.id;

            let availableKitsHtml = (theme.kits || []).map(kit =>
                `<span class="text-xs font-semibold px-2 py-1 rounded-full ${kitDetails[kit]?.class || ''}">${kit.charAt(0).toUpperCase() + kit.slice(1)}</span>`
            ).join(' ');

            card.innerHTML = `
                <div class="relative">
                    <img src="${theme.coverImage || 'https://placehold.co/400x300/e2e8f0/adb5bd?text=Sem+Imagem'}" alt="Foto do tema ${theme.name}" class="w-full h-48 object-cover ${isRentedToday ? 'opacity-50' : ''}">
                    ${isRentedToday ? '<div class="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center"><span class="text-white font-bold text-lg">INDISPONÍVEL</span></div>' : ''}
                </div>
                <div class="p-4">
                    <h3 class="text-lg font-bold truncate">${theme.name}</h3>
                    <p class="text-sm text-gray-500 mb-2">${theme.category || 'Sem Categoria'}</p>
                    <div class="flex flex-wrap gap-2 mt-2">
                        ${availableKitsHtml}
                    </div>
                </div>
            `;
            card.addEventListener('click', () => openThemeModal(theme.id));
            catalogContainer.appendChild(card);
        });
    }

    function filterAndSearch() {
        const activeCategory = categoryFilter.value;
        const activeKit = document.querySelector('.active-filter').dataset.kit;

        let filteredThemes = themes;

        if (activeCategory !== 'todas') {
            filteredThemes = filteredThemes.filter(theme => theme.category === activeCategory);
        }

        if (activeKit !== 'todos') {
            filteredThemes = filteredThemes.filter(theme => theme.kits && theme.kits.includes(activeKit));
        }

        displayThemes(filteredThemes);
    }

    filterButtonsContainer.addEventListener('click', e => {
        if (e.target.tagName === 'BUTTON') {
            document.querySelector('.active-filter').classList.remove('active-filter', 'ring-2', 'ring-blue-500');
            e.target.classList.add('active-filter', 'ring-2', 'ring-blue-500');
            filterAndSearch();
        }
    });

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
            const kitDiv = document.createElement('div');
            kitDiv.className = 'mb-6 p-4 border rounded-lg';
            const kitImage = theme.images?.[kit] || 'https://placehold.co/600x400/e2e8f0/adb5bd?text=Sem+Imagem';

            let actionButtonHtml = '';
            if (currentUser) {
                actionButtonHtml = `<button class="rent-btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg" data-theme-id="${theme.id}" data-kit="${kit}">Agendar</button>`;
            } else {
                actionButtonHtml = `<button class="quote-btn whatsapp-btn flex items-center gap-2 bg-green-500 text-white font-bold px-6 py-2 rounded-lg" data-theme-id="${theme.id}" data-kit="${kit}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-whatsapp" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
                    Solicitar Orçamento
                </button>`;
            }

            kitDiv.innerHTML = `
                <div class="flex flex-col md:flex-row gap-6">
                    <img src="${kitImage}" alt="Imagem do Kit ${kit}" class="w-full md:w-1/3 rounded-lg shadow-md kit-image" data-src="${kitImage}">
                    <div class="flex-grow">
                        <h4 class="text-2xl font-bold capitalize ${kitDetails[kit]?.class} inline-block px-3 py-1 rounded-md">${kit} - ${kitDetails[kit]?.price}</h4>
                        <div class="mt-6 flex flex-wrap gap-4">
                            ${actionButtonHtml}
                            ${currentUser ? `
                                <button class="edit-btn bg-yellow-500 text-white px-4 py-2 rounded-lg" data-theme-id="${theme.id}">Editar Tema</button>
                                <button class="delete-btn bg-red-500 text-white px-4 py-2 rounded-lg" data-theme-id="${theme.id}">Excluir Tema</button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            modalKitsContainer.appendChild(kitDiv);
        });

        if (currentUser && theme.rentals && theme.rentals.length > 0) {
            const rentalsTitle = document.createElement('h5');
            rentalsTitle.className = 'font-semibold mb-2 mt-6 text-xl';
            rentalsTitle.textContent = 'Agendamentos do Tema:';
            modalKitsContainer.appendChild(rentalsTitle);

            const rentalsList = document.createElement('ul');
            rentalsList.className = 'list-disc list-inside text-sm text-gray-600 space-y-2';
            theme.rentals.forEach((rental, index) => {
                const listItem = document.createElement('li');
                listItem.className = 'flex justify-between items-center';
                listItem.innerHTML = `
                    <span>
                        <b>${rental.clientName || 'Cliente'}</b> (Kit ${rental.kit}): 
                        ${new Date(rental.startDate).toLocaleDateString()} a ${new Date(rental.endDate).toLocaleDateString()}
                    </span>
                    <button class="delete-rental-btn text-red-500 hover:text-red-700 font-bold" data-theme-id="${theme.id}" data-rental-index="${index}">
                        Excluir
                    </button>
                `;
                rentalsList.appendChild(listItem);
            });
            modalKitsContainer.appendChild(rentalsList);
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
        const target = e.target;
        const dataset = target.dataset;

        if (target.classList.contains('kit-image')) {
            lightboxImage.src = dataset.src;
            imageModal.classList.remove('hidden');
            setTimeout(() => imageModal.classList.remove('opacity-0'), 10);
        }
        if (target.classList.contains('edit-btn')) {
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
        if (target.classList.contains('delete-btn')) {
            const id = dataset.themeId;
            if (confirm('Tem a certeza que quer excluir este tema?')) {
                themesCollection.doc(id).delete();
                closeModalBtn.click();
            }
        }
        if (target.classList.contains('rent-btn')) {
            currentRentalData.themeId = dataset.themeId;
            currentRentalData.kit = dataset.kit;
            const theme = themes.find(t => t.id === currentRentalData.themeId);
            rentalThemeInfo.textContent = `Agendar: ${theme.name} (Kit ${currentRentalData.kit})`;
            rentalModal.classList.remove('hidden');
        }
        if (target.closest('.quote-btn')) {
            const button = target.closest('.quote-btn');
            currentQuoteData.themeId = button.dataset.themeId;
            currentQuoteData.kit = button.dataset.kit;
            const theme = themes.find(t => t.id === currentQuoteData.themeId);
            quoteThemeInfo.textContent = `Orçamento: ${theme.name} (Kit ${currentQuoteData.kit})`;
            quoteModal.classList.remove('hidden');
        }
        if (target.classList.contains('delete-rental-btn')) {
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
            alert('A data de fim deve ser depois da data de início.');
            return;
        }

        const themeRef = themesCollection.doc(currentRentalData.themeId);
        try {
            await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(themeRef);
                if (!doc.exists) throw "Tema não encontrado!";

                const themeData = doc.data();

                if (isThemeRentedOnDate(themeData, startDate, endDate)) {
                    alert('Este tema já está agendado para este período. Por favor, verifique as datas.');
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
                alert("Não foi possível agendar. Tente novamente.");
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
            alert(`O tema "${theme.name}" não está disponível para a data selecionada. Por favor, escolha outra data.`);
            return;
        }

        const kitImage = theme.images?.[currentQuoteData.kit] || theme.coverImage || '';

        // CÓDIGO ATUALIZADO PELO UTILIZADOR
        const businessPhoneNumber = "5534988435876";
        const formattedDate = new Date(eventDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        const message = `Olá, meu nome é *${clientName}* e estou entrando em contato através do site *Pegue e Monte*.  

Gostaria de *solicitar um orçamento* para o tema *"${theme.name}" (Kit ${currentQuoteData.kit})*, com data prevista para *${formattedDate}*.  

Segue meu contato para retorno: *${clientPhone}*.  

Veja a foto do kit que escolhi: ${kitImage}  

Aguardo seu retorno com as informações completas do orçamento e formas de pagamento.  
Muito obrigado pela atenção!`;

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
            alert('Nenhum agendamento encontrado para este mês.');
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
            alert("Não foi possível excluir o agendamento. Tente novamente.");
        }
    }

    // Inicializa a aplicação
    initialize();
});

