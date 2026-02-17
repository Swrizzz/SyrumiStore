let selectedProduct = "", selectedPrice = "", currentServiceId = "", requiredPattern = "";

// --- KONFIGURASI ADMIN ---
const ADMIN_A = "6289507913948"; 
const ADMIN_B = "6285924527083"; 
const isManualClose = false; 

function getCurrentAdmin() {
    const detik = new Date().getSeconds();
    const isAdminA = detik % 2 === 0; 
    if (isAdminA) {
        return { nomor: ADMIN_A, label: "ADMIN A", noteBayar: "- DANA: 089507913948\n- QRIS: https://whatsapp.com/channel/0029VbB9bWGLNSa9K95BId3P/504" };
    } else {
        return { nomor: ADMIN_B, label: "ADMIN B", noteBayar: "- DANA: 085924527083\n- QRIS: Minta ke Admin\n(Pajak 0 - 1.500)" };
    }
}

function kustomAlert(title, message, icon = "⚠️") {
    const iconEl = document.getElementById('alert-icon');
    const titleEl = document.getElementById('alert-title');
    const msgEl = document.getElementById('alert-message');
    const overlay = document.getElementById('alert-overlay');
    if(iconEl) iconEl.innerText = icon;
    if(titleEl) titleEl.innerText = title;
    if(msgEl) msgEl.innerText = message;
    if(overlay) overlay.style.display = 'flex';
}

function tutupAlert() { document.getElementById('alert-overlay').style.display = 'none'; }
function bukaTesti() { document.getElementById('testi-overlay').style.display = 'flex'; }
function tutupTesti() { document.getElementById('testi-overlay').style.display = 'none'; }

function konfirmasiSaluran() {
    tutupTesti();
    kustomAlert("Dialihkan!", "Kamu akan diarahkan ke Saluran WhatsApp Syrumi Store.", "🚀");
    setTimeout(() => { window.location.href = "https://whatsapp.com/channel/0029VbB9bWGLNSa9K95BId3P/504"; }, 2000);
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
    const target = document.getElementById(id);
    if(target) { target.style.display = 'block'; setTimeout(() => { target.classList.add('active'); }, 10); }
    window.scrollTo(0, 0);
}

function goToLobby() { switchScreen('screen-lobby'); }
function backToKategori() { switchScreen('screen-kategori'); }
function tutupKonfirmasi() { document.getElementById('confirm-overlay').style.display = 'none'; }

// --- LOGIKA KATEGORI (DENGAN SUB-MENU) ---
function openKategori(cat) {
    const listDiv = document.getElementById('list-layanan');
    listDiv.innerHTML = "";
    databaseLayanan[cat].forEach(item => {
        let func;
        if (item.comingSoon) {
            func = `kustomAlert('Segera Hadir', 'Layanan ${item.name} akan segera tersedia!', '⏳')`;
        } else if (item.isAppGroup) {
            func = `openSubSosmed('${item.id}')`;
        } else if (item.id === 'sub_ewallet') { // DETEKSI KLIK MENU EWALLET DI DALAM PPOB
            func = `openKategori('sub_ewallet')`;
        } else {
            func = `openOrder('${item.id}', '${item.name}', '${item.label}', false)`;
        }
        listDiv.innerHTML += `<div onclick="${func}" class="glass menu-item"><img src="${item.icon}"><span>${item.name}</span></div>`;
    });
    switchScreen('screen-kategori');
}

function openSubSosmed(appId) {
    const listDiv = document.getElementById('list-layanan');
    listDiv.innerHTML = `<p style="text-align:center; font-size:11px; color:#ff85b3; margin-bottom:15px; padding:0 10px;">⚠️ Akun dilarang private!</p>`;
    databaseLayanan.sosmed_apps[appId].forEach(sub => {
        listDiv.innerHTML += `<div onclick="openOrder('${sub.id}', '${sub.name}', '${sub.label}', true, '${sub.note || ""}', '${sub.pattern || ""}')" class="glass menu-item"><i class="fas fa-chevron-right" style="margin-right:15px; color:#ff85b3;"></i><div style="display:flex; flex-direction:column; text-align:left;"><span>${sub.name}</span>${sub.note ? `<small style="font-size:10px; color:#aaa;">${sub.note}</small>` : ''}</div></div>`;
    });
}

