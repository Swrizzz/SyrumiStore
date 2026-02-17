let selectedProduct = "", selectedPrice = "", currentServiceId = "";
let currentValidation = {}; 

// --- KONFIGURASI ADMIN & SISTEM LEMPAR KOIN 50:50 ---
const ADMIN_A = "6289507913948"; 
const ADMIN_B = "6285924527083"; 
const LINK_QRIS_A = "https://whatsapp.com/channel/0029VbB9bWGLNSa9K95BId3P/504";

function getCurrentAdmin() {
    // Logika Lempar Koin (50% peluang)
    const lemparKoin = Math.random(); 
    
    if (lemparKoin < 0.5) {
        // HASIL: ADMIN A
        return { 
            nomor: ADMIN_A, 
            label: "ADMIN A", 
            note: `- DANA: 089507913948\n- QRIS: ${LINK_QRIS_A}` 
        };
    } else {
        // HASIL: ADMIN B
        return { 
            nomor: ADMIN_B, 
            label: "ADMIN B", 
            note: `- DANA: 085924527083\n- QRIS: Minta ke Admin\n- (admin 0 - 1.500)` 
        };
    }
}

// --- UI NAVIGATION ---
function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
    const target = document.getElementById(id);
    if(target) { target.style.display = 'block'; setTimeout(() => target.classList.add('active'), 10); }
    window.scrollTo(0, 0);
}
function goToLobby() { switchScreen('screen-lobby'); }
function backToKategori() { switchScreen('screen-kategori'); }
function tutupAlert() { document.getElementById('alert-overlay').style.display = 'none'; }
function tutupKonfirmasi() { document.getElementById('confirm-overlay').style.display = 'none'; }

// --- SISTEM TESTIMONI ---
function bukaTesti() { document.getElementById('testi-overlay').style.display = 'flex'; }
function tutupTesti() { document.getElementById('testi-overlay').style.display = 'none'; }
function konfirmasiSaluran() { window.open('https://whatsapp.com/channel/0029VbB9bWGLNSa9K95BId3P', '_blank'); }

function kirimTestiWA() {
    const msg = document.getElementById('input-testi').value.trim();
    if(!msg) return kustomAlert("Kosong", "Tulis testimoni dulu ya!");
    const text = `*TESTIMONI SYRUMI STORE*\n\n"${msg}"\n\n_Kirim dari Website_`;
    window.open(`https://wa.me/${ADMIN_A}?text=${encodeURIComponent(text)}`, '_blank');
    tutupTesti();
}

function kustomAlert(title, msg, icon="⚠️") {
    document.getElementById('alert-icon').innerText = icon;
    document.getElementById('alert-title').innerText = title;
    document.getElementById('alert-message').innerText = msg;
    document.getElementById('alert-overlay').style.display = 'flex';
}

// --- MENU SYSTEM ---
function openKategori(cat) {
    const listDiv = document.getElementById('list-layanan');
    listDiv.innerHTML = "";
    if (cat === 'sub_ewallet') {
        ['dana', 'gopay', 'ovo', 'shopeepay'].forEach(w => {
            listDiv.innerHTML += `<div onclick="openOrder('${w}', '${w.toUpperCase()}', 'NOMOR HP')" class="glass menu-item"><span>${w.toUpperCase()}</span></div>`;
        });
    } else {
        databaseLayanan[cat].forEach(item => {
            let action;
            if(item.comingSoon) action = `kustomAlert('Segera Hadir', 'Layanan belum tersedia.', '⏳')`;
            else if(item.isAppGroup) action = `openSubSosmed('${item.id}')`;
            else if(item.id === 'sub_ewallet') action = `openKategori('sub_ewallet')`;
            else action = `openOrder('${item.id}', '${item.name}', '${item.label || 'DATA TUJUAN'}')`;
            listDiv.innerHTML += `<div onclick="${action}" class="glass menu-item"><img src="${item.icon}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/686/686589.png'"><span>${item.name}</span></div>`;
        });
    }
    switchScreen('screen-kategori');
}

function openSubSosmed(appId) {
    const listDiv = document.getElementById('list-layanan');
    listDiv.innerHTML = `<p style="text-align:center; font-size:11px; color:#ff85b3; padding-bottom:10px;">⚠️ Pastikan Akun Tidak Private!</p>`;
    databaseLayanan.sosmed_apps[appId].forEach(sub => {
        listDiv.innerHTML += `<div onclick="openOrder('${sub.id}', '${sub.name}', '')" class="glass menu-item"><span>${sub.name}</span></div>`;
    });
}

