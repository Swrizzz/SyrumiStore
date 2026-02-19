let selectedProduct = "", selectedPrice = "", currentServiceId = "", currentCategory = "";
let keranjang = [];

// --- ADMIN CONFIG ---
const ADMIN_A = "6289507913948"; 
const ADMIN_B = "6285924527083"; 

function getCurrentAdmin() {
    const coin = Math.random();
    const footer = `\n----------------------------\n_Pesanan diproses manual, mohon bersabar._`;
    const metode = `[ METODE PEMBAYARAN ]\n- DANA: 089507913948\n- QRIS: (Minta di Chat)`;

    if (coin < 0.5) return { nomor: ADMIN_A, header: "*[ADMIN A] SYRUMI STORE*", metode, footer };
    return { nomor: ADMIN_B, header: "*[ADMIN B] SYRUMI STORE*", metode, footer };
}

// --- NAVIGASI ---
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    window.scrollTo(0,0);
}

function goToLobby() { switchScreen('screen-lobby'); }

// --- RENDER MENU ---
function init() {
    const gameGrid = document.getElementById('menu-game');
    const lainGrid = document.getElementById('menu-lain');

    databaseLayanan.game.forEach(item => {
        gameGrid.innerHTML += `<div class="menu-item" onclick="openOrder('${item.id}', 'game')">
            <img src="${item.icon}"><span>${item.name}</span></div>`;
    });

    databaseLayanan.sosmed.forEach(item => {
        lainGrid.innerHTML += `<div class="menu-item" onclick="openOrder('${item.id}', 'sosmed')">
            <img src="${item.icon}"><span>${item.name}</span></div>`;
    });

    databaseLayanan.ppob.forEach(item => {
        lainGrid.innerHTML += `<div class="menu-item" onclick="openOrder('${item.id}', 'ppob')">
            <img src="${item.icon}"><span>${item.name}</span></div>`;
    });
}

// --- LOGIKA ORDER ---
function openOrder(id, cat) {
    currentServiceId = id;
    currentCategory = cat;
    selectedProduct = "";
    
    const data = (cat === 'game') ? databaseLayanan.game.find(x => x.id === id) : 
                 (cat === 'sosmed') ? databaseLayanan.sosmed.find(x => x.id === id) :
                 databaseLayanan.ppob.find(x => x.id === id);

    document.getElementById('order-title').innerText = data.name;
    document.getElementById('label-input-user').innerText = data.label || "DATA TUJUAN";
    document.getElementById('zone-id').style.display = (id === 'ml') ? 'inline-block' : 'none';
    document.getElementById('user-id').value = "";
    
    renderProductGrid(id, cat);
    switchScreen('screen-order');
}

function renderProductGrid(id, cat) {
    const grid = document.getElementById('grid-produk');
    grid.innerHTML = "";
    let list = [];

    if(cat === 'game') list = pricelistGame[id];
    else if(cat === 'ppob') list = pricelistPPOB[id] || [];
    else if(cat === 'sosmed') {
        // Jika sosmed, tampilkan sub-app
        const apps = databaseLayanan.sosmed_apps[id] || [];
        apps.forEach(app => {
            const subList = pricelistSosmed[app.id] || [];
            subList.forEach(p => {
                grid.innerHTML += `<div class="product-card" onclick="selectItem(this, '${app.name} - ${p.item}', '${p.harga}', '${app.id}')">
                    <div style="font-size:11px; color:#999">${app.name}</div>
                    <div class="price">${p.harga}</div><div style="font-size:10px">${p.item}</div></div>`;
            });
        });
        return;
    }

    list.forEach(p => {
        grid.innerHTML += `<div class="product-card" onclick="selectItem(this, '${p.item}', '${p.harga}', '${id}')">
            <div class="price">${p.harga}</div><div>${p.item}</div></div>`;
    });
}

let activeSubSosmed = ""; 
function selectItem(el, name, price, subId) {
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    selectedProduct = name;
    selectedPrice = price;
    activeSubSosmed = subId;
}

// --- LINKGUARD & AUTO CONVERT LOGIC ---
function getValidatedTarget() {
    let tujuan = document.getElementById('user-id').value.trim();
    const zone = document.getElementById('zone-id').value.trim();
    
    // 1. Validasi Mobile Legends
    if (currentServiceId === 'ml') {
        if (tujuan.length < 5 || zone.length < 3) {
            kustomAlert("Data Kurang", "ID ML dan Zone harus diisi lengkap!");
            return null;
        }
        return `${tujuan} (${zone})`;
    }

    // 2. Validasi Sosmed (LinkGuard)
    const config = hargaSatuan[activeSubSosmed];
    if (config) {
        // Auto Convert Username
        if (config.isUser) {
            let user = tujuan.replace('@', '');
            if (user.length < 3) {
                kustomAlert("Username Salah", "Username terlalu pendek!");
                return null;
            }
            return config.urlPrefix + user;
        }
        // LinkGuard Pattern
        if (config.pattern) {
            const regex = new RegExp(config.pattern, 'i');
            if (!regex.test(tujuan)) {
                kustomAlert("Link Salah", "Link tidak sesuai dengan layanan! Harap masukkan link yang benar.");
                return null;
            }
        }
    }

    // 3. Validasi PPOB (Minimal 10 digit nomor HP)
    if (currentCategory === 'ppob' && tujuan.length < 10) {
        kustomAlert("Nomor Salah", "Nomor HP/Tujuan minimal 10 digit!");
        return null;
    }

    return tujuan;
}

