document.addEventListener('DOMContentLoaded', () => {
    // ===== Authentication Logic =====
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    // Valid credentials
    const validUser = 'alexis';
    const validPass = '1234';

    // Check if already logged in
    if (sessionStorage.getItem('bp_logged_in') === 'true') {
        loginScreen.classList.add('hidden');
        appContainer.style.display = 'block';
    }

    // Login Form Handler
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('login-user').value.trim().toLowerCase();
        const pass = document.getElementById('login-pass').value;

        if (user === validUser && pass === validPass) {
            loginError.innerText = '';
            sessionStorage.setItem('bp_logged_in', 'true');
            loginScreen.classList.add('hidden');
            appContainer.style.display = 'block';
        } else {
            loginError.innerText = 'Usuario o contraseña incorrectos';
            document.getElementById('login-pass').value = '';
        }
    });

    // Logout Handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('bp_logged_in');
            appContainer.style.display = 'none';
            loginScreen.classList.remove('hidden');
            document.getElementById('login-user').value = '';
            document.getElementById('login-pass').value = '';
            loginError.innerText = '';
            // Reset to home screen for next login
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('screen-home').classList.add('active');
        });
    }

    // Modal Logic
    const modal = document.getElementById('account-modal');
    const openBtn = document.getElementById('open-account-btn');
    const signupForm = document.getElementById('signup-form');

    const openModal = (e) => {
        e.preventDefault();
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    // Navigation Logic
    const screens = document.querySelectorAll('.screen');
    const backBtns = document.querySelectorAll('.back-btn');

    const showScreen = (screenId) => {
        screens.forEach(s => s.classList.remove('active'));
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.add('active');
            window.scrollTo(0, 0);

            // Update bottom nav active state if screen matches a nav item
            document.querySelectorAll('.nav-item').forEach(item => {
                if (item.getAttribute('data-screen') === screenId) {
                    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                }
            });
        }
    };

    // Quick Actions, Accounts & Bottom Nav
    document.querySelectorAll('[data-screen]').forEach(el => {
        el.addEventListener('click', () => {
            const screenId = el.getAttribute('data-screen');
            showScreen(screenId);
        });
    });

    // Back Buttons
    backBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showScreen('screen-home');
        });
    });


    // Movement Search Logic
    const searchInput = document.getElementById('movement-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.searchable').forEach(item => {
                const text = item.innerText.toLowerCase();
                item.style.display = text.includes(term) ? 'flex' : 'none';
            });
        });
    }

    // Global State for Balances (persisted with dual-storage fallback)
    const defaultBalances = { savings: 850.25, pibank: 395.25 };

    const loadBalances = () => {
        try {
            const fromLocal = localStorage.getItem('bp_balances');
            if (fromLocal) return JSON.parse(fromLocal);
        } catch (e) { /* localStorage not available */ }
        try {
            const fromSession = sessionStorage.getItem('bp_balances');
            if (fromSession) return JSON.parse(fromSession);
        } catch (e) { /* sessionStorage not available */ }
        return { ...defaultBalances };
    };

    const saveBalances = () => {
        const data = JSON.stringify(balances);
        try { localStorage.setItem('bp_balances', data); } catch (e) { }
        try { sessionStorage.setItem('bp_balances', data); } catch (e) { }
    };

    let balances = loadBalances();

    const updateAllBalances = () => {
        const total = balances.savings + balances.pibank;
        const format = (val) => `$ ${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

        document.querySelectorAll('.balance-total').forEach(el => el.innerText = format(total));
        document.querySelectorAll('.balance-savings').forEach(el => el.innerText = format(balances.savings));
        document.querySelectorAll('.balance-pibank').forEach(el => el.innerText = format(balances.pibank));

        // Persist to storage
        saveBalances();
    };

    // Initial Sync
    updateAllBalances();

    // Transaction Flow Logic
    const txModal = document.getElementById('transaction-modal');
    const txSteps = document.querySelectorAll('.tx-step');
    const txAmountInput = document.getElementById('tx-amount-input');
    const txDestInfo = document.getElementById('tx-dest-info');
    const confirmTxBtn = document.getElementById('confirm-tx-btn');
    const finishTxBtn = document.getElementById('finish-tx-btn');
    const cancelTxBtns = document.querySelectorAll('.cancel-tx');

    let currentTxData = { target: '', amount: 0, fromAcc: 'savings', type: 'transfer', phone: '', giftData: null };

    const showTxStep = (stepId) => {
        txSteps.forEach(s => s.classList.remove('active'));
        document.getElementById(stepId).classList.add('active');
    };

    const initTransaction = (targetName, type = 'transfer', giftData = null) => {
        currentTxData.target = targetName;
        currentTxData.type = type;
        currentTxData.phone = '';
        currentTxData.giftData = giftData;
        txDestInfo.innerText = `Para: ${targetName}`;
        txAmountInput.value = '';

        // Also clear phone input
        const phoneInput = document.getElementById('tx-phone-input');
        if (phoneInput) phoneInput.value = '';

        showTxStep('tx-step-account');
        txModal.style.display = 'flex';

        // Reset account selection to default (savings)
        document.querySelectorAll('.account-opt').forEach(o => o.classList.remove('active'));
        document.querySelector('.account-opt[data-acc="savings"]').classList.add('active');
        currentTxData.fromAcc = 'savings';
    };

    // Account Selection Logic
    document.querySelectorAll('.account-opt').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.account-opt').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            currentTxData.fromAcc = opt.getAttribute('data-acc');
        });
    });

    document.getElementById('next-to-amount').addEventListener('click', () => {
        if (currentTxData.type === 'recharge') {
            const operatorLabel = document.getElementById('tx-dest-operator');
            if (operatorLabel) operatorLabel.innerText = `Operadora: ${currentTxData.target}`;
            showTxStep('tx-step-phone');
            setTimeout(() => {
                const phoneInput = document.getElementById('tx-phone-input');
                if (phoneInput) phoneInput.focus();
            }, 100);
        } else {
            showTxStep('tx-step-amount');
            setTimeout(() => txAmountInput.focus(), 100);
        }
    });

    const nextFromPhoneBtn = document.getElementById('next-to-amount-from-phone');
    if (nextFromPhoneBtn) {
        nextFromPhoneBtn.addEventListener('click', () => {
            const phoneStr = document.getElementById('tx-phone-input').value.trim();
            if (phoneStr.length < 9) return alert('Ingresa un número de celular válido');

            currentTxData.phone = phoneStr;
            txDestInfo.innerText = `Para: ${currentTxData.target} (${phoneStr})`;

            showTxStep('tx-step-amount');
            setTimeout(() => txAmountInput.focus(), 100);
        });
    }

    // Back Navigation in Modal
    document.querySelectorAll('.tx-back').forEach(btn => {
        btn.addEventListener('click', () => {
            const prev = btn.getAttribute('data-prev');
            if (prev) {
                showTxStep(prev);
            }
        });
    });

    const backFromAmountBtn = document.getElementById('back-from-amount');
    if (backFromAmountBtn) {
        backFromAmountBtn.addEventListener('click', () => {
            if (currentTxData.type === 'recharge') {
                showTxStep('tx-step-phone');
            } else {
                showTxStep('tx-step-account');
            }
        });
    }

    // Trigger from Contacts
    document.querySelectorAll('.clickable-contact').forEach(el => {
        el.addEventListener('click', () => {
            initTransaction(el.getAttribute('data-target'));
        });
    });

    // === Global Event Delegation for Dynamic Elements ===
    document.addEventListener('click', (e) => {
        // 1. Transaction trigger from Contacts (including dynamically generated ones)
        const contactEl = e.target.closest('.clickable-contact');
        if (contactEl) {
            initTransaction(contactEl.getAttribute('data-target'));
            return;
        }

        // 2. Transaction trigger from Payments, More Gestiones & Recharges
        const featureEl = e.target.closest('.clickable-feature');
        if (featureEl) {
            const name = featureEl.getAttribute('data-name');
            const type = featureEl.getAttribute('data-type') || 'service';
            if (name) initTransaction(name, type);
            return;
        }
    });

    // --- Add Contacts Logic (Screen Based) ---
    const goToAddContactBtn = document.getElementById('go-to-add-contact');
    const addContactForm = document.getElementById('add-contact-form');

    // Navigate to Add Contact Screen
    if (goToAddContactBtn) {
        goToAddContactBtn.addEventListener('click', () => {
            showScreen('screen-add-contact');
        });
    }

    const defaultContacts = [
        { name: 'Maria Andrade', bank: 'Pichincha', account: '4521' },
        { name: 'Juan Silva', bank: 'Produbanco', account: '8821' }
    ];

    const loadContacts = () => {
        try {
            const fromLocal = localStorage.getItem('bp_contacts');
            if (fromLocal) return JSON.parse(fromLocal);
        } catch (e) { }
        return [...defaultContacts];
    };

    const saveContacts = () => {
        try { localStorage.setItem('bp_contacts', JSON.stringify(contacts)); } catch (e) { }
    };

    let contacts = loadContacts();

    const renderContacts = () => {
        const container = document.getElementById('contacts-list-container');
        if (!container) return;

        container.innerHTML = '';
        contacts.forEach(contact => {
            // Generate initials for avatar
            const words = contact.name.trim().split(/\s+/);
            let initial = 'C';
            if (words.length > 1) {
                initial = (words[0][0] + words[1][0]).toUpperCase();
            } else if (words.length === 1 && words[0]) {
                initial = words[0].substring(0, 2).toUpperCase();
            }

            const accSuffix = contact.account.length >= 4 ? contact.account.slice(-4) : contact.account;

            const item = document.createElement('div');
            item.className = 'contact-item clickable-contact';
            item.setAttribute('data-target', contact.name);
            item.setAttribute('data-acc', `****${accSuffix}`);

            item.innerHTML = `
                <div class="contact-avatar">${initial}</div>
                <div class="contact-info">
                    <h4>${contact.name}</h4>
                    <p>${contact.bank} • ****${accSuffix}</p>
                </div>
            `;
            // Delegation handles click events now
            container.appendChild(item);
        });
    };

    renderContacts();

    // Form Submission for New Screen
    if (addContactForm) {
        addContactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contact-name').value.trim();
            const bank = document.getElementById('contact-bank').value;
            const account = document.getElementById('contact-account').value.trim();

            if (name && bank && account) {
                contacts.push({ name, bank, account });
                saveContacts();
                renderContacts();

                // Navigate back to Transfer screen
                showScreen('screen-transfer');
                addContactForm.reset();
            }
        });
    }
    // --- End Contacts Logic ---

    // --- Transferir Regalo Logic ---
    let currentGiftState = { category: '', postcardUrl: '', title: '', message: '' };

    // 1. From Category to Postcards
    document.querySelectorAll('.gift-category').forEach(cat => {
        cat.addEventListener('click', () => {
            const categoryName = cat.getAttribute('data-gift-cat');
            currentGiftState.category = categoryName;
            document.getElementById('gift-cat-title').innerText = `Postales de ${categoryName}`;

            const keywordMap = {
                'Navidad': 'christmas',
                'Cumpleaños': 'birthday,cake',
                'Donación': 'charity,care',
                'Aniversario': 'anniversary,romance',
                'Día de la Madre': 'mother,mom'
            };
            const keyword = keywordMap[categoryName] || 'gift';

            // Generate some random visually distinct postcards based on category
            const container = document.getElementById('postcards-container');
            container.innerHTML = '';
            for (let i = 1; i <= 4; i++) {
                // Using loremflickr to fetch themed images by keyword
                const imgUrl = `https://loremflickr.com/400/300/${keyword}?lock=${i + Math.floor(Math.random() * 100)}`;
                const card = document.createElement('div');
                card.className = 'postcard-item clickable';
                card.style.cssText = `height: 120px; border-radius: 12px; background-image: url('${imgUrl}'); background-size: cover; background-position: center; border: 2px solid transparent; transition: var(--transition); box-shadow: var(--shadow-sm);`;

                card.addEventListener('click', () => {
                    currentGiftState.postcardUrl = imgUrl;
                    document.getElementById('preview-postcard').style.backgroundImage = `url('${imgUrl}')`;
                    showScreen('screen-gifts-details');
                });
                container.appendChild(card);
            }

            showScreen('screen-gifts-postcards');
        });
    });

    // Back Buttons for Gifts
    document.getElementById('btn-back-to-gift-categories')?.addEventListener('click', () => showScreen('screen-gifts-category'));
    document.getElementById('btn-back-to-postcards')?.addEventListener('click', () => showScreen('screen-gifts-postcards'));
    document.getElementById('btn-back-to-gift-details')?.addEventListener('click', () => showScreen('screen-gifts-details'));

    // 2. From Details to Contacts List
    document.getElementById('gift-details-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        currentGiftState.title = document.getElementById('gift-title').value.trim();
        currentGiftState.message = document.getElementById('gift-message').value.trim();

        // Populate Contacts list dynamically for gifts
        const giftContactsContainer = document.getElementById('gift-contacts-container');
        if (giftContactsContainer) {
            giftContactsContainer.innerHTML = '';
            contacts.forEach(c => {
                const initials = c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                const div = document.createElement('div');
                div.className = 'contact-item clickable-gift-contact';
                div.innerHTML = `
                    <div class="contact-avatar">${initials}</div>
                    <div class="contact-info">
                        <h4>${c.name}</h4>
                        <p>${c.bank} • ****${c.account.slice(-4)}</p>
                    </div>
                `;
                div.addEventListener('click', () => {
                    // Start transaction with gift mode
                    initTransaction(c.name, 'gift', { ...currentGiftState });
                });
                giftContactsContainer.appendChild(div);
            });
        }

        showScreen('screen-gifts-contact');
    });



    // Movement Filtering Logic
    const filterTabs = document.querySelectorAll('.filter-tab');
    const globalMovementsList = document.getElementById('global-movements');
    const movementSearch = document.getElementById('movement-search');

    const filterMovements = () => {
        const activeFilter = document.querySelector('.filter-tab.active').getAttribute('data-filter');
        const searchTerm = movementSearch.value.toLowerCase();

        document.querySelectorAll('#global-movements .movement-item').forEach(item => {
            const accMatch = activeFilter === 'all' || item.getAttribute('data-acc') === activeFilter;
            const textMatch = item.innerText.toLowerCase().includes(searchTerm);

            if (accMatch && textMatch) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    };

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filterMovements();
        });
    });

    movementSearch.addEventListener('input', filterMovements);

    confirmTxBtn.addEventListener('click', () => {
        const amount = parseFloat(txAmountInput.value) || 0;
        if (amount <= 0) return alert('Ingresa un monto válido');
        if (amount > balances[currentTxData.fromAcc]) return alert('Saldo insuficiente en la cuenta elegida');

        currentTxData.amount = amount;
        showTxStep('tx-step-processing');

        // Simulate network delay
        setTimeout(() => {
            // Update Balance
            balances[currentTxData.fromAcc] -= amount;
            updateAllBalances();

            // Add to Account-Specific Movements List
            const listId = currentTxData.fromAcc === 'savings' ? 'savings-movements' : 'pibank-movements';
            const list = document.getElementById(listId);
            if (list) {
                const item = document.createElement('div');
                item.className = 'movement-item';
                item.innerHTML = `
                    <div class="mov-icon debit"><i class="fa-solid fa-arrow-up"></i></div>
                    <div class="mov-info"><h4>${currentTxData.target}</h4><p>Hoy ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>
                    <div class="mov-amount">-$ ${amount.toFixed(2)}</div>
                `;
                list.prepend(item);
            }

            // Add to Global Movements List with data-acc
            if (globalMovementsList) {
                const globalItem = document.createElement('div');
                globalItem.className = 'movement-item searchable';
                globalItem.setAttribute('data-acc', currentTxData.fromAcc);
                globalItem.innerHTML = `
                    <div class="mov-icon debit"><i class="fa-solid fa-arrow-up"></i></div>
                    <div class="mov-info"><h4>${currentTxData.target}</h4><p>Hoy ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>
                    <div class="mov-amount">-$ ${amount.toFixed(2)}</div>
                `;
                globalMovementsList.prepend(globalItem);
                filterMovements(); // Re-apply filter to show/hide based on active tab
            }

            // Receipt Info
            document.getElementById('receipt-amount').innerText = `$ ${amount.toFixed(2)}`;
            const finalTargetDesc = currentTxData.type === 'recharge'
                ? `${currentTxData.target} (${currentTxData.phone})`
                : currentTxData.target;
            document.getElementById('receipt-dest').innerText = finalTargetDesc;
            document.getElementById('receipt-date').innerText = new Date().toLocaleDateString();
            document.getElementById('receipt-id').innerText = '#' + Math.floor(Math.random() * 900000 + 100000);

            // Gift Info Display
            const giftInfoEl = document.getElementById('receipt-gift-info');
            if (giftInfoEl) {
                if (currentTxData.type === 'gift' && currentTxData.giftData) {
                    giftInfoEl.style.display = 'block';
                    document.getElementById('receipt-gift-img').style.backgroundImage = `url('${currentTxData.giftData.postcardUrl}')`;
                    document.getElementById('receipt-gift-title').innerText = currentTxData.giftData.title || 'Mi Regalo';
                    document.getElementById('receipt-gift-message').innerText = currentTxData.giftData.message || '';
                } else {
                    giftInfoEl.style.display = 'none';
                }
            }

            showTxStep('tx-step-success');
        }, 2000);
    });

    finishTxBtn.addEventListener('click', () => {
        txModal.style.display = 'none';
        showScreen('screen-home');
    });

    cancelTxBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            txModal.style.display = 'none';
        });
    });

    if (openBtn) openBtn.addEventListener('click', openModal);

    // Close modal when clicking outside content
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Form Submission with Formspree
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = signupForm.querySelector('button');
            btn.innerText = 'Procesando...';
            btn.disabled = true;

            const formData = new FormData(signupForm);

            try {
                const response = await fetch(signupForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    signupForm.innerHTML = `
                        <div style="text-align: center; padding: 2rem 0;">
                            <i class="fa-solid fa-circle-check" style="font-size: 4rem; color: #002B54; margin-bottom: 1.5rem;"></i>
                            <h2 style="margin-bottom: 1rem; color: #002B54;">¡Solicitud Enviada!</h2>
                            <p style="color: #666666;">Hemos recibido tu solicitud. Un asesor se contactará contigo pronto.</p>
                            <button class="btn-cta w-full" style="margin-top: 2rem; color: white;" onclick="location.reload()">Volver</button>
                        </div>
                    `;
                } else { throw new Error(); }
            } catch (error) {
                btn.innerText = 'Reintentar';
                btn.disabled = false;
                alert('Hubo un problema. Intenta de nuevo.');
            }
        });
    }
});
