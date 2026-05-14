// ====== Mock Data ======
const DATA = (() => {
  const i18n = {
    'uz-Latn': {
      home: "Bosh sahifa",
      lessons: "Darslar",
      groups: "Guruhlar",
      messages: "Xabarlar",
      profile: "Profil",
      settings: "Sozlamalar",
      people: "Tadbirkorlar",
      mysite: "Mening saytim",
      continue: "Davom ettirish",
      newLessons: "Yangi darslar",
      popular: "Mashhur darslar",
      myGroups: "Mening guruhlarim",
      newEnts: "Yangi tadbirkorlar",
      seeAll: "Hammasini ko'rish",
      search: "Qidirish",
      message: "Xabar yuborish",
      follow: "Kuzatish",
      members: "a'zo",
      online: "onlayn",
      lastSeen: "oxirgi marta",
      typing: "yozmoqda...",
    }
  };

  const sectors = [
    { id: 'family', icon: '👨\u200d👩\u200d👧', name: "Oila va Tarbiya" },
    { id: 'students', icon: '🎓', name: "Talabalar va Yoshlar" },
    { id: 'small-biz', icon: '💼', name: "Kichik Biznes va Tadbirkorlar" },
    { id: 'teachers', icon: '📚', name: "O'qituvchilar va Murabbiylar" },
    { id: 'doctors', icon: '🏥', name: "Shifokorlar va Tibbiyot" },
    { id: 'marketing', icon: '📣', name: "Marketing va SMM" },
    { id: 'lawyers', icon: '⚖️', name: "Huquqshunoslar" },
    { id: 'govt', icon: '🏛', name: "Davlat Xizmatchilari" },
    { id: 'journalists', icon: '✍️', name: "Jurnalistlar" },
    { id: 'it', icon: '👩\u200d💻', name: "IT va Dasturchilar" },
  ];

  const departments = [
    { id: 'food', icon: '🍽', name: "Oziq-ovqat" },
    { id: 'beauty', icon: '💇', name: "Go'zallik" },
    { id: 'retail', icon: '🛒', name: "Chakana savdo" },
    { id: 'workshop', icon: '🔧', name: "Ustaxona" },
    { id: 'clinic', icon: '💊', name: "Klinika" },
    { id: 'sport', icon: '🏋️', name: "Sport" },
    { id: 'education', icon: '🏫', name: "Ta'lim" },
    { id: 'hospitality', icon: '🏨', name: "Mehmondo'stlik" },
    { id: 'logistics', icon: '🚚', name: "Logistika" },
  ];

  // Lesson gradients (mood, fits dark UI)
  const grads = [
    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
    "linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)",
    "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    "linear-gradient(135deg, #84cc16 0%, #10b981 100%)",
    "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
    "linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)",
    "linear-gradient(135deg, #f97316 0%, #db2777 100%)",
    "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
    "linear-gradient(135deg, #65a30d 0%, #16a34a 100%)",
  ];

  const lessons = [
    { id: 'l1', title: "Restoran biznesini noldan boshlash: 7 ta asosiy qadam", duration: "18:42", views: 12400, dept: 'food', author: 'Bekzod Olimov', grad: 0, progress: 0.42, isNew: true },
    { id: 'l2', title: "Kafe uchun menu dizayn: narxlash psixologiyasi", duration: "12:15", views: 8200, dept: 'food', author: 'Nilufar Rahimova', grad: 1, isNew: true },
    { id: 'l3', title: "Mijozni xizmatga oshib qoldirish — 12 ta texnika", duration: "23:08", views: 18900, dept: 'food', author: 'Aziz Karimov', grad: 2 },
    { id: 'l4', title: "Choyxonangizda yo'qotishlarni 30% kamaytirish", duration: "15:32", views: 6700, dept: 'food', author: 'Sherzod Nizomov', grad: 3 },
    { id: 'l5', title: "Yetkazib berish xizmati: Yandex va Uzum bilan ishlash", duration: "20:17", views: 14500, dept: 'food', author: 'Madina Yusupova', grad: 4, isNew: true },
    { id: 'l6', title: "Restoran rentabelligini hisoblash: Excel namunalari", duration: "28:55", views: 9100, dept: 'food', author: 'Bekzod Olimov', grad: 5 },
    { id: 'l7', title: "Instagram orqali kafe brandini kuchaytirish", duration: "16:24", views: 22800, dept: 'food', author: 'Nilufar Rahimova', grad: 6, progress: 0.68 },
    { id: 'l8', title: "Oshpazlar bilan ishlash va jamoa motivatsiyasi", duration: "19:11", views: 5400, dept: 'food', author: 'Aziz Karimov', grad: 7 },
    { id: 'l9', title: "SES talablari va sanitariya hujjatlari", duration: "14:08", views: 11200, dept: 'food', author: 'Dilshod Tursunov', grad: 8 },
    { id: 'l10', title: "Yo'l xaritasi: 1 yilda kafe ochish reja", duration: "32:40", views: 16700, dept: 'food', author: 'Bekzod Olimov', grad: 9 },
  ];

  const people = [
    { id: 'u1', name: "Bekzod Olimov", handle: "bekzod_o", biz: "Kofe Lab", city: "Toshkent", dept: 'food', sector: 'small-biz', avColor: 0, online: true, bio: "5 yil restoran biznesi. 3 ta filial. Spesialist: F&B operations." },
    { id: 'u2', name: "Nilufar Rahimova", handle: "nilufar.r", biz: "Beauty Studio N", city: "Samarqand", dept: 'beauty', sector: 'small-biz', avColor: 1, online: true },
    { id: 'u3', name: "Aziz Karimov", handle: "aziz", biz: "Karimov Auto", city: "Toshkent", dept: 'workshop', sector: 'small-biz', avColor: 2 },
    { id: 'u4', name: "Madina Yusupova", handle: "madina_y", biz: "Madina Style", city: "Buxoro", dept: 'retail', sector: 'small-biz', avColor: 3, online: true },
    { id: 'u5', name: "Sherzod Nizomov", handle: "sherzod99", biz: "Choyxona Bahor", city: "Farg'ona", dept: 'food', sector: 'small-biz', avColor: 4 },
    { id: 'u6', name: "Dilshod Tursunov", handle: "dilshod_t", biz: "Tursunov & Partners", city: "Toshkent", dept: 'food', sector: 'small-biz', avColor: 5 },
    { id: 'u7', name: "Zarina Yo'ldosheva", handle: "zarina", biz: "Smart Marketing UZ", city: "Toshkent", dept: 'food', sector: 'marketing', avColor: 6, online: true },
    { id: 'u8', name: "Otabek Sodiqov", handle: "otabek_s", biz: "Lazzat Restaurant", city: "Andijon", dept: 'food', sector: 'small-biz', avColor: 7 },
  ];

  const groups = [
    { id: 'g1', name: "Toshkent kafe egalari", desc: "Tajriba almashish, mijozlar, recipiyentlar", members: 184, public: true, unread: 12, lastMsg: "Madina: yangi yetkazib beruvchini sinab ko'rdim, juda yaxshi", lastTime: "12 daq", iconColor: 0 },
    { id: 'g2', name: "F&B Marketing UZ", desc: "Restoran va kafe uchun reklama strategiyalari", members: 67, public: true, unread: 3, lastMsg: "Zarina: Instagram reels misollar yubordim", lastTime: "1 soat", iconColor: 4 },
    { id: 'g3', name: "Choyxona biznesi", desc: "Klassik choyxona formati", members: 42, public: false, unread: 0, lastMsg: "Sherzod: do'stlar, narxlar haqida fikr almashaylik", lastTime: "kecha", iconColor: 2 },
    { id: 'g4', name: "Yetkazib berish operatsiyalari", desc: "Logistika, kuryerlar, dispetcher", members: 95, public: true, unread: 1, lastMsg: "Aziz: bizda kuryer kerak edi, kim tavsiya beradi?", lastTime: "2 soat", iconColor: 3 },
    { id: 'g5', name: "Yangi tadbirkorlar 2026", desc: "0 dan boshlovchilar uchun", members: 156, public: true, unread: 0, lastMsg: "Nilufar: salom hammaga, men yangi a'zoman", lastTime: "3 kun", iconColor: 5 },
  ];

  const messages = [
    { id: 'd1', userId: 'u1', lastMsg: "Bugun kelolasizmi?", time: "5 daq", unread: 2, online: true },
    { id: 'd2', userId: 'u2', lastMsg: "Rahmat, juda foydali bo'ldi", time: "23 daq", unread: 0, online: true, lastFromMe: true, read: true },
    { id: 'd3', userId: 'u3', lastMsg: "🎥 Ovozli xabar", time: "1 soat", unread: 1 },
    { id: 'd4', userId: 'u4', lastMsg: "Madinka, bu narx me'yorida tushadi", time: "kecha", unread: 0 },
    { id: 'd5', userId: 'u7', lastMsg: "Reels strategiyasi tayyor", time: "kecha", unread: 0, lastFromMe: true, read: true },
    { id: 'd6', userId: 'u5', lastMsg: "📷 Rasm", time: "2 kun", unread: 0 },
    { id: 'd7', userId: 'u8', lastMsg: "Mehmonlar uchun chegirma haqida", time: "1 hafta", unread: 0 },
  ];

  const conversation = [
    { from: 'them', text: "Salom Bekzod, vaqtingiz bormi?", time: "10:14" },
    { from: 'me', text: "Salom! Ha, eshitaman.", time: "10:15", status: 'read' },
    { from: 'them', text: "Kecha Instagram'da yangi reklama formati haqida video chiqarganingizni ko'rdim. Juda zo'r bo'libdi.", time: "10:15" },
    { from: 'them', text: "Bizning kafemiz uchun ham shunday narsa qilish mumkinmi?", time: "10:16" },
    { from: 'me', text: "Albatta. Sizning kafe qaysi yo'nalishda?", time: "10:18", status: 'read' },
    { from: 'them', text: "Family restaurant. Asosiy auditoriya — yoshi kattalar, oilalar.", time: "10:19" },
    { from: 'me', text: "Tushundim. Sizga 3 ta variant tayyorlab beraman:\n1. Reels — ovqat tayyorlash\n2. Stories — atmosfera\n3. UGC — mijozlarning sharhi", time: "10:22", status: 'read' },
    { from: 'them', text: "Ajoyib! Bugun kelolasizmi?", time: "10:23" },
  ];

  const myVideo = {
    title: "Kofe Lab — siz uchun professional kofe tajribasi",
    desc: "5 yillik tajriba, 3 filial, har kuni 800+ mijoz xursand. Spesialty kofe, mahalliy o'qituvchilar bilan brewing master-klasslar.",
    duration: "2:24",
    sharedPublic: true,
  };

  return { sectors, departments, lessons, people, groups, messages, conversation, myVideo, grads, i18n };
})();

window.DATA = DATA;
