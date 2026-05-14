export type Lesson = {
  id: string;
  title: string;
  duration: string;
  views: number;
  section: string;
  author: string;
  grad: number;
  description?: string;
  sourcePath?: string;
  hlsManifestPath?: string;
  thumbnailPath?: string;
  progress?: number;
  isNew?: boolean;
};

export type Person = {
  id: string;
  name: string;
  handle: string;
  business: string;
  city: string;
  section: string;
  avatarColor: number;
  online?: boolean;
  bio?: string;
  avatarPath?: string;
};

export type Group = {
  id: string;
  name: string;
  description: string;
  members: number;
  public: boolean;
  unread: number;
  lastMessage: string;
  lastTime: string;
  iconColor: number;
};

export const sections = [
  { id: "food", icon: "🍽", name: "Oziq-ovqat" },
  { id: "beauty", icon: "💇", name: "Go'zallik" },
  { id: "retail", icon: "🛒", name: "Chakana savdo" },
  { id: "workshop", icon: "🔧", name: "Ustaxona" },
  { id: "clinic", icon: "💊", name: "Klinika" },
  { id: "sport", icon: "🏋️", name: "Sport" },
  { id: "education", icon: "🏫", name: "Ta'lim" },
  { id: "hospitality", icon: "🏨", name: "Mehmondo'stlik" },
  { id: "logistics", icon: "🚚", name: "Logistika" },
];

export const gradients = [
  "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
  "linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)",
  "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
  "linear-gradient(135deg, #84cc16 0%, #10b981 100%)",
  "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
  "linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)",
  "linear-gradient(135deg, #f97316 0%, #db2777 100%)",
];

export const lessons: Lesson[] = [
  {
    id: "lesson_1",
    title: "Restoran biznesini noldan boshlash: 7 ta asosiy qadam",
    duration: "18:42",
    views: 12400,
    section: "food",
    author: "Bekzod Olimov",
    grad: 0,
    progress: 0.42,
    isNew: true,
  },
  {
    id: "lesson_2",
    title: "Kafe uchun menu dizayn: narxlash psixologiyasi",
    duration: "12:15",
    views: 8200,
    section: "food",
    author: "Nilufar Rahimova",
    grad: 1,
    isNew: true,
  },
  {
    id: "lesson_3",
    title: "Mijozni xizmatga oshib qoldirish — 12 ta texnika",
    duration: "23:08",
    views: 18900,
    section: "food",
    author: "Aziz Karimov",
    grad: 2,
  },
  {
    id: "lesson_4",
    title: "Choyxonangizda yo'qotishlarni 30% kamaytirish",
    duration: "15:32",
    views: 6700,
    section: "food",
    author: "Sherzod Nizomov",
    grad: 3,
  },
  {
    id: "lesson_5",
    title: "Yetkazib berish xizmati: Yandex va Uzum bilan ishlash",
    duration: "20:17",
    views: 14500,
    section: "food",
    author: "Madina Yusupova",
    grad: 4,
    isNew: true,
  },
  {
    id: "lesson_6",
    title: "Restoran rentabelligini hisoblash: Excel namunalari",
    duration: "28:55",
    views: 9100,
    section: "food",
    author: "Bekzod Olimov",
    grad: 5,
  },
  {
    id: "lesson_7",
    title: "Instagram orqali kafe brandini kuchaytirish",
    duration: "16:24",
    views: 22800,
    section: "food",
    author: "Nilufar Rahimova",
    grad: 6,
    progress: 0.68,
  },
  {
    id: "lesson_8",
    title: "Oshpazlar bilan ishlash va jamoa motivatsiyasi",
    duration: "19:11",
    views: 5400,
    section: "food",
    author: "Aziz Karimov",
    grad: 7,
  },
];

export const people: Person[] = [
  {
    id: "user_1",
    name: "Bekzod Olimov",
    handle: "bekzod_o",
    business: "Kofe Lab",
    city: "Toshkent",
    section: "food",
    avatarColor: 0,
    online: true,
    bio: "5 yil restoran biznesi. 3 ta filial. Spesialist: F&B operations.",
  },
  {
    id: "user_2",
    name: "Nilufar Rahimova",
    handle: "nilufar.r",
    business: "Beauty Studio N",
    city: "Samarqand",
    section: "beauty",
    avatarColor: 1,
    online: true,
  },
  {
    id: "user_3",
    name: "Aziz Karimov",
    handle: "aziz",
    business: "Karimov Auto",
    city: "Toshkent",
    section: "workshop",
    avatarColor: 2,
  },
  {
    id: "user_4",
    name: "Madina Yusupova",
    handle: "madina_y",
    business: "Madina Style",
    city: "Buxoro",
    section: "retail",
    avatarColor: 3,
    online: true,
  },
];

export const groups: Group[] = [
  {
    id: "group_1",
    name: "Toshkent kafe egalari",
    description: "Tajriba almashish, mijozlar, yetkazib beruvchilar",
    members: 184,
    public: true,
    unread: 12,
    lastMessage: "Madina: yangi yetkazib beruvchini sinab ko'rdim",
    lastTime: "12 daq",
    iconColor: 0,
  },
  {
    id: "group_2",
    name: "F&B Marketing UZ",
    description: "Restoran va kafe uchun reklama strategiyalari",
    members: 67,
    public: true,
    unread: 3,
    lastMessage: "Zarina: Instagram reels misollar yubordim",
    lastTime: "1 soat",
    iconColor: 4,
  },
  {
    id: "group_3",
    name: "Choyxona biznesi",
    description: "Klassik choyxona formati",
    members: 42,
    public: false,
    unread: 0,
    lastMessage: "Sherzod: narxlar haqida fikr almashaylik",
    lastTime: "kecha",
    iconColor: 2,
  },
];
