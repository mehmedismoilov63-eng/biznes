import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PASSWORD_SALT = "biznesjon-dev";
const NOTIFICATION_TTL_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

function hashPassword(password: string): string {
  return createHash("sha256").update(`${PASSWORD_SALT}:${password}`).digest("hex");
}

// ─── 10 ta industry va ularning bo'limlari ───────────────────────────────────

const INDUSTRIES = [
  {
    id: "ind_family",
    slug: "family-parenting",
    icon: "👨‍👩‍👧",
    sortOrder: 1,
    names: {
      "uz-Latn": "Oila va Tarbiya",
      "uz-Cyrl": "Оила ва Тарбия",
      ru: "Семья и воспитание",
      en: "Family and Parenting",
    },
    sections: [
      {
        id: "sec_family_edu",
        slug: "child-education",
        icon: "📖",
        sortOrder: 1,
        names: { "uz-Latn": "Bola tarbiyasi", "uz-Cyrl": "Бола тарбияси", ru: "Воспитание детей", en: "Child upbringing" },
      },
      {
        id: "sec_family_health",
        slug: "family-health",
        icon: "🏥",
        sortOrder: 2,
        names: { "uz-Latn": "Oilaviy salomatlik", "uz-Cyrl": "Оилавий саломатлик", ru: "Семейное здоровье", en: "Family health" },
      },
      {
        id: "sec_family_finance",
        slug: "family-finance",
        icon: "💰",
        sortOrder: 3,
        names: { "uz-Latn": "Oilaviy moliya", "uz-Cyrl": "Оилавий молия", ru: "Семейные финансы", en: "Family finance" },
      },
      {
        id: "sec_family_psych",
        slug: "family-psychology",
        icon: "🧠",
        sortOrder: 4,
        names: { "uz-Latn": "Oilaviy psixologiya", "uz-Cyrl": "Оилавий психология", ru: "Семейная психология", en: "Family psychology" },
      },
    ],
  },
  {
    id: "ind_youth",
    slug: "students-youth",
    icon: "🎓",
    sortOrder: 2,
    names: {
      "uz-Latn": "Talabalar va Yoshlar",
      "uz-Cyrl": "Талабалар ва Ёшлар",
      ru: "Студенты и молодёжь",
      en: "Students and Youth",
    },
    sections: [
      {
        id: "sec_youth_career",
        slug: "career-start",
        icon: "💼",
        sortOrder: 1,
        names: { "uz-Latn": "Karera boshlash", "uz-Cyrl": "Карера бошлаш", ru: "Начало карьеры", en: "Career start" },
      },
      {
        id: "sec_youth_study",
        slug: "effective-study",
        icon: "📚",
        sortOrder: 2,
        names: { "uz-Latn": "Samarali o'qish", "uz-Cyrl": "Самарали ўқиш", ru: "Эффективное обучение", en: "Effective study" },
      },
      {
        id: "sec_youth_startup",
        slug: "youth-startup",
        icon: "🚀",
        sortOrder: 3,
        names: { "uz-Latn": "Yosh tadbirkorlik", "uz-Cyrl": "Ёш тадбиркорлик", ru: "Молодёжное предпринимательство", en: "Youth entrepreneurship" },
      },
      {
        id: "sec_youth_freelance",
        slug: "freelancing",
        icon: "💻",
        sortOrder: 4,
        names: { "uz-Latn": "Frilanserlik", "uz-Cyrl": "Фрилансерлик", ru: "Фриланс", en: "Freelancing" },
      },
    ],
  },
  {
    id: "ind_business",
    slug: "small-business",
    icon: "💼",
    sortOrder: 3,
    names: {
      "uz-Latn": "Kichik Biznes va Tadbirkorlar",
      "uz-Cyrl": "Кичик Бизнес ва Тадбиркорлар",
      ru: "Малый бизнес и предпринимательство",
      en: "Small Business and Entrepreneurs",
    },
    sections: [
      {
        id: "sec_biz_food",
        slug: "food-cafe-restaurant",
        icon: "🍽",
        sortOrder: 1,
        names: {
          "uz-Latn": "Oziq-ovqat — kafe, restoran, choyxona",
          "uz-Cyrl": "Озиқ-овқат — кафе, ресторан, чойхона",
          ru: "Питание — кафе, ресторан, чайхана",
          en: "Food — cafe, restaurant, teahouse",
        },
      },
      {
        id: "sec_biz_beauty",
        slug: "beauty-salon",
        icon: "💇",
        sortOrder: 2,
        names: {
          "uz-Latn": "Go'zallik — salon, sartaroshxona, nail studio",
          "uz-Cyrl": "Гўзаллик — салон, сартарошхона, nail studio",
          ru: "Красота — салон, парикмахерская, nail studio",
          en: "Beauty — salon, barber, nail studio",
        },
      },
      {
        id: "sec_biz_retail",
        slug: "retail",
        icon: "🛒",
        sortOrder: 3,
        names: {
          "uz-Latn": "Chakana savdo — kiyim, oziq-ovqat, elektronika",
          "uz-Cyrl": "Чакана савдо — кийим, озиқ-овқат, электроника",
          ru: "Розничная торговля — одежда, еда, электроника",
          en: "Retail — clothing, food, electronics",
        },
      },
      {
        id: "sec_biz_workshop",
        slug: "workshop",
        icon: "🔧",
        sortOrder: 4,
        names: {
          "uz-Latn": "Ustaxona — avto, mebel, qurilish, texnika",
          "uz-Cyrl": "Устахона — авто, мебель, қурилиш, техника",
          ru: "Мастерская — авто, мебель, строительство, техника",
          en: "Workshop — auto, furniture, construction, tech",
        },
      },
      {
        id: "sec_biz_clinic",
        slug: "medical-clinic",
        icon: "💊",
        sortOrder: 5,
        names: {
          "uz-Latn": "Tibbiyot klinikasi",
          "uz-Cyrl": "Тиббиёт клиникаси",
          ru: "Медицинская клиника",
          en: "Medical clinic",
        },
      },
      {
        id: "sec_biz_sport",
        slug: "sport-club",
        icon: "🏋️",
        sortOrder: 6,
        names: {
          "uz-Latn": "Sport — zal, basseyn, o'yin klubi",
          "uz-Cyrl": "Спорт — зал, ҳавза, ўйин клуби",
          ru: "Спорт — зал, бассейн, игровой клуб",
          en: "Sport — gym, pool, game club",
        },
      },
      {
        id: "sec_biz_education",
        slug: "education-center",
        icon: "🏫",
        sortOrder: 7,
        names: {
          "uz-Latn": "Ta'lim — maktab, bog'cha, o'quv markazi",
          "uz-Cyrl": "Таълим — мактаб, боғча, ўқув маркази",
          ru: "Образование — школа, детсад, учебный центр",
          en: "Education — school, kindergarten, study center",
        },
      },
      {
        id: "sec_biz_higher_edu",
        slug: "higher-education",
        icon: "🎓",
        sortOrder: 8,
        names: {
          "uz-Latn": "Oliy ta'lim — universitet, kollej, kurslar",
          "uz-Cyrl": "Олий таълим — университет, коллеж, курслар",
          ru: "Высшее образование — университет, колледж, курсы",
          en: "Higher education — university, college, courses",
        },
      },
      {
        id: "sec_biz_hospitality",
        slug: "hospitality",
        icon: "🏨",
        sortOrder: 9,
        names: {
          "uz-Latn": "Mehmondo'stlik — mehmonxona, hostel, ijara",
          "uz-Cyrl": "Меҳмондўстлик — меҳмонхона, хостел, ижара",
          ru: "Гостеприимство — гостиница, хостел, аренда",
          en: "Hospitality — hotel, hostel, rental",
        },
      },
      {
        id: "sec_biz_logistics",
        slug: "logistics",
        icon: "🚚",
        sortOrder: 10,
        names: {
          "uz-Latn": "Logistika va yetkazib berish",
          "uz-Cyrl": "Логистика ва етказиб бериш",
          ru: "Логистика и доставка",
          en: "Logistics and delivery",
        },
      },
    ],
  },
  {
    id: "ind_teachers",
    slug: "teachers-coaches",
    icon: "📚",
    sortOrder: 4,
    names: {
      "uz-Latn": "O'qituvchilar va Murabbiylar",
      "uz-Cyrl": "Ўқитувчилар ва Муроббийлар",
      ru: "Учителя и тренеры",
      en: "Teachers and Coaches",
    },
    sections: [
      {
        id: "sec_teach_school",
        slug: "school-teachers",
        icon: "🏫",
        sortOrder: 1,
        names: { "uz-Latn": "Maktab o'qituvchilari", "uz-Cyrl": "Мактаб ўқитувчилари", ru: "Школьные учителя", en: "School teachers" },
      },
      {
        id: "sec_teach_online",
        slug: "online-coaching",
        icon: "💻",
        sortOrder: 2,
        names: { "uz-Latn": "Onlayn o'qitish", "uz-Cyrl": "Онлайн ўқитиш", ru: "Онлайн обучение", en: "Online teaching" },
      },
      {
        id: "sec_teach_sports",
        slug: "sports-coaching",
        icon: "⚽",
        sortOrder: 3,
        names: { "uz-Latn": "Sport murabbiyligi", "uz-Cyrl": "Спорт мураббийлиги", ru: "Спортивный тренинг", en: "Sports coaching" },
      },
      {
        id: "sec_teach_skills",
        slug: "skills-training",
        icon: "🎯",
        sortOrder: 4,
        names: { "uz-Latn": "Ko'nikma o'qitish", "uz-Cyrl": "Кўникма ўқитиш", ru: "Обучение навыкам", en: "Skills training" },
      },
    ],
  },
  {
    id: "ind_medical",
    slug: "doctors-medicine",
    icon: "🏥",
    sortOrder: 5,
    names: {
      "uz-Latn": "Shifokorlar va Tibbiyot",
      "uz-Cyrl": "Шифокорлар ва Тиббиёт",
      ru: "Врачи и медицина",
      en: "Doctors and Medicine",
    },
    sections: [
      {
        id: "sec_med_general",
        slug: "general-medicine",
        icon: "🩺",
        sortOrder: 1,
        names: { "uz-Latn": "Umumiy tibbiyot", "uz-Cyrl": "Умумий тиббиёт", ru: "Общая медицина", en: "General medicine" },
      },
      {
        id: "sec_med_clinic_mgmt",
        slug: "clinic-management",
        icon: "🏥",
        sortOrder: 2,
        names: { "uz-Latn": "Klinika boshqaruvi", "uz-Cyrl": "Клиника бошқаруви", ru: "Управление клиникой", en: "Clinic management" },
      },
      {
        id: "sec_med_pharmacy",
        slug: "pharmacy",
        icon: "💊",
        sortOrder: 3,
        names: { "uz-Latn": "Dorixona biznesi", "uz-Cyrl": "Дорихона бизнеси", ru: "Аптечный бизнес", en: "Pharmacy business" },
      },
      {
        id: "sec_med_wellness",
        slug: "wellness",
        icon: "🧘",
        sortOrder: 4,
        names: { "uz-Latn": "Sog'liq va wellness", "uz-Cyrl": "Соғлиқ ва wellness", ru: "Здоровье и wellness", en: "Health and wellness" },
      },
    ],
  },
  {
    id: "ind_marketing",
    slug: "marketing-smm",
    icon: "📣",
    sortOrder: 6,
    names: {
      "uz-Latn": "Marketing va SMM",
      "uz-Cyrl": "Маркетинг ва SMM",
      ru: "Маркетинг и SMM",
      en: "Marketing and SMM",
    },
    sections: [
      {
        id: "sec_mkt_digital",
        slug: "digital-marketing",
        icon: "📱",
        sortOrder: 1,
        names: { "uz-Latn": "Raqamli marketing", "uz-Cyrl": "Рақамли маркетинг", ru: "Цифровой маркетинг", en: "Digital marketing" },
      },
      {
        id: "sec_mkt_smm",
        slug: "social-media",
        icon: "📸",
        sortOrder: 2,
        names: { "uz-Latn": "Ijtimoiy tarmoqlar", "uz-Cyrl": "Ижтимоий тармоқлар", ru: "Социальные сети", en: "Social media" },
      },
      {
        id: "sec_mkt_seo",
        slug: "seo-content",
        icon: "🔍",
        sortOrder: 3,
        names: { "uz-Latn": "SEO va kontent", "uz-Cyrl": "SEO ва контент", ru: "SEO и контент", en: "SEO and content" },
      },
      {
        id: "sec_mkt_brand",
        slug: "branding",
        icon: "🎨",
        sortOrder: 4,
        names: { "uz-Latn": "Branding va dizayn", "uz-Cyrl": "Брендинг ва дизайн", ru: "Брендинг и дизайн", en: "Branding and design" },
      },
    ],
  },
  {
    id: "ind_legal",
    slug: "lawyers-legal",
    icon: "⚖️",
    sortOrder: 7,
    names: {
      "uz-Latn": "Huquqshunoslar va Advokatlar",
      "uz-Cyrl": "Ҳуқуқшунослар ва Адвокатлар",
      ru: "Юристы и адвокаты",
      en: "Lawyers and Legal",
    },
    sections: [
      {
        id: "sec_law_business",
        slug: "business-law",
        icon: "📋",
        sortOrder: 1,
        names: { "uz-Latn": "Biznes huquqi", "uz-Cyrl": "Бизнес ҳуқуқи", ru: "Бизнес-право", en: "Business law" },
      },
      {
        id: "sec_law_civil",
        slug: "civil-law",
        icon: "🏛",
        sortOrder: 2,
        names: { "uz-Latn": "Fuqarolik huquqi", "uz-Cyrl": "Фуқаролик ҳуқуқи", ru: "Гражданское право", en: "Civil law" },
      },
      {
        id: "sec_law_tax",
        slug: "tax-law",
        icon: "📊",
        sortOrder: 3,
        names: { "uz-Latn": "Soliq va buxgalteriya", "uz-Cyrl": "Солиқ ва бухгалтерия", ru: "Налоги и бухгалтерия", en: "Tax and accounting" },
      },
      {
        id: "sec_law_notary",
        slug: "notary",
        icon: "📝",
        sortOrder: 4,
        names: { "uz-Latn": "Notariat xizmati", "uz-Cyrl": "Нотариат хизмати", ru: "Нотариальные услуги", en: "Notary services" },
      },
    ],
  },
  {
    id: "ind_government",
    slug: "government-officials",
    icon: "🏛",
    sortOrder: 8,
    names: {
      "uz-Latn": "Davlat Xizmatchilari",
      "uz-Cyrl": "Давлат Хизматчилари",
      ru: "Государственные служащие",
      en: "Government Officials",
    },
    sections: [
      {
        id: "sec_gov_local",
        slug: "local-government",
        icon: "🏙",
        sortOrder: 1,
        names: { "uz-Latn": "Mahalliy hokimiyat", "uz-Cyrl": "Маҳаллий ҳокимият", ru: "Местная власть", en: "Local government" },
      },
      {
        id: "sec_gov_digital",
        slug: "digital-gov",
        icon: "💻",
        sortOrder: 2,
        names: { "uz-Latn": "Raqamli xizmatlar", "uz-Cyrl": "Рақамли хизматлар", ru: "Цифровые услуги", en: "Digital services" },
      },
      {
        id: "sec_gov_management",
        slug: "public-management",
        icon: "📋",
        sortOrder: 3,
        names: { "uz-Latn": "Davlat boshqaruvi", "uz-Cyrl": "Давлат бошқаруви", ru: "Государственное управление", en: "Public management" },
      },
    ],
  },
  {
    id: "ind_journalism",
    slug: "journalists-creators",
    icon: "✍️",
    sortOrder: 9,
    names: {
      "uz-Latn": "Jurnalistlar va Kontent Yaratuvchilar",
      "uz-Cyrl": "Журналистлар ва Контент Яратувчилар",
      ru: "Журналисты и контент-мейкеры",
      en: "Journalists and Content Creators",
    },
    sections: [
      {
        id: "sec_jour_print",
        slug: "print-journalism",
        icon: "📰",
        sortOrder: 1,
        names: { "uz-Latn": "Matbuot jurnalistikasi", "uz-Cyrl": "Матбуот журналистикаси", ru: "Печатная журналистика", en: "Print journalism" },
      },
      {
        id: "sec_jour_video",
        slug: "video-blogging",
        icon: "🎥",
        sortOrder: 2,
        names: { "uz-Latn": "Video va YouTube", "uz-Cyrl": "Видео ва YouTube", ru: "Видео и YouTube", en: "Video and YouTube" },
      },
      {
        id: "sec_jour_podcast",
        slug: "podcast",
        icon: "🎙",
        sortOrder: 3,
        names: { "uz-Latn": "Podcast va audio", "uz-Cyrl": "Podcast ва аудио", ru: "Подкасты и аудио", en: "Podcast and audio" },
      },
      {
        id: "sec_jour_copywriting",
        slug: "copywriting",
        icon: "✏️",
        sortOrder: 4,
        names: { "uz-Latn": "Kopyrayting va matn", "uz-Cyrl": "Копирайтинг ва матн", ru: "Копирайтинг и текст", en: "Copywriting and text" },
      },
    ],
  },
  {
    id: "ind_it",
    slug: "it-developers",
    icon: "👩‍💻",
    sortOrder: 10,
    names: {
      "uz-Latn": "IT va Dasturchilar",
      "uz-Cyrl": "IT ва Дастурчилар",
      ru: "IT и разработчики",
      en: "IT and Developers",
    },
    sections: [
      {
        id: "sec_it_web",
        slug: "web-development",
        icon: "🌐",
        sortOrder: 1,
        names: { "uz-Latn": "Veb dasturlash", "uz-Cyrl": "Веб дастурлаш", ru: "Веб-разработка", en: "Web development" },
      },
      {
        id: "sec_it_mobile",
        slug: "mobile-development",
        icon: "📱",
        sortOrder: 2,
        names: { "uz-Latn": "Mobil dasturlash", "uz-Cyrl": "Мобил дастурлаш", ru: "Мобильная разработка", en: "Mobile development" },
      },
      {
        id: "sec_it_data",
        slug: "data-ai",
        icon: "🤖",
        sortOrder: 3,
        names: { "uz-Latn": "Data va AI", "uz-Cyrl": "Data ва AI", ru: "Data и AI", en: "Data and AI" },
      },
      {
        id: "sec_it_devops",
        slug: "devops",
        icon: "⚙️",
        sortOrder: 4,
        names: { "uz-Latn": "DevOps va infratuzilma", "uz-Cyrl": "DevOps ва инфратузилма", ru: "DevOps и инфраструктура", en: "DevOps and infrastructure" },
      },
      {
        id: "sec_it_startup",
        slug: "tech-startup",
        icon: "🚀",
        sortOrder: 5,
        names: { "uz-Latn": "Tech startup", "uz-Cyrl": "Tech startup", ru: "Tech стартап", en: "Tech startup" },
      },
    ],
  },
];