function openOrder(id, name, label, isSosmed, extraNote = "", pattern = "") {
    currentServiceId = id; 
    requiredPattern = pattern;
    selectedProduct = ""; 
    selectedPrice = "";
    document.getElementById('order-title').innerText = name;
    document.getElementById('label-input').innerText = label;
    const inputTujuan = document.getElementById('user-id');
    const inputZona = document.getElementById('zone-id');
    const grid = document.getElementById('grid-produk');
    const logoCont = document.getElementById('operator-logo-container');
    const kalkulatorCont = document.getElementById('kalkulator-sosmed-container');
    inputTujuan.value = ""; inputZona.value = ""; 
    if(logoCont) logoCont.style.display = 'none';
    if(kalkulatorCont) { kalkulatorCont.style.display = 'none'; kalkulatorCont.innerHTML = ""; }
    inputTujuan.oninput = null; inputZona.oninput = null;

    // LOGIKA INPUT BERDASARKAN LAYANAN
    if (['dana', 'gopay', 'ovo', 'shopeepay'].includes(id)) {
        inputTujuan.maxLength = 13; inputTujuan.placeholder = "08xxxxxxxx";
        inputTujuan.oninput = function() { this.value = this.value.replace(/[^0-9]/g, ''); };
        renderProductsEwallet(id); // Langsung munculkan list harga
    } else if (id === 'ml') {
        inputTujuan.maxLength = 12; inputZona.maxLength = 5;
        inputTujuan.placeholder = "User ID"; inputZona.placeholder = "Zona";
        inputTujuan.oninput = function() { this.value = this.value.replace(/[^0-9]/g, ''); };
        inputZona.oninput = function() { this.value = this.value.replace(/[^0-9]/g, ''); };
        renderProducts(id);
    } else if (id === 'ff') {
        inputTujuan.maxLength = 12; inputTujuan.placeholder = "Player ID";
        inputTujuan.oninput = function() { this.value = this.value.replace(/[^0-9]/g, ''); };
        renderProducts(id);
    } else if (id === 'pulsa') {
        inputTujuan.maxLength = 15; inputTujuan.placeholder = "0812xxxx";
        inputTujuan.oninput = function() { this.value = this.value.replace(/[^0-9]/g, ''); handleDeteksiOperator(this.value); };
        grid.innerHTML = "<p style='text-align:center; font-size:12px; color:#aaa; padding:20px;'>Menunggu nomor...</p>";
    } else {
        inputTujuan.maxLength = 500; inputTujuan.placeholder = "Masukkan Link/Username";
        renderProducts(id);
    }

    inputZona.style.display = (id === 'ml') ? 'block' : 'none';
    
    if (isSosmed && typeof hargaSatuan !== 'undefined' && hargaSatuan[id] && kalkulatorCont) {
        const data = hargaSatuan[id];
        kalkulatorCont.style.display = 'block';
        kalkulatorCont.innerHTML = `<div style="display: flex; gap: 10px; align-items: flex-end;"><div style="flex: 1.5; text-align: left;"><label style="font-size: 10px; color: #ff85b3; font-weight: bold; margin-left: 5px;">JUMLAH BEBAS</label><input type="number" id="custom-qty" placeholder="Min: ${data.min}" style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #ff85b3; background: #fff; margin-top: 5px; height:50px;" oninput="hitungHargaOtomatis(this.value, '${id}')"></div><div style="flex: 1; text-align: left;"><label style="font-size: 10px; color: #ff85b3; font-weight: bold; margin-left: 5px;">HARGA</label><div id="display-harga-otomatis" style="height: 50px; background: #fff; border-radius: 12px; border: 1px solid #ff85b3; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #ff85b3; margin-top: 5px; font-size: 14px;">Rp0</div></div></div>`;
    }
    switchScreen('screen-order');
}

function renderProductsEwallet(id) {
    const grid = document.getElementById('grid-produk');
    grid.innerHTML = "";
    if(pricelistEwallet[id]) {
        pricelistEwallet[id].forEach(p => {
            const badge = p.label ? `<span class="badge-premium">${p.label}</span>` : '';
            grid.innerHTML += `<div onclick="selectItem('${p.item}', '${p.harga}', this)" class="product-card ${p.isPremium?'premium':''}"><span class="item-name" style="color:#000 !important;">${p.item} ${badge}</span><span class="item-price">${p.harga}</span></div>`;
        });
    }
}

function handleDeteksiOperator(nomor) {
    const provider = deteksiOperator(nomor);
    const logoCont = document.getElementById('operator-logo-container');
    const logoImg = document.getElementById('operator-logo');
    const grid = document.getElementById('grid-produk');
    const daftarLogo = { "telkomsel": "images/telkomsel.jfif", "indosat": "images/indosat.jfif", "xl_axis": "images/XL.jfif", "three": "images/three.jfif", "smartfren": "images/smartfren.jfif", "byu": "images/by-u.jfif" };

    if (provider) {
        const jam = new Date().getHours();
        if (isManualClose || (jam >= 22 || jam < 4)) {
            logoCont.style.display = 'none';
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 20px;"><h3 style="color: #ff85b3;">LAYANAN TUTUP</h3><p style="font-size: 12px;">Buka kembali jam 04:00 WIB</p></div>`;
            return;
        }
        renderProductsPulsa(provider);
        logoImg.src = daftarLogo[provider]; logoCont.style.display = 'block';
    } else {
        logoCont.style.display = 'none';
        grid.innerHTML = "<p style='text-align:center; font-size:12px; color:#aaa; padding:20px;'>Menunggu operator...</p>";
    }
}

