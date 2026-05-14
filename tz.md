P# BIZNESJON — Loyiha Hujjati

> Tadbirkorlar uchun bepul professional ta'lim va hamjamiyat platformasi

| | |
|---|---|
| **Versiya** | 2.0 (Final) |
| **Sana** | 2026 |
| **Holat** | Implementatsiya uchun tasdiqlangan |
| **Til** | O'zbek (lotin) |

---

## Mundarija

1. [Loyiha haqida](#1-loyiha-haqida)
2. [Maqsadli auditoriya](#2-maqsadli-auditoriya)
3. [Platformaning tuzilishi](#3-platformaning-tuzilishi)
4. [Foydalanuvchi yo'li](#4-foydalanuvchi-yoli)
5. [Sohalar va bo'limlar](#5-sohalar-va-bolimlar)
6. [Sahifalar va funksiyalar](#6-sahifalar-va-funksiyalar)
7. [Foydalanuvchi rollari](#7-foydalanuvchi-rollari)
8. [Til tizimi](#8-til-tizimi)
9. [UI/UX tamoyillari](#9-uiux-tamoyillari)
10. [Daromad modeli](#10-daromad-modeli)
11. [Launch strategiyasi](#11-launch-strategiyasi)

---

## 1. Loyiha haqida

Biznesjon — O'zbekistondagi tadbirkorlar uchun mo'ljallangan to'liq bepul professional ta'lim platformasi.

Platforma foydalanuvchilarga quyidagilarni taqdim etadi:

- O'z sohasi bo'yicha professional video darslar
- Boshqa tadbirkorlar bilan muloqot (shaxsiy chat va guruh chatlar)
- "Mening saytim" — mijoz biznesi haqida jamoa tomonidan yaratilgan professional video o'z profilida

### Asosiy qadriyatlar

| Qadriyat | Mohiyat |
|---|---|
| **Bepullik** | Hech qanday to'lov, yashirin narx, premium versiya yoki reklama yo'q |
| **Sifat** | Har dars va har xizmat professional darajada tayyorlanadi |
| **Soddalik** | Har kim uchun tushunarli interfeys |
| **Mahalliylik** | O'zbekiston bozori va mentalitetiga moslashtirilgan |
| **Hamjamiyat** | Tadbirkorlar bir-biri bilan erkin muloqot qila olishadi |

---

## 2. Maqsadli auditoriya

Platformaning asosiy auditoriyasi — tadbirkorlar va kichik biznes egalari.

| Til | Kimlar uchun |
|---|---|
| O'zbekcha (lotin) | Yoshlar va asosiy aholi |
| Ўзбекча (kirill) | Yoshi katta foydalanuvchilar |
| Русский | Rus tilida ishlovchi tadbirkorlar |
| English | Xorijiy va xalqaro tadbirkorlar |

**Yosh chegarasi yo'q** — barcha yoshdagi tadbirkorlar uchun ochiq.

---

## 3. Platformaning tuzilishi

```
BIZNESJON
│
├── 📚 TA'LIM
│   ├── Sohalar (10 ta)
│   ├── Bo'limlar (har soha ichida)
│   └── Video darslar (audio o'zbek + subtitle 4 til)
│
├── 👥 HAMJAMIYAT
│   ├── Foydalanuvchi profillari (@username)
│   ├── Tadbirkorlarni topish
│   ├── Shaxsiy chat (1-1)
│   └── Guruh chatlar (foydalanuvchilar yaratadi, public/private)
│
├── ⭐ MENING SAYTIM
│   └── Mijoz biznesi haqida jamoa yaratgan professional video
│       (faqat egasiga ko'rinadi, ulashish mumkin)
│
└── ⚙️ ADMIN PANEL
    ├── Foydalanuvchilarni boshqarish
    ├── Dars videolari yuklash
    └── "Mening saytim" videolarini biriktirish
```

---

## 4. Foydalanuvchi yo'li

```
1. Ro'yxatdan o'tish (telefon + parol + OTP)
        ↓
2. Til tanlash (uz-Latn / uz-Cyrl / ru / en)
        ↓
3. Soha tanlash (10 ta)
        ↓
4. Bo'lim tanlash
        ↓
5. Profilni to'ldirish (ism + familiya + @username)
        ↓
6. Bosh sahifa
   ├── ⭐ Mening saytim (agar bor bo'lsa)
   ├── ▶️ Davom ettirish
   ├── ✨ Yangi darslar
   ├── 🔥 Mashhur darslar
   ├── 👥 Mening guruhlarim
   └── 🤝 Yangi tadbirkorlar
```

---

## 5. Sohalar va bo'limlar

### 5.1. 10 ta soha — barchasi ochiq

| № | Soha |
|---|---|
| 1 | 👨‍👩‍👧 Oila va Tarbiya |
| 2 | 🎓 Talabalar va Yoshlar |
| 3 | 💼 Kichik Biznes va Tadbirkorlar |
| 4 | 📚 O'qituvchilar va Murabbiylar |
| 5 | 🏥 Shifokorlar va Tibbiyot |
| 6 | 📣 Marketing va SMM |
| 7 | ⚖️ Huquqshunoslar va Advokatlar |
| 8 | 🏛 Davlat Xizmatchilari |
| 9 | ✍️ Jurnalistlar va Kontent Yaratuvchilar |
| 10 | 👩‍💻 IT va Dasturchilar |

### 5.2. Bo'limlar — Tadbirkorlik sohasi (misol)

| № | Bo'lim |
|---|---|
| 1 | 🍽 Oziq-ovqat — kafe, restoran, choyxona |
| 2 | 💇 Go'zallik — salon, sartaroshxona, nail studio |
| 3 | 🛒 Chakana savdo — kiyim, oziq-ovqat, elektronika |
| 4 | 🔧 Ustaxona — avto, mebel, qurilish, texnika |
| 5 | 💊 Tibbiyot klinikasi |
| 6 | 🏋️ Sport — zal, basseyn, o'yin klubi |
| 7 | 🏫 Ta'lim — maktab, bog'cha, o'quv markazi |
| 8 | 🎓 Oliy ta'lim — universitet, kollej, kurslar |
| 9 | 🏨 Mehmondo'stlik — mehmonxona, hostel, ijara |
| 10 | 🚚 Logistika va yetkazib berish |

**Qoida:** Foydalanuvchi tanlagan bo'limga tegishli darslar va tavsiya etilgan tadbirkorlar ko'rsatiladi. Guruh chatlar **avtomatik biriktirilmaydi** — foydalanuvchilar o'zlari yaratadi va qo'shiladi.

**Bo'lim o'zgartirish:** Cheklov yo'q — istalgan paytda Sozlamalar orqali o'zgartirish mumkin. Eski guruh a'zoliklari, dars progress va xabarlar **doimiy saqlanadi** — qaytib kelsa hammasi joyida bo'ladi.

---

## 6. Sahifalar va funksiyalar

### 6.1. Ro'yxatdan o'tish

Foydalanuvchi kiritadi:
1. Telefon raqami
2. Parol

Tizim qiladi:
1. Ma'lumotlar tekshiriladi
2. Telefonga SMS orqali OTP kod yuboriladi
3. OTP tasdiqlanadi
4. Hisob yaratiladi
5. Til tanlash sahifasiga o'tiladi

Xato holatlari:
- **Telefon raqami band** — "Bu raqam allaqachon ro'yxatdan o'tgan"
- **Parol kuchsiz** — talab ko'rsatiladi (kamida 8 belgi, 1 raqam, 1 katta harf)
- **OTP noto'g'ri** — 5 marta urinish, keyin yangi OTP so'raladi

### 6.2. Kirish

Foydalanuvchi kiritadi:
1. Telefon raqami
2. Parol

Tizim qiladi:
1. Ma'lumotlar tekshiriladi
2. To'g'ri bo'lsa — bosh sahifaga o'tiladi
3. Noto'g'ri bo'lsa — "Telefon yoki parol noto'g'ri" xabari chiqadi
4. Hisob hech qachon bloklanmaydi — necha marta xato kiritilsa ham
5. Sessiya saqlanib qolgan bo'lsa — qayta kirishda avtomatik bosh sahifaga kiradi
6. **Multi-device:** istalgan qurilmadan kira oladi, cheklov yo'q

**Parol unutilsa:** Foydalanuvchi support'ga murojaat qiladi. Admin manual ravishda yangi vaqtinchalik parol beradi. ("Parolni unutdim" avtomatik oqimi yo'q.)

### 6.3. Til tanlash

Mavjud tillar:
1. O'zbekcha (lotin)
2. Ўзбекча (kirill)
3. Русский
4. English

Qoidalar:
1. Ro'yxatdan o'tgandan keyin bir martalik majburiy bosqich
2. Tanlov profilga saqlanadi — boshqa qurilmalarda ham amal qiladi
3. Keyinchalik Sozlamalar orqali istalgan vaqtda o'zgartiriladi
4. **Video darslar audiosi har doim o'zbekcha** (lotin), lekin **subtitle va sarlavhalar 4 tilda** almashtirib bo'ladi

### 6.4. Soha tanlash

Ko'rinadigan sohalar:
1. Barcha 10 ta soha — hammasi ochiq va bosiladi

Qoidalar:
1. Soha tanlanadi → bo'lim tanlash sahifasiga o'tiladi
2. Bir foydalanuvchi bir vaqtda faqat 1 ta sohada bo'ladi
3. Soha o'zgartirilsa — bo'limni qayta tanlash kerak

### 6.5. Bo'lim tanlash

Ko'rinadigan bo'limlar:
1. Tanlangan sohaga tegishli barcha bo'limlar ro'yxati

Qoidalar:
1. Bo'lim tanlanadi → profil to'ldirish sahifasiga o'tiladi
2. Faqat shu bo'limga tegishli darslar ko'rsatiladi (Bosh sahifa feed)
3. Bo'lim keyinchalik Sozlamalar orqali o'zgartiriladi
4. **Bo'limga avtomatik guruh chat YO'Q** — guruhlarni foydalanuvchilar o'zlari yaratadi

### 6.6. Profilni to'ldirish

Majburiy maydonlar:
1. Ism
2. Familiya
3. **Username (@foydalanuvchi_nomi)** — band bo'lsa tizim raqamli variant taklif qiladi (`@aziz`, `@aziz1`, `@aziz2`)

Ixtiyoriy maydonlar:
1. Profil rasmi (JPG, PNG, WEBP, HEIC — max 5 MB, server avtomatik konvert qiladi)
2. Biznes nomi
3. Shahar
4. Bio (max 200 belgi)

Qoidalar:
1. Telefon raqami profilga saqlanadi, lekin boshqa foydalanuvchilarga ko'rinmaydi
2. Profil rasmi yuklanmasa — ism birinchi harfi avatar bo'ladi (rang generator bilan)
3. Username — kichik harf, raqam, pastki chiziq (`_`), 3-20 belgi
4. Saqlangach bosh sahifaga o'tiladi

### 6.7. Bosh sahifa

Ko'rinadigan bloklar (yuqoridan pastga):

1. **⭐ Mening saytim** — agar admin video yuklagan bo'lsa (egasiga eng yuqorida)
2. **▶️ Davom ettirish** — yarim ko'rilgan darslar (engagement hook)
3. **✨ Yangi darslar** — bo'limga tegishli so'nggi videolar
4. **🔥 Mashhur darslar** — eng ko'p ko'rilganlari
5. **👥 Mening guruhlarim** — faol guruh chatlarga tezkor kirish
6. **🤝 Yangi tadbirkorlar** — bo'limga yaqinda qo'shilganlar

Qoidalar:
1. Faqat foydalanuvchining bo'limiga tegishli kontent ko'rinadi
2. Boshqa bo'lim kontenti aralashmaydi
3. Har blok 5-10 ta element ko'rsatadi, "Hammasini ko'rish" linki bilan

### 6.8. Video tomosha qilish

Player imkoniyatlari:
1. Play / Pause
2. 10 soniya oldinga / orqaga
3. Ovoz nazorati
4. To'liq ekran
5. Tezlik: 0.5x · 1x · 1.25x · 1.5x · 2x
6. Sifat: 480p · 720p · 1080p (avto-tanlash + qo'lda tanlash)
7. **Subtitle tili tanlash** — uz-Latn · uz-Cyrl · ru · en (yoki o'chirish)
8. Picture-in-Picture (PiP)

Qoidalar:
1. Ko'rilgan joy saqlanadi — qaytib kelganda o'sha yerdan davom etadi
2. Video tugagach — 5 soniyadan keyin keyingisi boshlanadi
3. Yuklab olish UI darajasida cheklangan (signed URL, kontekst menyu yopiq)
4. **Audio har doim o'zbek tilida**, subtitle UI tilidan mustaqil tanlanadi

### 6.9. Mening saytim

Bu nima:
1. Mijoz jamoaga buyurtma beradi (platforma tashqarisida) — biznesi yoki sayti haqida video tayyorlash
2. Jamoa professional video yaratadi (mijoz biznesi, xizmati, mahsuloti haqida)
3. Admin panel orqali tayyor video foydalanuvchi profiliga yuklanadi
4. Foydalanuvchi o'z profilida bu video(lar)ni ko'radi
5. **Foydalanuvchi videoni boshqalar bilan ulashishi mumkin** (chat orqali yoki public link orqali)

Maxfiylik va ulashish:
1. Video birinchi navbatda **faqat egasiga** ko'rinadi
2. Egasi xohlasa **"Ulashish" tugmasi** orqali public link yaratadi (boshqa odamlar shu link orqali kira oladi, lekin sitemap/qidiruvda yo'q)
3. Egasi xohlagan paytda ulashishni o'chirib qo'yishi mumkin
4. Hech narsa yuklanmagan bo'lsa — Bosh sahifada "Mening saytim" bloki umuman ko'rinmaydi
5. Bitta foydalanuvchining bir nechta videosi bo'lishi mumkin (turli xizmatlar uchun)

### 6.10. Tadbirkorlarni topish

Imkoniyatlar:
1. **Filterlar:** Soha · Bo'lim · Shahar · Username
2. **Izlash:** Ism, familiya, biznes nomi, @username bo'yicha
3. **Global qidiruv (Cmd+K):** Header'dan har sahifadan ochiladi — darslar, tadbirkorlar va public guruhlar bir vaqtda izlanadi

Default tartib:
1. Avval o'z bo'limidagilar
2. Keyin o'z sohasidagi boshqa bo'limlar
3. Keyin boshqa sohalar
4. Ichkarida — `lastActiveAt` bo'yicha

### 6.11. Boshqa foydalanuvchi profili

Ko'rinadigan ma'lumotlar:
1. Profil rasmi
2. Ism va familiya
3. @username
4. Biznes nomi
5. Soha va bo'lim
6. Shahar
7. Bio
8. **Ommaviy "Mening saytim" videolari** (agar egasi ulashishni yoqgan bo'lsa)

Qoidalar:
1. Telefon raqami hech kimga ko'rinmaydi
2. Foydalanuvchi o'z profilini ochsa — "Tahrirlash" tugmasi ko'rinadi
3. Boshqa profilda — "💬 Xabar yuborish" tugmasi
4. **Block tugmasi yo'q** (block funksiyasi platformada yo'q)
5. URL: `/people/@username`

### 6.12. Xabarlar (Shaxsiy chat — 1-1)

Yuborish mumkin:
1. Matnli xabar
2. Rasm (JPG, PNG, WEBP, HEIC)
3. Video (oddiy, max 100 MB)
4. **Aylanacha video xabar** (yumaloq video, 60 sekundgacha) — Telegram'dagidek
5. Ovozli xabar (audio)
6. Emoji va reaktsiyalar
7. Boshqa xabarga javob berish (reply)

Boshqaruv:
1. Xabar holati: yuborildi · yetdi · o'qildi
2. Xabarni o'chirish — faqat o'zinikini, 24 soat ichida
3. Yozish indikatori ("yozmoqda...")
4. Onlayn / oxirgi marta ko'ringan vaqt

### 6.13. Guruh chatlar

**Yangi model — Telegram-style:**

Yaratish:
1. Istalgan foydalanuvchi guruh yaratishi mumkin
2. Guruh nomi (3-50 belgi), tavsifi (max 200 belgi), avatar
3. **Visibility:** PUBLIC (qidiruvda topiladi) yoki PRIVATE (faqat invite link)
4. **Max 200 a'zo** har guruh
5. Yaratuvchi avtomatik OWNER bo'ladi

Topish va qo'shilish:
1. **Public guruhlar:** Global qidiruv (Cmd+K) yoki `/groups/search` orqali topiladi
2. **Private guruhlar:** Faqat invite link orqali (`/groups/join/{token}`)
3. Yaratuvchi yoki admin invite link yaratadi (har safar yangisini olish mumkin)

Yuborish mumkin:
1. Matnli xabar
2. Rasm, video, ovozli xabar, aylanacha video
3. Emoji va reaktsiyalar (👍 ❤️ 🔥 💯 va h.k.)
4. **@mention** — guruh a'zosini tag qilish
5. Boshqa xabarga javob berish (reply)

Rollar guruh ichida:
- **OWNER** — yaratuvchi, hamma narsa
- **ADMIN** — a'zolarni taklif qilish, xabarlarni o'chirish, sozlamalarni o'zgartirish
- **MEMBER** — xabar yozish, reaktsiya

Qoidalar:
1. Bo'limga avtomatik biriktirilmaydi — guruhlar organik
2. Foydalanuvchi xohlagan paytda chiqishi mumkin
3. OWNER guruhdan chiqa olmaydi — avval boshqa a'zoni OWNER qilishi kerak yoki guruhni o'chiradi
4. Guruh o'chirilsa — barcha xabarlar yo'qoladi (a'zolarga bildirishnoma)

### 6.14. Bildirishnomalar

Turlari:
1. 💬 Yangi xabar (DM)
2. 👥 Guruhda yangi xabar (faqat mention bo'lsa, default)
3. ⭐ Mening saytim — admin yangi video yukladi
4. 📺 Bo'limda yangi dars chiqdi
5. 🎉 Guruhga taklif (private guruh)
6. 📢 Admin e'loni

Qoidalar:
1. O'qilmagan — qalin matn + ko'k nuqta
2. 30 kun saqlanadi, keyin avtomatik o'chiriladi
3. Push va in-app bildirishnomalarni alohida sozlash mumkin
4. **Push ruxsati birinchi yangi xabar kelganda so'raladi** (onboarding'da emas — iOS uchun eng yuqori conversion)

### 6.15. Sozlamalar

Bo'limlar:
1. **👤 Profil** — rasm, ism, familiya, @username, biznes nomi, shahar, bio
2. **🌐 Til** — interfeys tilini o'zgartirish (4 til)
3. **📂 Soha va bo'lim** — yo'nalishni o'zgartirish (cheklov yo'q)
4. **🔔 Bildirishnomalar** — push va in-app preferences
5. **🔒 Maxfiylik** — profilni kim ko'radi, "Mening saytim" ulashish toggle
6. **🎨 Tema** — yorug' / qorong'i / tizimga muvofiq
7. **📱 Faol qurilmalar** — har bir qurilma uchun "Chiqarish" tugmasi
8. **🚪 Chiqish**
9. **🗑 Hisobni o'chirish** — 30 kun ichida login qilsa avtomatik tiklanadi, 30 kundan keyin to'liq o'chadi

### 6.16. Admin: Foydalanuvchilar boshqaruvi

Ro'yxatda ko'rinadi:
1. ID, ism, familiya, @username, telefon raqami
2. Soha va bo'lim, shahar
3. Qo'shilgan sana, oxirgi faollik
4. Holat: ✅ Faol / 🕐 O'chirilmoqda (30 kun)
5. Yuklangan "Mening saytim" videolari soni

Filtr va izlash:
1. Soha, bo'lim, shahar, sana bo'yicha
2. Ism, telefon, @username, ID bo'yicha izlash

Admin amallari:
1. ✏️ Profil ma'lumotlarini tahrirlash
2. 🔑 Parolni qayta tiklash (vaqtinchalik parol)
3. 🗑 Hisobni o'chirish — 30 kun saqlanadi
4. 🎥 "Mening saytim" videosi yuklash
5. 💬 Foydalanuvchiga maxsus xabar yuborish

Audit log:
1. Har admin amali yozib boriladi — kim, qachon, nima qildi
2. Faqat super-admin ko'ra oladi

**Muhim:** Admin hech qanday foydalanuvchini bloklay olmaydi.

### 6.17. Admin: Dars videolari yuklash

Yuklash formasi:
1. Video fayl — MP4, MOV, AVI, MKV (max 5 GB, **audio o'zbek tilida**)
2. **Sarlavha (4 tilda):** uz-Latn, uz-Cyrl, ru, en (har biri 5-100 belgi)
3. **Tavsif (4 tilda):** uz-Latn, uz-Cyrl, ru, en (har biri 50-2000 belgi)
4. **Subtitle (SRT) — 4 ta fayl** yuklash (uz-Latn, uz-Cyrl, ru, en)
5. Soha va bo'lim
6. Tartib raqami, teglar
7. Thumbnail (avtomatik yoki qo'lda)

Tizim avtomatik qiladi:
1. 3 ta sifat versiyasi yaratadi: 480p · 720p · 1080p (HLS)
2. Thumbnail va davomiylikni chiqaradi
3. Original B2'ga backup

Xato holatlari:
1. 5 GB dan oshsa yoki format noto'g'ri — xato xabari
2. Subtitle SRT noto'g'ri formatda — xato xabari
3. Yuklash uzilsa — davom ettirish imkoni bor (TUS protocol)

### 6.18. Admin: "Mening saytim" videosi yuklash

Jarayon:
1. Mijoz buyurtma beradi (platforma tashqarisida)
2. Jamoa professional video yaratadi (mijoz biznesi haqida)
3. Admin formasi:
   - Foydalanuvchini tanlash (@username yoki telefon bo'yicha)
   - Video fayl (max 5 GB)
   - **Sarlavha va tavsif (4 tilda)**
   - **Subtitle (SRT) 4 til** (ixtiyoriy — ko'pincha mijoz o'z biznesi haqida bilgan)
   - Thumbnail
4. Tasdiqlash — video foydalanuvchining profiliga biriktiriladi
5. Foydalanuvchiga avtomatik bildirishnoma yuboriladi
6. Foydalanuvchi o'z Bosh sahifasida ko'radi

Maxfiylik:
1. Video birinchi navbatda **faqat egasiga** ko'rinadi
2. Egasi "Ulashish" tugmasi orqali public link yaratishi mumkin
3. Tasdiqlashsiz biriktirish imkonsiz
4. Har amal audit logga yoziladi

Boshqarish:
1. Yuklangan videoni keyinchalik tahrirlash mumkin (admin)
2. O'chirish mumkin — foydalanuvchi profilidan ham tushib ketadi (a'zoga bildirishnoma)

---

## 7. Foydalanuvchi rollari

### 7.1. Foydalanuvchi (Tadbirkor)

Platforma asosiy foydalanuvchisi.

Imkoniyatlari:
- Barcha video darslarni ko'rish (audio o'zbek + subtitle 4 til)
- Profilini boshqarish (@username, rasm, bio)
- Boshqa tadbirkorlar bilan shaxsiy chat (matn, rasm, video, ovoz, aylanacha video)
- Guruh chatlar yaratish va boshqarish (OWNER/ADMIN/MEMBER rollari)
- Public guruhlarni qidirish va qo'shilish
- O'z profilida "Mening saytim" videosini ko'rish va ulashish
- 4 til UI o'rtasida o'tish

### 7.2. Administrator

Jamoaning ichki a'zosi.

Imkoniyatlari:
- Foydalanuvchilarni ko'rish va boshqarish (tahrirlash, parol reset)
- Dars videolarini yuklash (4 til sarlavha + 4 til subtitle)
- "Mening saytim" videolarini foydalanuvchi profillariga biriktirish
- Foydalanuvchilarga maxsus xabar va e'lon yuborish
- Audit logni kuzatish (super-admin)
- **Foydalanuvchini bloklay olmaydi** — bu printsipial qoida

### 7.3. Mehmon

Ro'yxatdan o'tmagan tashrif buyuruvchi.

Imkoniyatlari:
- Platformaga kirish sahifasini ko'rish
- Public "Mening saytim" linkini ko'rish (agar link bilan kelsa)
- Ro'yxatdan o'tish

---

## 8. Til tizimi

Platforma 4 tilda ishlaydi:

| Til | Kod | URL prefix |
|---|---|---|
| O'zbekcha (lotin) | `uz-Latn` | `/uz-Latn/...` |
| Ўзбекча (kirill) | `uz-Cyrl` | `/uz-Cyrl/...` |
| Русский | `ru` | `/ru/...` |
| English | `en` | `/en/...` |

Qoidalar:
- Foydalanuvchi bir marta til tanlaydi va bu uning profiliga saqlanadi
- Interfeys (UI) — to'liq 4 tilda
- **Dars videolari audiosi har doim o'zbek tilida** (lotin)
- **Subtitle va sarlavhalar — har dars uchun 4 tilda** alohida yuklanadi
- "Mening saytim" videolarining sarlavha va tavsifi ham 4 tilda
- Chat xabarlari tarjima qilinmaydi
- Tizim xato xabarlari foydalanuvchi tilida ko'rsatiladi

---

## 9. UI/UX tamoyillari

### 9.1. Asosiy talab

Platforma **Linear, Notion va Telegram** darajasida professional ko'rinishi shart.

### 9.2. Tamoyillar

| Tamoyil | Tavsif |
|---|---|
| **Mobil birinchi** | Asosiy foydalanish telefondan — interfeys shunga moslashtirilgan |
| **Soddalik** | Har bir tugma aniq, har bir sahifa tushunarli |
| **Tezlik** | Sahifalar tez yuklanadi (LCP < 2.5s) |
| **Aralashmaslik** | Foydalanuvchi faqat o'z bo'limiga tegishli kontentni ko'radi |
| **Zamonaviylik** | Silliq animatsiyalar, chiroyli o'tishlar |
| **Konsistensiya** | Design tokens orqali bir xil rang, shrift, masofa |

### 9.3. Brend va vizual

| Element | Qiymat |
|---|---|
| **Asosiy rang (Brand)** | Indigo `#6366f1` |
| **Hover/Active** | Indigo `#4338ca` |
| **Vibe** | Sof, minimalist (Linear / Notion) |
| **Border-radius** | sm 6px · md 8px · lg 16px |
| **Shrift** | **Inter** (lotin + kirill subset, self-hosted) |
| **Animatsiya** | Subtle, 150-200ms ease-out |

**Dark mode (default detection):**
- Background: `#09090b` (zinc-950)
- Surface: `#18181b` (zinc-900)
- Elevated: `#27272a` (zinc-800)
- Text: `#fafafa` (zinc-50)
- Muted text: `#a1a1aa` (zinc-400)
- Border: `#3f3f46` (zinc-700)

**Light mode:**
- Background: `#ffffff`
- Surface: `#fafafa` (zinc-50)
- Elevated: `#f4f4f5` (zinc-100)
- Text: `#09090b` (zinc-950)
- Muted text: `#71717a` (zinc-500)
- Border: `#e4e4e7` (zinc-200)

**Semantic ranglar (har ikkala mode):**
- Success: `#10b981` (emerald)
- Warning: `#f59e0b` (amber)
- Error: `#ef4444` (red)
- Info: `#3b82f6` (blue)

### 9.4. Mobil versiya — Tab bar (pastda)

```
┌─────────────────────┐
│  🚀 Biznesjon  🔍 🔔│  ← Header (search + bildirishnoma)
├─────────────────────┤
│  ⭐ Mening saytim   │
│  ▶️ Davom ettirish  │
│  ✨ Yangi darslar   │
│  🔥 Mashhur         │
│  👥 Guruhlarim      │
│  🤝 Tadbirkorlar    │
├─────────────────────┤
│ 🏠  📚  👥  💬  👤 │  ← Tab bar
│Bosh Darslar Gr Msg Profil
└─────────────────────┘
```

### 9.5. Desktop versiya — Sidebar (chapda)

```
┌─────────────────────────────────────────────────────┐
│  🚀 Biznesjon       [🔍 Cmd+K Qidirish]      🔔 👤 │
├──────────┬──────────────────────────────────────────┤
│ 🏠 Bosh   │                                          │
│ 📚 Darslar│        Asosiy kontent maydoni           │
│ 👥 Guruh  │        (sahifaga qarab o'zgaradi)       │
│ 💬 Xabar  │                                          │
│ 👤 Profil │                                          │
│ ⚙️ Sozlam │                                          │
└──────────┴──────────────────────────────────────────┘
```

### 9.6. Global qidiruv (Cmd+K)

Linear/Notion-style modal. Header'dan ochiladi.
- Darslar (sarlavha, tavsif, teg bo'yicha)
- Tadbirkorlar (@username, ism, biznes nomi, shahar)
- Public guruhlar (nom, tavsif)
- Yaqinda izlanganlar tarixi

---

## 10. Daromad modeli

**Biznesjon — to'liq bepul platforma.**

Foydalanuvchilar uchun:
- Hech qanday to'lov yo'q
- Yashirin to'lovlar yo'q
- Premium versiya yo'q
- Reklama yo'q

Loyiha jamoaning boshqa tijorat loyihalaridan tushadigan daromad hisobiga saqlanadi. Biznesjon — jamoaning jamiyatga bepul hissasi.

**"Mening saytim"** xizmati — platforma ichidagi bepul imkoniyat. Mijoz biznesi haqida video tayyorlash xizmati platforma tashqarisida (alohida shartnoma asosida) tijoriy ravishda taqdim etilishi mumkin, lekin platformadagi har qanday foydalanuvchi uchun yuklangan video bepul ko'rinadi.

---

## 11. Launch strategiyasi

**Muhim qoida:** Biznesjon **bir martada to'liq professional** ravishda ishga tushiriladi. **MVP, V1, V2 kabi bosqichlar yo'q** — launch kuni hamma funksiya 100% professional darajada ishlaydi.

Bu CLAUDE.md global qoidalarga muvofiq:
- **Sifat tezlikdan ustun**
- **Adversarial QA majburiy** — har funksiya real-data, concurrent, edge case testdan o'tishi shart
- **"Done" ning yangi ta'rifi:** typecheck + lint + test + build + real-data smoke + adversarial review + concurrent test + edge case + commit hooks — hammasi yashil

**Yetkazib berish fazalari:**

1. **Phase 1 — Development:** Funksiya, test, lint, build
2. **Phase 2 — QA:** Adversarial, concurrent, real-data, edge case, load test
3. **Phase 3 — Staging:** Production-like environment, monitoring, beta foydalanuvchilar (ichki jamoa)
4. **Phase 4 — Public launch:** Feature flag bilan gradual rollout, monitoring dashboard, error budget

**Beta dasturi yo'q** — launch'dan oldin platforma hamma jihatdan tayyor bo'ladi, keyin ommaga ochiladi.

---

> Biznesjon — bu nafaqat platforma, balki tadbirkorlar uchun yaratilgan bepul professional ta'lim makonidir.

**Hujjat versiyasi:** 2.0 Final · **Sana:** 2026 · **Til:** O'zbek (lotin)
