// --- JAVASCRIPT ---

// Espera o HTML ser totalmente carregado para executar o script
document.addEventListener('DOMContentLoaded', () => {

    // 1. BASE DE DADOS INICIAL
    let themes = [
        {
            id: 1, name: 'Batman',
            coverImage: 'https://placehold.co/600x400/2d3748/ffffff?text=Batman',
            images: {
                bronze: 'https://placehold.co/600x400/2d3748/ffffff?text=Batman+Bronze',
                prata: 'https://placehold.co/600x400/4a5568/ffffff?text=Batman+Prata',
                ouro: 'https://placehold.co/600x400/1a202c/ffffff?text=Batman+Ouro'
            },
            kits: ['bronze', 'prata', 'ouro']
        },
        {
            id: 2, name: 'Frozen',
            coverImage: 'https://placehold.co/600x400/a0deff/000000?text=Frozen',
            images: {
                prata: 'https://placehold.co/600x400/a0deff/000000?text=Frozen+Prata',
                ouro: 'https://placehold.co/600x400/74c0e0/ffffff?text=Frozen+Ouro'
            },
            kits: ['prata', 'ouro']
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
    const formMessage = document.getElementById('formMessage');
    const themeModal = document.getElementById('themeModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalThemeName = document.getElementById('modalThemeName');
    const modalKitsContainer = document.getElementById('modalKitsContainer');
    // Novos elementos para o modal de imagem
    const imageModal = document.getElementById('imageModal');
    const closeImageModalBtn = document.getElementById('closeImageModalBtn');
    const lightboxImage = document.getElementById('lightboxImage');

    // 3. FUNÇÕES DO MODAL DE DETALHES DO TEMA
    function openThemeModal(theme) {
        modalThemeName.textContent = theme.name;
        modalKitsContainer.innerHTML = '';

        theme.kits.forEach(kitKey => {
            const detail = kitDetails[kitKey];
            const imageUrl = theme.images[kitKey] || theme.coverImage;

            const kitHTML = `
                <div class="border rounded-lg p-4 text-center">
                    <img src="${imageUrl}" class="kit-image w-full h-48 object-cover rounded-md mb-4" onerror="this.onerror=null;this.src='https://placehold.co/600x400/cccccc/ffffff?text=Imagem';">
                    <h3 class="text-xl font-semibold">${kitKey.charAt(0).toUpperCase() + kitKey.slice(1)}</h3>
                    <p class="text-lg font-bold ${detail.class.replace('bg-', 'text-').replace('-300', '-600').replace('-400', '-700')}">${detail.price}</p>
                </div>
            `;
            modalKitsContainer.innerHTML += kitHTML;
        });

        themeModal.classList.remove('hidden');
        themeModal.classList.remove('opacity-0');
        themeModal.querySelector('.modal-content').classList.remove('scale-95');
    }

    function closeThemeModal() {
        themeModal.classList.add('opacity-0');
        themeModal.querySelector('.modal-content').classList.add('scale-95');
        setTimeout(() => {
            themeModal.classList.add('hidden');
        }, 300);
    }

    // 4. FUNÇÕES DO MODAL DE IMAGEM (LIGHTBOX)
    function openImageModal(imageUrl) {
        lightboxImage.src = imageUrl;
        imageModal.classList.remove('hidden', 'opacity-0');
    }

    function closeImageModal() {
        imageModal.classList.add('opacity-0');
        setTimeout(() => {
            imageModal.classList.add('hidden');
            lightboxImage.src = '';
        }, 300);
    }

    // 5. EVENT LISTENERS
    closeModalBtn.addEventListener('click', closeThemeModal);
    themeModal.addEventListener('click', (event) => {
        if (event.target === themeModal) {
            closeThemeModal();
        }
    });

    closeImageModalBtn.addEventListener('click', closeImageModal);
    imageModal.addEventListener('click', (event) => {
        if (event.target === imageModal) {
            closeImageModal();
        }
    });

    modalKitsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('kit-image')) {
            openImageModal(event.target.src);
        }
    });

    // 6. FUNÇÃO PARA MOSTRAR OS TEMAS NA TELA
    function displayThemes(themesToDisplay) {
        catalogContainer.innerHTML = '';
        if (themesToDisplay.length === 0) {
            catalogContainer.innerHTML = `<p class="col-span-full text-center text-gray-500 text-xl">Nenhum tema encontrado.</p>`;
            return;
        }
        themesToDisplay.forEach(theme => {
            const kitBadges = theme.kits.map(kitKey => {
                const detail = kitDetails[kitKey];
                return `<span class="text-xs font-bold mr-2 px-2.5 py-1 rounded-full ${detail.class}">${kitKey.charAt(0).toUpperCase() + kitKey.slice(1)}</span>`;
            }).join('');
            const themeCardHTML = `
                <div class="theme-card bg-white rounded-lg overflow-hidden shadow-md" data-theme-id="${theme.id}">
                    <img src="${theme.coverImage}" alt="Foto do tema ${theme.name}" class="w-full h-48 object-cover" onerror="this.onerror=null;this.src='https://placehold.co/600x400/cccccc/ffffff?text=Imagem';">
                    <div class="p-4">
                        <h3 class="text-xl font-bold mb-3">${theme.name}</h3>
                        <div class="flex flex-wrap gap-2">${kitBadges}</div>
                    </div>
                </div>
            `;
            catalogContainer.innerHTML += themeCardHTML;
        });
    }

    // 7. LÓGICA DOS FILTROS, PESQUISA E ABERTURA DO MODAL
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

    catalogContainer.addEventListener('click', (event) => {
        const card = event.target.closest('.theme-card');
        if (card) {
            const themeId = parseInt(card.dataset.themeId);
            const theme = themes.find(t => t.id === themeId);
            if (theme) {
                openThemeModal(theme);
            }
        }
    });

    // 8. LÓGICA PARA ADICIONAR NOVO TEMA
    addThemeBtn.addEventListener('click', () => {
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
            const imageUrl = document.getElementById(inputId).value.trim();
            if (imageUrl) {
                images[kit] = imageUrl;
            }
        });

        if (!name || !coverImage || selectedKits.length === 0) {
            formMessage.textContent = 'Preencha Nome, Imagem de Capa e selecione/preencha ao menos um kit.';
            return;
        }

        const newTheme = {
            id: themes.length > 0 ? Math.max(...themes.map(t => t.id)) + 1 : 1,
            name, coverImage, images, kits: selectedKits
        };

        themes.push(newTheme);
        filterAndSearch();
        addThemeForm.reset();
        addThemeFormContainer.classList.add('hidden');
    });

    // 9. EXIBIÇÃO INICIAL
    filterAndSearch();
});