function deteksiOperator(nomor) {
    if (nomor.length < 4) return null;
    const prefix = nomor.slice(0, 4);
    if (/^0851$/.test(prefix)) return "byu"; 
    if (/^0811|0812|0813|0821|0822|0823|0852|0853$/.test(prefix)) return "telkomsel";
    if (/^0814|0815|0816|0855|0856|0857|0858$/.test(prefix)) return "indosat";
    if (/^0817|0818|0819|0859|0877|0878|0831|0832|0833|0838$/.test(prefix)) return "xl_axis";
    if (/^0895|0896|0897|0898|0899$/.test(prefix)) return "three";
    if (/^0881|0882|0883|0884|0885|0886|0887|0888|0889$/.test(prefix)) return "smartfren";
    return null;
}

function renderProducts(id) {
    const grid = document.getElementById('grid-produk');
    const allData = { ...pricelistGame, ...pricelistSosmed };
    const data = allData[id];
    grid.innerHTML = "";
    if(data) {
        data.forEach(p => {
            const badge = (p.label || p.isPremium) ? `<span class="badge-premium">${p.label || 'HOT'}</span>` : '';
            grid.innerHTML += `<div onclick="selectItem('${p.item}', '${p.harga}', this)" class="product-card ${p.isPremium?'premium':''}"><span class="item-name" style="color:#000 !important;">${p.item} ${badge}</span><span class="item-price">${p.harga}</span></div>`;
        });
    }
}

function renderProductsPulsa(provider) {
    const grid = document.getElementById('grid-produk');
    grid.innerHTML = "";
    if(pricelistPPOB[provider]) {
        pricelistPPOB[provider].forEach(p => {
            const badge = p.label ? `<span class="badge-premium">${p.label}</span>` : '';
            grid.innerHTML += `<div onclick="selectItem('${p.item}', '${p.harga}', this)" class="product-card"><span class="item-name" style="color:#000 !important;">${p.item} ${badge}</span><span class="item-price">${p.harga}</span></div>`;
        });
    }
}

function selectItem(item, harga, el) {
    const manualInput = document.getElementById('custom-qty');
    const displayManual = document.getElementById('display-harga-otomatis');
    if (manualInput) { manualInput.value = ""; if (displayManual) displayManual.innerText = "Rp0"; }
    selectedProduct = item; selectedPrice = harga;
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
}

function tampilkanKonfirmasi() {
    const val = document.getElementById('user-id').value.trim();
    if (!val) return kustomAlert("Data Kosong", "Isi nomor/ID tujuan!", "❌");
    if (!selectedProduct) return kustomAlert("Pilihan Kosong", "Pilih nominal paket!", "🛒");
    document.getElementById('confirm-overlay').style.display = 'flex';
}

function prosesKeWA() {
    const admin = getCurrentAdmin();
    let val = document.getElementById('user-id').value.trim();
    const zone = document.getElementById('zone-id').value;
    const tujuan = (currentServiceId === 'ml' && zone) ? `${val} (${zone})` : val;
    const textWA = `*ORDER SYRUMI STORE [${admin.label}]*\n\n*Produk:* ${selectedProduct}\n*Tujuan:* ${tujuan}\n*Harga: ${selectedPrice}*\n\n----------------------------\n[ CARA BAYAR ]\n1. Transfer sesuai nominal.\n2. Kirim Bukti di chat ini.\n----------------------------\n[ PEMBAYARAN ]\n${admin.noteBayar}\n----------------------------`;
    window.location.href = `https://wa.me/${admin.nomor}?text=${encodeURIComponent(textWA)}`;
}

function kirimTestiWA() {
    const admin = getCurrentAdmin();
    const t = document.getElementById('input-testi').value.trim();
    if(!t) return kustomAlert("Kosong", "Tulis testimoninya dulu!", "✍️");
    const pesanTesti = `*TESTIMONI SYRUMI STORE*%0A%0A"${t}"`;
    window.location.href = `https://wa.me/${admin.nomor}?text=${pesanTesti}`;
}

function hitungHargaOtomatis(qty, id) {
    const display = document.getElementById('display-harga-otomatis');
    const data = hargaSatuan[id];
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
    if (!qty || qty <= 0) { display.innerText = "Rp0"; return; }
    if (qty < data.min) { display.innerHTML = `<span style="color:red; font-size:10px;">Min: ${data.min}</span>`; return; }
    const total = Math.ceil(qty * data.price);
    selectedProduct = `${qty} ${document.getElementById('order-title').innerText}`;
    selectedPrice = `Rp${total.toLocaleString('id-ID')}`;
    display.innerText = selectedPrice;
}