// --- ORDER LOGIC (DENGAN LINKGUARD KETAT) ---
function openOrder(id, name, label) {
    currentServiceId = id;
    selectedProduct = ""; selectedPrice = "";
    const config = hargaSatuan[id] || {};
    currentValidation = config; 

    document.getElementById('order-title').innerText = name;
    document.getElementById('label-input').innerText = config.label || label;
    
    const inputMain = document.getElementById('user-id');
    const inputZone = document.getElementById('zone-id');
    const grid = document.getElementById('grid-produk');
    const kalkulator = document.getElementById('kalkulator-sosmed-container');
    const logoArea = document.getElementById('operator-logo-container');
    const wrapperGrid = document.getElementById('wrapper-grid');
    
    inputMain.value = ""; inputZone.value = ""; 
    logoArea.style.display = 'none';
    kalkulator.style.display = 'none';
    inputZone.style.display = 'none';
    wrapperGrid.style.display = 'block';
    grid.innerHTML = "";

    const isSosmed = (id.includes('fol') || id.includes('view') || id.includes('like') || config.price);
    
    // Validasi Real-time (LinkGuard)
    inputMain.oninput = function() {
        if (!isSosmed) {
            this.value = this.value.replace(/[^0-9]/g, ''); // Hanya Angka
            if (this.value.length > 13) this.value = this.value.slice(0, 13); // Max 13 digit
        }
        if (id === 'pulsa') handleDeteksiOperator(this.value);
    };

    inputZone.oninput = function() {
        this.value = this.value.replace(/[^0-9]/g, ''); // Hanya Angka
        if (this.value.length > 5) this.value = this.value.slice(0, 5); // Max 5 digit
    };

    if (id === 'pulsa') {
        inputMain.placeholder = "08xxxxxxxx";
        grid.innerHTML = "<p style='text-align:center; padding:20px; color:#aaa;'>Masukkan nomor...</p>";
    } else if (['dana', 'gopay', 'ovo', 'shopeepay'].includes(id)) {
        inputMain.placeholder = "08xxxxxxxx";
        renderPPOB(id);
    } else if (id === 'ml') {
        inputZone.style.display = 'block';
        inputMain.placeholder = "User ID";
        inputZone.placeholder = "Zone";
        renderGame(id);
    } else if (!config.price) { 
        inputMain.placeholder = label || "Player ID / UID";
        renderGame(id);
    } else { 
        inputMain.placeholder = config.label || "Link / Username";
        kalkulator.style.display = 'block';
        renderKalkulatorSosmed(id);
        renderGame(id);
    }
    switchScreen('screen-order');
}

// --- RENDER FUNCTIONS ---
function renderPPOB(id) {
    const grid = document.getElementById('grid-produk');
    grid.innerHTML = "";
    if(typeof pricelistPPOB !== 'undefined' && pricelistPPOB[id]) {
        pricelistPPOB[id].forEach(p => cardTemplate(grid, p));
    }
}

function renderGame(id) {
    const grid = document.getElementById('grid-produk');
    grid.innerHTML = "";
    let data = null;
    if (typeof pricelistGame !== 'undefined' && pricelistGame[id]) data = pricelistGame[id];
    else if (typeof pricelistSosmed !== 'undefined' && pricelistSosmed[id]) data = pricelistSosmed[id];

    if (data) {
        data.forEach(p => cardTemplate(grid, p));
    } else if (!hargaSatuan[id]) {
        grid.innerHTML = "<p class='text-center'>Pricelist belum tersedia.</p>";
    }
}

function renderKalkulatorSosmed(id) {
    const container = document.getElementById('kalkulator-sosmed-container');
    const config = hargaSatuan[id];
    container.innerHTML = `
        <div class="glass" style="padding:15px; border-radius:15px; border:2px dashed #ff85b3; margin-bottom:15px; background:rgba(255,255,255,0.5)">
            <label style="font-size:12px; font-weight:bold; color:#ff85b3; display:block; margin-bottom:8px;">INPUT JUMLAH CUSTOM</label>
            <input type="number" id="custom-qty" placeholder="Min: ${config.min} - Max: ${config.max}" 
                style="width:100%; padding:12px; border-radius:10px; border:1px solid #ffdeed;" 
                oninput="hitungSosmed(this.value, '${id}')">
            <div id="hasil-kalkulasi" style="text-align:right; font-weight:bold; color:#ff85b3; margin-top:10px;">Total: Rp0</div>
        </div>
        <label class="input-label">ATAU PILIH PAKET</label>
    `;
}

function cardTemplate(container, p) {
    const badge = p.label ? `<span class="badge-premium">${p.label}</span>` : '';
    container.innerHTML += `
        <div onclick="selectItem('${p.item}', '${p.harga}', this)" class="product-card ${p.isPremium?'premium':''}">
            <span class="item-name">${p.item} ${badge}</span>
            <span class="item-price">${p.harga}</span>
        </div>`;
}