// --- KERANJANG LOGIC ---
function tambahKeKeranjang() {
    const target = getValidatedTarget();
    if (!target || !selectedProduct) {
        if(!selectedProduct) kustomAlert("Belum Pilih", "Silakan pilih nominal produk!");
        return;
    }

    keranjang.push({
        layanan: document.getElementById('order-title').innerText,
        produk: selectedProduct,
        harga: selectedPrice,
        tujuan: target
    });

    document.getElementById('cart-count').innerText = keranjang.length;
    kustomAlert("Berhasil", "Pesanan dimasukkan ke keranjang.", "🛒");
    goToLobby();
}

function renderCartItems() {
    const list = document.getElementById('cart-items-list');
    const totalEl = document.getElementById('cart-total');
    list.innerHTML = "";
    let total = 0;

    if (keranjang.length === 0) {
        list.innerHTML = "<p style='text-align:center; padding:20px; color:#999;'>Keranjang Kosong</p>";
    }

    keranjang.forEach((item, index) => {
        total += parseInt(item.harga.replace(/[^0-9]/g, ''));
        list.innerHTML += `
            <div class="glass" style="margin-bottom:10px; padding:15px; position:relative; font-size:13px;">
                <b>${item.layanan}</b> - ${item.produk}<br>
                <small>Target: ${item.tujuan}</small><br>
                <span style="color:var(--accent-pink); font-weight:700;">${item.harga}</span>
                <i class="fas fa-trash" onclick="hapusCart(${index})" style="position:absolute; right:15px; top:50%; transform:translateY(-50%); color:red; cursor:pointer;"></i>
            </div>`;
    });
    totalEl.innerText = `Total: Rp${total.toLocaleString('id-ID')}`;
}

function hapusCart(i) {
    keranjang.splice(i, 1);
    document.getElementById('cart-count').innerText = keranjang.length;
    renderCartItems();
}

function checkoutKeranjang() {
    if (keranjang.length === 0) return;
    const admin = getCurrentAdmin();
    let text = `${admin.header}\n\n`;
    let total = 0;

    keranjang.forEach((item, i) => {
        text += `${i+1}. ${item.layanan} - ${item.produk}\n   Target: ${item.tujuan}\n   Harga: ${item.harga}\n\n`;
        total += parseInt(item.harga.replace(/[^0-9]/g, ''));
    });

    text += `*TOTAL BAYAR: Rp${total.toLocaleString('id-ID')}*\n\n${admin.metode}\n${admin.footer}`;
    window.open(`https://wa.me/${admin.nomor}?text=${encodeURIComponent(text)}`);
}

// --- SINGLE ORDER WA ---
function prosesKeWA() {
    const target = getValidatedTarget();
    if (!target || !selectedProduct) return;

    const admin = getCurrentAdmin();
    const text = `${admin.header}\n\n` +
                 `Layanan: ${document.getElementById('order-title').innerText}\n` +
                 `Produk: ${selectedProduct}\n` +
                 `Target: ${target}\n` +
                 `Harga: ${selectedPrice}\n\n` +
                 `${admin.metode}\n${admin.footer}`;

    window.open(`https://wa.me/${admin.nomor}?text=${encodeURIComponent(text)}`);
}

// --- FITUR TAMBAHAN ---
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('dark-icon');
    icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon';
}

function bukaRekber() {
    kustomAlert("Syrumi Rekber", "Sistem transaksi aman menggunakan Rekber. Biaya admin flat Rp5.000. Hubungi admin untuk buat grup transaksi!", "🤝");
}

function kustomAlert(t, m, i="⚠️") {
    document.getElementById('alert-icon').innerText = i;
    document.getElementById('alert-title').innerText = t;
    document.getElementById('alert-message').innerText = m;
    document.getElementById('alert-overlay').style.display = 'flex';
}

function tutupAlert() { document.getElementById('alert-overlay').style.display = 'none'; }

// --- DETEKSI OPERATOR (Fungsi Lama) ---
function cekOperator(n) {
    const container = document.getElementById('operator-logo-container');
    const logo = document.getElementById('operator-logo');
    if (n.length < 4) { container.style.display = 'none'; return; }
    
    let src = "";
    if (/^(0811|0812|0813|0821|0822|0823|0851|0852|0853)/.test(n)) src = "https://upload.wikimedia.org/wikipedia/commons/b/b2/Telkomsel_2021_logo.svg";
    else if (/^(0814|0815|0816|0855|0856|0857|0858)/.test(n)) src = "https://upload.wikimedia.org/wikipedia/commons/a/a3/Indosat_Ooredoo_logo.svg";
    else if (/^(0817|0818|0819|0859|0877|0878)/.test(n)) src = "https://upload.wikimedia.org/wikipedia/commons/a/ac/XL_logo_2016.svg";
    
    if (src && currentCategory === 'ppob') {
        logo.src = src;
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}

// Start
window.onload = init;
