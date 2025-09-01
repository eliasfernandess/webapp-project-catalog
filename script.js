// --- JAVASCRIPT ---

// AVISO IMPORTANTE:
// Todas as alterações (adicionar, editar, excluir, alugar) são temporárias e
// serão perdidas ao recarregar a página. Este é um protótipo avançado.
// Para salvar os dados permanentemente, o próximo passo seria conectar a um banco de dados.

document.addEventListener('DOMContentLoaded', () => {

    // 1. BASE DE DADOS INICIAL
    // Adicionamos a propriedade "rentals" para guardar os aluguéis de cada tema.
    let themes = [
        {
            id: 1, name: 'Batman',
            coverImage: 'https://placehold.co/600x400/2d3748/ffffff?text=Batman',
            images: {
                bronze: 'https://placehold.co/600x400/2d3748/ffffff?text=Batman+Bronze',
                prata: 'https://placehold.co/600x400/4a5568/ffffff?text=Batman+Prata',
                ouro: 'https://placehold.co/600x400/1a202c/ffffff?text=Batman+Ouro'
            },
            kits: ['bronze', 'prata', 'ouro'],
            rentals: [
                // Exemplo de como um aluguel será guardado:
                // { kit: 'prata', startDate: '2025-09-05', endDate: '2025-09-08' }
            ]
        },
        {
            id: 2, name: 'Frozen',
            coverImage: 'https://placehold.co/600x400/a0deff/000000?text=Frozen',
            images: {
                prata: 'https://placehold.co/600x400/a0deff/000000?text=Frozen+Prata',
                ouro: 'https://placehold.co/600x400/74c0e0/ffffff?text=Frozen+Ouro'
            },
            kits: ['prata', 'ouro'],
            rentals: []
        }
    ];

    const kitDetails = {
        bronze: { price: 'R$ 150,00', class: 'bg-orange-300 text-orange-900' },
        prata: { price: 'R$ 250,00', class: 'bg-gray-300 text-gray-800' },
        ouro: { price: 'R$ 300,00', class: 'bg-yellow-400 text-yellow-900' }
    };

    // 2. ELEMENTOS DA PÁGINA
    const catalogContainer = document.getElementById('theme-catalog');
    const searchInput = document.getElementById('searchInput');
    const filterButtonsContainer = document.getElementById('filterButtons');
    const addThemeBtn = document.getElementById('addThemeBtn');
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

    // NOVOS ELEMENTOS PARA EDIÇÃO E ALUGUEL
    const rentalModal = document.getElementById('rentalModal');
    const closeRentalModalBtn = document.getElementById('closeRentalModalBtn');
    const rentalForm = document.getElementById('rentalForm');
    const rentalThemeInfo = document.getElementById('rentalThemeInfo');

    let editingThemeId = null; // Variável para controlar se estamos editando ou criando um tema

    // 3. FUNÇÕES DE VERIFICAÇÃO DE ALUGUEL
    function isKitRented(theme, kitKey, checkDate) {
        const date = new Date(checkDate);
        date.setUTCHours(0, 0, 0, 0); // Normaliza a data para UTC
        return theme.rentals.some(rental => {
            if (rental.kit !== kitKey) return false;
            const start = new Date(rental.startDate);
            const end = new Date(rental.endDate);
            start.setUTCHours(0, 0, 0, 0);
            end.setUTCHours(0, 0, 0, 0);
            return date >= start && date <= end;
        });
    }

    // Verifica se QUALQUER kit de um tema está alugado na data de hoje
    function isThemeUnavailableToday(theme) {
        const today = new Date().toISOString().split('T')[0];
        return theme.kits.some(kitKey => isKitRented(theme, kitKey, today));
    }


    // 4. FUNÇÕES DO MODAL DE DETALHES DO TEMA (Atualizado)
    function openThemeModal(theme) {
        modalThemeName.textContent = theme.name;
        modalKitsContainer.innerHTML = '';
        const today = new Date().toISOString().split('T')[0];

        // Seção de Kits
        let kitsHTML = '<div class="grid grid-cols-1 md:grid-cols-3 gap-4">';
        theme.kits.forEach(kitKey => {
            const detail = kitDetails[kitKey];
            const imageUrl = theme.images[kitKey] || theme.coverImage;
            const isRentedToday = isKitRented(theme, kitKey, today);

            kitsHTML += `
                <div class="border rounded-lg p-4 text-center ${isRentedToday ? 'bg-gray-200' : ''}">
                    <img src="${imageUrl}" class="kit-image w-full h-48 object-cover rounded-md mb-4 ${isRentedToday ? 'opacity-50' : 'hover:opacity-80 transition'}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/cccccc/ffffff?text=Imagem';">
                    <h3 class="text-xl font-semibold">${kitKey.charAt(0).toUpperCase() + kitKey.slice(1)}</h3>
                    <p class="text-lg font-bold ${detail.class.replace('bg-', 'text-').replace('-300', '-600').replace('-400', '-700')}">${detail.price}</p>
                    ${isRentedToday ?
                    '<p class="text-red-600 font-bold mt-2">Alugado Hoje</p>' :
                    `<button class="rent-btn mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600" data-theme-id="${theme.id}" data-kit="${kitKey}">Agendar Aluguel</button>`
                }
                </div>
            `;
        });
        kitsHTML += '</div>';

        // Seção de Aluguéis Agendados
        let rentalsHTML = '<div class="mt-8"> <h4 class="text-2xl font-bold mb-4">Aluguéis Agendados</h4>';
        if (theme.rentals.length > 0) {
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
            rentalsHTML += '<p>Nenhum aluguel agendado para este tema.</p>';
        }
        rentalsHTML += '</div>';

        modalKitsContainer.innerHTML = kitsHTML + rentalsHTML;
        themeModal.classList.remove('hidden', 'opacity-0');
        themeModal.querySelector('.modal-content').classList.remove('scale-95');
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

    // 5. FUNÇÕES DO MODAL DE ALUGUEL (Novo)
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

    // 6. FUNÇÃO PARA MOSTRAR OS TEMAS NA TELA (Atualizado)
    function displayThemes(themesToDisplay) {
        catalogContainer.innerHTML = '';
        if (themesToDisplay.length === 0) {
            catalogContainer.innerHTML = `<p class="col-span-full text-center text-gray-500 text-xl">Nenhum tema encontrado.</p>`;
            return;
        }
        themesToDisplay.forEach(theme => {
            const unavailable = isThemeUnavailableToday(theme);
            const kitBadges = theme.kits.map(kitKey => {
                const detail = kitDetails[kitKey];
                return `<span class="text-xs font-bold mr-2 px-2.5 py-1 rounded-full ${detail.class}">${kitKey.charAt(0).toUpperCase() + kitKey.slice(1)}</span>`;
            }).join('');

            const themeCardHTML = `
                <div class="theme-card bg-white rounded-lg overflow-hidden shadow-md relative" data-theme-id="${theme.id}">
                    ${unavailable ? '<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-2xl font-bold rounded-lg z-10">INDISPONÍVEL HOJE</div>' : ''}
                    <img src="${theme.coverImage}" alt="Foto do tema ${theme.name}" class="w-full h-48 object-cover ${unavailable ? 'opacity-40' : ''}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/cccccc/ffffff?text=Imagem';">
                    <div class="p-4 ${unavailable ? 'opacity-40' : ''}">
                        <h3 class="text-xl font-bold mb-3">${theme.name}</h3>
                        <div class="flex flex-wrap gap-2">${kitBadges}</div>
                    </div>
                    <div class="absolute top-2 right-2 flex gap-2">
                        <button class="edit-btn bg-yellow-400 text-white p-2 rounded-full hover:bg-yellow-500 shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16"><path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/></svg></button>
                        <button class="delete-btn bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16"><path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/></svg></button>
                    </div>
                </div>
            `;
            catalogContainer.innerHTML += themeCardHTML;
        });
    }

    // 7. LÓGICA DE EDIÇÃO E EXCLUSÃO (Novo)
    function startEditTheme(themeId) {
        const theme = themes.find(t => t.id === themeId);
        if (!theme) return;

        editingThemeId = theme.id;
        formTitle.textContent = "Editando Tema";
        document.getElementById('themeName').value = theme.name;
        document.getElementById('themeCoverImage').value = theme.coverImage;

        // Limpa e marca os checkboxes corretos
        addThemeForm.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = theme.kits.includes(cb.value);
        });

        // Preenche as URLs das imagens
        ['Bronze', 'Prata', 'Ouro'].forEach(kitName => {
            const kitKey = kitName.toLowerCase();
            const input = document.getElementById(`themeImage${kitName}`);
            input.value = theme.images[kitKey] || '';
        });

        addThemeFormContainer.classList.remove('hidden');
    }

    function deleteTheme(themeId) {
        if (confirm('Tem certeza que deseja excluir este tema? Esta ação não pode ser desfeita.')) {
            themes = themes.filter(t => t.id !== themeId);
            filterAndSearch();
        }
    }

    function deleteRental(themeId, rentalIndex) {
        const theme = themes.find(t => t.id === themeId);
        if (theme && confirm('Tem certeza que deseja excluir este agendamento?')) {
            theme.rentals.splice(rentalIndex, 1);
            openThemeModal(theme); // Reabre o modal para atualizar a lista
        }
    }

    // 8. EVENT LISTENERS (Atualizado)
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
            const themeId = parseInt(target.dataset.themeId);
            const kitKey = target.dataset.kit;
            openRentalModal(themeId, kitKey);
        }
        if (target.classList.contains('delete-rental-btn')) {
            const themeId = parseInt(target.dataset.themeId);
            const rentalIndex = parseInt(target.dataset.rentalIndex);
            deleteRental(themeId, rentalIndex);
        }
    });

    catalogContainer.addEventListener('click', (event) => {
        const card = event.target.closest('.theme-card');
        const editBtn = event.target.closest('.edit-btn');
        const deleteBtn = event.target.closest('.delete-btn');

        if (editBtn) {
            const themeId = parseInt(editBtn.closest('.theme-card').dataset.themeId);
            startEditTheme(themeId);
            return;
        }
        if (deleteBtn) {
            const themeId = parseInt(deleteBtn.closest('.theme-card').dataset.themeId);
            deleteTheme(themeId);
            return;
        }
        if (card) {
            const themeId = parseInt(card.dataset.themeId);
            const theme = themes.find(t => t.id === themeId);
            if (theme) {
                openThemeModal(theme);
            }
        }
    });

    // FILTROS E PESQUISA
    function filterAndSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeFilter = filterButtonsContainer.querySelector('.active-filter')?.dataset.kit || 'todos';
        let filteredThemes = themes;
        if (activeFilter !== 'todos') {
            filteredThemes = filteredThemes.filter(theme => theme.kits.includes(activeFilter));
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

    // 9. LÓGICA DO FORMULÁRIO (Adicionar e Editar)
    addThemeBtn.addEventListener('click', () => {
        editingThemeId = null; // Garante que estamos no modo de criação
        formTitle.textContent = "Adicionar Novo Tema";
        addThemeForm.reset();
        addThemeFormContainer.classList.toggle('hidden');
    });

    addThemeForm.addEventListener('submit', (event) => {
        event.preventDefault();
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
            formMessage.textContent = 'Preencha Nome, Imagem de Capa e selecione/preencha ao menos um kit.';
            return;
        }

        if (editingThemeId) {
            // Modo Edição
            const themeIndex = themes.findIndex(t => t.id === editingThemeId);
            if (themeIndex > -1) {
                themes[themeIndex] = { ...themes[themeIndex], name, coverImage, images, kits: selectedKits };
            }
        } else {
            // Modo Criação
            const newTheme = {
                id: themes.length > 0 ? Math.max(...themes.map(t => t.id)) + 1 : 1,
                name, coverImage, images, kits: selectedKits, rentals: []
            };
            themes.push(newTheme);
        }

        filterAndSearch();
        addThemeForm.reset();
        addThemeFormContainer.classList.add('hidden');
        editingThemeId = null;
    });

    rentalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const themeId = parseInt(rentalForm.dataset.themeId);
        const kit = rentalForm.dataset.kit;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (!startDate || !endDate || new Date(startDate) > new Date(endDate)) {
            alert('Por favor, insira datas válidas. A data de início não pode ser depois da data de fim.');
            return;
        }

        const theme = themes.find(t => t.id === themeId);
        if (theme) {
            theme.rentals.push({ kit, startDate, endDate });
            filterAndSearch(); // Atualiza o card principal se ficou indisponível hoje
            closeRentalModal();
            openThemeModal(theme); // Reabre o modal de detalhes para ver o agendamento
        }
    });

    // 10. EXIBIÇÃO INICIAL
    filterAndSearch();
});

