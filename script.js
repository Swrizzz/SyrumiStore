let selectedProduct = "", selectedPrice = "", currentServiceId = "", currentUnitName = "Pcs", activeOrderID = "";

function kustomAlert(title, message, icon = "⚠️") {
    document.getElementById('alert-icon').innerText = icon;
    document.getElementById('alert-title').innerText = title;
    document.getElementById('alert-message').innerText = message;
    document.getElementById('alert-overlay').style.display = 'flex';
}

function tutupAlert() { document.getElementById('alert-overlay').style.display = 'none'; }

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    const target = document.getElementById(id);
    target.style.display = 'block';
    setTimeout(() => { target.classList.add('active'); }, 10);
    window.scrollTo(0, 0);
}

function openKategori(cat) {
    const listDiv = document.getElementById('list-layanan');
    listDiv.innerHTML = "";
    databaseLayanan[cat].forEach(item => {
        const func = item.isAppGroup ? `openSubSosmed('${item.id}')` : `openOrder('${item.id}', '${item.name}', '${item.label}', false)`;
        listDiv.innerHTML += `<div onclick="${func}" class="glass menu-item"><img src="${item.icon}"><span>${item.name}</span></div>`;
    });
    switchScreen('screen-kategori');
}

function openSubSosmed(appId) {
    const listDiv = document.getElementById('list-layanan');
    listDiv.innerHTML = "";
    databaseLayanan.sosmed_apps[appId].forEach(sub => {
        listDiv.innerHTML += `<div onclick="openOrder('${sub.id}', '${sub.name}', '${sub.label}', true, '${sub.unit}')" class="glass menu-item"><i class="fas fa-chevron-right" style="margin-right:15px; color:#ff85b3;"></i><span>${sub.name}</span></div>`;
    });
}

function openOrder(id, name, label, manual, unitName = "Pcs") {
    currentServiceId = id; 
    currentUnitName = unitName;
    selectedProduct = ""; 
    selectedPrice = "";
    
    document.getElementById('order-title').innerText = name;
    document.getElementById('label-input').innerText = label;
    document.getElementById('user-id').value = "";
    
    // Sembunyikan Zone ID kecuali untuk ML
    document.getElementById('zone-id').style.display = (id === 'ml') ? 'block' : 'none';
    
    // Atur tampilan manual (Sosmed) atau grid (Game/Pulsa)
    document.getElementById('wrapper-manual').style.display = manual ? 'block' : 'none';
    document.getElementById('wrapper-grid').style.display = manual ? 'none' : 'block';
    
    const grid = document.getElementById('grid-produk');
    
    if (id === 'pulsa') {
        // Jika Pulsa, kosongkan grid dan beri instruksi
        grid.innerHTML = "<p style='text-align:center; font-size:12px; color:#aaa; padding:20px;'>Masukkan nomor HP untuk melihat harga...</p>";
    } else {
        // Jika Game, langsung render harganya
        renderProducts(id);
    }
    
    switchScreen('screen-order');
}

// LOGIKA DETEKSI OPERATOR PULSA
function deteksiOperator(nomor) {
    if (nomor.length < 4) return null;
    const prefix = nomor.slice(0, 4);
    if (/^0811|0812|0813|0821|0822|0823|0851|0852|0853$/.test(prefix)) return "telkomsel";
    if (/^0814|0815|0816|0855|0856|0857|0858$/.test(prefix)) return "indosat";
    if (/^0817|0818|0819|0859|0877|0878|0831|0832|0833|0838$/.test(prefix)) return "xl_axis";
    if (/^0895|0896|0897|0898|0899$/.test(prefix)) return "three";
    if (/^0881|0882|0883|0884|0885|0886|0887|0888|0889$/.test(prefix)) return "smartfren";
    return null;
}

// Pantau input nomor HP (gunakan ID 'user-id' karena itu input utama kamu)
document.addEventListener('keyup', function(e) {
    if (e.target && e.target.id === 'user-id' && currentServiceId === 'pulsa') {
        const provider = deteksiOperator(e.target.value);
        if (provider) {
            renderProductsPulsa(provider);
        } else {
            document.getElementById('grid-produk').innerHTML = "<p style='text-align:center; font-size:12px; color:#aaa; padding:20px;'>Menunggu operator...</p>";
        }
    }
});

