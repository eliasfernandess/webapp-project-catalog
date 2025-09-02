// --- JAVASCRIPT COM FIREBASE, AUTENTICAÇÃO E ORÇAMENTO ---

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
    const choiceScreen = document.getElementById('choiceScreen');
    const loginScreen = document.getElementById('loginScreen');
    const mainContent = document.getElementById('mainContent');
    const customerBtn = document.getElementById('customerBtn');
    const employeeBtn = document.getElementById('employeeBtn');
    const backToChoiceBtn = document.getElementById('backToChoiceBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    const adminControls = document.getElementById('adminControls');
    const addThemeBtn = document.getElementById('addThemeBtn');
    const catalogContainer = document.getElementById('theme-catalog');
    const searchInput = document.getElementById('searchInput');
    const filterButtonsContainer = document.getElementById('filterButtons');
    const addThemeFormContainer = document.getElementById('addThemeFormContainer');
    const addThemeForm = document.getElementById('addThemeForm');
    const formTitle = document.getElementById('formTitle');
    const formMessage = document.getElementById('formMessage');
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

    // Elementos do Modal de Orçamento
    const quoteModal = document.getElementById('quoteModal');
    const closeQuoteModalBtn = document.getElementById('closeQuoteModalBtn');
    const quoteForm = document.getElementById('quoteForm');
    const quoteThemeInfo = document.getElementById('quoteThemeInfo');

    // NOVO: Elementos da Secção de Relatórios
    const reportMonthSelect = document.getElementById('reportMonth');
    const reportYearSelect = document.getElementById('reportYear');
    const downloadReportBtn = document.getElementById('downloadReportBtn');


    let editingThemeId = null;
    let currentRentalData = {};
    let currentQuoteData = {};

    // --- SETUP INICIAL ---
    function initialize() {
        populateYearSelector();
        auth.onAuthStateChanged(user => {
            currentUser = user;
            if (user) {
                showCatalog(true);
            } else {
                showChoiceScreen();
            }
        });

        customerBtn.addEventListener('click', () => showCatalog(false));
        employeeBtn.addEventListener('click', showLoginScreen);
        backToChoiceBtn.addEventListener('click', showChoiceScreen);
        logoutBtn.addEventListener('click', () => auth.signOut());
        downloadReportBtn.addEventListener('click', downloadReport);
    }

    // NOVO: Preenche o seletor de ano dinamicamente
    function populateYearSelector() {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= 2023; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            reportYearSelect.appendChild(option);
        }
    }


    // --- LÓGICA DE AUTENTICAÇÃO E NAVEGAÇÃO ---
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

    function showScreen(screen) {
        choiceScreen.classList.add('hidden');
        loginScreen.classList.add('hidden');
        mainContent.classList.add('hidden');
        screen.classList.remove('hidden');
    }

    function showChoiceScreen() {
        showScreen(choiceScreen);
    }

    function showLoginScreen() {
        showScreen(loginScreen);
    }

    function showCatalog(isAdmin) {
        showScreen(mainContent);
        adminControls.classList.toggle('hidden', !isAdmin);
        logoutBtn.classList.toggle('hidden', !isAdmin);
        fetchThemes();
    }


    // --- LÓGICA PRINCIPAL (CRUD, FILTROS, ETC.) ---

    function fetchThemes() {
        loadingIndicator.classList.remove('hidden');
        catalogContainer.innerHTML = '';

        themesCollection.orderBy('name').onSnapshot(snapshot => {
            themes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            displayThemes(themes);
            loadingIndicator.classList.add('hidden');
        }, error => {
            console.error("Erro ao buscar temas: ", error);
            loadingIndicator.textContent = "Erro ao carregar temas.";
        });
    }

    function displayThemes(themesToDisplay) {
        catalogContainer.innerHTML = '';
        if (themesToDisplay.length === 0 && !loadingIndicator.classList.contains('hidden')) {
            catalogContainer.innerHTML = `<p class="col-span-full text-center text-gray-500">Nenhum tema encontrado.</p>`;
        }

        themesToDisplay.forEach(theme => {
            const isRented = theme.rentals && theme.rentals.some(rental => {
                const today = new Date().toISOString().split('T')[0];
                return today >= rental.startDate && today <= rental.endDate;
            });

            const card = document.createElement('div');
            card.className = `theme-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group ${isRented ? 'opacity-50' : ''}`;
            card.dataset.id = theme.id;

            let availableKitsHtml = (theme.kits || []).map(kit =>
                `<span class="text-xs font-semibold px-2 py-1 rounded-full ${kitDetails[kit]?.class || ''}">${kit.charAt(0).toUpperCase() + kit.slice(1)}</span>`
            ).join(' ');

            card.innerHTML = `
                <div class="relative">
                    <img src="${theme.coverImage || 'https://placehold.co/400x300/e2e8f0/adb5bd?text=Sem+Imagem'}" alt="Foto do tema ${theme.name}" class="w-full h-48 object-cover">
                    ${isRented ? '<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"><span class="text-white font-bold text-lg">Indisponível</span></div>' : ''}
                </div>
                <div class="p-4">
                    <h3 class="text-lg font-bold truncate">${theme.name}</h3>
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
        const searchTerm = searchInput.value.toLowerCase();
        const activeFilter = document.querySelector('.active-filter').dataset.kit;

        let filteredThemes = themes;

        if (activeFilter !== 'todos') {
            filteredThemes = filteredThemes.filter(theme => theme.kits && theme.kits.includes(activeFilter));
        }

        if (searchTerm) {
            filteredThemes = filteredThemes.filter(theme => theme.name.toLowerCase().includes(searchTerm));
        }

        displayThemes(filteredThemes);
    }
    searchInput.addEventListener('keyup', filterAndSearch);
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

        const themeData = { name, coverImage, kits, images };

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

    // --- LÓGICA DOS MODAIS ---

    function openThemeModal(id) {
        const theme = themes.find(t => t.id === id);
        if (!theme) return;

        modalThemeName.textContent = theme.name;
        modalKitsContainer.innerHTML = '';

        (theme.kits || []).forEach(kit => {
            const kitDiv = document.createElement('div');
            kitDiv.className = 'mb-6 p-4 border rounded-lg';
            const kitImage = theme.images?.[kit] || 'https://placehold.co/600x400/e2e8f0/adb5bd?text=Sem+Imagem';

            const today = new Date().toISOString().split('T')[0];
            const isRented = theme.rentals && theme.rentals.some(r => r.kit === kit && today >= r.startDate && today <= r.endDate);

            kitDiv.innerHTML = `
                <div class="flex flex-col md:flex-row gap-6">
                    <img src="${kitImage}" alt="Imagem do Kit ${kit}" class="w-full md:w-1/3 rounded-lg shadow-md kit-image" data-src="${kitImage}">
                    <div class="flex-grow">
                        <h4 class="text-2xl font-bold capitalize ${kitDetails[kit]?.class} inline-block px-3 py-1 rounded-md">${kit} - ${kitDetails[kit]?.price}</h4>
                        <div class="mt-4">
                            <h5 class="font-semibold mb-2">Datas Agendadas:</h5>
                            <ul class="list-disc list-inside text-sm text-gray-600">
                                ${theme.rentals && theme.rentals.filter(r => r.kit === kit).length > 0
                    ? theme.rentals.filter(r => r.kit === kit).map(r => `<li>${new Date(r.startDate).toLocaleDateString()} a ${new Date(r.endDate).toLocaleDateString()}</li>`).join('')
                    : '<li>Nenhum agendamento.</li>'
                }
                            </ul>
                        </div>
                        <div class="mt-6 flex flex-wrap gap-4">
                            <button class="quote-btn whatsapp-btn flex items-center gap-2 bg-green-500 text-white font-bold px-6 py-2 rounded-lg" data-theme-id="${theme.id}" data-kit="${kit}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-whatsapp" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
                                Solicitar Orçamento
                            </button>
                            <!-- Botões de Admin -->
                            ${currentUser ? `
                                <button class="rent-btn bg-blue-500 text-white px-4 py-2 rounded-lg" data-theme-id="${theme.id}" data-kit="${kit}">Agendar</button>
                                <button class="edit-btn bg-yellow-500 text-white px-4 py-2 rounded-lg" data-theme-id="${theme.id}">Editar Tema</button>
                                <button class="delete-btn bg-red-500 text-white px-4 py-2 rounded-lg" data-theme-id="${theme.id}">Excluir Tema</button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            modalKitsContainer.appendChild(kitDiv);
        });

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
            rentalThemeInfo.textContent = `Agendar Aluguer: ${theme.name} (Kit ${currentRentalData.kit})`;
            rentalModal.classList.remove('hidden');
        }
        if (target.closest('.quote-btn')) {
            const button = target.closest('.quote-btn');
            currentQuoteData.themeId = button.dataset.themeId;
            currentQuoteData.kit = button.dataset.kit;
            const theme = themes.find(t => t.id === currentQuoteData.themeId);
            quoteThemeInfo.textContent = `Solicitar Orçamento: ${theme.name} (Kit ${currentQuoteData.kit})`;
            quoteModal.classList.remove('hidden');
        }
    });

    closeImageModalBtn.addEventListener('click', () => {
        imageModal.classList.add('opacity-0');
        setTimeout(() => imageModal.classList.add('hidden'), 300);
    });

    closeRentalModalBtn.addEventListener('click', () => rentalModal.classList.add('hidden'));

    rentalForm.addEventListener('submit', async e => {
        e.preventDefault();
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
                if (!doc.exists) {
                    throw "Tema não encontrado!";
                }
                const rentals = doc.data().rentals || [];
                rentals.push({ kit: currentRentalData.kit, startDate, endDate });
                transaction.update(themeRef, { rentals });
            });
            rentalModal.classList.add('hidden');
            closeModalBtn.click();
        } catch (error) {
            console.error("Erro no agendamento: ", error);
            alert("Não foi possível agendar. Tente novamente.");
        }
    });

    // --- LÓGICA DO MODAL DE ORÇAMENTO (ATUALIZADO PARA INCLUIR IMAGEM) ---
    closeQuoteModalBtn.addEventListener('click', () => quoteModal.classList.add('hidden'));

    quoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const clientName = document.getElementById('clientName').value;
        const clientPhone = document.getElementById('clientPhone').value;
        const eventDate = document.getElementById('eventDate').value;
        const theme = themes.find(t => t.id === currentQuoteData.themeId);

        // Obter a URL da imagem específica do kit
        const kitImage = theme.images?.[currentQuoteData.kit] || theme.coverImage || '';

        // 1. Redirecionar para o WhatsApp IMEDIATAMENTE
        const businessPhoneNumber = "5511999999999"; // SUBSTITUA PELO NÚMERO DA SUA LOJA
        const formattedDate = new Date(eventDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

        // Mensagem atualizada para incluir o link da imagem
        const message = `Olá! Tenho interesse em alugar o tema "${theme.name}" (Kit ${currentQuoteData.kit}) para o dia ${formattedDate}.\nMeu nome é ${clientName} e o meu telefone é ${clientPhone}.\n\nVeja a foto do kit que escolhi: ${kitImage}\n\nAguardo o vosso contacto!`;

        const whatsappUrl = `https://api.whatsapp.com/send?phone=${businessPhoneNumber}&text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank');

        // 2. Salvar na base de dados em SEGUNDO PLANO
        quotesCollection.add({
            clientName,
            clientPhone,
            eventDate,
            themeName: theme.name,
            kit: currentQuoteData.kit,
            kitImage: kitImage, // Salvar o link da imagem no registo
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pendente'
        }).catch(error => {
            console.error("Erro ao salvar solicitação em segundo plano:", error);
        });

        // 3. Fechar e limpar o formulário
        quoteModal.classList.add('hidden');
        quoteForm.reset();
        closeModalBtn.click();
    });

    // --- NOVA LÓGICA DE RELATÓRIOS ---
    async function downloadReport() {
        const year = reportYearSelect.value;
        const month = reportMonthSelect.value;

        // Calcula a data de início e fim do mês selecionado
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);

        try {
            // Converte as datas para Timestamps do Firebase
            const startTimestamp = firebase.firestore.Timestamp.fromDate(startDate);
            const endTimestamp = firebase.firestore.Timestamp.fromDate(endDate);

            // Faz a consulta na base de dados
            const snapshot = await quotesCollection
                .where('timestamp', '>=', startTimestamp)
                .where('timestamp', '<', endTimestamp)
                .orderBy('timestamp', 'desc')
                .get();

            if (snapshot.empty) {
                alert('Nenhuma solicitação de orçamento encontrada para este mês.');
                return;
            }

            // Converte os dados para o formato CSV
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Nome do Cliente,Telefone,Data do Evento,Tema,Kit,Data da Solicitacao\r\n";

            snapshot.forEach(doc => {
                const data = doc.data();
                const requestDate = data.timestamp.toDate().toLocaleString('pt-BR');
                const row = [
                    `"${data.clientName}"`,
                    `"${data.clientPhone}"`,
                    `"${new Date(data.eventDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}"`,
                    `"${data.themeName}"`,
                    `"${data.kit}"`,
                    `"${requestDate}"`
                ].join(',');
                csvContent += row + "\r\n";
            });

            // Cria e descarrega o ficheiro
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `relatorio_orcamentos_${year}_${month}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Erro ao gerar relatório: ", error);
            alert("Ocorreu um erro ao gerar o relatório. Tente novamente.");
        }
    }

    // Inicializa a aplicação
    initialize();
});

