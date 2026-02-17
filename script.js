let selectedProduct = "", selectedPrice = "", currentServiceId = "";
let currentValidation = {}; // Menyimpan aturan validasi saat ini

// --- KONFIGURASI ADMIN ---
const ADMIN_A = "6289507913948"; 
const ADMIN_B = "6285924527083"; 

function getCurrentAdmin() {
    const detik = new Date().getSeconds();
    // Ganjil Genap untuk membagi beban admin
    return (detik % 2 === 0) ? 
        { nomor: ADMIN_A, label: "ADMIN A", note: "- DANA: 089507913948\n- QRIS: Cek Profil WA" } : 
        { nomor: ADMIN_B, label: "ADMIN B", note: "- DANA: 085924527083\n- QRIS: Minta Admin" };
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
    
    // Khusus Sub-Menu E-Wallet
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

// --- ORDER LOGIC & VALIDATION ---
function openOrder(id, name, label) {
    currentServiceId = id;
    selectedProduct = ""; selectedPrice = "";
    
    // Ambil Config Sosmed jika ada
    const config = hargaSatuan[id] || {};
    currentValidation = config; 
    
    // Setup Tampilan
    document.getElementById('order-title').innerText = name;
    document.getElementById('label-input').innerText = config.label || label;
    
    const inputMain = document.getElementById('user-id');
    const inputZone = document.getElementById('zone-id');
    const grid = document.getElementById('grid-produk');
    const kalkulator = document.getElementById('kalkulator-sosmed-container');
    const logoArea = document.getElementById('operator-logo-container');
    
    // Reset State
    inputMain.value = ""; inputZone.value = ""; 
    inputMain.oninput = null;
    logoArea.style.display = 'none';
    kalkulator.style.display = 'none';
    inputZone.style.display = 'none';
    grid.innerHTML = "";

    // --- LOGIC PER LAYANAN ---

    // 1. PULSA (Time Lock & Numeric Only)
    if (id === 'pulsa') {
        const jam = new Date().getHours();
        if (jam >= 22 || jam < 4) {
            grid.innerHTML = `<div style="text-align:center; padding:30px; color:red;"><h3>TOKO TUTUP</h3><p>Buka kembali jam 04:00 WIB</p></div>`;
            switchScreen('screen-order');
            return;
        }
        inputMain.placeholder = "08xxxxxxxx";
        inputMain.maxLength = 13;
        inputMain.oninput = function() {
            this.value = this.value.replace(/[^0-9]/g, ''); // Hapus huruf
            handleDeteksiOperator(this.value);
        };
        grid.innerHTML = "<p style='text-align:center; padding:20px; color:#aaa;'>Masukkan nomor untuk melihat harga...</p>";
    }

    // 2. E-WALLET (Numeric Only)
    else if (['dana', 'gopay', 'ovo', 'shopeepay'].includes(id)) {
        inputMain.placeholder = "08xxxxxxxx";
        inputMain.maxLength = 13;
        inputMain.oninput = function() { this.value = this.value.replace(/[^0-9]/g, ''); };
        renderPPOB(id);
    }

    // 3. MOBILE LEGENDS (Special Validation)
    else if (id === 'ml') {
        inputZone.style.display = 'block';
        inputMain.placeholder = "User ID (10-13 digit)";
        inputZone.placeholder = "Zone (4-5)";
        
        // Input Guard: Angka Saja
        inputMain.oninput = function() { this.value = this.value.replace(/[^0-9]/g, ''); };
        inputZone.oninput = function() { this.value = this.value.replace(/[^0-9]/g, ''); };
        
        renderGame(id);
    }

    // 4. GAME LAIN (Free Fire, dll)
    else if (!config.min) { // Kalau bukan sosmed (karena sosmed punya config.min)
        inputMain.placeholder = "Player ID / UID";
        inputMain.oninput = function() { this.value = this.value.replace(/[^0-9]/g, ''); };
        renderGame(id);
    }

    // 5. SOSMED (Kalkulator & Link Guard)
    else {
        inputMain.placeholder = config.label;
        inputMain.oninput = null; // Bebas input teks (username/link)
        
        // Tampilkan Kalkulator
        kalkulator.style.display = 'block';
        kalkulator.innerHTML = `
            <div style="background:rgba(255,133,179,0.1); padding:15px; border-radius:10px; border:1px dashed #ff85b3;">
                <label style="font-size:11px; font-weight:bold; color:#ff85b3;">JUMLAH (Min: ${config.min} - Max: ${config.max})</label>
                <input type="number" id="custom-qty" placeholder="Masukkan jumlah..." style="margin-top:5px; padding:10px; width:100%; border-radius:8px; border:1px solid #ddd;" oninput="hitungSosmed(this.value, '${id}')">
                <div id="hasil-kalkulasi" style="text-align:right; font-weight:bold; color:#ff85b3; margin-top:10px;">Rp0</div>
            </div>`;
    }

    switchScreen('screen-order');
}

// --- RENDER FUNCTIONS ---
function renderPPOB(id) {
    const grid = document.getElementById('grid-produk');
    if(window.pricelistPPOB && window.pricelistPPOB[id]) {
        window.pricelistPPOB[id].forEach(p => cardTemplate(grid, p));
    }
}
function renderGame(id) {
    const grid = document.getElementById('grid-produk');
    const all = { ...(window.pricelistGame || {}), ...(window.pricelistSosmed || {}) };
    if(all[id]) all[id].forEach(p => cardTemplate(grid, p));
}
function cardTemplate(container, p) {
    const badge = p.label ? `<span class="badge-premium">${p.label}</span>` : '';
    container.innerHTML += `
        <div onclick="selectItem('${p.item}', '${p.harga}', this)" class="product-card ${p.isPremium?'premium':''}">
            <span class="item-name">${p.item} ${badge}</span>
            <span class="item-price">${p.harga}</span>
        </div>`;
}

// --- LOGIC DETEKSI PULSA ---
function handleDeteksiOperator(nomor) {
    if (nomor.length < 4) return;
    const prefix = nomor.slice(0, 4);
    let prov = "";
    
    if (/^0811|0812|0813|0821|0822|0852|0853|0823/.test(prefix)) prov = "telkomsel";
    else if (/^0857|0858|0814|0815|0816/.test(prefix)) prov = "indosat";
    else if (/^0817|0818|0819|0877|0878|0831|0838/.test(prefix)) prov = "xl_axis";
    else if (/^0895|0896|0897|0898|0899/.test(prefix)) prov = "three";
    else if (/^0881|0882|0883|0884|0885|0886|0887|0888/.test(prefix)) prov = "smartfren";

    const logo = document.getElementById('operator-logo');
    const area = document.getElementById('operator-logo-container');
    const grid = document.getElementById('grid-produk');

    if (prov && window.pricelistPPOB[prov]) {
        logo.src = `images/${prov}.jfif`;
        area.style.display = 'block';
        grid.innerHTML = "";
        window.pricelistPPOB[prov].forEach(p => cardTemplate(grid, p));
    }
}

// --- KALKULATOR SOSMED ---
function hitungSosmed(qty, id) {
    const data = hargaSatuan[id];
    const display = document.getElementById('hasil-kalkulasi');
    const val = parseInt(qty);

    if (!val || val <= 0) {
        display.innerText = "Rp0"; selectedProduct = ""; return;
    }
    if (val < data.min) {
        display.innerHTML = `<span style="color:red; font-size:11px;">Minimal: ${data.min}</span>`; selectedProduct = ""; return;
    }
    if (val > data.max) {
        display.innerHTML = `<span style="color:red; font-size:11px;">Maksimal: ${data.max}</span>`; selectedProduct = ""; return;
    }

    const total = Math.ceil(val * data.price);
    selectedPrice = `Rp${total.toLocaleString('id-ID')}`;
    // Format nama produk yang cantik
    const niceName = id.replace('tk_', 'TikTok ').replace('ig_', 'IG ').replace('shp_', 'Shopee ').replace('_', ' ').toUpperCase();
    selectedProduct = `${val} ${niceName}`;
    display.innerText = `Total: ${selectedPrice}`;
}

function selectItem(item, harga, el) {
    selectedProduct = item; selectedPrice = harga;
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    // Reset kalkulator jika user memilih pricelist manual
    const calcInput = document.getElementById('custom-qty');
    if(calcInput) calcInput.value = "";
}

// --- PROSES ORDER & VALIDASI AKHIR ---
function tampilkanKonfirmasi() {
    const inputMain = document.getElementById('user-id').value.trim();
    const inputZone = document.getElementById('zone-id').value.trim();

    // 1. Cek Kosong
    if (!inputMain) return kustomAlert("Data Kosong", "Data tujuan belum diisi!");
    if (!selectedProduct) return kustomAlert("Belum Pilih", "Silakan pilih nominal atau isi jumlah!");

    // 2. Validasi Mobile Legends
    if (currentServiceId === 'ml') {
        if (inputMain.length < 10 || inputMain.length > 13) return kustomAlert("ID Salah", "User ID ML harus 10-13 angka!");
        if (inputZone.length < 4 || inputZone.length > 5) return kustomAlert("Zone Salah", "Server/Zone ML harus 4-5 angka!");
    }

    // 3. Validasi Sosmed LinkGuard
    if (currentValidation.pattern) {
        const regex = new RegExp(currentValidation.pattern, 'i');
        if (!regex.test(inputMain)) {
            return kustomAlert("Link Salah", `Link harus mengandung: ${currentValidation.pattern}`);
        }
    }

    document.getElementById('confirm-overlay').style.display = 'flex';
}

function prosesKeWA() {
    const admin = getCurrentAdmin();
    let tujuan = document.getElementById('user-id').value.trim();
    const zone = document.getElementById('zone-id').value.trim();

    // Auto-Convert Username ke Link (Untuk Followers)
    if (currentValidation.isUser && currentValidation.urlPrefix) {
        // Hapus @ jika ada, lalu gabung dengan prefix
        const cleanUser = tujuan.replace('@', '');
        tujuan = `${currentValidation.urlPrefix}${cleanUser}`;
    }

    const finalTujuan = (currentServiceId === 'ml') ? `${tujuan} (${zone})` : tujuan;

    const textWA = `*ORDER SYRUMI STORE*\n\n*Layanan:* ${selectedProduct}\n*Target:* ${finalTujuan}\n*Harga:* ${selectedPrice}\n\n${admin.note}`;
    
    window.location.href = `https://wa.me/${admin.nomor}?text=${encodeURIComponent(textWA)}`;
}
