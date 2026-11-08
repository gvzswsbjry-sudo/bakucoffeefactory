'use strict';

const fs = require('fs');
const path = require('path');

const builderContent = fs.readFileSync(path.join(__dirname, 'build-i18n-dictionary.js'), 'utf8');
const vm = require('vm');
const ctx = { require, console, __dirname };
vm.createContext(ctx);
vm.runInContext(builderContent + '\nthis.PHRASE_MAP = PHRASE_MAP;', ctx);
const PHRASE_MAP = ctx.PHRASE_MAP;

const { RU_MAP } = require('./add-russian-translations.js');

const EXTRA_PHRASES = {
  'Qiymət təsdiqlənəcək': {
    en: 'Price to be confirmed',
    ar: 'السعر قيد التأكيد',
    ru: 'Цена уточняется'
  },
  'Sifariş sorğusuna əlavə et': {
    en: 'Add to order request',
    ar: 'إضافة إلى طلب الشراء',
    ru: 'Добавить в заявку'
  },
  'Çay kolleksiyası': {
    en: 'Tea collection',
    ar: 'مجموعة الشاي',
    ru: 'Чайная коллекция'
  },
  'Yumşaq şirinliyi, canlı meyvə xarakteri və kakaolu bitişi ilə balanslı gündəlik qəhvə.': {
    en: 'Balanced everyday coffee with soft sweetness, lively fruit character, and a cocoa finish.',
    ar: 'قهوة يومية متوازنة مع حلاوة ناعمة وطابع فاكهي حيوي ونهاية بنكهة الكاكاو.',
    ru: 'Сбалансированный кофе на каждый день с мягкой сладостью, ярким фруктовым характером и нотками какао.'
  },
  'Dərin, klassik və şokoladlı gövdəsi olan çox yönlü qəhvə.': {
    en: 'Versatile coffee with a deep, classic, and chocolatey body.',
    ar: 'قهوة متعددة الاستخدامات بقوام عميق وكلاسيكي ونكهة شوكولاتة غنية.',
    ru: 'Универсальный кофе с глубоким, классическим и выразительным шоколадным телом.'
  },
  'Aşağı turşuluqlu, kremli və şokoladlı espresso profili.': {
    en: 'Low-acidity, creamy, and chocolatey espresso profile.',
    ar: 'ملف إسبريسو منخفض الحموضة، كريمي وغني بالشوكولاتة.',
    ru: 'Кремовый шоколадный эспрессо-профиль с низкой кислотностью.'
  },
  'Meyvə təravəti və kakaolu rahatlığı birləşdirən canlı profil.': {
    en: 'Lively profile uniting fresh fruitiness with cocoa comfort.',
    ar: 'ملف حيوي يجمع بين انتعاش الفواكه ودفء الكاكاو المريح.',
    ru: 'Яркий профиль, сочетающий свежесть фруктов с теплом и уютом какао.'
  },
  'Güclü, intensiv və dolğun içim üçün seçilən qəhvə.': {
    en: 'Selected coffee for a strong, intense, and full-bodied cup.',
    ar: 'قهوة مختارة لمن يبحث عن مذاق قوي ومكثف وقوام غني.',
    ru: 'Отборный кофе для крепкого, насыщенного и полнотелого вкуса.'
  },
  'Parlaq turşuluq və balabənzər şirinliyi olan təmiz fincan.': {
    en: 'Clean cup with bright acidity and honey-like sweetness.',
    ar: 'فنجان نقي بحموضة ساطعة وحلاوة تشبه العسل.',
    ru: 'Чистая чашка с яркой кислотностью и медовой сладостью.'
  },
  'Ətirli, zərif və parlaq xarakterli, çayabənzər yüngül fincan.': {
    en: 'Aromatic, delicate, and bright cup with a tea-like light body.',
    ar: 'فنجان عطري رقيق بنفحات زاهية وقوام خفيف يشبه الشاي.',
    ru: 'Ароматная, утонченная и яркая чашка с легким чайным характером.'
  },
  'Şirəli meyvə xarakteri və parlaq turşuluğu ilə ifadəli qəhvə.': {
    en: 'Expressive coffee with juicy fruit character and vibrant acidity.',
    ar: 'قهوة معبرة تتميز بطابع فاكهي غني وحموضة ساطعة.',
    ru: 'Выразительный кофе с сочным фруктовым характером и яркой кислотностью.'
  },
  'Kofeinsiz, yumşaq və dolğun qəhvə seçimi.': {
    en: 'Decaffeinated, smooth, and full-flavored coffee choice.',
    ar: 'خيار منزوع الكافيين، ناعم وكامل النكهة.',
    ru: 'Декофеинизированный кофе — мягкий, насыщенный и сбалансированный.'
  },
  'Dolğun bədənli, aşağı–orta turşuluqlu və uzun kakaolu fincan.': {
    en: 'Full-bodied cup with low-to-medium acidity and a long cocoa finish.',
    ar: 'فنجان ممتلئ القوام بحموضة منخفضة إلى متوسطة ونهاية كاكاو طويلة.',
    ru: 'Полнотелая чашка с низкой или средней кислотностью и долгим послевкусием какао.'
  },
  'Kiçik qeyd': {
    en: 'Quick note',
    ar: 'ملاحظة سريعة',
    ru: 'Примечание'
  },
  'Yaşıl çay üçün qaynar suyu bir qədər soyudun. Qara və meyvəli qarışıqlarda isə daha yüksək temperatur aromanı və gövdəni tam açır.': {
    en: 'Let boiling water cool slightly for green tea. For black and fruit blends, higher temperatures bring out full aroma and body.',
    ar: 'اترك الماء المغلي يبرد قليلاً للشاي الأخضر. أما للشاي الأسود وخلطات الفواكه، فالحرارة الأعلى تُبرز النكهة والقوام بالكامل.',
    ru: 'Для зеленого чая дайте кипятку немного остыть. Для черного и фруктовых сборов более высокая температура полностью раскрывает аромат и тело.'
  },
  'Tamper': {
    en: 'Tamper',
    ar: 'مكبس القهوة (تامبر)',
    ru: 'Темпер'
  },
  'Fincan': {
    en: 'Coffee Cup',
    ar: 'فنجان قهوة',
    ru: 'Чашка'
  },
  'Fincan(handmade)': {
    en: 'Cup (handmade)',
    ar: 'فنجان (صناعة يدوية)',
    ru: 'Чашка ручной работы'
  },
  'Milli Fincan (qaşıqlı)': {
    en: 'National Cup (with spoon)',
    ar: 'فنجان تراثي (مع ملعقة)',
    ru: 'Национальная чашка с ложкой'
  },
  'Zərif qəhvə fincanı.': {
    en: 'Elegant coffee cup.',
    ar: 'فنجان قهوة أنيق.',
    ru: 'Изящная кофейная чашка.'
  },
  'Xüsusi naxışlı milli qəhvə fincanı və qaşıq dəsti.': {
    en: 'Specially patterned traditional coffee cup and spoon set.',
    ar: 'طقم فنجان قهوة تراثي بنقوش مميزة مع ملعقة.',
    ru: 'Кофейная чашка в национальном стиле с узором и ложкой.'
  },
  'Ana menyu': {
    en: 'Main Menu',
    ar: 'القائمة الرئيسية',
    ru: 'Главное меню'
  },
  'Summer menu': {
    en: 'Summer Menu',
    ar: 'قائمة الصيف',
    ru: 'Летнее меню'
  },
  'Desert': {
    en: 'Dessert',
    ar: 'الحلويات',
    ru: 'Десерты'
  },
  'Ana menyu 01': {
    en: 'Main Menu 01',
    ar: 'القائمة الرئيسية 01',
    ru: 'Главное меню 01'
  },
  'Summer menu 02': {
    en: 'Summer Menu 02',
    ar: 'قائمة الصيف 02',
    ru: 'Летнее меню 02'
  },
  'Desert 03': {
    en: 'Dessert 03',
    ar: 'الحلويات 03',
    ru: 'Десерты 03'
  },
  'Fresh Lemonades': {
    en: 'Fresh Lemonades',
    ar: 'ليموناضة طازجة',
    ru: 'Свежие лимонады'
  },
  'Bir fincan seçin.': {
    en: 'Choose a cup.',
    ar: 'اختر فنجانك.',
    ru: 'Выберите чашку.'
  },
  'Şirin bir fasilə.': {
    en: 'A sweet break.',
    ar: 'استراحة حلوة.',
    ru: 'Сладкая пауза.'
  },
  '01 · Ana menyu': {
    en: '01 · Main Menu',
    ar: '01 · القائمة الرئيسية',
    ru: '01 · Главное меню'
  },
  '02 · Mövsümi kolleksiya': {
    en: '02 · Seasonal Collection',
    ar: '02 · تشكيلة موسمية',
    ru: '02 · Сезонная коллекция'
  },
  '03 · Desert menyusu': {
    en: '03 · Dessert Menu',
    ar: '03 · قائمة الحلويات',
    ru: '03 · Десертное меню'
  },
  '01—04': {
    en: '01—04',
    ar: '01—04',
    ru: '01—04'
  },
  '05—08': {
    en: '05—08',
    ar: '05—08',
    ru: '05—08'
  },
  'Desertlər': {
    en: 'Desserts',
    ar: 'الحلويات',
    ru: 'Десерты'
  },
  'Menyu': {
    en: 'Menu',
    ar: 'القائمة',
    ru: 'Меню'
  }
};

