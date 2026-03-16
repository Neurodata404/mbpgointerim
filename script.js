const VEHICLE_RECORDS = {
  CNP521: {
    plate: 'CNP521',
    status: 'Menunggu bayaran',
    caseRef: 'ITCS-MBPG-2026-000872',
    incidentDate: '14 Mac 2026, 08:45 pagi',
    reportDate: '14 Mac 2026, 09:10 pagi',
    offenceType: 'Parkir di zon larangan tunda (petak lori barang)',
    legislation: 'Kaedah 25(1) Kaedah-Kaedah Lalu Lintas Jalan 1959',
    location: 'Lot 12, Jalan Rambai 3, Taman Bukit Dahlia, Pasir Gudang',
    enforcementTeam: 'Unit Tindakan Khas Penguatkuasaan (ITCS)',
    officerInCharge: 'PPJ Azran Khalid',
    towOperator: 'Kontraktor MBPG - Citra Logistics',
    ownerName: 'Syarikat Logistik Mega Sdn. Bhd.',
    ownerContact: '+607-251 8080',
    ownerAddress: 'Pusat Perniagaan Pasir Gudang, 81700 Pasir Gudang, Johor',
    releaseYard: 'Depoh Tundaan MBPG, Jalan Emas 3',
    storageFee: 'RM180 (tunda) + RM50/hari (simpanan)',
    remarks: 'Kenderaan boleh dituntut dalam tempoh 24 jam selepas bayaran diselesaikan.',
    gallery: ['assets/penguatkuasa.jpg', 'assets/penguatkuasa.jpg', 'assets/penguatkuasa.jpg', 'assets/penguatkuasa.jpg']
  },
  JQX8800: {
    plate: 'JQX8800',
    status: 'Selesai / Dilepaskan',
    caseRef: 'ITCS-MBPG-2026-000761',
    incidentDate: '10 Mac 2026, 11:20 malam',
    reportDate: '11 Mac 2026, 09:05 pagi',
    offenceType: 'Menutup laluan kecemasan di Medan Niaga',
    legislation: 'UUK 52 Undang-Undang Kecil MBPG 2019',
    location: 'Medan Selera Kota Masai, Pasir Gudang',
    enforcementTeam: 'Seksyen Penguatkuasaan Zon Selatan',
    officerInCharge: 'PPJ Nurul Shuhada',
    towOperator: 'MBPG Fleet Services',
    ownerName: 'Encik Farhan Halim',
    ownerContact: '+6012-555 8100',
    ownerAddress: 'No 19, Jalan Anggerik 2, Kota Masai, Johor',
    releaseYard: 'Depoh Tundaan MBPG, Jalan Delima 6',
    storageFee: 'RM180 (tunda) + RM40/hari (simpanan)',
    remarks: 'Kenderaan dilepaskan pada 12 Mac 2026 selepas bayaran penuh.',
    gallery: ['assets/penguatkuasa.jpg', 'assets/penguatkuasa.jpg']
  }
};

const FORM = document.getElementById('searchForm');
const INPUT = document.getElementById('plateInput');
const FEEDBACK = document.querySelector('[data-feedback]');
const MODAL = document.getElementById('vehicleModal');
const PLATE_EL = MODAL.querySelector('[data-plate]');
const STATUS_EL = MODAL.querySelector('[data-status]');
const CASE_DETAILS_EL = MODAL.querySelector('[data-case-details]');
const OWNER_DETAILS_EL = MODAL.querySelector('[data-owner-details]');
const GALLERY_EL = MODAL.querySelector('[data-gallery]');

const CASE_FIELDS = [
  { label: 'No. Rujukan', key: 'caseRef' },
  { label: 'Tarikh / Masa Kejadian', key: 'incidentDate' },
  { label: 'Tarikh Laporan', key: 'reportDate' },
  { label: 'Jenis Kesalahan', key: 'offenceType' },
  { label: 'Rujukan Perundangan', key: 'legislation' },
  { label: 'Lokasi Kesalahan', key: 'location' },
  { label: 'Jabatan / Unit', key: 'enforcementTeam' },
  { label: 'Pegawai Bertugas', key: 'officerInCharge' },
  { label: 'Kontraktor / Operator', key: 'towOperator' }
];

const OWNER_FIELDS = [
  { label: 'Nama Pemilik', key: 'ownerName' },
  { label: 'No. Telefon', key: 'ownerContact' },
  { label: 'Alamat Surat-Menyurat', key: 'ownerAddress' },
  { label: 'Lokasi Tuntutan', key: 'releaseYard' },
  { label: 'Caj & Syarat', key: 'storageFee' },
  { label: 'Catatan', key: 'remarks' }
];

const closeTriggers = MODAL.querySelectorAll('[data-close]');
closeTriggers.forEach(btn =>
  btn.addEventListener('click', () => toggleModal(false))
);

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    toggleModal(false);
  }
});

FORM.addEventListener('submit', event => {
  event.preventDefault();
  const sanitizedPlate = sanitizePlate(INPUT.value);
  if (!sanitizedPlate) {
    FEEDBACK.textContent = 'Masukkan nombor pendaftaran yang sah.';
    return;
  }

  const record = VEHICLE_RECORDS[sanitizedPlate];
  if (!record) {
    FEEDBACK.textContent = 'Rekod tidak ditemui dalam sistem. Sila hubungi MBPG untuk bantuan lanjut.';
    toggleModal(false);
    return;
  }

  FEEDBACK.textContent = '';
  populateModal(record);
  toggleModal(true);
});

function sanitizePlate(value = '') {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .trim();
}

function populateModal(record) {
  PLATE_EL.textContent = record.plate;
  STATUS_EL.textContent = record.status;
  renderDefinitionList(CASE_DETAILS_EL, CASE_FIELDS, record);
  renderDefinitionList(OWNER_DETAILS_EL, OWNER_FIELDS, record);
  renderGallery(record.gallery);
}

function renderDefinitionList(container, fields, record) {
  container.innerHTML = '';
  fields.forEach(field => {
    const dt = document.createElement('dt');
    dt.textContent = field.label;
    const dd = document.createElement('dd');
    dd.textContent = record[field.key] || '—';
    container.append(dt, dd);
  });
}

function renderGallery(images = []) {
  GALLERY_EL.innerHTML = '';
  if (!images.length) {
    const placeholder = document.createElement('p');
    placeholder.className = 'gallery__placeholder';
    placeholder.textContent = 'Tiada gambar dilampirkan.';
    GALLERY_EL.appendChild(placeholder);
    return;
  }

  images.forEach((src, index) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Gambar kesalahan ${index + 1}`;
    GALLERY_EL.appendChild(img);
  });
}

function toggleModal(state) {
  if (!state) {
    MODAL.classList.remove('is-visible');
    MODAL.setAttribute('aria-hidden', 'true');
    return;
  }

  MODAL.classList.add('is-visible');
  MODAL.setAttribute('aria-hidden', 'false');
}

const yearEl = document.getElementById('currentYear');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
