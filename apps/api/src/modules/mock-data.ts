export const currentUser = {
  id: "user_1",
  phone: "+998901234567",
  role: "USER",
  language: "uz-Latn",
  industryId: "industry-3",
  sectionId: "section-1",
  profile: {
    firstName: "Bekzod",
    lastName: "Olimov",
    username: "bekzod_o",
    businessName: "Kofe Lab",
    city: "Toshkent",
    bio: "5 yil restoran biznesi. 3 ta filial. Spesialist: F&B operations.",
  },
};

export const lessons = [
  {
    id: "lesson_1",
    title: "Restoran biznesini noldan boshlash: 7 ta asosiy qadam",
    description:
      "Bozorni o'rganish, joy tanlash, konseptsiya, jamoa, hujjatlar va birinchi oy operatsiyalari.",
    durationSeconds: 1122,
    views: 12400,
    sectionId: "section-1",
    author: "Bekzod Olimov",
    progress: 0.42,
    isNew: true,
  },
  {
    id: "lesson_2",
    title: "Kafe uchun menu dizayn: narxlash psixologiyasi",
    description: "Menu dizayni, narx anchoring va mijoz qaroriga ta'sir qiluvchi omillar.",
    durationSeconds: 735,
    views: 8200,
    sectionId: "section-1",
    author: "Nilufar Rahimova",
    isNew: true,
  },
  {
    id: "lesson_3",
    title: "Mijozni xizmatga oshib qoldirish — 12 ta texnika",
    description: "Xizmat sifati orqali qaytuvchi mijozlar ulushini oshirish.",
    durationSeconds: 1388,
    views: 18900,
    sectionId: "section-1",
    author: "Aziz Karimov",
  },
];

export const people = [
  {
    id: "user_1",
    name: "Bekzod Olimov",
    username: "bekzod_o",
    businessName: "Kofe Lab",
    city: "Toshkent",
    sectionId: "section-1",
    online: true,
  },
  {
    id: "user_2",
    name: "Nilufar Rahimova",
    username: "nilufar_r",
    businessName: "Beauty Studio N",
    city: "Samarqand",
    sectionId: "section-2",
    online: true,
  },
  {
    id: "user_3",
    name: "Aziz Karimov",
    username: "aziz",
    businessName: "Karimov Auto",
    city: "Toshkent",
    sectionId: "section-4",
    online: false,
  },
];

export const groups = [
  {
    id: "group_1",
    name: "Toshkent kafe egalari",
    description: "Tajriba almashish, mijozlar, yetkazib beruvchilar",
    visibility: "PUBLIC",
    members: 184,
    unread: 12,
  },
  {
    id: "group_2",
    name: "F&B Marketing UZ",
    description: "Restoran va kafe uchun reklama strategiyalari",
    visibility: "PUBLIC",
    members: 67,
    unread: 3,
  },
];

export const promoVideos = [
  {
    id: "promo_1",
    title: "Kofe Lab — siz uchun professional kofe tajribasi",
    description:
      "5 yillik tajriba, 3 filial, har kuni 800+ mijoz. Professional Mening saytim videosi.",
    durationSeconds: 144,
    isShareable: true,
    shareToken: "kofe-lab-bekzod",
    owner: people[0],
  },
];

export const notifications = [
  {
    id: "notif_1",
    type: "PROMO_VIDEO_PUBLISHED",
    title: "Mening saytim videosi tayyor",
    body: "Kofe Lab videosi profilingizga biriktirildi.",
    readAt: null,
    createdAt: new Date().toISOString(),
  },
];