for (const [k, v] of Object.entries(EXTRA_PHRASES)) {
  PHRASE_MAP[k] = Object.assign({}, PHRASE_MAP[k] || {}, v);
}

for (const [k, v] of Object.entries(RU_MAP)) {
  if (!PHRASE_MAP[k]) PHRASE_MAP[k] = {};
  PHRASE_MAP[k].ru = v;
}

const fullI18nJs = `(() => {
  'use strict';

  if (window.__BCF_I18N_INITIALIZED__) return;
  window.__BCF_I18N_INITIALIZED__ = true;

  const STORAGE_KEY = 'bcf_language';
  const DEFAULT_LANG = 'az';

  const LANGUAGES = {
    az: { code: 'az', name: 'Azərbaycan', flag: '🇦🇿', dir: 'ltr' },
    en: { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
    ru: { code: 'ru', name: 'Русский', flag: '🇷🇺', dir: 'ltr' },
    ar: { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  };

  const DICTIONARY = {
    az: {
      // Nav
      navHome: 'Ana səhifə',
      navCoffee: 'Qəhvələr',
      navTea: 'Çaylar',
      navEquipment: 'Avadanlıqlar',
      navMenu: 'Menyu',
      navContact: 'Bizimlə əlaqə',
      navAbout: 'Haqqımızda',
      navAccount: 'Hesab',
      navFavorites: 'Seçilmişlər',
      navCart: 'Səbət',

      // Brand & General
      brandTitle: 'Baku Coffee Factory',
      brandSubtitle: 'Yeni',
      footerCopyright: '© 2026 · Bakı, Azərbaycan',

      // Actions
      addToCart: 'Səbətə əlavə et',
      added: 'Əlavə edildi',
      soldOut: 'Bitib',
      available: 'Mövcuddur',
      orderNow: 'Sifariş et',
      close: 'Bağla',
      total: 'Cəmi',
      price: 'Qiymət',
      quantity: 'Miqdar',
      gram: 'Qram',
      piece: 'ədəd',
      selection: 'seçim',
      variant: 'Variant',
      all: 'Hamısı',
      moreDetails: 'Daha çox',
      lessDetails: 'Daha az',
      pricePending: 'Qiymət təsdiqlənəcək',
      addToOrderRequest: 'Sifariş sorğusuna əlavə et',
      quickNote: 'Kiçik qeyd',

      // Coffee
      coffeeHeroEyebrow: 'Mənşə qəhvələri · 100 q',
      coffeeHeroTitle: 'Fincanınızdakı<br /><em>mənşəni tanıyın.</em>',
      coffeeHeroDesc: 'Hər qəhvə üçün turşuluq, bədən və balans 1–5 aralığında göstərilib. Dad notları qəhvənin ölkə-mənşə xarakterini və uyğun orta qovrum istiqamətini ifadə edir.',
      coffeeHeroNoteTitle: 'Vacib qeyd',
      coffeeHeroNoteDesc: 'Qəhvənin dəqiq dadı lot, emal üsulu, qovrum və dəmləmə ilə dəyişir. Konkret təsərrüfat məlumatı olduqda bu profilləri daha da dəqiqləşdirə bilərik.',
      acidity: 'Turşuluq',
      body: 'Bədən',
      balance: 'Balans',
      tastingNotes: 'Dad notları',
      brewingMethod: 'Uyğun dəmləmə',
      roast: 'Qovrum',
      coffeeQtyKicker: 'Miqdar seçimi',
      max2kg: 'Maksimum 2 kq',

      // Tea
      teaHeroEyebrow: 'BCF · Seçilmiş çaylar',
      teaHeroTitle: 'Zərif yarpaqlardan<br /><em>isti dəmləmə.</em>',
      teaCollectionTitle: 'BCF Çay Kolleksiyası',
      teaCollectionDesc: 'Dünyanın ən yaxşı bağlarından toplanmış təbii və ətirli çaylar.',
      teaFactsBrew: 'Dəmləmə',

      // Equipment
      equipmentHeroEyebrow: 'Baku Coffee Factory · Avadanlıqlar',
      equipmentHeroTitle: 'Dəmləmək üçün<br /><em>seçilmiş alətlər.</em>',
      equipmentHeroNoteCount: '13 məhsul · 24 seçim',
      equipmentHeroNoteDesc: 'Evdə və peşəkar istifadə üçün dəmləyicilər, dəyirmanlar və servis aksesuarları.',
      equipmentCatalog: 'Kataloq',
      allProducts: 'Bütün məhsullar',
      catBrewing: 'Dəmləmə',
      catGrinder: 'Dəyirman',
      catKettle: 'Çaydan',
      catService: 'Servis',
      catAccessory: 'Aksesuar',
      backToEquipment: '← Bütün avadanlıqlar',
      productNotFound: 'Məhsul tapılmadı',
      productNotFoundDesc: 'Bu məhsul mövcud deyil.',
      returnToCatalog: 'Kataloqa qayıt',
      tempPriceNote: 'Müvəqqəti qiymət',

      // Menu
      menuTopEyebrow: 'Baku Coffee Factory',
      menuHeadingDrink: 'Bir fincan<br /><em>seçin.</em>',
      menuHeadingDessert: 'Şirin bir<br /><em>fasilə.</em>',
      tabMainMenu: 'Ana menyu',
      tabSummerMenu: 'Summer menu',
      tabDessertMenu: 'Desert',

      // Cart
      cartYourChoice: 'Sizin seçiminiz',
      cartTitle: 'Səbət',
      cartEmpty: 'Səbətiniz hələ boşdur.',
      cartUnifiedNote: 'Qəhvə, çay və avadanlıqlar vahid səbətdə hesablanır.',
      cartAddedToast: 'Səbətə uğurla əlavə edildi',

      // Checkout
      checkoutEyebrow: 'SİFARİŞ SORĞUSU',
      checkoutTitle: 'Sifarişi tamamlayın.',
      sellerNote: 'Satıcıya qeyd',
      optional: '(istəyə bağlı)',
      notePlaceholder: 'Sifarişlə bağlı əlavə istəyiniz varsa yazın',
      confirmCheckoutBtn: 'Sifarişi təsdiqlə və WhatsApp-a göndər',
      checkoutDestinationNote: '✓ Sifariş admin panelə, Telegram-a və WhatsApp-a (+994 55 645 22 04) göndərilir',
      orderReceivedEyebrow: 'SİFARİŞ QEYDƏ ALINDI',
      orderReceivedTitle: 'Sifariş sorğunuz qəbul edildi.',
      orderWhatsAppHint: 'Sifarişiniz sistemə qeyd olundu! Sürətli təsdiq üçün birbaşa WhatsApp-a göndərin:',
      sendWhatsAppBtn: 'WhatsApp ilə göndər',
      teamContactSubnote: 'Komandamız həmçinin göstərdiyiniz telefon nömrəsi ilə əlaqə saxlayacaq.',
      continueShopping: 'Alış-verişə davam et',

      // Account
      accountHeading: 'Hesabınız',
      accountDetailsTab: 'Hesab məlumatları',
      accountOrdersTab: 'Keçmiş sifarişlər',
      tabLogin: 'Giriş',
      tabRegister: 'Qeydiyyat',
      identifierLabel: 'İstifadəçi adı və ya telefon nömrəsi',
      identifierPlaceholder: 'İstifadəçi adı, telefon və ya e-poçt',
      fullNameLabel: 'Ad və Soyad',
      fullNamePlaceholder: 'Ad və soyadınız',
      usernameLabel: 'İstifadəçi adı',
      usernameHint: '(unikal olmalıdır)',
      usernamePlaceholder: 'İstifadəçi adınız (məs: farman08)',
      phoneLabel: 'Mobil nömrə',
      passwordLabel: 'Şifrə',
      passwordPlaceholder: 'Ən azı 12 simvol',
      loginSubmit: 'Daxil ol',
      registerSubmit: 'Hesab yarat',
      continueWithGoogle: 'Google ilə davam et',
      logoutBtn: 'Hesabdan çıx',
      socialOr: 'və ya',
      noOrdersYet: 'Hələ sifariş yoxdur.',
      noOrdersDesc: 'Hesabınıza daxil olaraq verdiyiniz sifarişlər burada görünəcək.',

      // Favorites
      favoritesTitle: 'Seçilmişlər',
      favoritesEmpty: 'Hələ heç bir məhsul seçilməyib.',
      clearFavorites: 'Siyahını təmizlə',

      // Home
      homeEyebrow: 'Bakı · qəhvə · söhbət',
      homeHeroTitle: 'Baku Coffee Factory<br /><em>qəhvə dünyası.</em>',
      homeHeroLink: 'Bizi tanıyın <span>↓</span>',
      homeHeroMeta: 'Yeni Baku Coffee Factory',
      homeAboutEyebrow: 'Haqqımızda · Əlaqə',
      homeAboutTitle: 'Qəhvə üçün<br /><em>yaxşı bir səbəb.</em>',
      contactPhone: 'Telefon',
      contactAddress: 'Ünvan',
      openInMaps: 'Google Maps-də aç',
      contactDelivery: 'Çatdırılma',
      orderWithWolt: 'Wolt ilə sifariş et',
    },

    en: {
      // Nav
      navHome: 'Home',
      navCoffee: 'Coffee',
      navTea: 'Tea',
      navEquipment: 'Equipment',
      navMenu: 'Menu',
      navContact: 'Contact Us',
      navAbout: 'About Us',
      navAccount: 'Account',
      navFavorites: 'Favorites',
      navCart: 'Cart',

      // Brand & General
      brandTitle: 'Baku Coffee Factory',
      brandSubtitle: 'New',
      footerCopyright: '© 2026 · Baku, Azerbaijan',

      // Actions
      addToCart: 'Add to Cart',
      added: 'Added',
      soldOut: 'Sold Out',
      available: 'Available',
      orderNow: 'Order Now',
      close: 'Close',
      total: 'Total',
      price: 'Price',
      quantity: 'Quantity',
      gram: 'Gram',
      piece: 'pcs',
      selection: 'options',
      variant: 'Variant',
      all: 'All',
      moreDetails: 'More details',
      lessDetails: 'Less details',
      pricePending: 'Price to be confirmed',
      addToOrderRequest: 'Add to order request',
      quickNote: 'Quick note',

      // Coffee
      coffeeHeroEyebrow: 'Single Origin Coffee · 100g',
      coffeeHeroTitle: 'Discover the origin<br /><em>in your cup.</em>',
      coffeeHeroDesc: 'Acidity, body, and balance are rated 1–5 for each coffee. Tasting notes reflect regional origin and optimal medium roast profile.',
      coffeeHeroNoteTitle: 'Important Note',
      coffeeHeroNoteDesc: 'Exact taste varies by crop lot, processing method, roast level, and brewing. As specific lot details become available, profiles are refined.',
      acidity: 'Acidity',
      body: 'Body',
      balance: 'Balance',
      tastingNotes: 'Tasting Notes',
      brewingMethod: 'Brewing Method',
      roast: 'Roast Level',
      coffeeQtyKicker: 'Select Quantity',
      max2kg: 'Maximum 2 kg',

      // Tea
      teaHeroEyebrow: 'BCF · Selected Teas',
      teaHeroTitle: 'Warm brewing from<br /><em>delicate leaves.</em>',
      teaCollectionTitle: 'BCF Tea Collection',
      teaCollectionDesc: 'Natural and fragrant teas harvested from the world’s finest gardens.',
      teaFactsBrew: 'Brewing',

      // Equipment
      equipmentHeroEyebrow: 'Baku Coffee Factory · Equipment',
      equipmentHeroTitle: 'Curated tools<br /><em>for brewing.</em>',
      equipmentHeroNoteCount: '13 products · 24 options',
      equipmentHeroNoteDesc: 'Brewers, grinders, and service accessories for home and professional use.',
      equipmentCatalog: 'Catalog',
      allProducts: 'All Products',
      catBrewing: 'Brewing',
      catGrinder: 'Grinder',
      catKettle: 'Kettle',
      catService: 'Service',
      catAccessory: 'Accessory',
      backToEquipment: '← All Equipment',
      productNotFound: 'Product Not Found',
      productNotFoundDesc: 'This product is currently not available.',
      returnToCatalog: 'Return to Catalog',
      tempPriceNote: 'Estimated price',

      // Menu
      menuTopEyebrow: 'Baku Coffee Factory',
      menuHeadingDrink: 'Choose<br /><em>a cup.</em>',
      menuHeadingDessert: 'A sweet<br /><em>break.</em>',
      tabMainMenu: 'Main Menu',
      tabSummerMenu: 'Summer Menu',
      tabDessertMenu: 'Desserts',

      // Cart
      cartYourChoice: 'Your Selection',
      cartTitle: 'Cart',
      cartEmpty: 'Your cart is currently empty.',
      cartUnifiedNote: 'Coffee, tea, and equipment are calculated in a unified cart.',
      cartAddedToast: 'Successfully added to cart',

      // Checkout
      checkoutEyebrow: 'ORDER REQUEST',
      checkoutTitle: 'Complete your order.',
      sellerNote: 'Note to seller',
      optional: '(optional)',
      notePlaceholder: 'Write any special instructions for your order',
      confirmCheckoutBtn: 'Confirm Order & Send via WhatsApp',
      checkoutDestinationNote: '✓ Order is sent to Admin panel, Telegram, and WhatsApp (+994 55 645 22 04)',
      orderReceivedEyebrow: 'ORDER RECEIVED',
      orderReceivedTitle: 'Your order request has been accepted.',
      orderWhatsAppHint: 'Your order is recorded! Send directly to WhatsApp for rapid confirmation:',
      sendWhatsAppBtn: 'Send via WhatsApp',
      teamContactSubnote: 'Our team will also reach out to your provided phone number.',
      continueShopping: 'Continue Shopping',

      // Account
      accountHeading: 'Your Account',
      accountDetailsTab: 'Account Details',
      accountOrdersTab: 'Order History',
      tabLogin: 'Sign In',
      tabRegister: 'Register',
      identifierLabel: 'Username or phone number',
      identifierPlaceholder: 'Username, phone, or email',
      fullNameLabel: 'Full Name',
      fullNamePlaceholder: 'Your full name',
      usernameLabel: 'Username',
      usernameHint: '(must be unique)',
      usernamePlaceholder: 'Your username (e.g. farman08)',
      phoneLabel: 'Mobile Number',
      passwordLabel: 'Password',
      passwordPlaceholder: 'At least 12 characters',
      loginSubmit: 'Sign In',
      registerSubmit: 'Create Account',
      continueWithGoogle: 'Continue with Google',
      logoutBtn: 'Sign Out',
      socialOr: 'or',
      noOrdersYet: 'No orders yet.',
      noOrdersDesc: 'Orders placed while logged into your account will appear here.',

      // Favorites
      favoritesTitle: 'Favorites',
      favoritesEmpty: 'No items saved to favorites yet.',
      clearFavorites: 'Clear list',

      // Home
      homeEyebrow: 'Baku · Coffee · Conversation',
      homeHeroTitle: 'Baku Coffee Factory<br /><em>world of coffee.</em>',
      homeHeroLink: 'Discover us <span>↓</span>',
      homeHeroMeta: 'New Baku Coffee Factory',
      homeAboutEyebrow: 'About Us · Contact',
      homeAboutTitle: 'A good reason<br /><em>for coffee.</em>',
      contactPhone: 'Phone',
      contactAddress: 'Address',
      openInMaps: 'Open in Google Maps',
      contactDelivery: 'Delivery',
      orderWithWolt: 'Order with Wolt',
    },

    ru: {
      // Nav
      navHome: 'Главная',
      navCoffee: 'Кофе',
      navTea: 'Чай',
      navEquipment: 'Оборудование',
      navMenu: 'Меню',
      navContact: 'Контакты',
      navAbout: 'О нас',
      navAccount: 'Аккаунт',
      navFavorites: 'Избранное',
      navCart: 'Корзина',

      // Brand & General
      brandTitle: 'Baku Coffee Factory',
      brandSubtitle: 'Новый',
      footerCopyright: '© 2026 · Баку, Азербайджан',

      // Actions
      addToCart: 'В корзину',
      added: 'Добавлено',
      soldOut: 'Распродано',
      available: 'В наличии',
      orderNow: 'Заказать',
      close: 'Закрыть',
      total: 'Итого',
      price: 'Цена',
      quantity: 'Количество',
      gram: 'Грамм',
      piece: 'шт.',
      selection: 'варианты',
      variant: 'Вариант',
      all: 'Все',
      moreDetails: 'Подробнее',
      lessDetails: 'Скрыть',
      pricePending: 'Цена уточняется',
      addToOrderRequest: 'Добавить в заявку',
      quickNote: 'Примечание',

      // Coffee
      coffeeHeroEyebrow: 'Моносорта кофе · 100 г',
      coffeeHeroTitle: 'Почувствуйте происхождение<br /><em>в каждой чашке.</em>',
      coffeeHeroDesc: 'Кислотность, тело и баланс оценены от 1 до 5 для каждого сорта. Ноты вкуса отражают происхождение и оптимальную среднюю обжарку.',
      coffeeHeroNoteTitle: 'Важное примечание',
      coffeeHeroNoteDesc: 'Точный вкус меняется в зависимости от лота, обработки, обжарки и способа заваривания. По мере поступления данных с ферм профили уточняются.',
      acidity: 'Кислотность',
      body: 'Тело',
      balance: 'Баланс',
      tastingNotes: 'Ноты вкуса',
      brewingMethod: 'Способ заваривания',
      roast: 'Степень обжарки',
      coffeeQtyKicker: 'Выбор количества',
      max2kg: 'Максимум 2 кг',

      // Tea
      teaHeroEyebrow: 'BCF · Отборные чаи',
      teaHeroTitle: 'Теплое заваривание из<br /><em>нежных чайных листьев.</em>',
      teaCollectionTitle: 'Коллекция чая BCF',
      teaCollectionDesc: 'Натуральный и ароматный чай, собранный с лучших плантаций мира.',
      teaFactsBrew: 'Заваривание',

      // Equipment
      equipmentHeroEyebrow: 'Baku Coffee Factory · Оборудование',
      equipmentHeroTitle: 'Инструменты,<br /><em>отобранные для заваривания.</em>',
      equipmentHeroNoteCount: '13 товаров · 24 варианта',
      equipmentHeroNoteDesc: 'Кофеварки, ручные кофемолки и аксессуары для сервировки дома и для бариста.',
      equipmentCatalog: 'Каталог',
      allProducts: 'Все товары',
      catBrewing: 'Заваривание',
      catGrinder: 'Кофемолка',
      catKettle: 'Чайник',
      catService: 'Сервировка',
      catAccessory: 'Аксессуар',
      backToEquipment: '← Все оборудование',
      productNotFound: 'Товар не найден',
      productNotFoundDesc: 'Данный товар в настоящее время недоступен.',
      returnToCatalog: 'Вернуться в каталог',
      tempPriceNote: 'Ориентировочная цена',

      // Menu
      menuTopEyebrow: 'Baku Coffee Factory',
      menuHeadingDrink: 'Выберите<br /><em>чашку.</em>',
      menuHeadingDessert: 'Сладкая<br /><em>пауза.</em>',
      tabMainMenu: 'Основное меню',
      tabSummerMenu: 'Летнее меню',
      tabDessertMenu: 'Десерты',

      // Cart
      cartYourChoice: 'Ваш выбор',
      cartTitle: 'Корзина',
      cartEmpty: 'Ваша корзина пока пуста.',
      cartUnifiedNote: 'Кофе, чай и оборудование оформляются в единой корзине.',
      cartAddedToast: 'Успешно добавлено в корзину',

      // Checkout
      checkoutEyebrow: 'ЗАПРОС НА ЗАКАЗ',
      checkoutTitle: 'Оформление заказа.',
      sellerNote: 'Примечание к заказу',
      optional: '(необязательно)',
      notePlaceholder: 'Укажите пожелания или детали к заказу, если есть',
      confirmCheckoutBtn: 'Подтвердить заказ и отправить в WhatsApp',
      checkoutDestinationNote: '✓ Заказ отправляется в панель управления, Telegram и WhatsApp (+994 55 645 22 04)',
      orderReceivedEyebrow: 'ЗАКАЗ ПРИНЯТ',
      orderReceivedTitle: 'Ваш запрос на заказ успешно принят.',
      orderWhatsAppHint: 'Ваш заказ зафиксирован! Для быстрого подтверждения отправьте в WhatsApp:',
      sendWhatsAppBtn: 'Отправить в WhatsApp',
      teamContactSubnote: 'Наша команда также свяжется с вами по указанному номеру телефона.',
      continueShopping: 'Продолжить покупки',

      // Account
      accountHeading: 'Личный кабинет',
      accountDetailsTab: 'Данные аккаунта',
      accountOrdersTab: 'История заказов',
      tabLogin: 'Вход',
      tabRegister: 'Регистрация',
      identifierLabel: 'Имя пользователя или номер телефона',
      identifierPlaceholder: 'Имя пользователя, телефон или email',
      fullNameLabel: 'Имя и фамилия',
      fullNamePlaceholder: 'Ваше имя и фамилия',
      usernameLabel: 'Имя пользователя',
      usernameHint: '(должно быть уникальным)',
      usernamePlaceholder: 'Имя пользователя (напр. farman08)',
      phoneLabel: 'Номер телефона',
      passwordLabel: 'Пароль',
      passwordPlaceholder: 'Минимум 12 символов',
      loginSubmit: 'Войти',
      registerSubmit: 'Создать аккаунт',
      continueWithGoogle: 'Продолжить с Google',
      logoutBtn: 'Выйти из аккаунта',
      socialOr: 'или',
      noOrdersYet: 'Заказов пока нет.',
      noOrdersDesc: 'Заказы, оформленные в вашем аккаунте, будут отображаться здесь.',

      // Favorites
      favoritesTitle: 'Избранное',
      favoritesEmpty: 'В избранном пока ничего нет.',
      clearFavorites: 'Очистить список',

      // Home
      homeEyebrow: 'Баку · кофе · беседы',
      homeHeroTitle: 'Baku Coffee Factory<br /><em>мир кофе.</em>',
      homeHeroLink: 'Узнать больше <span>↓</span>',
      homeHeroMeta: 'Новый Baku Coffee Factory',
      homeAboutEyebrow: 'О нас · Контакты',
      homeAboutTitle: 'Отличный повод<br /><em>выпить кофе.</em>',
      contactPhone: 'Телефон',
      contactAddress: 'Адрес',
      openInMaps: 'Открыть в Google Maps',
      contactDelivery: 'Доставка',
      orderWithWolt: 'Заказать через Wolt',
    },

    ar: {
      // Nav
      navHome: 'الرئيسية',
      navCoffee: 'القهوة',
      navTea: 'الشاي',
      navEquipment: 'المعدات',
      navMenu: 'القائمة',
      navContact: 'اتصل بنا',
      navAbout: 'من نحن',
      navAccount: 'الحساب',
      navFavorites: 'المفضلة',
      navCart: 'السلة',

      // Brand & General
      brandTitle: 'باكو كوفي فاكتوري',
      brandSubtitle: 'جديد',
      footerCopyright: '© 2026 · باكو، أذربيجان',

      // Actions
      addToCart: 'أضف إلى السلة',
      added: 'تمت الإضافة',
      soldOut: 'نفد',
      available: 'متوفر',
      orderNow: 'اطلب الآن',
      close: 'إغلاق',
      total: 'المجموع',
      price: 'السعر',
      quantity: 'الكمية',
      gram: 'جرام',
      piece: 'قطعة',
      selection: 'خيارات',
      variant: 'النوع',
      all: 'الكل',
      moreDetails: 'المزيد',
      lessDetails: 'أقل',
      pricePending: 'السعر قيد التأكيد',
      addToOrderRequest: 'إضافة إلى طلب الشراء',
      quickNote: 'ملاحظة سريعة',

      // Coffee
      coffeeHeroEyebrow: 'قهوة أحادية المنشأ · 100 جم',
      coffeeHeroTitle: 'اكتشف المنشأ<br /><em>في كل فنجان.</em>',
      coffeeHeroDesc: 'تم تقييم الحموضة والقوام والتوازن من 1 إلى 5 لكل نوع قهوة. تعكس نوتات التذوق الخصائص الإقليمية ودرجة التحميص المتوسطة المثلى.',
      coffeeHeroNoteTitle: 'ملاحظة هامة',
      coffeeHeroNoteDesc: 'تختلف النكهات الدقيقة باختلاف الدفعة وطريقة المعالجة والتحميص والتحضير. يتم تحديث الملفات عند توفر بيانات المزارع المحددة.',
      acidity: 'الحموضة',
      body: 'القوام',
      balance: 'التوازن',
      tastingNotes: 'نوتات التذوق',
      brewingMethod: 'طريقة التحضير',
      roast: 'درجة التحميص',
      coffeeQtyKicker: 'تحديد الكمية',
      max2kg: 'الحد الأقصى 2 كجم',

      // Tea
      teaHeroEyebrow: 'بي سي إف · شاي مختار',
      teaHeroTitle: 'تخمير دافئ من<br /><em>أوراق الشاي الفاخرة.</em>',
      teaCollectionTitle: 'مجموعة شاي بي سي إف',
      teaCollectionDesc: 'شاي طبيعي وعطري منتقى بعناية من أفضل مزارع الشاي حول العالم.',
      teaFactsBrew: 'طريقة التحضير',

      // Equipment
      equipmentHeroEyebrow: 'باكو كوفي فاكتوري · المعدات',
      equipmentHeroTitle: 'أدوات مختارة<br /><em>لتحضير القهوة.</em>',
      equipmentHeroNoteCount: '13 منتج · 24 خيار',
      equipmentHeroNoteDesc: 'أدوات تحضير، مطاحن، وإكسسوارات تقديم للاستخدام المنزلي والمهني.',
      equipmentCatalog: 'الكتالوج',
      allProducts: 'جميع المنتجات',
      catBrewing: 'أدوات التحضير',
      catGrinder: 'المطاحن',
      catKettle: 'الأباريق',
      catService: 'أدوات التقديم',
      catAccessory: 'إكسسوارات',
      backToEquipment: '← جميع المعدات',
      productNotFound: 'المنتج غير موجود',
      productNotFoundDesc: 'هذا المنتج غير متوفر حالياً.',
      returnToCatalog: 'العودة إلى الكتالوج',
      tempPriceNote: 'سعر تقديري',

      // Menu
      menuTopEyebrow: 'باكو كوفي فاكتوري',
      menuHeadingDrink: 'اختر<br /><em>فنجانك.</em>',
      menuHeadingDessert: 'استراحة<br /><em>حلوة.</em>',
      tabMainMenu: 'القائمة الرئيسية',
      tabSummerMenu: 'قائمة الصيف',
      tabDessertMenu: 'الحلويات',

      // Cart
      cartYourChoice: 'اختياراتك',
      cartTitle: 'السلة',
      cartEmpty: 'سلتك فارغة حالياً.',
      cartUnifiedNote: 'يتم احتساب القهوة والشاي والمعدات في سلة موحدة.',
      cartAddedToast: 'تمت الإضافة إلى السلة بنجاح',

      // Checkout
      checkoutEyebrow: 'طلب شراء',
      checkoutTitle: 'إتمام الطلب.',
      sellerNote: 'ملاحظة للبائع',
      optional: '(اختياري)',
      notePlaceholder: 'اكتب أي ملاحظة أو طلب خاص بطلبك هنا',
      confirmCheckoutBtn: 'تأكيد الطلب والإرسال عبر واتساب',
      checkoutDestinationNote: '✓ يتم إرسال الطلب إلى لوحة التحكم وتيليجرام وواتساب (+994 55 645 22 04)',
      orderReceivedEyebrow: 'تم تسجيل الطلب',
      orderReceivedTitle: 'تم استلام طلبك بنجاح.',
      orderWhatsAppHint: 'تم تسجيل طلبك! أرسله مباشرة عبر واتساب للتأكيد الفوري:',
      sendWhatsAppBtn: 'إرسال عبر واتساب',
      teamContactSubnote: 'سيتواصل فريقنا أيضاً معك عبر رقم الهاتف المسجل.',
      continueShopping: 'متابعة التسوق',

      // Account
      accountHeading: 'حسابك الشخصي',
      accountDetailsTab: 'بيانات الحساب',
      accountOrdersTab: 'الطلبات السابقة',
      tabLogin: 'تسجيل الدخول',
      tabRegister: 'إنشاء حساب',
      identifierLabel: 'اسم المستخدم أو رقم الهاتف',
      identifierPlaceholder: 'اسم المستخدم، الهاتف أو البريد',
      fullNameLabel: 'الاسم الكامل',
      fullNamePlaceholder: 'اسمك الكامل',
      usernameLabel: 'اسم المستخدم',
      usernameHint: '(يجب أن يكون فريداً)',
      usernamePlaceholder: 'اسم المستخدم (مثال: farman08)',
      phoneLabel: 'رقم الهاتف المحمول',
      passwordLabel: 'كلمة المرور',
      passwordPlaceholder: '12 حرفاً على الأقل',
      loginSubmit: 'دخول',
      registerSubmit: 'إنشاء حساب',
      continueWithGoogle: 'المتابعة باستخدام جوجل',
      logoutBtn: 'تسجيل الخروج',
      socialOr: 'أو',
      noOrdersYet: 'لا توجد طلبات سابقة بعد.',
      noOrdersDesc: 'الطلبات التي تجريها أثناء تسجيل الدخول ستظهر هنا.',

      // Favorites
      favoritesTitle: 'المفضلة',
      favoritesEmpty: 'لم تقم بحفظ أي منتج في المفضلة بعد.',
      clearFavorites: 'مسح القائمة',

      // Home
      homeEyebrow: 'باكو · قهوة · حديث',
      homeHeroTitle: 'باكو كوفي فاكتوري<br /><em>عالم القهوة.</em>',
      homeHeroLink: 'تعرف علينا <span>↓</span>',
      homeHeroMeta: 'نيو باكو كوفي فاكتوري',
      homeAboutEyebrow: 'من نحن · اتصل بنا',
      homeAboutTitle: 'سبب وجيه<br /><em>لتناول القهوة.</em>',
      contactPhone: 'الهاتف',
      contactAddress: 'العنوان',
      openInMaps: 'افتح في خرائط جوجل',
      contactDelivery: 'التوصيل',
      orderWithWolt: 'اطلب عبر فولت',
    },
  };

  // Comprehensive phrase translations covering all products, categories, descriptions, notes, and UI texts
  const PHRASE_MAP = ${JSON.stringify(PHRASE_MAP, null, 2)};

  // Reverse lookup map to recover original Azerbaijani key from any translated text
  const REVERSE_MAP = {};
  for (const [azKey, trans] of Object.entries(PHRASE_MAP)) {
    if (trans.en) REVERSE_MAP[trans.en] = azKey;
    if (trans.ru) REVERSE_MAP[trans.ru] = azKey;
    if (trans.ar) REVERSE_MAP[trans.ar] = azKey;
  }

  function isKnownTranslation(candidate, origKey) {
    if (!candidate || !origKey) return false;
    if (candidate === origKey) return true;
    const entry = PHRASE_MAP[origKey];
    if (!entry) return false;
    return candidate === entry.en || candidate === entry.ru || candidate === entry.ar;
  }

  function getSavedLanguage() {
    try {
      const fromLocal = localStorage.getItem(STORAGE_KEY);
      if (fromLocal && LANGUAGES[fromLocal]) return fromLocal;
    } catch {}
    try {
      const match = document.cookie.match(/(?:^|;\s*)bcf_language=([^;]+)/);
      if (match && LANGUAGES[match[1]]) return match[1];
    } catch {}
    return DEFAULT_LANG;
  }

  function persistLanguage(lang) {
    if (!LANGUAGES[lang]) return;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
    try {
      document.cookie = 'bcf_language=' + encodeURIComponent(lang) + '; path=/; max-age=31536000; SameSite=Lax';
    } catch {}
  }

  let currentLang = getSavedLanguage();

  function getLanguage() {
    return currentLang;
  }

  function t(key, fallback = '') {
    return DICTIONARY[currentLang]?.[key] ?? DICTIONARY[DEFAULT_LANG]?.[key] ?? fallback;
  }

  function setLanguage(lang) {
    if (!LANGUAGES[lang]) return;
    currentLang = lang;
    persistLanguage(lang);

    document.documentElement.lang = lang;
    document.documentElement.dir = LANGUAGES[lang].dir;

    // Body language classes
    document.body.classList.remove('lang-az', 'lang-en', 'lang-ru', 'lang-ar');
    document.body.classList.add(\`lang-\${lang}\`);

    updateLanguageSelector();
    translateDom();

    window.dispatchEvent(new CustomEvent('bcf:language-changed', { detail: { lang } }));
  }

  function updateLanguageSelector() {
    const codeEl = document.getElementById('langCurrentCode');
    if (codeEl) {
      codeEl.textContent = currentLang.toUpperCase();
    }
    const trigger = document.getElementById('langTrigger');
    if (trigger) {
      trigger.setAttribute('aria-label', \`Dil: \${LANGUAGES[currentLang].name}\`);
      trigger.title = LANGUAGES[currentLang].name;
    }
    document.querySelectorAll('.lang-option').forEach((btn) => {
      const active = btn.dataset.lang === currentLang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
    });
  }

  let isTranslating = false;

  function translateDom(root = document) {
    if (isTranslating) return;
    isTranslating = true;
    try {
      // 1. data-i18n elements
      root.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.dataset.i18n;
        const translation = DICTIONARY[currentLang]?.[key];
        if (translation !== undefined) {
          if (!el._bcfOrigHtml) el._bcfOrigHtml = el.innerHTML;
          if (translation.includes('<') && translation.includes('>')) {
            if (el.innerHTML !== translation) el.innerHTML = translation;
          } else {
            if (el.textContent !== translation) el.textContent = translation;
          }
        } else if (currentLang === 'az' && el._bcfOrigHtml) {
          if (el.innerHTML !== el._bcfOrigHtml) el.innerHTML = el._bcfOrigHtml;
        }
      });

      // 2. data-i18n-placeholder
      root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const key = el.dataset.i18nPlaceholder;
        const translation = DICTIONARY[currentLang]?.[key];
        if (translation !== undefined) {
          if (!el._bcfOrigPlaceholder) el._bcfOrigPlaceholder = el.placeholder;
          if (el.placeholder !== translation) el.placeholder = translation;
        } else if (currentLang === 'az' && el._bcfOrigPlaceholder) {
          if (el.placeholder !== el._bcfOrigPlaceholder) el.placeholder = el._bcfOrigPlaceholder;
        }
      });

      // 3. data-i18n-aria
      root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
        const key = el.dataset.i18nAria;
        const translation = DICTIONARY[currentLang]?.[key];
        if (translation !== undefined) {
          el.setAttribute('aria-label', translation);
        }
      });

      // 4. Auto-translate all storefront products, notes, descriptions, and UI texts
      const targets = root.querySelectorAll(\`
        .main-nav a,
        .brand strong,
        .brand span,
        .filter-chip,
        .menu-tab,
        .account-tab,
        .account-center-tab,
        .coffee-add-button,
        .tea-add-button,
        .add-to-cart,
        .detail-add,
        .product-buy .add-to-cart,
        .contact-line span,
        .contact-line strong,
        .coffee-origin,
        .coffee-title h2,
        .coffee-scores span,
        .coffee-taste > span,
        .coffee-taste p,
        .coffee-more summary,
        .tea-more summary,
        .coffee-summary,
        .coffee-details span,
        .coffee-details p,
        .coffee-page-intro p,
        .coffee-page-intro aside span,
        .coffee-page-intro aside strong,
        .tea-kicker,
        .tea-hero h1,
        .tea-hero-copy,
        .tea-hero-link,
        .tea-jump a,
        .tea-collection-header h2,
        .tea-collection-header p,
        .tea-product-copy h2,
        .tea-product-copy .tea-kind,
        .tea-summary,
        .tea-facts dt,
        .tea-facts dd,
        .tea-more-content,
        .tea-modal-close,
        .tea-price,
        .tea-note-box span,
        .tea-note-box p,
        #coffeeOrderTitle,
        #teaOrderTitle,
        #teaOrderUnit,
        #coffeeOrderUnit,
        #teaQuantityLabel,
        #teaOrderLimit,
        .tea-quantity-display span,
        .tea-order-total span,
        .tea-confirm-add,
        .equipment-hero .eyebrow,
        .equipment-hero-note span,
        .equipment-hero-note p,
        .shop-toolbar .eyebrow,
        #shopTitle,
        .shop-sort-label span,
        .shop-sort option,
        .product-category,
        .gear-category-badge,
        .shop-product h3,
        .gear-card h2,
        .product-description,
        .gear-card-desc,
        .product-back,
        #detailTitle,
        #detailCategory,
        #detailDescription,
        #variantLabel,
        .variant-picker > div:first-child span,
        .detail-price-row span,
        .detail-price-note,
        .menu-top .eyebrow,
        .menu-top h1,
        #menuPageHeading,
        .menu-page-header .eyebrow,
        .menu-page-header .menu-meta,
        .menu-panel-heading .eyebrow,
        .menu-panel-heading h2,
        .menu-panel-heading p,
        .menu-group h2,
        .menu-group p > span:first-child,
        .summer-overline,
        .summer-intro,
        .summer-collection-heading h3,
        .summer-drink h4,
        .cart-header h2,
        .cart-summary span,
        .cart-empty p,
        .cart-item-cat,
        .cart-item-copy h3,
        .cart-remove,
        .checkout-open,
        .checkout-confirm,
        .checkout-done,
        .checkout-eyebrow,
        .checkout-note,
        .account-field > span,
        .account-submit,
        .account-logout,
        .account-eyebrow,
        .favorites-drawer h2,
        .favorites-empty h3,
        .favorites-empty p,
        .favorites-clear,
        .hero-eyebrow,
        .hero-link,
        .hero-meta,
        .about-copy
      \`);

      targets.forEach((el) => {
        if (el.hasAttribute('data-i18n')) return;
        const text = (el.textContent || '').trim();
        if (!text) return;

        if (!el._bcfOrigText) {
          if (PHRASE_MAP[text]) {
            el._bcfOrigText = text;
          } else if (REVERSE_MAP[text]) {
            el._bcfOrigText = REVERSE_MAP[text];
          } else {
            el._bcfOrigText = text;
          }
        } else if (!isKnownTranslation(text, el._bcfOrigText)) {
          if (PHRASE_MAP[text]) {
            el._bcfOrigText = text;
          } else if (REVERSE_MAP[text]) {
            el._bcfOrigText = REVERSE_MAP[text];
          }
        }

        const orig = el._bcfOrigText;
        if (currentLang === 'az') {
          if (el.textContent.trim() !== orig) el.textContent = orig;
          return;
        }

        const targetText = PHRASE_MAP[orig]?.[currentLang];
        if (targetText && el.textContent.trim() !== targetText) {
          el.textContent = targetText;
        }
      });

      // Update document title if needed
      updateDocumentTitle();
    } finally {
      isTranslating = false;
    }
  }

  function updateDocumentTitle() {
    const page = window.location?.pathname ? window.location.pathname.split('/').pop() || 'index.html' : 'index.html';
    const titles = {
      'index.html': {
        en: 'New Baku Coffee Factory',
        ru: 'Главная — New Baku Coffee Factory',
        ar: 'نيو باكو كوفي فاكتوري',
      },
      'qehveler.html': {
        en: 'Coffee — New Baku Coffee Factory',
        ru: 'Кофе — New Baku Coffee Factory',
        ar: 'القهوة — نيو باكو كوفي فاكتوري',
      },
      'caylar.html': {
        en: 'Tea — New Baku Coffee Factory',
        ru: 'Чай — New Baku Coffee Factory',
        ar: 'الشاي — نيو باكو كوفي فاكتوري',
      },
      'avadanliqlar.html': {
        en: 'Equipment — New Baku Coffee Factory',
        ru: 'Оборудование — New Baku Coffee Factory',
        ar: 'المعدات — نيو باكو كوفي فاكتوري',
      },
      'mehsul.html': {
        en: 'Product — New Baku Coffee Factory',
        ru: 'Товар — New Baku Coffee Factory',
        ar: 'المنتج — نيو باكو كوفي فاكتوري',
      },
      'menyu.html': {
        en: 'Menu — New Baku Coffee Factory',
        ru: 'Меню — New Baku Coffee Factory',
        ar: 'القائمة — نيو باكو كوفي فاكتوري',
      },
      'mexfilik.html': {
        en: 'Privacy Policy — New Baku Coffee Factory',
        ru: 'Политика конфиденциальности — New Baku Coffee Factory',
        ar: 'سياسة الخصوصية — نيو باكو كوفي فاكتوري',
      },
    };

    if (titles[page]?.[currentLang]) {
      document.title = titles[page][currentLang];
    }
  }

  function mountLanguageSelector() {
    const header = document.querySelector('.site-header');
    if (!header || document.getElementById('langSelector')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'langSelector';
    wrapper.className = 'lang-selector';

    wrapper.innerHTML = \`
      <button type="button" class="lang-trigger" id="langTrigger" aria-label="Dil / Language" aria-haspopup="true" aria-expanded="false">
        <svg class="lang-globe-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
          <path d="M2 12h20"></path>
        </svg>
        <span class="lang-current-code" id="langCurrentCode">\${currentLang.toUpperCase()}</span>
        <svg class="lang-chevron" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m1 1 4 4 4-4"/>
        </svg>
      </button>
      <div class="lang-dropdown" id="langDropdown" role="menu" aria-label="Dillər" hidden>
        <button type="button" class="lang-option \${currentLang === 'az' ? 'active' : ''}" data-lang="az" role="menuitem" aria-selected="\${currentLang === 'az'}">
          <span class="lang-flag" aria-hidden="true">🇦🇿</span>
          <span class="lang-label">Azərbaycan</span>
          <span class="lang-check" aria-hidden="true">✓</span>
        </button>
        <button type="button" class="lang-option \${currentLang === 'en' ? 'active' : ''}" data-lang="en" role="menuitem" aria-selected="\${currentLang === 'en'}">
          <span class="lang-flag" aria-hidden="true">🇬🇧</span>
          <span class="lang-label">English</span>
          <span class="lang-check" aria-hidden="true">✓</span>
        </button>
        <button type="button" class="lang-option \${currentLang === 'ru' ? 'active' : ''}" data-lang="ru" role="menuitem" aria-selected="\${currentLang === 'ru'}">
          <span class="lang-flag" aria-hidden="true">🇷🇺</span>
          <span class="lang-label">Русский</span>
          <span class="lang-check" aria-hidden="true">✓</span>
        </button>
        <button type="button" class="lang-option \${currentLang === 'ar' ? 'active' : ''}" data-lang="ar" role="menuitem" aria-selected="\${currentLang === 'ar'}">
          <span class="lang-flag" aria-hidden="true">🇸🇦</span>
          <span class="lang-label">العربية</span>
          <span class="lang-check" aria-hidden="true">✓</span>
        </button>
      </div>
    \`;

    const ref = header.querySelector('#accountTrigger, .tea-header-cart, .menu-toggle');
    if (ref) {
      header.insertBefore(wrapper, ref);
    } else {
      header.append(wrapper);
    }

    const trigger = wrapper.querySelector('#langTrigger');
    const dropdown = wrapper.querySelector('#langDropdown');

    function toggleDropdown(open) {
      const isVisible = open !== undefined ? Boolean(open) : !dropdown.classList.contains('open');
      dropdown.hidden = !isVisible;
      dropdown.classList.toggle('open', isVisible);
      dropdown.classList.toggle('is-open', isVisible);
      dropdown.style.display = isVisible ? 'flex' : 'none';
      trigger.setAttribute('aria-expanded', String(isVisible));
    }

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleDropdown();
    });

    wrapper.querySelectorAll('.lang-option').forEach((opt) => {
      opt.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const selectedLang = opt.dataset.lang;
        toggleDropdown(false);
        setLanguage(selectedLang);
      });
    });

    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) toggleDropdown(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') toggleDropdown(false);
    });

    window.addEventListener('scroll', () => {
      toggleDropdown(false);
    }, { passive: true });
  }

  // Initialize
  function init() {
    mountLanguageSelector();
    setLanguage(currentLang);

    // Watch for dynamic product additions (bcf:catalog-ready event)
    window.addEventListener('bcf:catalog-ready', () => {
      if (currentLang !== 'az') {
        translateDom();
      }
    });

    // Sync language choice across open browser tabs
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue && LANGUAGES[e.newValue] && e.newValue !== currentLang) {
        setLanguage(e.newValue);
      }
    });

    // Translate modals, drawers, swatches, and filter chips on user interaction
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('#accountTrigger, .account-trigger, #floatingCartTrigger, .floating-cart-btn, .tea-header-cart, #openCartBtn, #openGearCartBtn, #favoritesTrigger, .favorites-trigger, .coffee-add-button, .tea-add-button, .add-to-cart, .variant-swatch, .gallery-arrow, .filter-chip, .menu-tab, .account-tab, .menu-toggle, #checkoutOpen, .checkout-open');
      if (trigger && currentLang !== 'az') {
        requestAnimationFrame(() => translateDom());
      }
    });

    // Safely observe cart items (debounced, without infinite loops)
    let cartDebounceTimer = null;
    const cartItems = document.querySelector('.cart-items');
    if (cartItems) {
      const cartObserver = new MutationObserver(() => {
        if (isTranslating || currentLang === 'az') return;
        clearTimeout(cartDebounceTimer);
        cartDebounceTimer = setTimeout(() => {
          translateDom(cartItems);
        }, 60);
      });
      cartObserver.observe(cartItems, { childList: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export to window
  window.BCF_I18N = {
    setLanguage,
    getLanguage,
    t,
    LANGUAGES,
    DICTIONARY,
    PHRASE_MAP,
  };
})();
`;

fs.writeFileSync(path.join(__dirname, '..', 'i18n.js'), fullI18nJs, 'utf8');
console.log('Successfully wrote full i18n.js! File size:', fullI18nJs.length);
