const API_BASE_URL = 'https://itcs-staging.up.railway.app/itcs-svc';
const TOKEN_USER_ID = window.__ENV_TOKEN__ || '<SECRET_TOKEN>';

const FORM = document.getElementById('searchForm');
const INPUT = document.getElementById('plateInput');
const FEEDBACK = document.querySelector('[data-feedback]');
const MODAL = document.getElementById('vehicleModal');
const PLATE_EL = MODAL.querySelector('[data-plate]');
const STATUS_EL = MODAL.querySelector('[data-status]');
const CASE_DETAILS_EL = MODAL.querySelector('[data-case-details]');
const OWNER_DETAILS_EL = MODAL.querySelector('[data-owner-details]');
const GALLERY_EL = MODAL.querySelector('[data-gallery]');
const LOADING_WRAP = document.getElementById('loadingWrap');

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
closeTriggers.forEach(btn => btn.addEventListener('click', () => toggleModal(false)));

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') toggleModal(false);
});

FORM.addEventListener('submit', async event => {
  event.preventDefault();
  const sanitizedPlate = sanitizePlate(INPUT.value);

  if (!sanitizedPlate) {
    FEEDBACK.textContent = 'Masukkan nombor pendaftaran yang sah.';
    return;
  }

  FEEDBACK.textContent = '';
  toggleModal(false);
  setLoading(true);

  try {
    const opRecord = await fetchTowingOperationByPlate(sanitizedPlate);
    const record = opRecord
      ? mapTowingOperationToRecord(opRecord, sanitizedPlate)
      : await fetchTowAssignmentFallbackRecord(sanitizedPlate);

    if (!record) {
      FEEDBACK.textContent = 'Rekod tidak ditemui dalam sistem. Sila hubungi MBPG untuk bantuan lanjut.';
      return;
    }

    populateModal(record);
    toggleModal(true);
  } catch (error) {
    console.error('Vehicle lookup failed:', error);
    FEEDBACK.textContent = 'Ralat semasa mendapatkan rekod. Sila cuba sebentar lagi.';
  } finally {
    setLoading(false);
  }
});

function sanitizePlate(value = '') {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
}

async function fetchTowingOperationByPlate(plate) {
  const payload = {
    vehicleRegistrationNo: plate,
    page: 0,
    size: 1,
    sortBy: 'createdDate',
    sortDirection: 'DESC'
  };

  const response = await callApi('/api/towing-operations/search', payload);
  const items = extractItems(response);
  return items[0] || null;
}

async function fetchTowAssignmentFallbackRecord(plate) {
  const payload = {
    vehicleRegistrationNo: plate,
    page: 0,
    size: 1,
    sortBy: 'createdDate',
    sortDirection: 'DESC'
  };

  const response = await callApi('/api/tow-assignments/search', payload);
  const item = extractItems(response)[0];
  if (!item) return null;

  return {
    plate: item.vehicleRegistrationNo || plate,
    status: item.status || 'Dalam Proses',
    caseRef: item.assignmentId || '—',
    incidentDate: formatDate(item.assignedDatetime) || '—',
    reportDate: formatDate(item.createdDate || item.assignedDatetime) || '—',
    offenceType: item.warningNoticeNumber ? `Notis: ${item.warningNoticeNumber}` : 'Kes Tundaan',
    legislation: '—',
    location: '—',
    enforcementTeam: 'MBPG ITCS',
    officerInCharge: item.assignedByName || '—',
    towOperator: item.towingRegistrationNumber || '—',
    ownerName: '—',
    ownerContact: '—',
    ownerAddress: '—',
    releaseYard: '—',
    storageFee: '—',
    remarks: 'Data daripada tow-assignments',
    gallery: []
  };
}

async function callApi(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'token-user-id': TOKEN_USER_ID
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

function extractItems(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data?.content)) return response.data.content;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function mapTowingOperationToRecord(op, fallbackPlate) {
  return {
    plate: op.vehicleRegistrationNo || fallbackPlate,
    status: op.status || 'Dalam Proses',
    caseRef: op.towingId || op.assignmentId || '—',
    incidentDate: formatDate(op.createdAt) || '—',
    reportDate: formatDate(op.createdDate || op.createdAt) || '—',
    offenceType: op.warningNoticeNumber ? `Notis: ${op.warningNoticeNumber}` : 'Kes Tundaan',
    legislation: '—',
    location: '—',
    enforcementTeam: 'MBPG ITCS',
    officerInCharge: op.initiatedBy || '—',
    towOperator: '—',
    ownerName: '—',
    ownerContact: '—',
    ownerAddress: '—',
    releaseYard: op.status === 'IN_DEPOT' ? 'Depoh MBPG' : '—',
    storageFee: '—',
    remarks: op.entrySource ? `Sumber: ${op.entrySource}` : '—',
    gallery: []
  };
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('ms-MY', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
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

function setLoading(isLoading) {
  if (LOADING_WRAP) {
    LOADING_WRAP.hidden = !isLoading;
    LOADING_WRAP.setAttribute('aria-busy', isLoading ? 'true' : 'false');
  }
  const submitBtn = FORM?.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = isLoading;
  if (INPUT) INPUT.disabled = isLoading;
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
if (yearEl) yearEl.textContent = new Date().getFullYear();
