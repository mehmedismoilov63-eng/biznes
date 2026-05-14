import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

const DEFAULT_INDUSTRY_OPEN = true;

type LocaleNames = Prisma.InputJsonObject;

type CatalogSectionSeed = {
  id: string;
  slug: string;
  icon: string;
  sortOrder: number;
  names: LocaleNames;
};

type CatalogIndustrySeed = {
  id: string;
  slug: string;
  icon: string;
  sortOrder: number;
  names: LocaleNames;
  sections: CatalogSectionSeed[];
};

function names(value: Record<string, string>): LocaleNames {
  return value;
}

const CATALOG_INDUSTRIES: CatalogIndustrySeed[] = [
  {
    id: "ind_family",
    slug: "family-parenting",
    icon: "👨‍👩‍👧",
    sortOrder: 1,
    names: names({
      "uz-Latn": "Oila va tarbiya",
      "uz-Cyrl": "Оила ва тарбия",
      ru: "Семья и воспитание",
      en: "Family and parenting",
    }),
    sections: [
      {
        id: "sec_family_edu",
        slug: "child-education",
        icon: "📖",
        sortOrder: 1,
        names: names({ "uz-Latn": "Bola tarbiyasi", "uz-Cyrl": "Бола тарбияси", ru: "Воспитание детей", en: "Child education" }),
      },
      {
        id: "sec_family_health",
        slug: "family-health",
        icon: "🏥",
        sortOrder: 2,
        names: names({ "uz-Latn": "Oilaviy salomatlik", "uz-Cyrl": "Оилавий саломатлик", ru: "Семейное здоровье", en: "Family health" }),
      },
      {
        id: "sec_family_finance",
        slug: "family-finance",
        icon: "💰",
        sortOrder: 3,
        names: names({ "uz-Latn": "Oilaviy moliya", "uz-Cyrl": "Оилавий молия", ru: "Семейные финансы", en: "Family finance" }),
      },
      {
        id: "sec_family_psych",
        slug: "family-psychology",
        icon: "🧠",
        sortOrder: 4,
        names: names({ "uz-Latn": "Oilaviy psixologiya", "uz-Cyrl": "Оилавий психология", ru: "Семейная психология", en: "Family psychology" }),
      },
    ],
  },
  {
    id: "ind_youth",
    slug: "students-youth",
    icon: "🎓",
    sortOrder: 2,
    names: names({
      "uz-Latn": "Talabalar va yoshlar",
      "uz-Cyrl": "Талабалар ва ёшлар",
      ru: "Студенты и молодежь",
      en: "Students and youth",
    }),
    sections: [
      {
        id: "sec_youth_career",
        slug: "career-start",
        icon: "💼",
        sortOrder: 1,
        names: names({ "uz-Latn": "Karera boshlash", "uz-Cyrl": "Карьера бошлаш", ru: "Старт карьеры", en: "Career start" }),
      },
      {
        id: "sec_youth_study",
        slug: "effective-study",
        icon: "📚",
        sortOrder: 2,
        names: names({ "uz-Latn": "Samarali o'qish", "uz-Cyrl": "Самарали ўқиш", ru: "Эффективное обучение", en: "Effective study" }),
      },
      {
        id: "sec_youth_startup",
        slug: "youth-startup",
        icon: "🚀",
        sortOrder: 3,
        names: names({ "uz-Latn": "Yosh tadbirkorlik", "uz-Cyrl": "Ёш тадбиркорлик", ru: "Молодежное предпринимательство", en: "Youth entrepreneurship" }),
      },
      {
        id: "sec_youth_freelance",
        slug: "freelancing",
        icon: "💻",
        sortOrder: 4,
        names: names({ "uz-Latn": "Frilanserlik", "uz-Cyrl": "Фрилансерлик", ru: "Фриланс", en: "Freelancing" }),
      },
    ],
  },
  {
    id: "ind_business",
    slug: "small-business",
    icon: "💼",
    sortOrder: 3,
    names: names({
      "uz-Latn": "Kichik biznes va tadbirkorlar",
      "uz-Cyrl": "Кичик бизнес ва тадбиркорлар",
      ru: "Малый бизнес и предприниматели",
      en: "Small business and entrepreneurs",
    }),
    sections: [
      {
        id: "sec_biz_food",
        slug: "food-cafe-restaurant",
        icon: "🍽️",
        sortOrder: 1,
        names: names({ "uz-Latn": "Oziq-ovqat, kafe va restoran", "uz-Cyrl": "Озиқ-овқат, кафе ва ресторан", ru: "Еда, кафе и ресторан", en: "Food, cafe and restaurant" }),
      },
      {
        id: "sec_biz_beauty",
        slug: "beauty-salon",
        icon: "💇",
        sortOrder: 2,
        names: names({ "uz-Latn": "Go'zallik saloni", "uz-Cyrl": "Гўзаллик салони", ru: "Салон красоты", en: "Beauty salon" }),
      },
      {
        id: "sec_biz_retail",
        slug: "retail",
        icon: "🛒",
        sortOrder: 3,
        names: names({ "uz-Latn": "Chakana savdo", "uz-Cyrl": "Чакана савдо", ru: "Розничная торговля", en: "Retail" }),
      },
      {
        id: "sec_biz_workshop",
        slug: "workshop",
        icon: "🔧",
        sortOrder: 4,
        names: names({ "uz-Latn": "Ustaxona va servis", "uz-Cyrl": "Устахона ва сервис", ru: "Мастерская и сервис", en: "Workshop and service" }),
      },
      {
        id: "sec_biz_clinic",
        slug: "medical-clinic",
        icon: "💊",
        sortOrder: 5,
        names: names({ "uz-Latn": "Tibbiyot klinikasi", "uz-Cyrl": "Тиббиёт клиникаси", ru: "Медицинская клиника", en: "Medical clinic" }),
      },
      {
        id: "sec_biz_sport",
        slug: "sport-club",
        icon: "🏋️",
        sortOrder: 6,
        names: names({ "uz-Latn": "Sport klubi", "uz-Cyrl": "Спорт клуби", ru: "Спортивный клуб", en: "Sport club" }),
      },
      {
        id: "sec_biz_education",
        slug: "education-center",
        icon: "🏫",
        sortOrder: 7,
        names: names({ "uz-Latn": "O'quv markazi", "uz-Cyrl": "Ўқув маркази", ru: "Учебный центр", en: "Education center" }),
      },
      {
        id: "sec_biz_higher_edu",
        slug: "higher-education",
        icon: "🎓",
        sortOrder: 8,
        names: names({ "uz-Latn": "Oliy ta'lim va kurslar", "uz-Cyrl": "Олий таълим ва курслар", ru: "Высшее образование и курсы", en: "Higher education and courses" }),
      },
      {
        id: "sec_biz_hospitality",
        slug: "hospitality",
        icon: "🏨",
        sortOrder: 9,
        names: names({ "uz-Latn": "Mehmonxona va ijara", "uz-Cyrl": "Меҳмонхона ва ижара", ru: "Гостиница и аренда", en: "Hospitality and rentals" }),
      },
      {
        id: "sec_biz_logistics",
        slug: "logistics",
        icon: "🚚",
        sortOrder: 10,
        names: names({ "uz-Latn": "Logistika va yetkazib berish", "uz-Cyrl": "Логистика ва етказиб бериш", ru: "Логистика и доставка", en: "Logistics and delivery" }),
      },
    ],
  },
  {
    id: "ind_teachers",
    slug: "teachers-coaches",
    icon: "📚",
    sortOrder: 4,
    names: names({
      "uz-Latn": "O'qituvchilar va murabbiylar",
      "uz-Cyrl": "Ўқитувчилар ва мураббийлар",
      ru: "Учителя и тренеры",
      en: "Teachers and coaches",
    }),
    sections: [
      {
        id: "sec_teach_school",
        slug: "school-teachers",
        icon: "🏫",
        sortOrder: 1,
        names: names({ "uz-Latn": "Maktab o'qituvchilari", "uz-Cyrl": "Мактаб ўқитувчилари", ru: "Школьные учителя", en: "School teachers" }),
      },
      {
        id: "sec_teach_online",
        slug: "online-coaching",
        icon: "💻",
        sortOrder: 2,
        names: names({ "uz-Latn": "Onlayn o'qitish", "uz-Cyrl": "Онлайн ўқитиш", ru: "Онлайн обучение", en: "Online teaching" }),
      },
      {
        id: "sec_teach_sports",
        slug: "sports-coaching",
        icon: "⚽",
        sortOrder: 3,
        names: names({ "uz-Latn": "Sport murabbiyligi", "uz-Cyrl": "Спорт мураббийлиги", ru: "Спортивный коучинг", en: "Sports coaching" }),
      },
      {
        id: "sec_teach_skills",
        slug: "skills-training",
        icon: "🎯",
        sortOrder: 4,
        names: names({ "uz-Latn": "Ko'nikma o'rgatish", "uz-Cyrl": "Кўникма ўргатиш", ru: "Обучение навыкам", en: "Skills training" }),
      },
    ],
  },
  {
    id: "ind_medical",
    slug: "doctors-medicine",
    icon: "🏥",
    sortOrder: 5,
    names: names({
      "uz-Latn": "Shifokorlar va tibbiyot",
      "uz-Cyrl": "Шифокорлар ва тиббиёт",
      ru: "Врачи и медицина",
      en: "Doctors and medicine",
    }),
    sections: [
      {
        id: "sec_med_general",
        slug: "general-medicine",
        icon: "🩺",
        sortOrder: 1,
        names: names({ "uz-Latn": "Umumiy tibbiyot", "uz-Cyrl": "Умумий тиббиёт", ru: "Общая медицина", en: "General medicine" }),
      },
      {
        id: "sec_med_clinic_mgmt",
        slug: "clinic-management",
        icon: "🏥",
        sortOrder: 2,
        names: names({ "uz-Latn": "Klinika boshqaruvi", "uz-Cyrl": "Клиника бошқаруви", ru: "Управление клиникой", en: "Clinic management" }),
      },
      {
        id: "sec_med_pharmacy",
        slug: "pharmacy",
        icon: "💊",
        sortOrder: 3,
        names: names({ "uz-Latn": "Dorixona biznesi", "uz-Cyrl": "Дорихона бизнеси", ru: "Аптечный бизнес", en: "Pharmacy business" }),
      },
      {
        id: "sec_med_wellness",
        slug: "wellness",
        icon: "🧘",
        sortOrder: 4,
        names: names({ "uz-Latn": "Sog'liq va wellness", "uz-Cyrl": "Соғлиқ ва wellness", ru: "Здоровье и wellness", en: "Health and wellness" }),
      },
    ],
  },
  {
    id: "ind_marketing",
    slug: "marketing-smm",
    icon: "📣",
    sortOrder: 6,
    names: names({
      "uz-Latn": "Marketing va SMM",
      "uz-Cyrl": "Маркетинг ва SMM",
      ru: "Маркетинг и SMM",
      en: "Marketing and SMM",
    }),
    sections: [
      {
        id: "sec_mkt_digital",
        slug: "digital-marketing",
        icon: "📱",
        sortOrder: 1,
        names: names({ "uz-Latn": "Raqamli marketing", "uz-Cyrl": "Рақамли маркетинг", ru: "Цифровой маркетинг", en: "Digital marketing" }),
      },
      {
        id: "sec_mkt_smm",
        slug: "social-media",
        icon: "📸",
        sortOrder: 2,
        names: names({ "uz-Latn": "Ijtimoiy tarmoqlar", "uz-Cyrl": "Ижтимоий тармоқлар", ru: "Социальные сети", en: "Social media" }),
      },
      {
        id: "sec_mkt_seo",
        slug: "seo-content",
        icon: "🔍",
        sortOrder: 3,
        names: names({ "uz-Latn": "SEO va kontent", "uz-Cyrl": "SEO ва контент", ru: "SEO и контент", en: "SEO and content" }),
      },
      {
        id: "sec_mkt_brand",
        slug: "branding",
        icon: "🎨",
        sortOrder: 4,
        names: names({ "uz-Latn": "Brending va dizayn", "uz-Cyrl": "Брендинг ва дизайн", ru: "Брендинг и дизайн", en: "Branding and design" }),
      },
    ],
  },
  {
    id: "ind_legal",
    slug: "lawyers-legal",
    icon: "⚖️",
    sortOrder: 7,
    names: names({
      "uz-Latn": "Huquqshunoslar va advokatlar",
      "uz-Cyrl": "Ҳуқуқшунослар ва адвокатлар",
      ru: "Юристы и адвокаты",
      en: "Lawyers and legal",
    }),
    sections: [
      {
        id: "sec_law_business",
        slug: "business-law",
        icon: "📋",
        sortOrder: 1,
        names: names({ "uz-Latn": "Biznes huquqi", "uz-Cyrl": "Бизнес ҳуқуқи", ru: "Бизнес-право", en: "Business law" }),
      },
      {
        id: "sec_law_civil",
        slug: "civil-law",
        icon: "🏛️",
        sortOrder: 2,
        names: names({ "uz-Latn": "Fuqarolik huquqi", "uz-Cyrl": "Фуқаролик ҳуқуқи", ru: "Гражданское право", en: "Civil law" }),
      },
      {
        id: "sec_law_tax",
        slug: "tax-law",
        icon: "📊",
        sortOrder: 3,
        names: names({ "uz-Latn": "Soliq va buxgalteriya", "uz-Cyrl": "Солиқ ва бухгалтерия", ru: "Налоги и бухгалтерия", en: "Tax and accounting" }),
      },
      {
        id: "sec_law_notary",
        slug: "notary",
        icon: "📝",
        sortOrder: 4,
        names: names({ "uz-Latn": "Notariat xizmati", "uz-Cyrl": "Нотариат хизмати", ru: "Нотариальные услуги", en: "Notary services" }),
      },
    ],
  },
  {
    id: "ind_government",
    slug: "government-officials",
    icon: "🏛️",
    sortOrder: 8,
    names: names({
      "uz-Latn": "Davlat xizmatchilari",
      "uz-Cyrl": "Давлат хизматчилари",
      ru: "Государственные служащие",
      en: "Government officials",
    }),
    sections: [
      {
        id: "sec_gov_local",
        slug: "local-government",
        icon: "🏙️",
        sortOrder: 1,
        names: names({ "uz-Latn": "Mahalliy hokimiyat", "uz-Cyrl": "Маҳаллий ҳокимият", ru: "Местная власть", en: "Local government" }),
      },
      {
        id: "sec_gov_digital",
        slug: "digital-gov",
        icon: "💻",
        sortOrder: 2,
        names: names({ "uz-Latn": "Raqamli xizmatlar", "uz-Cyrl": "Рақамли хизматлар", ru: "Цифровые услуги", en: "Digital services" }),
      },
      {
        id: "sec_gov_management",
        slug: "public-management",
        icon: "📋",
        sortOrder: 3,
        names: names({ "uz-Latn": "Davlat boshqaruvi", "uz-Cyrl": "Давлат бошқаруви", ru: "Государственное управление", en: "Public management" }),
      },
    ],
  },
  {
    id: "ind_journalism",
    slug: "journalists-creators",
    icon: "✍️",
    sortOrder: 9,
    names: names({
      "uz-Latn": "Jurnalistlar va ijodkorlar",
      "uz-Cyrl": "Журналистлар ва ижодкорлар",
      ru: "Журналисты и креаторы",
      en: "Journalists and creators",
    }),
    sections: [
      {
        id: "sec_media_news",
        slug: "news-media",
        icon: "📰",
        sortOrder: 1,
        names: names({ "uz-Latn": "Yangiliklar va media", "uz-Cyrl": "Янгиликлар ва медиа", ru: "Новости и медиа", en: "News and media" }),
      },
      {
        id: "sec_media_video",
        slug: "video-production",
        icon: "🎥",
        sortOrder: 2,
        names: names({ "uz-Latn": "Video kontent", "uz-Cyrl": "Видео контент", ru: "Видео контент", en: "Video content" }),
      },
      {
        id: "sec_media_blog",
        slug: "blogging",
        icon: "✍️",
        sortOrder: 3,
        names: names({ "uz-Latn": "Blog va maqolalar", "uz-Cyrl": "Блог ва мақолалар", ru: "Блог и статьи", en: "Blogging and articles" }),
      },
      {
        id: "sec_media_pr",
        slug: "public-relations",
        icon: "📢",
        sortOrder: 4,
        names: names({ "uz-Latn": "PR va kommunikatsiya", "uz-Cyrl": "PR ва коммуникация", ru: "PR и коммуникации", en: "PR and communications" }),
      },
    ],
  },
  {
    id: "ind_it",
    slug: "it-digital",
    icon: "💻",
    sortOrder: 10,
    names: names({
      "uz-Latn": "IT va raqamli kasblar",
      "uz-Cyrl": "IT ва рақамли касблар",
      ru: "IT и цифровые профессии",
      en: "IT and digital careers",
    }),
    sections: [
      {
        id: "sec_it_web",
        slug: "web-development",
        icon: "🌐",
        sortOrder: 1,
        names: names({ "uz-Latn": "Veb dasturlash", "uz-Cyrl": "Веб дастурлаш", ru: "Веб-разработка", en: "Web development" }),
      },
      {
        id: "sec_it_mobile",
        slug: "mobile-development",
        icon: "📱",
        sortOrder: 2,
        names: names({ "uz-Latn": "Mobil dasturlash", "uz-Cyrl": "Мобил дастурлаш", ru: "Мобильная разработка", en: "Mobile development" }),
      },
      {
        id: "sec_it_design",
        slug: "ui-ux-design",
        icon: "🎨",
        sortOrder: 3,
        names: names({ "uz-Latn": "UI/UX dizayn", "uz-Cyrl": "UI/UX дизайн", ru: "UI/UX дизайн", en: "UI/UX design" }),
      },
      {
        id: "sec_it_freelance",
        slug: "it-freelance",
        icon: "💼",
        sortOrder: 4,
        names: names({ "uz-Latn": "IT frilanserlik", "uz-Cyrl": "IT фрилансерлик", ru: "IT-фриланс", en: "IT freelancing" }),
      },
    ],
  },
];

export async function seedCatalog(prisma: PrismaService): Promise<void> {
  for (const industry of CATALOG_INDUSTRIES) {
    await prisma.industry.upsert({
      where: { id: industry.id },
      update: {
        slug: industry.slug,
        names: industry.names,
        icon: industry.icon,
        isOpen: DEFAULT_INDUSTRY_OPEN,
        sortOrder: industry.sortOrder,
      },
      create: {
        id: industry.id,
        slug: industry.slug,
        names: industry.names,
        icon: industry.icon,
        isOpen: DEFAULT_INDUSTRY_OPEN,
        sortOrder: industry.sortOrder,
      },
    });

    for (const section of industry.sections) {
      await prisma.section.upsert({
        where: { id: section.id },
        update: {
          industryId: industry.id,
          slug: section.slug,
          names: section.names,
          icon: section.icon,
          sortOrder: section.sortOrder,
        },
        create: {
          id: section.id,
          industryId: industry.id,
          slug: section.slug,
          names: section.names,
          icon: section.icon,
          sortOrder: section.sortOrder,
        },
      });
    }
  }
}