function renderProducts(id) {
    const grid = document.getElementById('grid-produk');
    grid.innerHTML = pricelist[id] ? "" : "<p style='text-align:center; font-size:12px; color:#aaa; padding:20px;'>Paket segera hadir...</p>";
    if(pricelist[id]) {
        pricelist[id].forEach(p => {
            const premiumClass = p.isPremium ? 'premium' : '';
            grid.innerHTML += `
                <div onclick="selectItem('${p.item}', '${p.harga}', this)" class="product-card ${premiumClass}">
                    <span class="item-name">${p.item}</span>
                    <span class="item-price">${p.harga}</span>
                </div>`;
        });
    }
}

// Fungsi Khusus Render Pulsa
function renderProductsPulsa(provider) {
    const grid = document.getElementById('grid-produk');
    if (pricelist.pulsa && pricelist.pulsa[provider]) {
        grid.innerHTML = "";
        pricelist.pulsa[provider].forEach(p => {
            grid.innerHTML += `
                <div onclick="selectItem('${p.item}', '${p.harga}', this)" class="product-card">
                    <span class="item-name">${p.item}</span>
                    <span class="item-price">${p.harga}</span>
                </div>`;
        });
    }
}

function selectItem(item, harga, el) {
    selectedProduct = item; selectedPrice = harga;
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
}

function hitungHargaManual() {
    const qty = parseInt(document.getElementById('jumlah-manual').value) || 0;
    const inputHarga = document.getElementById('harga-manual');
    let hrg = 0;
    if(currentServiceId === 'tk_fol') hrg = hargaKonstanta.tiktokFollowers;
    else if(currentServiceId === 'tk_like') hrg = hargaKonstanta.tiktokLikes;
    else if(currentServiceId === 'ig_fol') hrg = hargaKonstanta.igFollowers;

    if(qty >= 50) {
        const total = qty * hrg;
        selectedProduct = qty + " " + currentUnitName;
        selectedPrice = "Rp" + total.toLocaleString('id-ID');
        inputHarga.value = total.toLocaleString('id-ID');
    } else {
        inputHarga.value = ""; selectedProduct = ""; selectedPrice = "";
    }
}

function tampilkanKonfirmasi() {
    if(!document.getElementById('user-id').value) return kustomAlert("Data Kosong", "Isi Link/ID tujuan!", "❌");
    if(!selectedProduct) return kustomAlert("Pilihan Kosong", "Pilih nominal dulu!", "🛒");

    const d = new Date();
    const tglBln = String(d.getDate()).padStart(2, '0') + String(d.getMonth() + 1).padStart(2, '0');
    const jamMnt = String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0');
    activeOrderID = `SYR-${tglBln}-${jamMnt}`;
    document.getElementById('generated-id').innerText = activeOrderID;
    document.getElementById('confirm-overlay').style.display = 'flex';
}

function prosesKeWA() {
    let val = document.getElementById('user-id').value.trim();
    const zone = document.getElementById('zone-id').value;
    const namaProduk = document.getElementById('order-title').innerText;
    let tujuan = zone ? `${val} (${zone})` : val;

    const pesan = window.encodeURIComponent(
        `*ORDER BARU SYRUMISTORE*\n\n` +
        `ID: ${activeOrderID}\n` +
        `Barang: ${selectedProduct} ${namaProduk}\n` +
        `Tujuan: ${tujuan}\n` +
        `Total: ${selectedPrice}\n\n` +
        `_Halo admin, silakan proses pesanan saya_`
    );
    window.location.href = `https://wa.me/6289507913948?text=${pesan}`;
}

function cekResi() {
    const idInput = document.getElementById('input-resi').value.trim().toUpperCase();
    const box = document.getElementById('status-result-box');
    if(typeof databaseStatus !== 'undefined' && databaseStatus[idInput]) {
        const data = databaseStatus[idInput];
        box.style.display = 'block';
        document.getElementById('st-icon').innerText = data.icon;
        document.getElementById('st-label').innerText = data.status;
        document.getElementById('st-desc').innerText = data.desc;
        document.getElementById('st-action').innerHTML = data.link ? `<button onclick="window.open('${data.link}')" class="btn-confirm">Lihat Bukti</button>` : "";
    } else {
        kustomAlert("Tidak Ditemukan", "ID belum terdaftar.", "🔍");
    }
}

function goToLobby() { switchScreen('screen-lobby'); }
function backToKategori() { switchScreen('screen-kategori'); }
function tutupKonfirmasi() { document.getElementById('confirm-overlay').style.display = 'none'; }
function tampilkanKonfirmasiSaluran() { document.getElementById('testi-overlay').style.display = 'flex'; }
function tutupTesti() { document.getElementById('testi-overlay').style.display = 'none'; }
function bukaSaluran() { window.open("https://whatsapp.com/channel/0029VbB9bWGLNSa9K95BId3P", "_blank"); tutupTesti(); }
