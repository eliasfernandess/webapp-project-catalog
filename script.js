// --- JAVASCRIPT COM FIREBASE E AUTENTICAÇÃO (VERSÃO DE DIAGNÓSTICO) ---

// MENSAGEM 1: Confirma que o ficheiro script.js foi carregado.
console.log("FICHEIRO SCRIPT.JS CARREGADO. A inicializar o Firebase...");

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

// MENSAGEM 2: Confirma que o script está à espera que o HTML seja carregado.
console.log("A aguardar pelo evento DOMContentLoaded...");

document.addEventListener('DOMContentLoaded', () => {

    // MENSAGEM 3: Esta é a mensagem mais importante. Se esta aparecer, o coração do script está a funcionar.
    console.log("EVENTO DOMCONTENTLOADED DISPARADO. O SCRIPT PRINCIPAL ESTÁ A EXECUTAR.");

    let themes = [];
    const kitDetails = {
        bronze: { price: 'R$ 150,00', class: 'bg-orange-300 text-orange-900' },
        prata: { price: 'R$ 250,00', class: 'bg-gray-300 text-gray-800' },
        ouro: { price: 'R$ 300,00', class: 'bg-yellow-400 text-yellow-900' }
    };

    const choiceScreen = document.getElementById('choiceScreen');
    const loginScreen = document.getElementById('loginScreen');
    const mainContent = document.getElementById('mainContent');
    const customerBtn = document.getElementById('customerBtn');
    const employeeBtn = document.getElementById('employeeBtn');

    // MENSAGEM 4 e 5: Verificam se o JavaScript conseguiu encontrar os botões no HTML.
    if (customerBtn) {
        console.log("SUCESSO: Botão 'customerBtn' encontrado no HTML.");
    } else {
        console.error("FALHA: Não foi possível encontrar o botão 'customerBtn' no HTML!");
    }
    if (employeeBtn) {
        console.log("SUCESSO: Botão 'employeeBtn' encontrado no HTML.");
    } else {
        console.error("FALHA: Não foi possível encontrar o botão 'employeeBtn' no HTML!");
    }

    const backToChoiceBtn = document.getElementById('backToChoiceBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginForm = document.getElementById('loginForm');
    const adminControls = document.getElementById('adminControls');
    const catalogContainer = document.getElementById('theme-catalog');

    // MENSAGEM 6: Confirma que o script está a tentar adicionar a funcionalidade de clique.
    console.log("A adicionar os 'event listeners' de clique aos botões.");
    customerBtn.addEventListener('click', () => {
        console.log("CLIQUE DETETADO: Botão 'Sou Cliente' foi clicado.");
        showCatalog(false);
    });
    employeeBtn.addEventListener('click', () => {
        console.log("CLIQUE DETETADO: Botão 'Sou Funcionário' foi clicado.");
        showLoginScreen();
    });
    backToChoiceBtn.addEventListener('click', showChoiceScreen);

    // Ouve mudanças no estado de autenticação (login/logout)
    auth.onAuthStateChanged(user => {
        console.log("Estado de autenticação verificado. Utilizador:", user ? user.email : "Nenhum");
        if (user) {
            showCatalog(true);
        } else {
            showChoiceScreen();
        }
    });

    function showChoiceScreen() {
        console.log("A executar: showChoiceScreen()");
        choiceScreen.style.display = 'flex';
        loginScreen.style.display = 'none';
        mainContent.style.display = 'none';
    }

    function showLoginScreen() {
        console.log("A executar: showLoginScreen()");
        choiceScreen.style.display = 'none';
        loginScreen.style.display = 'flex';
        mainContent.style.display = 'none';
    }

    function showCatalog(isAdmin) {
        console.log(`A executar: showCatalog(). Modo Admin: ${isAdmin}`);
        choiceScreen.style.display = 'none';
        loginScreen.style.display = 'none';
        mainContent.style.display = 'block';

        if (isAdmin) {
            adminControls.style.display = 'block';
            logoutBtn.style.display = 'block';
        } else {
            adminControls.style.display = 'none';
            logoutBtn.style.display = 'none';
        }
        filterAndSearch();
    }

    // O resto do código permanece igual, pode deixar como está.
    // ... (restante das funções de login, logout, displayThemes, modais, etc.) ...

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
    const loginMessage = document.getElementById('loginMessage');
    const addThemeBtn = document.getElementById('addThemeBtn');

    let editingThemeId = null;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                loginMessage.textContent = 'Email ou senha inválidos.';
                console.error('Erro de login:', error);
            });
    });

    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });

    themesCollection.onSnapshot(snapshot => {
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        themes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        filterAndSearch();
    }, error => {
        console.error("Erro ao buscar temas: ", error);
        if (loadingIndicator) loadingIndicator.textContent = "Erro ao carregar os temas.";
    });

    function displayThemes(themesToDisplay) {
        const currentUser = auth.currentUser;
        catalogContainer.innerHTML = '';

        if (themesToDisplay.length === 0 && loadingIndicator && loadingIndicator.classList.contains('hidden')) {
            catalogContainer.innerHTML = `<p class="col-span-full text-center text-gray-500 text-xl">Nenhum tema encontrado.</p>`;
            return;
        }

        themesToDisplay.forEach(theme => {
            if (!theme || !theme.name) {
                console.warn("Tema inválido encontrado na base de dados, a ignorar:", theme);
                return;
            }
            const unavailable = isThemeUnavailableToday(theme);
            const kitBadges = (theme.kits || []).map(kitKey => {
                const detail = kitDetails[kitKey];
                if (!detail) return '';
                return `<span class="text-xs font-bold mr-2 px-2.5 py-1 rounded-full ${detail.class}">${kitKey.charAt(0).toUpperCase() + kitKey.slice(1)}</span>`;
            }).join('');

            const adminButtonsHTML = currentUser ? `
                <div class="absolute top-2 right-2 flex gap-2">
                    <button class="edit-btn bg-yellow-400 text-white p-2 rounded-full hover:bg-yellow-500 shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16"><path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/></svg></button>
                    <button class="delete-btn bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16"><path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5.5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/></svg></button>
                </div>
            ` : '';

            const themeCardHTML = `
                <div class="theme-card bg-white rounded-lg overflow-hidden shadow-md relative" data-theme-id="${theme.id}">
                    ${unavailable ? '<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-2xl font-bold rounded-lg z-10">INDISPONÍVEL HOJE</div>' : ''}
                    <img src="${theme.coverImage}" alt="Foto do tema ${theme.name}" class="w-full h-48 object-cover ${unavailable ? 'opacity-40' : ''}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/cccccc/ffffff?text=Imagem';">
                    <div class="p-4 ${unavailable ? 'opacity-40' : ''}">
                        <h3 class="text-xl font-bold mb-3">${theme.name}</h3>
                        <div class="flex flex-wrap gap-2">${kitBadges}</div>
                    </div>
                    ${adminButtonsHTML}
                </div>
            `;
            catalogContainer.innerHTML += themeCardHTML;
        });
    }

    function openThemeModal(theme) {
        const currentUser = auth.currentUser;
        modalThemeName.textContent = theme.name;
        modalKitsContainer.innerHTML = '';
        const today = new Date().toISOString().split('T')[0];

        let kitsHTML = '<div class="grid grid-cols-1 md:grid-cols-3 gap-4">';
        (theme.kits || []).forEach(kitKey => {
            const detail = kitDetails[kitKey];
            const imageUrl = theme.images?.[kitKey] || theme.coverImage;
            const isRentedToday = isKitRented(theme, kitKey, today);

            const rentButtonHTML = currentUser && !isRentedToday ?
                `<button class="rent-btn mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600" data-theme-id="${theme.id}" data-kit="${kitKey}">Agendar Aluguer</button>` :
                '';

            kitsHTML += `
                <div class="border rounded-lg p-4 text-center ${isRentedToday ? 'bg-gray-200' : ''}">
                    <img src="${imageUrl}" class="kit-image w-full h-48 object-cover rounded-md mb-4 ${isRentedToday ? 'opacity-50' : 'hover:opacity-80 transition'}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/cccccc/ffffff?text=Imagem';">
                    <h3 class="text-xl font-semibold">${kitKey.charAt(0).toUpperCase() + kitKey.slice(1)}</h3>
                    <p class="text-lg font-bold ${detail.class.replace('bg-', 'text-').replace('-300', '-600').replace('-400', '-700')}">${detail.price}</p>
                    ${isRentedToday ? '<p class="text-red-600 font-bold mt-2">Alugado Hoje</p>' : rentButtonHTML}
                </div>
            `;
        });
        kitsHTML += '</div>';

        let rentalsHTML = '';
        if (currentUser) {
            rentalsHTML = '<div class="mt-8"> <h4 class="text-2xl font-bold mb-4">Aluguéis Agendados</h4>';
            if (theme.rentals && theme.rentals.length > 0) {
                rentalsHTML += '<ul class="list-disc pl-5 space-y-2">';
                theme.rentals.forEach((rental, index) => {
                    rentalsHTML += `
                        <li class="flex justify-between items-center">
                            <span>Kit <strong>${rental.kit}</strong> de ${new Date(rental.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} até ${new Date(rental.endDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                            <button class="delete-rental-btn text-red-500 hover:text-red-700 font-bold" data-theme-id="${theme.id}" data-rental-index="${index}">Excluir</button>
                        </li>
                    `;
                });
                rentalsHTML += '</ul>';
            } else {
                rentalsHTML += '<p>Nenhum aluguer agendado para este tema.</p>';
            }
            rentalsHTML += '</div>';
        }

        modalKitsContainer.innerHTML = kitsHTML + rentalsHTML;
        themeModal.classList.remove('hidden', 'opacity-0');
        themeModal.querySelector('.modal-content').classList.remove('scale-95');
    }

    function isKitRented(theme, kitKey, checkDate) {
        if (!theme.rentals) return false;
        const date = new Date(checkDate);
        date.setUTCHours(0, 0, 0, 0);
        return theme.rentals.some(rental => {
            if (rental.kit !== kitKey) return false;
            const start = new Date(rental.startDate);
            const end = new Date(rental.endDate);
            start.setUTCHours(0, 0, 0, 0);
            end.setUTCHours(0, 0, 0, 0);
            return date >= start && date <= end;
        });
    }

    function isThemeUnavailableToday(theme) {
        const today = new Date().toISOString().split('T')[0];
        return (theme.kits || []).some(kitKey => isKitRented(theme, kitKey, today));
    }

    function closeThemeModal() {
        themeModal.classList.add('opacity-0');
        themeModal.querySelector('.modal-content').classList.add('scale-95');
        setTimeout(() => { themeModal.classList.add('hidden'); }, 300);
    }
    function openImageModal(imageUrl) {
        lightboxImage.src = imageUrl;
        imageModal.classList.remove('hidden', 'opacity-0');
    }
    function closeImageModal() {
        imageModal.classList.add('opacity-0');
        setTimeout(() => { imageModal.classList.add('hidden'); lightboxImage.src = ''; }, 300);
    }
    function openRentalModal(themeId, kitKey) {
        const theme = themes.find(t => t.id === themeId);
        rentalThemeInfo.textContent = `Agendando o Kit "${kitKey}" para o tema "${theme.name}"`;
        rentalForm.dataset.themeId = themeId;
        rentalForm.dataset.kit = kitKey;
        rentalModal.classList.remove('hidden');
    }
    function closeRentalModal() {
        rentalForm.reset();
        rentalModal.classList.add('hidden');
    }

    function startEditTheme(themeId) {
        const theme = themes.find(t => t.id === themeId);
        if (!theme) return;
        editingThemeId = theme.id;
        formTitle.textContent = "Editando Tema";
        document.getElementById('themeName').value = theme.name;
        document.getElementById('themeCoverImage').value = theme.coverImage;
        addThemeForm.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = (theme.kits || []).includes(cb.value);
        });
        ['Bronze', 'Prata', 'Ouro'].forEach(kitName => {
            const kitKey = kitName.toLowerCase();
            document.getElementById(`themeImage${kitName}`).value = theme.images?.[kitKey] || '';
        });
        addThemeFormContainer.classList.remove('hidden');
    }

    async function deleteTheme(themeId) {
        if (confirm('Tem certeza que deseja excluir este tema? Esta ação não pode ser desfeita.')) {
            try {
                await themesCollection.doc(themeId).delete();
            } catch (error) {
                console.error("Erro ao excluir tema: ", error);
                alert("Ocorreu um erro ao excluir o tema.");
            }
        }
    }

    async function deleteRental(themeId, rentalIndex) {
        const theme = themes.find(t => t.id === themeId);
        if (theme && confirm('Tem certeza que deseja excluir este agendamento?')) {
            const updatedRentals = [...(theme.rentals || [])];
            updatedRentals.splice(rentalIndex, 1);
            try {
                await themesCollection.doc(themeId).update({ rentals: updatedRentals });
            } catch (error) {
                console.error("Erro ao excluir aluguel: ", error);
                alert("Ocorreu um erro ao excluir o aluguer.");
            }
        }
    }

    function filterAndSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeFilter = filterButtonsContainer.querySelector('.active-filter')?.dataset.kit || 'todos';
        let filteredThemes = themes;
        if (activeFilter !== 'todos') {
            filteredThemes = filteredThemes.filter(theme => (theme.kits || []).includes(activeFilter));
        }
        if (searchTerm) {
            filteredThemes = filteredThemes.filter(theme => theme.name.toLowerCase().includes(searchTerm));
        }
        displayThemes(filteredThemes);
    }

    searchInput.addEventListener('keyup', filterAndSearch);
    filterButtonsContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            filterButtonsContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active-filter', 'ring-2', 'ring-blue-500'));
            event.target.classList.add('active-filter', 'ring-2', 'ring-blue-500');
            filterAndSearch();
        }
    });

    addThemeBtn.addEventListener('click', () => {
        editingThemeId = null;
        formTitle.textContent = "Adicionar Novo Tema";
        addThemeForm.reset();
        addThemeFormContainer.classList.toggle('hidden');
    });

    catalogContainer.addEventListener('click', (event) => {
        const card = event.target.closest('.theme-card');
        const editBtn = event.target.closest('.edit-btn');
        const deleteBtn = event.target.closest('.delete-btn');
        if (editBtn) {
            startEditTheme(editBtn.closest('.theme-card').dataset.themeId);
            return;
        }
        if (deleteBtn) {
            deleteTheme(deleteBtn.closest('.theme-card').dataset.themeId);
            return;
        }
        if (card) {
            const theme = themes.find(t => t.id === card.dataset.themeId);
            if (theme) openThemeModal(theme);
        }
    });

    closeModalBtn.addEventListener('click', closeThemeModal);
    themeModal.addEventListener('click', (event) => { if (event.target === themeModal) closeThemeModal(); });
    closeImageModalBtn.addEventListener('click', closeImageModal);
    imageModal.addEventListener('click', (event) => { if (event.target === imageModal) closeImageModal(); });
    closeRentalModalBtn.addEventListener('click', closeRentalModal);

    modalKitsContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.closest('.kit-image')) {
            openImageModal(target.closest('.kit-image').src);
        }
        if (target.classList.contains('rent-btn')) {
            openRentalModal(target.dataset.themeId, target.dataset.kit);
        }
        if (target.classList.contains('delete-rental-btn')) {
            deleteRental(target.dataset.themeId, parseInt(target.dataset.rentalIndex));
        }
    });

    addThemeForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitButton = addThemeForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'A salvar...';

        formMessage.textContent = '';
        const name = document.getElementById('themeName').value.trim();
        const coverImage = document.getElementById('themeCoverImage').value.trim();
        const selectedKits = Array.from(addThemeForm.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
        const images = {};
        selectedKits.forEach(kit => {
            const inputId = `themeImage${kit.charAt(0).toUpperCase() + kit.slice(1)}`;
            images[kit] = document.getElementById(inputId).value.trim();
        });

        if (!name || !coverImage || selectedKits.length === 0) {
            formMessage.textContent = 'Preencha Nome, Imagem de Capa e selecione/preencha pelo menos um kit.';
            submitButton.disabled = false;
            submitButton.textContent = 'Salvar Tema';
            return;
        }

        try {
            const themeData = { name, coverImage, images, kits: selectedKits };
            if (editingThemeId) {
                const themeToUpdate = themes.find(t => t.id === editingThemeId);
                themeData.rentals = themeToUpdate.rentals || [];
                await themesCollection.doc(editingThemeId).set(themeData);
            } else {
                themeData.rentals = [];
                await themesCollection.add(themeData);
            }
            addThemeForm.reset();
            addThemeFormContainer.classList.add('hidden');
            editingThemeId = null;
        } catch (error) {
            console.error("Erro ao salvar tema: ", error);
            alert("Ocorreu um erro ao salvar o tema.");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Salvar Tema';
        }
    });

    rentalForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const themeId = rentalForm.dataset.themeId;
        const kit = rentalForm.dataset.kit;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (!startDate || !endDate || new Date(startDate) > new Date(endDate)) {
            alert('Por favor, insira datas válidas.');
            return;
        }

        const theme = themes.find(t => t.id === themeId);
        if (theme) {
            const newRental = { kit, startDate, endDate };
            const updatedRentals = theme.rentals ? [...theme.rentals, newRental] : [newRental];
            try {
                await themesCollection.doc(themeId).update({ rentals: updatedRentals });
                closeRentalModal();
            } catch (error) {
                console.error("Erro ao agendar aluguer: ", error);
                alert("Ocorreu um erro ao agendar o aluguer.");
            }
        }
    });
});