// ─── Asosiy seed ──────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("🌱 Seeding database...");

  // 1. Barcha industrylar va sectionlarni upsert qilamiz
  for (const ind of INDUSTRIES) {
    const { sections: indSections, ...indData } = ind;

    await prisma.industry.upsert({
      where: { id: ind.id },
      update: { names: ind.names as never, icon: ind.icon, sortOrder: ind.sortOrder },
      create: {
        id: indData.id,
        slug: indData.slug,
        names: indData.names as never,
        icon: indData.icon,
        sortOrder: indData.sortOrder,
      },
    });

    for (const sec of indSections) {
      await prisma.section.upsert({
        where: { id: sec.id },
        update: { names: sec.names as never, icon: sec.icon, sortOrder: sec.sortOrder },
        create: {
          id: sec.id,
          industryId: ind.id,
          slug: sec.slug,
          names: sec.names as never,
          icon: sec.icon,
          sortOrder: sec.sortOrder,
        },
      });
    }
    console.log(`  ✓ ${ind.names["uz-Latn"]} (${indSections.length} ta bo'lim)`);
  }

  // 2. Admin foydalanuvchi
  const admin = await prisma.user.upsert({
    where: { phone: "+998900000001" },
    update: {
      passwordHash: hashPassword("admin1234"),
      role: "ADMIN",
      industryId: "ind_business",
      sectionId: "sec_biz_food",
    },
    create: {
      id: "user_admin",
      phone: "+998900000001",
      passwordHash: hashPassword("admin1234"),
      role: "ADMIN",
      language: "uz-Latn",
      industryId: "ind_business",
      sectionId: "sec_biz_food",
      profile: {
        create: {
          firstName: "Admin",
          lastName: "Biznesjon",
          username: "admin_biznesjon",
          businessName: "Biznesjon Team",
          city: "Toshkent",
          bio: "Kontent va platforma administratori.",
        },
      },
    },
  });

  // 3. Asosiy test foydalanuvchi (user_1)
  const user = await prisma.user.upsert({
    where: { phone: "+998901234567" },
    update: {
      passwordHash: hashPassword("password123"),
      industryId: "ind_business",
      sectionId: "sec_biz_food",
    },
    create: {
      id: "user_1",
      phone: "+998901234567",
      passwordHash: hashPassword("password123"),
      role: "USER",
      language: "uz-Latn",
      industryId: "ind_business",
      sectionId: "sec_biz_food",
      profile: {
        create: {
          firstName: "Bekzod",
          lastName: "Olimov",
          username: "bekzod_o",
          businessName: "Kofe Lab",
          city: "Toshkent",
          bio: "5 yil restoran biznesi. 3 ta filial. Spesialist: F&B operations.",
        },
      },
    },
  });

  // 4. Qo'shimcha test foydalanuvchilar
  const nilufar = await prisma.user.upsert({
    where: { phone: "+998901111111" },
    update: { industryId: "ind_business", sectionId: "sec_biz_beauty" },
    create: {
      id: "user_2",
      phone: "+998901111111",
      passwordHash: hashPassword("password123"),
      role: "USER",
      language: "uz-Latn",
      industryId: "ind_business",
      sectionId: "sec_biz_beauty",
      profile: {
        create: {
          firstName: "Nilufar",
          lastName: "Rahimova",
          username: "nilufar_r",
          businessName: "Beauty Studio N",
          city: "Samarqand",
          bio: "Servis va mijoz tajribasi bo'yicha amaliy bilimlar.",
        },
      },
    },
  });

  const aziz = await prisma.user.upsert({
    where: { phone: "+998902222222" },
    update: { industryId: "ind_business", sectionId: "sec_biz_workshop" },
    create: {
      id: "user_3",
      phone: "+998902222222",
      passwordHash: hashPassword("password123"),
      role: "USER",
      language: "uz-Latn",
      industryId: "ind_business",
      sectionId: "sec_biz_workshop",
      profile: {
        create: {
          firstName: "Aziz",
          lastName: "Karimov",
          username: "aziz",
          businessName: "Karimov Auto",
          city: "Toshkent",
          bio: "Operatsion jarayonlar va xizmat sifati.",
        },
      },
    },
  });

  const madina = await prisma.user.upsert({
    where: { phone: "+998903333333" },
    update: { industryId: "ind_business", sectionId: "sec_biz_retail" },
    create: {
      id: "user_4",
      phone: "+998903333333",
      passwordHash: hashPassword("password123"),
      role: "USER",
      language: "uz-Latn",
      industryId: "ind_business",
      sectionId: "sec_biz_retail",
      profile: {
        create: {
          firstName: "Madina",
          lastName: "Yusupova",
          username: "madina_y",
          businessName: "Madina Style",
          city: "Buxoro",
          bio: "Moda va chakana savdo bo'yicha tajriba.",
        },
      },
    },
  });

  const sherzod = await prisma.user.upsert({
    where: { phone: "+998904444444" },
    update: { industryId: "ind_business", sectionId: "sec_biz_food" },
    create: {
      id: "user_5",
      phone: "+998904444444",
      passwordHash: hashPassword("password123"),
      role: "USER",
      language: "uz-Latn",
      industryId: "ind_business",
      sectionId: "sec_biz_food",
      profile: {
        create: {
          firstName: "Sherzod",
          lastName: "Nizomov",
          username: "sherzod_n",
          businessName: "Choyxona Sharq",
          city: "Namangan",
          bio: "Choyxona va milliy taomlar bo'yicha 10 yillik tajriba.",
        },
      },
    },
  });

  // IT bo'limi foydalanuvchilari
  const jasur = await prisma.user.upsert({
    where: { phone: "+998905555555" },
    update: { industryId: "ind_it", sectionId: "sec_it_web" },
    create: {
      id: "user_6",
      phone: "+998905555555",
      passwordHash: hashPassword("password123"),
      role: "USER",
      language: "uz-Latn",
      industryId: "ind_it",
      sectionId: "sec_it_web",
      profile: {
        create: {
          firstName: "Jasur",
          lastName: "Toshmatov",
          username: "jasur_dev",
          businessName: "JT Web Studio",
          city: "Toshkent",
          bio: "Frontend dasturchi, 4 yil tajriba. React va Next.js mutaxassisi.",
        },
      },
    },
  });

  const zulfiya = await prisma.user.upsert({
    where: { phone: "+998906666666" },
    update: { industryId: "ind_it", sectionId: "sec_it_web" },
    create: {
      id: "user_7",
      phone: "+998906666666",
      passwordHash: hashPassword("password123"),
      role: "USER",
      language: "uz-Latn",
      industryId: "ind_it",
      sectionId: "sec_it_web",
      profile: {
        create: {
          firstName: "Zulfiya",
          lastName: "Nazarova",
          username: "zulfiya_ui",
          businessName: "Design & Code",
          city: "Samarqand",
          bio: "UI/UX dizayner va veb dasturchi. 3 yildan ortiq loyihalar.",
        },
      },
    },
  });

  const bobur = await prisma.user.upsert({
    where: { phone: "+998907777777" },
    update: { industryId: "ind_it", sectionId: "sec_it_web" },
    create: {
      id: "user_8",
      phone: "+998907777777",
      passwordHash: hashPassword("password123"),
      role: "USER",
      language: "uz-Latn",
      industryId: "ind_it",
      sectionId: "sec_it_web",
      profile: {
        create: {
          firstName: "Bobur",
          lastName: "Xolmatov",
          username: "bobur_fullstack",
          businessName: "FullStack UZ",
          city: "Toshkent",
          bio: "Fullstack dasturchi. Node.js, React, PostgreSQL bo'yicha ishlayman.",
        },
      },
    },
  });

  console.log("  ✓ 8 ta foydalanuvchi (5 ta biznes + 3 ta IT bo'limi)");

  // 5. Darslar
  const lessonOne = await prisma.lesson.upsert({
    where: { id: "lesson_1" },
    update: { status: "PUBLISHED" },
    create: {
      id: "lesson_1",
      industryId: "ind_business",
      sectionId: "sec_biz_food",
      uploadedById: admin.id,
      titles: {
        "uz-Latn": "Restoran biznesini noldan boshlash: 7 ta asosiy qadam",
        "uz-Cyrl": "Ресторан бизнесини нолдан бошлаш: 7 та асосий қадам",
        ru: "Как открыть ресторан с нуля: 7 ключевых шагов",
        en: "Starting a restaurant from zero: 7 key steps",
      },
      descriptions: {
        "uz-Latn": "Bozorni o'rganish, joy tanlash, konseptsiya, jamoa va birinchi oy operatsiyalari.",
        "uz-Cyrl": "Бозорни ўрганиш, жой танлаш, концепция, жамоа ва биринчи ой операциялари.",
        ru: "Исследование рынка, выбор локации, концепция, команда и первый месяц операций.",
        en: "Market research, location, concept, team and first month operations.",
      },
      hlsManifestPath: "/storage/videos/lesson_1/master.m3u8",
      thumbnailPath: "/storage/videos/lesson_1/thumbnail.webp",
      sourcePath: "/storage/uploads/lesson_1/source.mp4",
      durationSeconds: 1122,
      status: "PUBLISHED",
      viewCount: 12400,
      tags: ["restaurant", "startup", "food"],
      publishedAt: new Date(),
    },
  });

  await prisma.lesson.upsert({
    where: { id: "lesson_2" },
    update: { status: "PUBLISHED" },
    create: {
      id: "lesson_2",
      industryId: "ind_business",
      sectionId: "sec_biz_food",
      uploadedById: admin.id,
      titles: {
        "uz-Latn": "Kafe uchun menu dizayn: narxlash psixologiyasi",
        "uz-Cyrl": "Кафе учун меню дизайн: нархлаш психологияси",
        ru: "Дизайн меню для кафе: психология цен",
        en: "Cafe menu design: pricing psychology",
      },
      descriptions: {
        "uz-Latn": "Menu dizayni, narx anchoring va mijoz qaroriga ta'sir qiluvchi omillar.",
        "uz-Cyrl": "Меню дизайни, нарх anchoring ва мижоз қарорига таъсир қилувчи омиллар.",
        ru: "Дизайн меню, ценовые якоря и факторы решения клиента.",
        en: "Menu design, price anchoring and decision factors.",
      },
      hlsManifestPath: "/storage/videos/lesson_2/master.m3u8",
      thumbnailPath: "/storage/videos/lesson_2/thumbnail.webp",
      sourcePath: "/storage/uploads/lesson_2/source.mp4",
      durationSeconds: 735,
      status: "PUBLISHED",
      viewCount: 8200,
      tags: ["menu", "pricing"],
      publishedAt: new Date(),
    },
  });

  await prisma.lesson.upsert({
    where: { id: "lesson_3" },
    update: { status: "PUBLISHED" },
    create: {
      id: "lesson_3",
      industryId: "ind_business",
      sectionId: "sec_biz_food",
      uploadedById: admin.id,
      titles: {
        "uz-Latn": "Mijozni xizmatga oshib qoldirish — 12 ta texnika",
        "uz-Cyrl": "Мижозни хизматга ошиб қолдириш — 12 та техника",
        ru: "12 техник удержания клиентов",
        en: "12 techniques for customer retention",
      },
      descriptions: {
        "uz-Latn": "Mijozlarni qayta qaytaruvchi 12 ta amaliy texnika va misollar.",
        "uz-Cyrl": "Мижозларни қайта қайтарувчи 12 та амалий техника ва мисоллар.",
        ru: "12 практических техник для возврата клиентов с примерами.",
        en: "12 practical techniques for customer return with examples.",
      },
      hlsManifestPath: "/storage/videos/lesson_3/master.m3u8",
      thumbnailPath: "/storage/videos/lesson_3/thumbnail.webp",
      sourcePath: "/storage/uploads/lesson_3/source.mp4",
      durationSeconds: 1388,
      status: "PUBLISHED",
      viewCount: 18900,
      tags: ["customer", "service", "retention"],
      publishedAt: new Date(Date.now() - 7 * DAY_MS),
    },
  });

  await prisma.lesson.upsert({
    where: { id: "lesson_4" },
    update: { status: "PUBLISHED" },
    create: {
      id: "lesson_4",
      industryId: "ind_business",
      sectionId: "sec_biz_food",
      uploadedById: admin.id,
      titles: {
        "uz-Latn": "Choyxonangizda yo'qotishlarni 30% kamaytirish",
        "uz-Cyrl": "Чойхонангизда йўқотишларни 30% камайтириш",
        ru: "Как снизить потери в чайхане на 30%",
        en: "How to cut teahouse losses by 30%",
      },
      descriptions: {
        "uz-Latn": "Inventar nazorati, chiqindilar tahlili va xarajatlarni optimallashtirish.",
        "uz-Cyrl": "Инвентар назорати, чиқиндилар таҳлили ва харажатларни оптималлаштириш.",
        ru: "Контроль запасов, анализ потерь и оптимизация затрат.",
        en: "Inventory control, loss analysis and cost optimization.",
      },
      hlsManifestPath: "/storage/videos/lesson_4/master.m3u8",
      thumbnailPath: "/storage/videos/lesson_4/thumbnail.webp",
      sourcePath: "/storage/uploads/lesson_4/source.mp4",
      durationSeconds: 932,
      status: "PUBLISHED",
      viewCount: 6700,
      tags: ["cost", "optimization", "inventory"],
      publishedAt: new Date(Date.now() - 14 * DAY_MS),
    },
  });

  await prisma.lesson.upsert({
    where: { id: "lesson_5" },
    update: { status: "PUBLISHED" },
    create: {
      id: "lesson_5",
      industryId: "ind_business",
      sectionId: "sec_biz_food",
      uploadedById: admin.id,
      titles: {
        "uz-Latn": "Yetkazib berish: Yandex va Uzum bilan ishlash",
        "uz-Cyrl": "Етказиб бериш: Yandex ва Uzum билан ишлаш",
        ru: "Доставка: работа с Yandex и Uzum",
        en: "Delivery: working with Yandex and Uzum",
      },
      descriptions: {
        "uz-Latn": "Agregatorlarga qo'shilish, to'lovlar, reyting ko'tarish va muammolarni hal qilish.",
        "uz-Cyrl": "Агрегаторларга қўшилиш, тўловлар, рейтинг кўтариш ва муаммоларни ҳал қилиш.",
        ru: "Подключение к агрегаторам, тарифы, повышение рейтинга и решение проблем.",
        en: "Joining aggregators, fees, rating boost and problem solving.",
      },
      hlsManifestPath: "/storage/videos/lesson_5/master.m3u8",
      thumbnailPath: "/storage/videos/lesson_5/thumbnail.webp",
      sourcePath: "/storage/uploads/lesson_5/source.mp4",
      durationSeconds: 1217,
      status: "PUBLISHED",
      viewCount: 14500,
      tags: ["delivery", "yandex", "uzum"],
      publishedAt: new Date(Date.now() - 2 * DAY_MS),
    },
  });

  await prisma.lesson.upsert({
    where: { id: "lesson_6" },
    update: { status: "PUBLISHED" },
    create: {
      id: "lesson_6",
      industryId: "ind_business",
      sectionId: "sec_biz_food",
      uploadedById: admin.id,
      titles: {
        "uz-Latn": "Restoran rentabelligini hisoblash: Excel namunalari",
        "uz-Cyrl": "Ресторан рентабеллигини ҳисоблаш: Excel намуналари",
        ru: "Расчёт рентабельности ресторана: примеры в Excel",
        en: "Restaurant profitability calculation: Excel examples",
      },
      descriptions: {
        "uz-Latn": "Haqiqiy raqamlar bilan rentabellik, break-even va pul oqimini hisoblash.",
        "uz-Cyrl": "Ҳақиқий рақамлар билан рентабеллик, break-even ва пул оқимини ҳисоблаш.",
        ru: "Расчёт рентабельности, точки безубыточности и денежного потока с реальными цифрами.",
        en: "Calculating profitability, break-even and cash flow with real numbers.",
      },
      hlsManifestPath: "/storage/videos/lesson_6/master.m3u8",
      thumbnailPath: "/storage/videos/lesson_6/thumbnail.webp",
      sourcePath: "/storage/uploads/lesson_6/source.mp4",
      durationSeconds: 1735,
      status: "PUBLISHED",
      viewCount: 9100,
      tags: ["finance", "excel", "profitability"],
      publishedAt: new Date(Date.now() - 21 * DAY_MS),
    },
  });

  await prisma.lesson.upsert({
    where: { id: "lesson_7" },
    update: { status: "PUBLISHED" },
    create: {
      id: "lesson_7",
      industryId: "ind_business",
      sectionId: "sec_biz_food",
      uploadedById: admin.id,
      titles: {
        "uz-Latn": "Instagram orqali kafe brandini kuchaytirish",
        "uz-Cyrl": "Instagram орқали кафе брандини кучайтириш",
        ru: "Усиление бренда кафе через Instagram",
        en: "Strengthening cafe brand through Instagram",
      },
      descriptions: {
        "uz-Latn": "Kontent strategiyasi, Reels, Stories va fotosuratlar bilan organik o'sish.",
        "uz-Cyrl": "Контент стратегияси, Reels, Stories ва фотосуратлар билан органик ўсиш.",
        ru: "Контент-стратегия, Reels, Stories и фото для органического роста.",
        en: "Content strategy, Reels, Stories and photos for organic growth.",
      },
      hlsManifestPath: "/storage/videos/lesson_7/master.m3u8",
      thumbnailPath: "/storage/videos/lesson_7/thumbnail.webp",
      sourcePath: "/storage/uploads/lesson_7/source.mp4",
      durationSeconds: 984,
      status: "PUBLISHED",
      viewCount: 22800,
      tags: ["instagram", "smm", "brand"],
      publishedAt: new Date(Date.now() - 5 * DAY_MS),
    },
  });

  await prisma.lesson.upsert({
    where: { id: "lesson_8" },
    update: { status: "PUBLISHED" },
    create: {
      id: "lesson_8",
      industryId: "ind_business",
      sectionId: "sec_biz_food",
      uploadedById: admin.id,
      titles: {
        "uz-Latn": "Oshpazlar bilan ishlash va jamoa motivatsiyasi",
        "uz-Cyrl": "Ошпазлар билан ишлаш ва жамоа мотивацияси",
        ru: "Работа с поварами и мотивация команды",
        en: "Working with chefs and team motivation",
      },
      descriptions: {
        "uz-Latn": "HR, KPI, mukofotlash tizimi va oshpazlarni uzoq vaqt ushlab turish sirlari.",
        "uz-Cyrl": "HR, KPI, мукофотлаш тизими ва ошпазларни узоқ вақт ушлаб туриш сирлари.",
        ru: "HR, KPI, система поощрений и секреты удержания поваров.",
        en: "HR, KPI, reward system and secrets of retaining chefs.",
      },
      hlsManifestPath: "/storage/videos/lesson_8/master.m3u8",
      thumbnailPath: "/storage/videos/lesson_8/thumbnail.webp",
      sourcePath: "/storage/uploads/lesson_8/source.mp4",
      durationSeconds: 1151,
      status: "PUBLISHED",
      viewCount: 5400,
      tags: ["hr", "team", "motivation"],
      publishedAt: new Date(Date.now() - 30 * DAY_MS),
    },
  });

  // IT bo'limi darslari
  await prisma.lesson.upsert({
    where: { id: "lesson_9" },
    update: { status: "PUBLISHED" },
    create: {
      id: "lesson_9",
      industryId: "ind_it",
      sectionId: "sec_it_web",
      uploadedById: admin.id,
      titles: {
        "uz-Latn": "React bilan zamonaviy veb ilova yaratish",
        "uz-Cyrl": "React билан замонавий веб илова яратиш",
        ru: "Создание современного веб-приложения с React",
        en: "Building a modern web app with React",
      },
      descriptions: {
        "uz-Latn": "React, hooks, state management va deployment — amaliy qo'llanma.",
        "uz-Cyrl": "React, hooks, state management ва deployment — амалий қўлланма.",
        ru: "React, hooks, управление состоянием и деплой — практическое руководство.",
        en: "React, hooks, state management and deployment — practical guide.",
      },
      hlsManifestPath: "/storage/videos/lesson_9/master.m3u8",
      thumbnailPath: "/storage/videos/lesson_9/thumbnail.webp",
      sourcePath: "/storage/uploads/lesson_9/source.mp4",
      durationSeconds: 1540,
      status: "PUBLISHED",
      viewCount: 8700,
      tags: ["react", "frontend", "javascript"],
      publishedAt: new Date(Date.now() - 3 * DAY_MS),
    },
  });

  await prisma.lesson.upsert({
    where: { id: "lesson_10" },
    update: { status: "PUBLISHED" },
    create: {
      id: "lesson_10",
      industryId: "ind_it",
      sectionId: "sec_it_web",
      uploadedById: admin.id,
      titles: {
        "uz-Latn": "Next.js 15 va App Router — to'liq kurs",
        "uz-Cyrl": "Next.js 15 ва App Router — тўлиқ курс",
        ru: "Next.js 15 и App Router — полный курс",
        en: "Next.js 15 and App Router — complete course",
      },
      descriptions: {
        "uz-Latn": "Server components, file-based routing, API routes va optimizatsiya.",
        "uz-Cyrl": "Server components, file-based routing, API routes ва оптимизация.",
        ru: "Серверные компоненты, маршрутизация, API routes и оптимизация.",
        en: "Server components, file-based routing, API routes and optimization.",
      },
      hlsManifestPath: "/storage/videos/lesson_10/master.m3u8",
      thumbnailPath: "/storage/videos/lesson_10/thumbnail.webp",
      sourcePath: "/storage/uploads/lesson_10/source.mp4",
      durationSeconds: 2100,
      status: "PUBLISHED",
      viewCount: 14200,
      tags: ["nextjs", "react", "fullstack"],
      publishedAt: new Date(),
    },
  });

  await prisma.lesson.upsert({
    where: { id: "lesson_11" },
    update: { status: "PUBLISHED" },
    create: {
      id: "lesson_11",
      industryId: "ind_it",
      sectionId: "sec_it_web",
      uploadedById: admin.id,
      titles: {
        "uz-Latn": "IT freelancer sifatida daromad: xalqaro bozorga chiqish",
        "uz-Cyrl": "IT freelancer сифатида даромад: халқаро бозорга чиқиш",
        ru: "Доход как IT-фрилансер: выход на международный рынок",
        en: "Income as IT freelancer: entering the international market",
      },
      descriptions: {
        "uz-Latn": "Upwork, Fiverr, to'g'ridan-to'g'ri mijozlar va narxlash strategiyasi.",
        "uz-Cyrl": "Upwork, Fiverr, тўғридан-тўғри мижозлар ва нархлаш стратегияси.",
        ru: "Upwork, Fiverr, прямые клиенты и стратегия ценообразования.",
        en: "Upwork, Fiverr, direct clients and pricing strategy.",
      },
      hlsManifestPath: "/storage/videos/lesson_11/master.m3u8",
      thumbnailPath: "/storage/videos/lesson_11/thumbnail.webp",
      sourcePath: "/storage/uploads/lesson_11/source.mp4",
      durationSeconds: 1320,
      status: "PUBLISHED",
      viewCount: 19500,
      tags: ["freelance", "it", "income"],
      publishedAt: new Date(Date.now() - 1 * DAY_MS),
    },
  });

  console.log("  ✓ 11 ta dars (3 ta IT bo'limi)");

  // 6. Dars progresslari
  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId: lessonOne.id } },
    update: { positionSeconds: 471 },
    create: { userId: user.id, lessonId: lessonOne.id, positionSeconds: 471 },
  });

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId: "lesson_7" } },
    update: { positionSeconds: 670 },
    create: { userId: user.id, lessonId: "lesson_7", positionSeconds: 670 },
  });

  // 7. Saqlangan darslar
  await prisma.savedLesson.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId: lessonOne.id } },
    update: {},
    create: { userId: user.id, lessonId: lessonOne.id },
  });

  // 8. Promo video
  await prisma.promoVideo.upsert({
    where: { id: "promo_1" },
    update: { status: "PUBLISHED", isShareable: true },
    create: {
      id: "promo_1",
      userId: user.id,
      uploadedById: admin.id,
      titles: {
        "uz-Latn": "Kofe Lab — siz uchun professional kofe tajribasi",
        "uz-Cyrl": "Kofe Lab — сиз учун профессионал кофе тажрибаси",
        ru: "Kofe Lab — профессиональный кофейный опыт для вас",
        en: "Kofe Lab — a professional coffee experience for you",
      },
      descriptions: {
        "uz-Latn": "5 yillik tajriba, 3 filial, har kuni 800+ mijoz. Barcha turlardagi kofe va shirinliklar.",
        "uz-Cyrl": "5 йиллик тажриба, 3 филиал, ҳар куни 800+ мижоз. Барча турлардаги кофе ва ширинликлар.",
        ru: "5 лет опыта, 3 филиала, 800+ клиентов ежедневно. Все виды кофе и сладостей.",
        en: "5 years of experience, 3 branches, 800+ customers daily. All types of coffee and sweets.",
      },
      hlsManifestPath: "/storage/promo-videos/promo_1/master.m3u8",
      thumbnailPath: "/storage/promo-videos/promo_1/thumbnail.webp",
      sourcePath: "/storage/uploads/promo_1/source.mp4",
      durationSeconds: 144,
      status: "PUBLISHED",
      isShareable: true,
      shareToken: "kofe-lab-bekzod",
    },
  });

  // 9. Guruhlar
  const group1 = await prisma.groupChat.upsert({
    where: { id: "group_1" },
    update: {},
    create: {
      id: "group_1",
      ownerId: user.id,
      name: "Toshkent kafe egalari",
      description: "Tajriba almashish, mijozlar, yetkazib beruvchilar",
      visibility: "PUBLIC",
      memberCount: 4,
    },
  });

  await prisma.groupChat.upsert({
    where: { id: "group_2" },
    update: {},
    create: {
      id: "group_2",
      ownerId: nilufar.id,
      name: "F&B Marketing UZ",
      description: "Restoran va kafe uchun reklama strategiyalari",
      visibility: "PUBLIC",
      memberCount: 2,
    },
  });

  await prisma.groupChat.upsert({
    where: { id: "group_3" },
    update: {},
    create: {
      id: "group_3",
      ownerId: sherzod.id,
      name: "Choyxona biznesi",
      description: "Klassik choyxona formati — Namangan, Farg'ona, Andijon",
      visibility: "PRIVATE",
      memberCount: 2,
    },
  });

  // Guruh a'zoliklari
  const memberships = [
    { groupId: group1.id, userId: user.id, role: "OWNER" as const },
    { groupId: group1.id, userId: nilufar.id, role: "MEMBER" as const },
    { groupId: group1.id, userId: aziz.id, role: "MEMBER" as const },
    { groupId: group1.id, userId: madina.id, role: "ADMIN" as const },
    { groupId: "group_2", userId: nilufar.id, role: "OWNER" as const },
    { groupId: "group_2", userId: user.id, role: "MEMBER" as const },
    { groupId: "group_3", userId: sherzod.id, role: "OWNER" as const },
    { groupId: "group_3", userId: aziz.id, role: "MEMBER" as const },
  ];

  for (const m of memberships) {
    await prisma.groupMembership.upsert({
      where: { groupId_userId: { groupId: m.groupId, userId: m.userId } },
      update: { role: m.role },
      create: m,
    });
  }

  // Guruh xabarlari
  await prisma.groupMessage.createMany({
    data: [
      {
        id: "gm_seed_1",
        groupId: group1.id,
        senderId: nilufar.id,
        type: "TEXT",
        text: "Toshkent kafe egalari guruhiga xush kelibsiz! Tajriba almashaylik.",
      },
      {
        id: "gm_seed_2",
        groupId: group1.id,
        senderId: madina.id,
        type: "TEXT",
        text: "Yangi yetkazib beruvchini sinab ko'rdim — sifat yaxshi, narx ham qulay.",
      },
      {
        id: "gm_seed_3",
        groupId: group1.id,
        senderId: user.id,
        type: "TEXT",
        text: "Kim Yandex Food bilan ishlayapti? Komissiya qancha?",
      },
    ],
    skipDuplicates: true,
  });

  // IT bo'limi guruhlari
  const group4 = await prisma.groupChat.upsert({
    where: { id: "group_4" },
    update: {},
    create: {
      id: "group_4",
      ownerId: jasur.id,
      name: "O'zbekiston veb dasturchilar",
      description: "React, Vue, Angular, Next.js bo'yicha tajriba almashish",
      visibility: "PUBLIC",
      memberCount: 3,
    },
  });

  await prisma.groupChat.upsert({
    where: { id: "group_5" },
    update: {},
    create: {
      id: "group_5",
      ownerId: zulfiya.id,
      name: "Freelance IT UZ",
      description: "Xalqaro bozorga chiqish, mijozlar topish, narxlash",
      visibility: "PUBLIC",
      memberCount: 2,
    },
  });

  const itMemberships = [
    { groupId: group4.id, userId: jasur.id, role: "OWNER" as const },
    { groupId: group4.id, userId: zulfiya.id, role: "MEMBER" as const },
    { groupId: group4.id, userId: bobur.id, role: "ADMIN" as const },
    { groupId: "group_5", userId: zulfiya.id, role: "OWNER" as const },
    { groupId: "group_5", userId: jasur.id, role: "MEMBER" as const },
  ];

  for (const m of itMemberships) {
    await prisma.groupMembership.upsert({
      where: { groupId_userId: { groupId: m.groupId, userId: m.userId } },
      update: { role: m.role },
      create: m,
    });
  }

  await prisma.groupMessage.createMany({
    data: [
      {
        id: "gm_seed_it_1",
        groupId: group4.id,
        senderId: jasur.id,
        type: "TEXT",
        text: "O'zbekiston veb dasturchilar guruhiga xush kelibsiz!",
      },
      {
        id: "gm_seed_it_2",
        groupId: group4.id,
        senderId: bobur.id,
        type: "TEXT",
        text: "Next.js 15 bilan loyiha yozdim — juda qulay. Kimda savollar bo'lsa yozing.",
      },
    ],
    skipDuplicates: true,
  });

  console.log("  ✓ 5 ta guruh + a'zoliklari (2 ta IT bo'limi)");

  // 10. Shaxsiy xabarlar
  await prisma.directMessage.createMany({
    data: [
      {
        id: "dm_seed_1",
        senderId: nilufar.id,
        receiverId: user.id,
        type: "TEXT",
        text: "Salom! Yangi dars bo'yicha fikringiz qanday?",
        status: "READ",
      },
      {
        id: "dm_seed_2",
        senderId: user.id,
        receiverId: nilufar.id,
        type: "TEXT",
        text: "Juda foydali! Ayniqsa subtitle tanlash qulay.",
        status: "READ",
      },
      {
        id: "dm_seed_3",
        senderId: nilufar.id,
        receiverId: user.id,
        type: "TEXT",
        text: "Ha, men ham Samarqandda shunday muammo bor edi. Yaxshi dars!",
        status: "DELIVERED",
      },
      {
        id: "dm_seed_4",
        senderId: aziz.id,
        receiverId: user.id,
        type: "TEXT",
        text: "Bekzod aka, Karimov Auto'dan Aziz. Uchrashamizmi?",
        status: "SENT",
      },
    ],
    skipDuplicates: true,
  });

  console.log("  ✓ DM xabarlar");

  // 11. Bildirishnomalar
  await prisma.notification.upsert({
    where: { id: "notif_1" },
    update: {},
    create: {
      id: "notif_1",
      userId: user.id,
      type: "PROMO_VIDEO_PUBLISHED",
      title: "Mening saytim videosi tayyor!",
      body: "Kofe Lab videosi profilingizga biriktirildi. Ko'ring va ulashing.",
      expiresAt: new Date(Date.now() + NOTIFICATION_TTL_DAYS * DAY_MS),
    },
  });

  await prisma.notification.upsert({
    where: { id: "notif_2" },
    update: {},
    create: {
      id: "notif_2",
      userId: user.id,
      type: "LESSON_PUBLISHED",
      title: "Yangi dars chiqdi!",
      body: "Yetkazib berish: Yandex va Uzum bilan ishlash — hoziroq ko'ring.",
      expiresAt: new Date(Date.now() + NOTIFICATION_TTL_DAYS * DAY_MS),
    },
  });

  await prisma.notification.upsert({
    where: { id: "notif_3" },
    update: {},
    create: {
      id: "notif_3",
      userId: user.id,
      type: "GROUP_MENTION",
      title: "Guruhda sizni eslatdilar",
      body: "Madina Yusupova: @bekzod_o yetkazib beruvchi masalasida yozing.",
      expiresAt: new Date(Date.now() + NOTIFICATION_TTL_DAYS * DAY_MS),
    },
  });

  console.log("  ✓ Bildirishnomalar");
  console.log("\n✅ Seed muvaffaqiyatli yakunlandi!");
  console.log("\n📋 Login ma'lumotlari:");
  console.log("  👤 Admin:  +998900000001 / admin1234");
  console.log("  👤 User 1: +998901234567 / password123 (Bekzod — kafe, sec_biz_food)");
  console.log("  👤 User 2: +998901111111 / password123 (Nilufar — go'zallik, sec_biz_beauty)");
  console.log("  👤 User 3: +998902222222 / password123 (Aziz — ustaxona, sec_biz_workshop)");
  console.log("  👤 User 4: +998903333333 / password123 (Madina — savdo, sec_biz_retail)");
  console.log("  👤 User 5: +998904444444 / password123 (Sherzod — choyxona, sec_biz_food)");
  console.log("  👤 User 6: +998905555555 / password123 (Jasur — veb dasturchi, sec_it_web)");
  console.log("  👤 User 7: +998906666666 / password123 (Zulfiya — UI/UX, sec_it_web)");
  console.log("  👤 User 8: +998907777777 / password123 (Bobur — fullstack, sec_it_web)");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