function handleDeteksiOperator(nomor) {
    const logoArea = document.getElementById('operator-logo-container');
    const logoImg = document.getElementById('operator-logo');
    const grid = document.getElementById('grid-produk');
    if (nomor.length < 4) { logoArea.style.display = 'none'; return; }
    const prefix = nomor.slice(0, 4);
    let prov = "";
    if (/^0811|0812|0813|0821|0822|0852|0853|0823/.test(prefix)) prov = "telkomsel";
    else if (/^0857|0858|0814|0815|0816/.test(prefix)) prov = "indosat";
    else if (/^0817|0818|0819|0877|0878|0831|0838|0859/.test(prefix)) prov = "xl_axis";
    else if (/^0895|0896|0897|0898|0899/.test(prefix)) prov = "three";
    else if (/^0881|0882|0883|0884|0885|0886|0887|0888/.test(prefix)) prov = "smartfren";
    else if (/^0851/.test(prefix)) prov = "byu";
    if (prov && typeof pricelistPPOB !== 'undefined' && pricelistPPOB[prov]) {
        logoImg.src = `images/${prov}.jfif`;
        logoArea.style.display = 'block';
        grid.innerHTML = "";
        pricelistPPOB[prov].forEach(p => cardTemplate(grid, p));
    }
}

function hitungSosmed(qty, id) {
    const data = hargaSatuan[id];
    const display = document.getElementById('hasil-kalkulasi');
    const val = parseInt(qty);
    
    if (!val || val < data.min) { 
        display.innerHTML = `<span style="color:#aaa;">Min: ${data.min}</span>`; 
        selectedProduct = ""; return; 
    }
    
    if (val > data.max) {
        display.innerHTML = `<span style="color:red;">Maksimal ${data.max}!</span>`;
        selectedProduct = ""; return;
    }

    const total = Math.ceil(val * data.price);
    selectedPrice = `Rp${total.toLocaleString('id-ID')}`;
    selectedProduct = `${val} ${document.getElementById('order-title').innerText}`;
    display.innerHTML = `<span style="color: #2ecc71;">Total: ${selectedPrice}</span>`;
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
}

function selectItem(item, harga, el) {
    selectedProduct = item; selectedPrice = harga;
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    const calcInput = document.getElementById('custom-qty');
    if(calcInput) { calcInput.value = ""; document.getElementById('hasil-kalkulasi').innerText = "Rp0"; }
}

// --- VALIDASI KONFIRMASI (LINKGUARD) ---
function tampilkanKonfirmasi() {
    const userId = document.getElementById('user-id').value.trim();
    const zoneId = document.getElementById('zone-id').value.trim();
    const isSosmed = (currentServiceId.includes('fol') || currentServiceId.includes('view') || currentServiceId.includes('like') || hargaSatuan[currentServiceId]?.price);

    if (!userId) return kustomAlert("Data Kosong", "Data tujuan belum diisi!");

    if (!isSosmed) {
        // Validasi ID Game/Topup
        if (userId.length < 5) return kustomAlert("ID Salah", "ID minimal 5 digit!");
        
        // Validasi PPOB (Nomor HP)
        const isPPOB = (['pulsa', 'dana', 'gopay', 'ovo', 'shopeepay'].includes(currentServiceId));
        if (isPPOB && userId.length < 10) return kustomAlert("Nomor Salah", "Nomor HP minimal 10 digit!");
    } else {
        // Validasi Link/Username
        if (userId.length < 3) return kustomAlert("Target Salah", "Username/Link minimal 3 karakter!");
    }

    // Validasi Khusus Mobile Legends
    if (currentServiceId === 'ml' && (userId.length < 5 || zoneId.length < 4)) {
        return kustomAlert("ML Error", "ID (min 5) atau Zone (min 4) belum lengkap!");
    }

    if (!selectedProduct) return kustomAlert("Belum Pilih", "Silakan pilih produk/jumlah!");
    document.getElementById('confirm-overlay').style.display = 'flex';
}

function prosesKeWA() {
    const admin = getCurrentAdmin();
    let tujuan = document.getElementById('user-id').value.trim();
    const zone = document.getElementById('zone-id').value.trim();
    const config = hargaSatuan[currentServiceId] || {};
    if (config.isUser && config.urlPrefix) {
        tujuan = `${config.urlPrefix}${tujuan.replace('@', '')}`;
    }
    const finalTujuan = (currentServiceId === 'ml') ? `${tujuan} (${zone})` : tujuan;
    const textWA = `*ORDER SYRUMI STORE*\n\n*Layanan:* ${selectedProduct}\n*Target:* ${finalTujuan}\n*Harga:* ${selectedPrice}\n\n${admin.note}`;
    window.location.href = `https://wa.me/${admin.nomor}?text=${encodeURIComponent(textWA)}`;
}
