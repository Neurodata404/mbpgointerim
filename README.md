# mbpgointerim
Landing page for Sistem Semakan Tundaan MBPG online

## API Integration

### Endpoint utama
- `POST https://itcs-staging.up.railway.app/itcs-svc/api/towing-operations/search`

### Fallback endpoint
- `POST https://itcs-staging.up.railway.app/itcs-svc/api/tow-assignments/search`

### Header wajib
- `token-user-id: <SECRET_TOKEN>`

Token sekarang dibaca dari:
- `window.__ENV_TOKEN__` (jika diset oleh host page)
- fallback ke placeholder dalam `script.js` (`TOKEN_USER_ID`)

## Aliran semakan no. kenderaan
1. User masukkan no. plat (cth `CNP521`)
2. Sistem sanitize input dan panggil API utama
3. Jika tiada data, sistem cuba fallback endpoint
4. Jika ada rekod, modal dibuka dengan data dipetakan ke UI
5. Jika tiada rekod, paparan mesej “Rekod tidak ditemui ...”
6. Jika ralat auth/network/API, paparan mesej ralat mesra pengguna

## Loading bar
- Muncul sebaik sahaja user tekan butang `Semak`
- Input + butang submit akan disabled semasa loading
- Hilang automatik selepas success/not-found/error

## Ujian manual cepat
1. Pastikan token sah tersedia (`window.__ENV_TOKEN__` atau update placeholder)
2. Buka laman dan masukkan no. plat
3. Semak:
   - Loading bar muncul semasa fetch
   - Modal dibuka bila data dijumpai
   - Mesej not found/ralat dipaparkan dengan betul
