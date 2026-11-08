(() => {
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
  const PHRASE_MAP = {
  "Ana səhifə": {
    "en": "Home",
    "ar": "الرئيسية",
    "ru": "Главная"
  },
  "Qəhvələr": {
    "en": "Coffee",
    "ar": "القهوة",
    "ru": "Кофе"
  },
  "Çaylar": {
    "en": "Teas",
    "ar": "شاي",
    "ru": "Чай"
  },
  "Avadanlıqlar": {
    "en": "Equipment",
    "ar": "المعدات",
    "ru": "Оборудование"
  },
  "Menyu": {
    "en": "Menu",
    "ar": "القائمة",
    "ru": "Меню"
  },
  "Bizimlə əlaqə": {
    "en": "Contact Us",
    "ar": "اتصل بنا",
    "ru": "Контакты"
  },
  "Haqqımızda": {
    "en": "About Us",
    "ar": "من نحن",
    "ru": "О нас"
  },
  "Hesab": {
    "en": "Account",
    "ar": "الحساب",
    "ru": "Аккаунт"
  },
  "Seçilmişlər": {
    "en": "Favorites",
    "ar": "المفضلة",
    "ru": "Избранное"
  },
  "Səbət": {
    "en": "Cart",
    "ar": "السلة",
    "ru": "Корзина"
  },
  "Səbətə əlavə et": {
    "en": "Add to Cart",
    "ar": "أضف إلى السلة",
    "ru": "В корзину"
  },
  "Əlavə edildi": {
    "en": "Added",
    "ar": "تمت الإضافة",
    "ru": "Добавлено"
  },
  "Bitib": {
    "en": "Sold Out",
    "ar": "نفد",
    "ru": "Распродано"
  },
  "Mövcuddur": {
    "en": "Available",
    "ar": "متوفر",
    "ru": "В наличии"
  },
  "Daha çox": {
    "en": "More details",
    "ar": "المزيد",
    "ru": "Подробнее"
  },
  "Daha az": {
    "en": "Less details",
    "ar": "أقل",
    "ru": "Скрыть"
  },
  "Daha çox ↗": {
    "en": "More details ↗",
    "ar": "المزيد ↗",
    "ru": "Подробнее ↗"
  },
  "Daha az ↗": {
    "en": "Less details ↗",
    "ar": "أقل ↗",
    "ru": "Скрыть ↗"
  },
  "Turşuluq": {
    "en": "Acidity",
    "ar": "الحموضة",
    "ru": "Кислотность"
  },
  "Bədən": {
    "en": "Body",
    "ar": "القوام",
    "ru": "Тело"
  },
  "Balans": {
    "en": "Balance",
    "ar": "التوازن",
    "ru": "Баланс"
  },
  "Dad notları": {
    "en": "Tasting notes",
    "ar": "نوتات التذوق",
    "ru": "Дескрипторы вкуса"
  },
  "Uyğun dəmləmə": {
    "en": "Brewing method",
    "ar": "طريقة التحضير",
    "ru": "Способ заваривания"
  },
  "Qovrum": {
    "en": "Roast level",
    "ar": "درجة التحميص",
    "ru": "Степень обжарки"
  },
  "Cəmi": {
    "en": "Total",
    "ar": "المجموع",
    "ru": "Итого"
  },
  "Sifariş et": {
    "en": "Order Now",
    "ar": "اطلب الآن",
    "ru": "Заказать"
  },
  "Hamısı": {
    "en": "All",
    "ar": "الكل",
    "ru": "Все"
  },
  "Dəmləmə": {
    "en": "Brewing",
    "ar": "أدوات التحضير",
    "ru": "Заваривание"
  },
  "Dəyirman": {
    "en": "Grinder",
    "ar": "المطاحن",
    "ru": "Кофемолка"
  },
  "Çaydan": {
    "en": "Kettle",
    "ar": "الأباريق",
    "ru": "Чайник"
  },
  "Servis": {
    "en": "Service",
    "ar": "أدوات التقديم",
    "ru": "Сервировка"
  },
  "Aksesuar": {
    "en": "Accessory",
    "ar": "إكسسوارات",
    "ru": "Аксессуар"
  },
  "Qəhvə": {
    "en": "Coffee",
    "ar": "قهوة",
    "ru": "Кофе"
  },
  "Çay": {
    "en": "Tea",
    "ar": "شاي",
    "ru": "Чай"
  },
  "Avadanlıq": {
    "en": "Equipment",
    "ar": "معدات",
    "ru": "Оборудование"
  },
  "Telefon": {
    "en": "Phone",
    "ar": "الهاتف",
    "ru": "Телефон"
  },
  "Instagram": {
    "en": "Instagram",
    "ar": "إنستغرام",
    "ru": "Instagram"
  },
  "Ünvan": {
    "en": "Address",
    "ar": "العنوان",
    "ru": "Адрес"
  },
  "Google Maps-də aç": {
    "en": "Open in Google Maps",
    "ar": "افتح في خرائط جوجل",
    "ru": "Открыть на Google Maps"
  },
  "Çatdırılma": {
    "en": "Delivery",
    "ar": "التوصيل",
    "ru": "Доставка"
  },
  "Wolt ilə sifariş et": {
    "en": "Order with Wolt",
    "ar": "اطلب عبر فولت",
    "ru": "Заказать через Wolt"
  },
  "Səbətiniz hələ boşdur.": {
    "en": "Your cart is currently empty.",
    "ar": "سلتك فارغة حالياً.",
    "ru": "Ваша корзина пока пуста."
  },
  "Sizin seçiminiz": {
    "en": "Your Selection",
    "ar": "اختياراتك",
    "ru": "Ваш выбор"
  },
  "Miqdar seçimi": {
    "en": "Select Quantity",
    "ar": "تحديد الكمية",
    "ru": "Выбор количества"
  },
  "Qram": {
    "en": "Gram",
    "ar": "جرام",
    "ru": "Грамм"
  },
  "Ədəd": {
    "en": "Pieces",
    "ar": "قطع",
    "ru": "Штук"
  },
  "ədəd": {
    "en": "pcs",
    "ar": "قطعة",
    "ru": "шт."
  },
  "Maksimum 2 kq": {
    "en": "Maximum 2 kg",
    "ar": "الحد الأقصى 2 كجم",
    "ru": "Максимум 2 кг"
  },
  "Maksimum 1 kq": {
    "en": "Maximum 1 kg",
    "ar": "الحد الأقصى 1 كجم",
    "ru": "Максимум 1 кг"
  },
  "1–20 ədəd seçə bilərsiniz": {
    "en": "You can select 1–20 items",
    "ar": "يمكنك اختيار 1–20 قطعة",
    "ru": "Можно выбрать от 1 до 20 шт."
  },
  "Qiymət sifarişdən sonra dəqiqləşdiriləcək": {
    "en": "Price will be confirmed after order",
    "ar": "سيتم تأكيد السعر بعد الطلب",
    "ru": "Цена уточняется после заказа"
  },
  "Satıcıya qeyd": {
    "en": "Note to seller",
    "ar": "ملاحظة للبائع",
    "ru": "Примечание к заказу"
  },
  "(istəyə bağlı)": {
    "en": "(optional)",
    "ar": "(اختياري)",
    "ru": "(необязательно)"
  },
  "Alış-verişə davam et": {
    "en": "Continue Shopping",
    "ar": "متابعة التسوق",
    "ru": "Продолжить покупки"
  },
  "← Bütün avadanlıqlar": {
    "en": "← All Equipment",
    "ar": "← جميع المعدات",
    "ru": "← Все оборудование"
  },
  "Variant": {
    "en": "Variant",
    "ar": "النوع",
    "ru": "Вариант"
  },
  "Variant:": {
    "en": "Variant:",
    "ar": "النوع:",
    "ru": "Вариант:"
  },
  "Qiymət": {
    "en": "Price",
    "ar": "السعر",
    "ru": "Цена"
  },
  "Seçim": {
    "en": "Options",
    "ar": "خيارات",
    "ru": "Опции"
  },
  "Müvəqqəti qiymət": {
    "en": "Estimated price",
    "ar": "سعر تقديري",
    "ru": "Ориентировочная цена"
  },
  "Məhsul tapılmadı": {
    "en": "Product Not Found",
    "ar": "المنتج غير موجود",
    "ru": "Товар не найден"
  },
  "Bu məhsul mövcud deyil.": {
    "en": "This product does not exist.",
    "ar": "هذا المنتج غير متوفر.",
    "ru": "Данный товар не существует."
  },
  "Kataloqa qayıt": {
    "en": "Return to Catalog",
    "ar": "العودة إلى الكتالوج",
    "ru": "Вернуться в каталог"
  },
  "Bütün məhsullar": {
    "en": "All Products",
    "ar": "جميع المنتجات",
    "ru": "Все товары"
  },
  "Kataloq": {
    "en": "Catalog",
    "ar": "الكتالوج",
    "ru": "Каталог"
  },
  "Haqqımızda · Əlaqə": {
    "en": "About Us · Contact",
    "ar": "من نحن · اتصل بنا",
    "ru": "О нас · Контакты"
  },
  "Bakı · qəhvə · söhbət": {
    "en": "Baku · Coffee · Conversation",
    "ar": "باكو · قهوة · حديث",
    "ru": "Баку · кофе · беседы"
  },
  "© 2026 · Bakı, Azərbaycan": {
    "en": "© 2026 · Baku, Azerbaijan",
    "ar": "© 2026 · باكو، أذربيجان",
    "ru": "© 2026 · Баку, Азербайджан"
  },
  "Yeni Baku Coffee Factory": {
    "en": "New Baku Coffee Factory",
    "ar": "نيو باكو كوفي فاكتوري",
    "ru": "Новый Baku Coffee Factory"
  },
  "Siyahını təmizlə": {
    "en": "Clear list",
    "ar": "مسح القائمة",
    "ru": "Очистить список"
  },
  "Giriş": {
    "en": "Sign In",
    "ar": "تسجيل الدخول",
    "ru": "Вход"
  },
  "Qeydiyyat": {
    "en": "Register",
    "ar": "إنشاء حساب",
    "ru": "Регистрация"
  },
  "Daxil ol": {
    "en": "Sign In",
    "ar": "دخول",
    "ru": "Войти"
  },
  "Hesab yarat": {
    "en": "Create Account",
    "ar": "إنشاء الحساب",
    "ru": "Создать аккаунт"
  },
  "Hesabdan çıx": {
    "en": "Sign Out",
    "ar": "تسجيل الخروج",
    "ru": "Выйти из аккаунта"
  },
  "Hesab məlumatları": {
    "en": "Account Details",
    "ar": "بيانات الحساب",
    "ru": "Данные аккаунта"
  },
  "Keçmiş sifarişlər": {
    "en": "Order History",
    "ar": "الطلبات السابقة",
    "ru": "История заказов"
  },
  "Google ilə davam et": {
    "en": "Continue with Google",
    "ar": "المتابعة باستخدام جوجل",
    "ru": "Продолжить через Google"
  },
  "Sil": {
    "en": "Remove",
    "ar": "حذف",
    "ru": "Удалить"
  },
  "Bizi tanıyın ↓": {
    "en": "Discover us ↓",
    "ar": "تعرف علينا ↓",
    "ru": "О нас ↓"
  },
  "Baku Coffee Factory Fresh roasted & specialty coffee Takeaway • Coffeeshop.": {
    "en": "Baku Coffee Factory Fresh roasted & specialty coffee Takeaway • Coffeeshop.",
    "ar": "باكو كوفي فاكتوري قهوة مختصة ومحمصة طازجة سفري وكافيه.",
    "ru": "Baku Coffee Factory Свежеобжаренный спешелти кофе навынос и в кофейне."
  },
  "SİFARİŞ SORĞUSU": {
    "en": "ORDER REQUEST",
    "ar": "طلب شراء",
    "ru": "ЗАЯВКА НА ЗАКАЗ"
  },
  "Sifarişi tamamlayın.": {
    "en": "Complete your order.",
    "ar": "إتمام الطلب.",
    "ru": "Оформление заказа."
  },
  "Sifarişlə bağlı əlavə istəyiniz varsa yazın": {
    "en": "Write any special instructions for your order",
    "ar": "اكتب أي ملاحظة أو طلب خاص بطلبك هنا",
    "ru": "Укажите пожелания или детали к вашему заказу"
  },
  "Sifarişi təsdiqlə və WhatsApp-a göndər": {
    "en": "Confirm Order & Send via WhatsApp",
    "ar": "تأكيد الطلب والإرسال عبر واتساب",
    "ru": "Подтвердить заказ и отправить в WhatsApp"
  },
  "✓ Sifariş admin panelə, Telegram-a və WhatsApp-a (+994 55 645 22 04) göndərilir": {
    "en": "✓ Order is sent to Admin panel, Telegram, and WhatsApp (+994 55 645 22 04)",
    "ar": "✓ يتم إرسال الطلب إلى لوحة التحكم وتيليجرام وواتساب (+994 55 645 22 04)",
    "ru": "✓ Заказ отправляется в панель управления, Telegram и WhatsApp (+994 55 645 22 04)"
  },
  "SİFARİŞ QEYDƏ ALINDI": {
    "en": "ORDER RECEIVED",
    "ar": "تم تسجيل الطلب",
    "ru": "ЗАКАЗ ПРИНЯТ"
  },
  "Sifariş sorğunuz qəbul edildi.": {
    "en": "Your order request has been accepted.",
    "ar": "تم استلام طلبك بنجاح.",
    "ru": "Ваша заявка на заказ принята."
  },
  "Sifarişiniz sistemə qeyd olundu! Sürətli təsdiq üçün birbaşa WhatsApp-a göndərin:": {
    "en": "Your order is recorded! Send directly to WhatsApp for rapid confirmation:",
    "ar": "تم تسجيل طلبك! أرسله مباشرة عبر واتساب للتأكيد الفوري:",
    "ru": "Ваш заказ зарегистрирован! Отправьте его напрямую в WhatsApp для быстрого подтверждения:"
  },
  "WhatsApp ilə göndər": {
    "en": "Send via WhatsApp",
    "ar": "إرسال عبر واتساب",
    "ru": "Отправить через WhatsApp"
  },
  "Komandamız həmçinin göstərdiyiniz telefon nömrəsi ilə əlaqə saxlayacaq.": {
    "en": "Our team will also reach out to your provided phone number.",
    "ar": "سيتواصل فريقنا أيضاً معك عبر رقم الهاتف المسجل.",
    "ru": "Наша команда также свяжется с вами по указанному номеру телефона."
  },
  "Qəhvə, çay və avadanlıqlar vahid səbətdə hesablanır.": {
    "en": "Coffee, tea, and equipment are calculated in a unified cart.",
    "ar": "يتم احتساب القهوة والشاي والمعدات في سلة موحدة.",
    "ru": "Кофе, чай и оборудование рассчитываются в единой корзине."
  },
  "Colombia": {
    "en": "Colombia",
    "ar": "كولومبيا",
    "ru": "Колумбия"
  },
  "Guatemala": {
    "en": "Guatemala",
    "ar": "غواتيمالا",
    "ru": "Гватемала"
  },
  "Brasil": {
    "en": "Brazil",
    "ar": "البرازيل",
    "ru": "Бразилия"
  },
  "Honduras": {
    "en": "Honduras",
    "ar": "هندوراس",
    "ru": "Гондурас"
  },
  "Robusta": {
    "en": "Robusta",
    "ar": "روبوستا",
    "ru": "Робуста"
  },
  "Costa Rica": {
    "en": "Costa Rica",
    "ar": "كوستاريكا",
    "ru": "Коста-Рика"
  },
  "Efiopiya": {
    "en": "Ethiopia",
    "ar": "إثيوبيا",
    "ru": "Эфиопия"
  },
  "Keniya": {
    "en": "Kenya",
    "ar": "كينيا",
    "ru": "Кения"
  },
  "Decaf": {
    "en": "Decaf",
    "ar": "خالي من الكافيين",
    "ru": "Декаф"
  },
  "Uqanda": {
    "en": "Uganda",
    "ar": "أوغندا",
    "ru": "Уганда"
  },
  "Colombia · 100 q": {
    "en": "Colombia · 100g",
    "ar": "كولومبيا · 100 جم",
    "ru": "Колумбия · 100 г"
  },
  "Guatemala · 100 q": {
    "en": "Guatemala · 100g",
    "ar": "غواتيمالا · 100 جم",
    "ru": "Гватемала · 100 г"
  },
  "Brasil · 100 q": {
    "en": "Brazil · 100g",
    "ar": "البرازيل · 100 جم",
    "ru": "Бразилия · 100 г"
  },
  "Honduras · 100 q": {
    "en": "Honduras · 100g",
    "ar": "هندوراس · 100 جم",
    "ru": "Гондурас · 100 г"
  },
  "Robusta · 100 q": {
    "en": "Robusta · 100g",
    "ar": "روبوستا · 100 جم",
    "ru": "Робуста · 100 г"
  },
  "Costa Rica · 100 q": {
    "en": "Costa Rica · 100g",
    "ar": "كوستاريكا · 100 جم",
    "ru": "Коста-Рика · 100 г"
  },
  "Efiopiya · 100 q": {
    "en": "Ethiopia · 100g",
    "ar": "إثيوبيا · 100 جم",
    "ru": "Эфиопия · 100 г"
  },
  "Keniya · 100 q": {
    "en": "Kenya · 100g",
    "ar": "كينيا · 100 جم",
    "ru": "Кения · 100 г"
  },
  "Kofeinsiz qəhvə · 100 q": {
    "en": "Decaf Coffee · 100g",
    "ar": "قهوة خالية من الكافيين · 100 جم",
    "ru": "Декаф кофе · 100 г"
  },
  "Uqanda · 100 q": {
    "en": "Uganda · 100g",
    "ar": "أوغندا · 100 جم",
    "ru": "Уганда · 100 г"
  },
  "Mənşə qəhvələri · 100 q": {
    "en": "Single Origin Coffees · 100g",
    "ar": "قهوة أحادية المنشأ · 100 جم",
    "ru": "Моносорта кофе · 100 г"
  },
  "Fincanınızdakı mənşəni tanıyın.": {
    "en": "Discover the origin in your cup.",
    "ar": "اكتشف المنشأ في كل فنجان.",
    "ru": "Познайте происхождение в каждой чашке."
  },
  "Vacib qeyd": {
    "en": "Important note",
    "ar": "ملاحظة هامة",
    "ru": "Важное примечание"
  },
  "Qırmızı alma, karamel, süd şokoladı, yüngül fındıq.": {
    "en": "Red apple, caramel, milk chocolate, light hazelnut.",
    "ar": "تفاح أحمر، كراميل، شوكولاتة بالحليب، بندق خفيف.",
    "ru": "Красное яблоко, карамель, молочный шоколад, легкий фундук."
  },
  "Tünd şokolad, badam, qəhvəyi şəkər, qurudulmuş portağal.": {
    "en": "Dark chocolate, almond, brown sugar, dried orange.",
    "ar": "شوكولاتة داكنة، لوز، سكر بني، برتقال مجفف.",
    "ru": "Темный шоколад, миндаль, тростниковый сахар, сушеный апельсин."
  },
  "Fındıq, kakao, qəhvəyi şəkər, karamel.": {
    "en": "Hazelnut, cocoa, brown sugar, caramel.",
    "ar": "بندق، كاكاو، سكر بني، كراميل.",
    "ru": "Фундук, какао, коричневый сахар, карамель."
  },
  "Qırmızı giləmeyvə, kakao, qəhvəyi şəkər, yumşaq sitrus.": {
    "en": "Red berries, cocoa, brown sugar, soft citrus.",
    "ar": "توت أحمر، كاكاو، سكر بني، حمضيات خفيفة.",
    "ru": "Красные ягоды, какао, тростниковый сахар, мягкие цитрусовые."
  },
  "Tünd kakao, qovrulmuş qoz, odunsu tonlar, ədviyyəli bitiş.": {
    "en": "Dark cocoa, roasted walnut, woody notes, spiced finish.",
    "ar": "كاكاو داكن، جوز محمص، نغمات خشبية، لمسة متبلة.",
    "ru": "Темное какао, жареный грецкий орех, древесные ноты, пряный финиш."
  },
  "Portağal, sarı meyvələr, bal, yüngül kakao.": {
    "en": "Orange, yellow fruits, honey, light cocoa.",
    "ar": "برتقال، فواكه صفراء، عسل، كاكاو خفيف.",
    "ru": "Апельсин, желтые фрукты, мед, легкое какао."
  },
  "Berqamot, yasəmən, limon qabığı və çəyirdəkli meyvələr.": {
    "en": "Bergamot, jasmine, lemon peel, and stone fruits.",
    "ar": "برغموت، ياسمين، قشر الليمون، وفواكه ذات نواة.",
    "ru": "Бергамот, жасмин, цедра лимона и косточковые фрукты."
  },
  "Qara qarağat, qırmızı giləmeyvə, qreypfrut və qamış şəkəri.": {
    "en": "Blackcurrant, red berries, grapefruit, and cane sugar.",
    "ar": "كشمش أسود، توت أحمر، جريب فروت، وقصب السكر.",
    "ru": "Черная смородина, красные ягоды, грейпфрут и тростниковый сахар."
  },
  "Karamel, kakao, badam və yumşaq quru meyvə çalarları.": {
    "en": "Caramel, cocoa, almond, and subtle dried fruit tones.",
    "ar": "كراميل، كاكاو، لوز، ونغمات فواكه مجففة خفيفة.",
    "ru": "Карамель, какао, миндаль и мягкие оттенки сухофруктов."
  },
  "Tünd şokolad, quru gavalı, isti ədviyyat və qovrulmuş qoz.": {
    "en": "Dark chocolate, prunes, warm spices, and roasted walnut.",
    "ar": "شوكولاتة داكنة، برقوق مجفف، بهارات دافئة، وجوز محمص.",
    "ru": "Темный шоколад, чернослив, теплые специи и жареный орех."
  },
  "Yumşaq şirinliyi, canlı meyvə xarakteri və kakaolu bitişi ilə balanslı gündəlik qəhvə. Fincanda təmiz və rahat içim yaradır.": {
    "en": "A balanced everyday coffee with gentle sweetness, lively fruit character, and a cocoa finish. Produces a clean and smooth cup.",
    "ar": "قهوة يومية متوازنة بحلاوة لطيفة وطابع فاكهي حيوي وخاتمة كاكاو. تمنحك فنجاناً نظيفاً ومريحاً.",
    "ru": "Сбалансированный кофе на каждый день с мягкой сладостью, ярким фруктовым характером и шоколадным послевкусием. Создает чистый и приятный вкус в чашке."
  },
  "Daha dərin, klassik və strukturlaşdırılmış fincan axtaranlar üçün. Şokoladlı gövdəsi və yumşaq sitrus toxunuşu onu çox yönlü edir.": {
    "en": "For those seeking a deeper, classic, and structured cup. Its chocolaty body and soft citrus touch make it exceptionally versatile.",
    "ar": "لمن يبحث عن فنجان أعمق وكلاسيكي ومنظم. قوامها الشوكولاتي ولمستها الحمضية اللطيفة يجعلانها متعددة الاستخدامات.",
    "ru": "Для тех, кто ищет более глубокий, классический и структурированный вкус. Шоколадное тело и мягкий цитрусовый акцент делают его универсальным."
  },
  "Turşuluğu aşağı, kremli və şokoladlı espresso sevənlər üçün etibarlı seçim. Südlü içkilərdə dadını itirmir.": {
    "en": "A dependable choice for lovers of low-acidity, creamy, chocolaty espresso. Retains its distinct flavor in milk beverages.",
    "ar": "خيار موثوق لمحبي الإسبريسو قليل الحموضة الكريمي والشوكولاتي. تحتفظ بنكهتها الغنية في المشروبات الممزوجة بالحليب.",
    "ru": "Надежный выбор для любителей эспрессо с низкой кислотностью, кремовой текстурой и шоколадными нотами. Прекрасно раскрывается в молочных напитках."
  },
  "Meyvə təravəti ilə kakaolu rahatlığın ortasında duran canlı, lakin yorucu olmayan profil. Həm filtr, həm espresso üçün uyğundur.": {
    "en": "A vibrant yet gentle profile balanced between fruit freshness and cocoa comfort. Well-suited for both filter and espresso.",
    "ar": "مزيج حيوي ومريح بين انتعاش الفاكهة ودفء الكاكاو. مناسب للفلتر والإسبريسو على حد سواء.",
    "ru": "Яркий, но ненавязчивый профиль на стыке свежести фруктов и уюта какао. Подходит как для фильтра, так и для эспрессо."
  },
  "Daha güclü, intensiv və dolğun içim istəyənlər üçün. Robusta adətən Arabica ilə müqayisədə daha sərt xarakter, daha az turşuluq və daha qüvvətli crema verir.": {
    "en": "For those seeking a stronger, intense, and full-bodied cup. Robusta generally offers a bolder character, lower acidity, and denser crema than Arabica.",
    "ar": "للراغبين في فنجان قوي وكثيف وممتلئ. تمنح روبوستا طابعاً أكثر جرأة مع حموضة أقل وكريما أكثر كثافة مقارنة بأرابيكا.",
    "ru": "Для тех, кто предпочитает крепкий, насыщенный и плотный напиток. Робуста дает более терпкий характер, минимальную кислотность и густую пенку крема."
  },
  "Parlaq, təmiz və mürəkkəb fincan. Təravətli turşuluqla bal kimi şirinlik birləşir; dəmləmə ritualını sevənlər üçün seçilən profildir.": {
    "en": "A bright, clean, and complex cup. Refreshing acidity merges with honey-like sweetness; the premier profile for pour-over lovers.",
    "ar": "فنجان مشرق، نظيف ومعقد. تجتمع الحموضة المنعشة مع حلاوة تشبه العسل؛ خيار مثالي لعشاق طقوس التحضير اليدوي.",
    "ru": "Яркая, чистая и многогранная чашка. Освежающая кислотность соединяется с медовой сладостью; излюбленный профиль ценителей альтернативного заваривания."
  },
  "Ətirli, zərif və parlaq xarakterli fincan. Çiçək aromaları sitrus təravəti və çayabənzər yüngüllüklə birləşərək aydın, uzun və təmiz bitiş yaradır.": {
    "en": "A fragrant, delicate, and radiant cup. Floral aromas blend with citrus crispness and tea-like elegance, yielding a luminous, long finish.",
    "ar": "فنجان عطري، رقيق ومشرق. تمتزج روائح الزهور مع انتعاش الحموضة وخفة تشبه الشاي لتمنحك نهاية واضحة وطويلة.",
    "ru": "Ароматная, утонченная и сияющая чашка. Цветочные ароматы соединяются с цитрусовой свежестью и чайной легкостью, оставляя долгое и чистое послевкусие."
  },
  "Şirəli meyvə xarakteri və parlaq turşuluğu ilə seçilən ifadəli qəhvə. Fincan soyuduqca giləmeyvə şirinliyi daha aydın hiss olunur, bitiş isə təmiz qalır.": {
    "en": "An expressive coffee prized for juicy fruit notes and vivid acidity. As it cools, berry sweetness blossoms while the finish remains pristine.",
    "ar": "قهوة مميزة بنكهة الفواكه العصيرية وحموضة ساطعة. كلما برد الفنجان برزت حلاوة التوت مع خاتمة نقية.",
    "ru": "Выразительный кофе с сочным фруктовым профилем и яркой искристой кислотностью. По мере остывания чашки сладость ягод становится еще отчетливее."
  },
  "Kofeini azaltmaq istəyən, amma rahat qəhvə dadından imtina etməyənlər üçün yumşaq və dolğun seçim. Dəqiq profil istifadə olunan dənə və kofeinsizləşdirmə üsuluna görə dəyişə bilər.": {
    "en": "A mellow, satisfying choice for those wishing to reduce caffeine without giving up genuine coffee flavor.",
    "ar": "خيار ناعم وممتلئ لمن يريد تقليل الكافيين دون التخلي عن نكهة القهوة الأصيلة.",
    "ru": "Мягкий и насыщенный выбор для тех, кто хочет сократить кофеин, не отказываясь от любимого вкуса кофе."
  },
  "Dolğun bədəni, aşağı–orta turşuluğu və tünd şokolad xarakteri ilə güclü, rahat içim verir. Espresso və südlü içkilərdə dadını yaxşı saxlayır.": {
    "en": "Full body, low-to-medium acidity, and dark chocolate notes deliver a bold, comforting drink. Outstanding in espresso and milk beverages.",
    "ar": "قوام كامل، حموضة منخفضة إلى متوسطة، وطابع شوكولاتة داكنة تمنح فنجاناً قوياً ومريحاً. ممتازة في الإسبريسو ومشروبات الحليب.",
    "ru": "Плотное тело, низкая кислотность и характер темного шоколада обеспечивают крепкий и гармоничный вкус. Отлично проявляет себя в эспрессо и капучино."
  },
  "V60, Chemex və balanslı espresso.": {
    "en": "V60, Chemex, and balanced espresso.",
    "ar": "V60، كيمكس وإسبريسو متوازن.",
    "ru": "V60, Chemex и сбалансированный эспрессо."
  },
  "Espresso, moka pot və French press.": {
    "en": "Espresso, moka pot, and French press.",
    "ar": "إسبريسو، موكا بوت وفرنش بريس.",
    "ru": "Эспрессо, гейзерная кофеварка (moka pot) и френч-пресс."
  },
  "Espresso, cappuccino, latte və moka pot.": {
    "en": "Espresso, cappuccino, latte, and moka pot.",
    "ar": "إسبريسو، كابتشينو، لاتيه وموكا بوت.",
    "ru": "Эспрессо, капучино, латте и гейзерная кофеварка."
  },
  "V60, Aeropress və gündəlik espresso.": {
    "en": "V60, AeroPress, and daily espresso.",
    "ar": "V60، إيروبريس وإسبريسو يومي.",
    "ru": "V60, AeroPress и повседневный эспрессо."
  },
  "Türk qəhvəsi, tünd espresso və espresso qarışıqları.": {
    "en": "Turkish coffee, dark espresso, and espresso blends.",
    "ar": "قهوة تركية، إسبريسو غامق ومزيج إسبريسو.",
    "ru": "Кофе по-турецки, темный эспрессо и смеси для эспрессо."
  },
  "V60, Kalita, Chemex və açıq espresso.": {
    "en": "V60, Kalita, Chemex, and light espresso.",
    "ar": "V60، كاليتا، كيمكس وإسبريسو خفيف.",
    "ru": "V60, Kalita, Chemex и светлый эспрессо."
  },
  "V60, Chemex və AeroPress — aromatik incəlikləri önə çıxarır.": {
    "en": "V60, Chemex, and AeroPress — accentuates delicate aromas.",
    "ar": "V60، كيمكس وإيروبريس — يبرز الدقة العطرية.",
    "ru": "V60, Chemex и AeroPress — подчеркивают ароматические нюансы."
  },
  "V60, Kalita və AeroPress — meyvə təravətini aydın göstərir.": {
    "en": "V60, Kalita, and AeroPress — highlights crisp fruit notes.",
    "ar": "V60، كاليتا وإيروبريس — يبرز انتعاش الفاكهة بوضوح.",
    "ru": "V60, Kalita и AeroPress — ярко раскрывают фруктовую свежесть."
  },
  "Espresso, French press və moka pot.": {
    "en": "Espresso, French press, and moka pot.",
    "ar": "إسبريسو، فرنش بريس وموكا بوت.",
    "ru": "Эспрессо, френч-пресс и гейзерная кофеварка."
  },
  "Orta qovrum — şirinlik və meyvə təravəti bir arada.": {
    "en": "Medium roast — combines sweetness and fruit freshness.",
    "ar": "تحميص متوسط — حلاوة وانتعاش فاكهي معاً.",
    "ru": "Средняя обжарка — баланс сладости и фруктовой свежести."
  },
  "Orta–tünd qovrum — dolğunluq və şokolad notları önə çıxır.": {
    "en": "Medium-dark roast — body and chocolate notes stand out.",
    "ar": "تحميص متوسط إلى داكن — يبرز القوام ونوتات الشوكولاتة.",
    "ru": "Средне-темная обжарка — на первый план выходят плотность и шоколад."
  },
  "Orta–tünd qovrum — dolğun, şirin və aşağı turşuluqlu.": {
    "en": "Medium-dark roast — full, sweet, and low in acidity.",
    "ar": "تحميص متوسط إلى داكن — ممتلئ، حلو وقليل الحموضة.",
    "ru": "Средне-темная обжарка — плотный, сладкий, с низкой кислотностью."
  },
  "Orta qovrum — meyvə notları və şokoladlı bitiş qorunur.": {
    "en": "Medium roast — preserves fruit notes and chocolaty finish.",
    "ar": "تحميص متوسط — يحافظ على نوتات الفاكهة وخاتمة الشوكولاتة.",
    "ru": "Средняя обжарка — сохраняются фруктовые ноты и шоколадный финиш."
  },
  "Tünd qovrum — yüksək ekstraksiya və güclü gövdə üçün.": {
    "en": "Dark roast — for maximum extraction and bold body.",
    "ar": "تحميص داكن — لاستخلاص عالٍ وقوام قوي.",
    "ru": "Темная обжарка — для максимальной экстракции и мощного тела."
  },
  "Orta–tünd qovrum — intensivlik və dolğun crema üçün.": {
    "en": "Medium-dark roast — for intensity and dense crema.",
    "ar": "تحميص متوسط إلى داكن — لكثافة وكريما غنية.",
    "ru": "Средне-темная обжарка — для насыщенности и густой крема."
  },
  "Yüngül–orta qovrum — təravət və şirinliyin aydın qalması üçün.": {
    "en": "Light-medium roast — to keep freshness and sweetness clear.",
    "ar": "تحميص خفيف إلى متوسط — لوضوح الانتعاش والحلاوة.",
    "ru": "Светло-средняя обжарка — для сохранения свежести и сладости."
  },
  "Açıq–orta qovrum — çiçək ətrini və canlı turşuluğu qorumaq üçün.": {
    "en": "Light-medium roast — preserves floral fragrance and lively acidity.",
    "ar": "تحميص خفيف إلى متوسط — للحفاظ على عطر الزهور والحموضة الحيوية.",
    "ru": "Светло-средняя обжарка — для сохранения цветочного аромата и кислотности."
  },
  "Açıq–orta qovrum — şirəli turşuluq və təbii şirinlik üçün.": {
    "en": "Light-medium roast — for juicy acidity and natural sweetness.",
    "ar": "تحميص خفيف إلى متوسط — لحموضة عصيرية وحلاوة طبيعية.",
    "ru": "Светло-средняя обжарка — для сочной кислотности и естественной сладости."
  },
  "Orta qovrum — şirinlik, yumşaq bədən və rahat bitiş üçün.": {
    "en": "Medium roast — for sweetness, mellow body, and a smooth finish.",
    "ar": "تحميص متوسط — لحلاوة وقوام ناعم ونهاية مريحة.",
    "ru": "Средняя обжарка — для сладости, мягкого тела и легкого финиша."
  },
  "Orta–tünd qovrum — dolğun bədən və uzun kakaolu bitiş üçün.": {
    "en": "Medium-dark roast — for full body and a long cocoa finish.",
    "ar": "تحميص متوسط إلى داكن — لقوام ممتلئ ونهاية كاكاو طويلة.",
    "ru": "Средне-темная обжарка — для плотного тела и долгого послевкусия какао."
  },
  "1001 Gecə Çayı": {
    "en": "1001 Nights Tea",
    "ar": "شاي ألف ليلة وليلة",
    "ru": "Чай 1001 Ночь"
  },
  "Admiral": {
    "en": "Admiral",
    "ar": "أدميرال",
    "ru": "Адмирал"
  },
  "Geyşa Qara": {
    "en": "Geisha Black",
    "ar": "جيشا أسود",
    "ru": "Гейша Черный"
  },
  "Jasmin Çayı": {
    "en": "Jasmine Tea",
    "ar": "شاي الياسمين",
    "ru": "Жасминовый чай"
  },
  "Limon Çayı": {
    "en": "Lemon Tea",
    "ar": "شاي الليمون",
    "ru": "Лимонный чай"
  },
  "Malina Şərbəti": {
    "en": "Raspberry Sorbet Tea",
    "ar": "شربات التوت",
    "ru": "Малиновый шербет"
  },
  "Meyvəli Çay": {
    "en": "Fruit Infusion Tea",
    "ar": "شاي الفواكه",
    "ru": "Фруктовый чай"
  },
  "Nar Çayı": {
    "en": "Pomegranate Tea",
    "ar": "شاي الرمان",
    "ru": "Гранатовый чай"
  },
  "Portağal Çayı": {
    "en": "Orange Tea",
    "ar": "شاي البرتقال",
    "ru": "Апельсиновый чай"
  },
  "Qarpız Çayı": {
    "en": "Watermelon Tea",
    "ar": "شاي البطيخ",
    "ru": "Арбузный чай"
  },
  "Geyşa Yaşıl": {
    "en": "Geisha Green",
    "ar": "جيشا أخضر",
    "ru": "Гейша Зеленый"
  },
  "Yaşıl Çay": {
    "en": "Green Tea",
    "ar": "شاي أخضر",
    "ru": "Зеленый чай"
  },
  "Mango Kürəsi": {
    "en": "Mango Blooming Ball",
    "ar": "كرة المانجو المزهرة",
    "ru": "Манговый шар (связанный)"
  },
  "Mango Çayı": {
    "en": "Mango Tea",
    "ar": "شاي المانجو",
    "ru": "Манговый чай"
  },
  "Qara Çay": {
    "en": "Black Tea",
    "ar": "شاي أسود",
    "ru": "Черный чай"
  },
  "Jasminli Qara Çay": {
    "en": "Jasmine Black Tea",
    "ar": "شاي أسود بالياسمين",
    "ru": "Черный чай с жасмином"
  },
  "Hibiskus": {
    "en": "Hibiscus",
    "ar": "كركديه",
    "ru": "Каркаде (Гибискус)"
  },
  "Aromatik qarışıq · çiçəkli": {
    "en": "Aromatic blend · Floral",
    "ar": "مزيج عطري · زهري",
    "ru": "Ароматный сбор · Цветочный"
  },
  "Qara çay · dolğun": {
    "en": "Black tea · Full-bodied",
    "ar": "شاي أسود · غني",
    "ru": "Черный чай · Насыщенный"
  },
  "Qara çay · çiçəkli": {
    "en": "Black tea · Floral",
    "ar": "شاي أسود · زهري",
    "ru": "Черный чай · Цветочный"
  },
  "Yaşıl çay · əl ilə bağlanmış": {
    "en": "Green tea · Hand-tied",
    "ar": "شاي أخضر · مربوط يدوياً",
    "ru": "Зеленый чай · Ручной работы"
  },
  "Qara çay · sitruslu": {
    "en": "Black tea · Citrus",
    "ar": "شاي أسود · حمضي",
    "ru": "Черный чай · Цитрусовый"
  },
  "Aromatik qara çay · giləmeyvəli": {
    "en": "Aromatic black tea · Berry",
    "ar": "شاي أسود عطري · توتي",
    "ru": "Ароматный черный чай · Ягодный"
  },
  "Meyvə infuziyası · şirin-turş": {
    "en": "Fruit infusion · Sweet & tart",
    "ar": "منقوع الفواكه · حلو وحامض",
    "ru": "Фруктовый настой · Кисло-сладкий"
  },
  "Qara çay · meyvəli": {
    "en": "Black tea · Fruity",
    "ar": "شاي أسود · فاكهي",
    "ru": "Черный чай · Фруктовый"
  },
  "Qara çay · yay meyvəli": {
    "en": "Black tea · Summer fruits",
    "ar": "شاي أسود · فواكه صيفية",
    "ru": "Черный чай · Летние фрукты"
  },
  "Yaşıl çay · klassik": {
    "en": "Green tea · Classic",
    "ar": "شاي أخضر · كلاسيكي",
    "ru": "Зеленый чай · Классический"
  },
  "Bağlanmış yaşıl çay · meyvəli": {
    "en": "Blooming green tea · Fruity",
    "ar": "شاي أخضر مزهر · فاكهي",
    "ru": "Связанный зеленый чай · Фруктовый"
  },
  "Qara çay · tropik meyvəli": {
    "en": "Black tea · Tropical fruit",
    "ar": "شاي أسود · فواكه استوائية",
    "ru": "Черный чай · Тропические фрукты"
  },
  "Qara çay · jasminli": {
    "en": "Black tea · Jasmine",
    "ar": "شاي أسود · ياسمين",
    "ru": "Черный чай · Жасминовый"
  },
  "Bitki infuziyası · turşməzə": {
    "en": "Herbal infusion · Tart",
    "ar": "منقوع أعشاب · حامض منعش",
    "ru": "Травяной сбор · Освежающий"
  },
  "Dad": {
    "en": "Taste",
    "ar": "المذاق",
    "ru": "Вкус"
  },
  "Çiçək, sitrus, quru meyvə": {
    "en": "Floral, citrus, dried fruit",
    "ar": "زهور، حمضيات، فواكه مجففة",
    "ru": "Цветы, цитрусовые, сухофрукты"
  },
  "90°C · 3–4 dəqiqə": {
    "en": "90°C · 3–4 min",
    "ar": "90°م · 3–4 دقائق",
    "ru": "90°C · 3–4 мин"
  },
  "Qara çay, giləmeyvə, çiçək": {
    "en": "Black tea, berries, floral",
    "ar": "شاي أسود، توت، زهور",
    "ru": "Черный чай, ягоды, цветы"
  },
  "95°C · 3–5 dəqiqə": {
    "en": "95°C · 3–5 min",
    "ar": "95°م · 3–5 دقائق",
    "ru": "95°C · 3–5 мин"
  },
  "Bal, çiçək ləçəyi, yüngül ədviyyə": {
    "en": "Honey, flower petal, light spice",
    "ar": "عسل، بتلات الزهور، توابل خفيفة",
    "ru": "Мед, лепестки цветов, легкие специи"
  },
  "Yasəmən, təzə ot, ağ çiçək": {
    "en": "Jasmine, fresh grass, white blossom",
    "ar": "ياسمين، أعشاب طازجة، زهور بيضاء",
    "ru": "Жасмин, свежая трава, белые цветы"
  },
  "80–85°C · 3–4 dəqiqə": {
    "en": "80–85°C · 3–4 min",
    "ar": "80–85°م · 3–4 دقائق",
    "ru": "80–85°C · 3–4 мин"
  },
  "Limon qabığı, sitrus, qara çay": {
    "en": "Lemon peel, citrus, black tea",
    "ar": "قشر الليمون، حمضيات، شاي أسود",
    "ru": "Цедра лимона, цитрусы, черный чай"
  },
  "Moruq, qırmızı meyvə, yüngül karamel": {
    "en": "Raspberry, red fruit, hint of caramel",
    "ar": "توت العليق، فواكه حمراء، كراميل خفيف",
    "ru": "Малина, красные фрукты, легкая карамель"
  },
  "95°C · 4 dəqiqə": {
    "en": "95°C · 4 min",
    "ar": "95°م · 4 دقائق",
    "ru": "95°C · 4 мин"
  },
  "Alma, giləmeyvə, hibiskus": {
    "en": "Apple, berries, hibiscus",
    "ar": "تفاح، توت، كركديه",
    "ru": "Яблоко, ягоды, каркаде"
  },
  "95°C · 5–7 dəqiqə": {
    "en": "95°C · 5–7 min",
    "ar": "95°م · 5–7 دقائق",
    "ru": "95°C · 5–7 мин"
  },
  "Nar, qırmızı giləmeyvə, çiçək": {
    "en": "Pomegranate, red berries, floral",
    "ar": "رمان، توت أحمر، زهور",
    "ru": "Гранат, красные ягоды, цветы"
  },
  "Portağal, sitrus qabığı, bal": {
    "en": "Orange, citrus peel, honey",
    "ar": "برتقال، قشر الحمضيات، عسل",
    "ru": "Апельсин, цедра цитрусов, мед"
  },
  "Qarpız, qırmızı meyvə, təzə bitki": {
    "en": "Watermelon, red fruits, fresh herbs",
    "ar": "بطيخ، فواكه حمراء، أعشاب طازجة",
    "ru": "Арбуз, красные фрукты, свежие травы"
  },
  "Ağ çiçək, təzə ot, yumşaq bal": {
    "en": "White floral, fresh grass, gentle honey",
    "ar": "زهور بيضاء، عشب طازج، عسل ناعم",
    "ru": "Белые цветы, свежая зелень, нежный мед"
  },
  "80–85°C · 3 dəqiqə": {
    "en": "80–85°C · 3 min",
    "ar": "80–85°م · 3 دقائق",
    "ru": "80–85°C · 3 мин"
  },
  "Təzə ot, yaşıl yarpaq, yüngül şirinlik": {
    "en": "Fresh grass, green leaves, subtle sweetness",
    "ar": "عشب طازج، أوراق خضراء، حلاوة خفيفة",
    "ru": "Свежая трава, зеленые листья, легкая сладость"
  },
  "75–80°C · 2–3 dəqiqə": {
    "en": "75–80°C · 2–3 min",
    "ar": "75–80°م · 2–3 دقائق",
    "ru": "75–80°C · 2–3 мин"
  },
  "Mango, tropik meyvə, yumşaq çiçək": {
    "en": "Mango, tropical fruit, gentle floral",
    "ar": "مانجو، فواكه استوائية، زهور ناعمة",
    "ru": "Манго, тропические фрукты, нежные цветы"
  },
  "80–85°C · 4–5 dəqiqə": {
    "en": "80–85°C · 4–5 min",
    "ar": "80–85°م · 4–5 دقائق",
    "ru": "80–85°C · 4–5 мин"
  },
  "Mango, yetişmiş meyvə, çiçək ləçəyi": {
    "en": "Mango, ripe fruits, floral petals",
    "ar": "مانجو، فواكه ناضجة، بتلات زهرية",
    "ru": "Манго, спелые фрукты, лепестки цветов"
  },
  "Malt, tünd bal, quru ağac": {
    "en": "Malt, dark honey, seasoned wood",
    "ar": "شعير، عسل داكن، خشب جاف",
    "ru": "Солод, темный мед, сухое дерево"
  },
  "Jasmin, qara çay, ağ çiçək": {
    "en": "Jasmine, black tea, white flowers",
    "ar": "ياسمين، شاي أسود، زهور بيضاء",
    "ru": "Жасмин, черный чай, белые цветы"
  },
  "90–95°C · 3 dəqiqə": {
    "en": "90–95°C · 3 min",
    "ar": "90–95°م · 3 دقائق",
    "ru": "90–95°C · 3 мин"
  },
  "Hibiskus, qırmızı giləmeyvə, sitrus": {
    "en": "Hibiscus, red berries, citrus",
    "ar": "كركديه، توت أحمر، حمضيات",
    "ru": "Гибискус, красные ягоды, цитрусы"
  },
  "Kataloqa bax": {
    "en": "View Catalog",
    "ar": "عرض الكتالوج",
    "ru": "Смотреть каталог"
  },
  "Kolleksiya": {
    "en": "Collection",
    "ar": "المجموعة",
    "ru": "Коллекция"
  },
  "Dadın açılması üçün suyu çayın xarakterinə uyğunlaşdırın.": {
    "en": "Adjust the water to the character of the tea to reveal its flavor.",
    "ar": "اضبط درجة حرارة الماء وفقاً لطبيعة الشاي لإبراز نكهته.",
    "ru": "Подбирайте температуру воды под характер чая для полного раскрытия вкуса."
  },
  "Yaşıl çay · çiçəkli": {
    "en": "Green tea · Floral",
    "ar": "شاي أخضر · زهري",
    "ru": "Зеленый чай · Цветочный"
  },
  "Qara çay · klassik": {
    "en": "Black tea · Classic",
    "ar": "شاي أسود · كلاسيكي",
    "ru": "Черный чай · Классический"
  },
  "95°C · 3–4 dəqiqə": {
    "en": "95°C · 3–4 min",
    "ar": "95°م · 3–4 دقائق",
    "ru": "95°C · 3–4 мин"
  },
  "95°C · 4–5 dəqiqə": {
    "en": "95°C · 4–5 min",
    "ar": "95°م · 4–5 دقائق",
    "ru": "95°C · 4–5 мин"
  },
  "Qiymət qeydi": {
    "en": "Price note",
    "ar": "ملاحظة السعر",
    "ru": "Примечание о цене"
  },
  "Yaşıl və tünd çay yarpaqlarının rəngli çiçək ləçəkləri və meyvə parçaları ilə birləşdiyi zərif qarışıqdır. İlk qurtumda təravətli yarpaq dadı, ardınca yumşaq çiçək ətri və meyvəli şirinlik hiss olunur. Orta gövdəli və uzun, ətirli bitişlidir.": {
    "en": "A delicate blend combining green and dark tea leaves with colorful floral petals and fruit pieces. An initial crisp note yields to soft floral fragrance and fruity sweetness with a fragrant finish.",
    "ar": "مزيج فاخر يجمع بين أوراق الشاي الأخضر والداكن مع بتلات الزهور الملونة وقطع الفواكه. يمنح مذاقاً منعشاً يعقبه عبير الأزهار وحلاوة الفواكه.",
    "ru": "Изысканный сбор зеленых и темных чайных листьев с яркими лепестками цветов и кусочками фруктов. С первого глотка раскрывается свежесть листьев, переходящая в нежный цветочный аромат и фруктовую сладость."
  },
  "Qara çayın güclü əsasını mavi və açıq rəngli çiçək ləçəkləri, eləcə də giləmeyvə toxunuşları yumşaldır. Dəmləndikdə dərin kəhrəba rəngi, aydın qara çay xarakteri və zərif meyvə ətri verir. Səhər və günorta üçün balanslı, ifadəli seçimdir.": {
    "en": "The robust base of black tea is softened by blue blossoms and hints of berry. Infuses into a deep amber liquor with distinct character and refined fruit scent.",
    "ar": "قاعدة قوية من الشاي الأسود تلطفها بتلات الزهور الزرقاء ولمسات التوت. يعطي لون عنبري عميق وعبق فاكهي راقٍ.",
    "ru": "Крепкую основу черного чая смягчают синие лепестки цветов и ягодные ноты. При заваривании дает глубокий янтарный настой, выразительный чайный характер и тонкий фруктовый аромат."
  },
  "Qara çay yarpaqları iri ağ və narıncı çiçəklərlə tamamlanır. Dolğun çay gövdəsinin içində yumşaq balabənzər şirinlik və zərif çiçək ətri açılır. Nə həddindən artıq sərt, nə də çox yüngüldür; rahat içimli, tarazlı profili var.": {
    "en": "Black tea leaves completed with broad white and orange blossoms. Within its full body unfolds gentle honey-like sweetness and delicate floral scent. Smooth and balanced.",
    "ar": "أوراق الشاي الأسود مع زهور بيضاء وبرتقالية كبيرة. تنكشف حلاوة عسلية ناعمة وعبير زهور رقيق ضمن قوام غني ومتوازن.",
    "ru": "Листья черного чая дополнены крупными белыми и оранжевыми цветами. В плотном настое раскрывается мягкая медовая сладость и утонченный цветочный аромат. Сбалансированный и мягкий вкус."
  },
  "İsti suda tədricən açılan yaşıl çay kürələri vizual dəmləmə ritualı yaradır. Yasəmənin təmiz çiçək ətri yaşıl çayın yüngül bitki tonları ilə birləşir. Aşağı temperaturda dəmləndikdə acılaşmadan yumşaq, təravətli və ipək kimi içim verir.": {
    "en": "Hand-crafted green tea pearls slowly unfurl in hot water, creating a mesmerizing visual ritual. Pure jasmine fragrance unites with light botanical notes for a silky, gentle cup.",
    "ar": "كرات الشاي الأخضر تتفتح تدريجياً في الماء الساخن في طقس ساحر. عطر الياسمين النقي يمتزج مع النغمات العشبية ليمنح مذاقاً حريرياً.",
    "ru": "Связанный шар зеленого чая медленно распускается в горячей воде, создавая завораживающий ритуал заваривания. Чистый аромат жасмина сочетается с легкими растительными тонами, даря шелковистый вкус."
  },
  "Qara çay, qurudulmuş limon dilimləri, sitrus qabığı və bitki ləçəklərinin canlı qarışığıdır. Parlaq limon ətri çayın dolğunluğunu yüngülləşdirir, sonda isə təmiz və azca turşməzə hiss buraxır. İsti olduğu kimi buzla da ifadəli qalır.": {
    "en": "A vivacious blend of black tea, dried lemon slices, citrus zest, and botanical petals. Bright lemon aroma uplifts the tea’s richness, leaving a clean, pleasantly tart finish. Exceptional hot or iced.",
    "ar": "مزيج حيوي من الشاي الأسود، شرائح الليمون المجفف، قشور الحمضيات والبتلات. عبير الليمون المشرق يمنح خفة وانتعاشاً ممتعاً.",
    "ru": "Яркий купаж черного чая, сушеных долек лимона, цитрусовой цедры и цветочных лепестков. Освежающий лимонный аромат придает легкость, оставляя приятную кислинку. Прекрасен как горячим, так и со льдом."
  },
  "Tünd çay yarpaqları, meyvə parçaları və açıq rəngli ləçəklərlə hazırlanmış ətirli qarışıqdır. Moruq xarakterli şirin-turş giləmeyvə dadı qara çayın dərinliyi ilə tarazlanır. Yumşaq şirinliyi və meyvəli bitişi desertlərlə yaxşı uyğunlaşır.": {
    "en": "An aromatic blend of dark tea leaves, real fruit pieces, and pastel petals. Sweet-tart raspberry balances the depth of black tea, pairing exquisitely with desserts.",
    "ar": "مزيج عطري من أوراق الشاي الداكن وقطع الفواكه. نكهة توت العليق الحلوة والحامضة تتوازن مع عمق الشاي الأسود، رائع مع الحلويات.",
    "ru": "Ароматный чай из темных листьев, кусочков фруктов и нежных лепестков. Кисло-сладкий малиновый вкус гармонирует с глубиной черного чая, великолепно сочетаясь с десертами."
  },
  "Qurudulmuş meyvələr, giləmeyvə və hibiskus tonlarının rəngli qarışığıdır. Çay yarpağından daha çox meyvə xarakteri önə çıxır: dolğun ətir, təbii turşuluq və kompotu xatırladan yumşaq şirinlik verir. Uzun dəmləmə dadı daha dərin edir.": {
    "en": "A colorful infusion of dried fruits, berries, and ruby hibiscus. Celebrates vibrant fruit richness with natural tang and gentle compote sweetness. Longer brewing deepens the experience.",
    "ar": "مزيج ملون من الفواكه المجففة والتوت والكركديه. عبير غني وحموضة طبيعية وحلاوة ناعمة تذكرك بالكومبوت اللذيذ.",
    "ru": "Красочная смесь сушеных фруктов, ягод и лепестков гибискуса. Насыщенный аромат, естественная кислинка и мягкая сладость домашнего компота без кофеина."
  },
  "Qara çay yarpaqlarını qırmızı meyvə parçaları və çiçək elementləri tamamlayır. Narın tanış şirin-turş xarakteri dəmləməyə parlaq ətir və canlı bitiş verir. Dolğun, lakin ağır olmayan profili həm tək, həm də az miqdarda bal ilə içmək üçün uyğundur.": {
    "en": "Black tea leaves complemented by ruby fruit pieces and floral notes. Pomegranate’s familiar sweet-tart flair brings bright aroma and crisp finish. Delightful pure or with honey.",
    "ar": "أوراق الشاي الأسود مكملة بقطع الفواكه الحمراء وعناصر الأزهار. طابع الرمان الحلو والحامض يضفي إشراقة وانتعاشاً رائعاً.",
    "ru": "Черный чай, дополненный кусочками красных фруктов и цветами. Знакомый кисло-сладкий характер граната дарит яркий аромат и бодрящее послевкусие."
  },
  "Qara çayın dərin dadı qurudulmuş portağal dilimləri, qabıq və sarı ləçəklərlə canlanır. Əvvəlcə şirin sitrus ətri, sonra isə yüngül qabıq acılığı və isti çay gövdəsi hiss olunur. Xüsusilə sərin havada ətirli və rahat içimli seçimdir.": {
    "en": "The deep flavor of black tea is enlivened by dried orange slices, zest, and golden petals. Sweet citrus aroma unfolds into warm, comforting body. A soothing choice in cool weather.",
    "ar": "نكهة الشاي الأسود العميقة تنتعش بشرائح البرتقال المجفف والقشور والبتلات الصفراء. عبير حمضي دافئ ومريح خاصة في الأجواء الباردة.",
    "ru": "Глубокий вкус черного чая оживлен сушеными дольками апельсина, цедрой и золотистыми лепестками. Согревающий и уютный напиток, особенно для прохладной погоды."
  },
  "Qara çay bazası qırmızı meyvə parçaları və yaşıl bitki elementləri ilə tamamlanır. Qarpızı xatırladan sulu, şirin ətir tünd yarpaq dadını daha yüngül göstərir. İsti dəmləndikdən sonra soyudulub buzla servis edildikdə meyvə xarakteri daha aydın duyulur.": {
    "en": "A black tea base combined with red fruit morsels and herbal botanicals. Juicy watermelon notes soften the bold leaves. Spectacular chilled over ice.",
    "ar": "قاعدة من الشاي الأسود مع قطع الفواكه الحمراء. نكهة البطيخ العصارية الحلوة تجعل الشاي منعشاً وممتعاً ساخناً أو مع الثلج.",
    "ru": "Основа из черного чая дополнена кусочками сочных красных фруктов. Сладкий арбузный аромат придает легкость, особенно ярко раскрываясь в холодном виде со льдом."
  },
  "Yaşıl çay yarpaqları ağ və sarı çiçək ləçəkləri ilə tamamlanan zərif, ətirli qarışıqdır. Dəmləndikdə təzə bitki xarakteri, yumşaq çiçək ətri və yüngül təbii şirinlik açılır. Aşağı temperaturda hazırlandıqda təmiz, incə və acılaşmayan içim verir.": {
    "en": "Delicate green tea leaves crowned with white and yellow flower petals. Brews with fresh herbal character, soft blossom aroma, and gentle natural sweetness without bitterness.",
    "ar": "أوراق الشاي الأخضر ممزوجة ببتلات الأزهار البيضاء والصفراء. تنبعث منها نغمات عشبية طازجة وعبير أزهار ناعم وحلاوة طبيعية.",
    "ru": "Нежные листья зеленого чая с белыми и желтыми лепестками. Раскрывается свежим травяным характером, мягким ароматом цветов и естественной сладостью без горечи."
  },
  "Təmiz yarpaq xarakterini ön plana çıxaran gündəlik yaşıl çaydır. Yumşaq bitki ətri, yüngül mineral hiss və təravətli bitiş verir. Qaynar olmayan su ilə qısa dəmləndikdə yarpağın təbii şirinliyi qorunur və sərtlik yaranmır.": {
    "en": "A pure everyday green tea honoring natural leaf integrity. Delivers gentle vegetal aroma, light minerality, and a crisp, refreshing finish.",
    "ar": "شاي أخضر يومي نقي يبرز طابع الأوراق الطبيعي. عبير عشبي لطيف ونهاية منعشة ونظيفة.",
    "ru": "Классический повседневный зеленый чай из отборного листа. Мягкий травянистый аромат, легкая минеральность и освежающее чистое послевкусие."
  },
  "Əl ilə bağlanmış çay kürəsi isti suda tədricən açılaraq həm vizual, həm də ətirli dəmləmə təcrübəsi yaradır. Yaşıl çayın yumşaq bitki tonları tropik meyvəni xatırladan şirin ətirlə birləşir. Şüşə dəmlikdə servis üçün xüsusilə uyğundur.": {
    "en": "A hand-tied tea globe unfurls slowly in hot water for a captivating visual and aromatic experience. Tender green tea tones merge with sweet mango aromas. Ideal for glass teapots.",
    "ar": "كرة شاي مصنوعة يدوياً تتفتح ببطء في الماء الساخن لتقديم تجربة بصرية وعطرية مميزة. نغمات الشاي الأخضر تمتزج بحلاوة المانجو الاستوائية.",
    "ru": "Связанный вручную чайный шар медленно распускается в горячей воде, создавая красивое зрелище. Тонкий зеленый чай соединяется с тропической сладостью спелого манго."
  },
  "Qara çay yarpaqları meyvə parçaları və rəngli ləçəklərlə zənginləşdirilmiş aromatik qarışıqdır. Manqonu xatırladan şirin, yetişmiş meyvə ətri qara çayın dolğun gövdəsini yumşaldır. İsti servisə də, soyudulub buzla içilməyə də uyğundur.": {
    "en": "Fragrant black tea leaves enriched with dried fruit and colorful petals. Ripe, luscious mango notes soften the robust body. Wonderful served hot or iced.",
    "ar": "شاي أسود عطري معزز بقطع الفواكه والبتلات الملونة. عبير المانجو الناضج يلطف قوام الشاي الغني، رائع ساخناً أو مثلجاً.",
    "ru": "Ароматный черный чай с кусочками фруктов и яркими лепестками. Сладкий аромат спелого манго смягчает терпкость чая, вкусен как горячим, так и охлажденным."
  },
  "Saf yarpaq xarakterli, dolğun və aydın dəmlənən klassik qara çaydır. Kəhrəba rəngi, isti malt çalarları və uzun, təmiz bitişi ilə səhər süfrəsi və gündəlik çay fasilələri üçün rahat seçimdir. İstəyə görə limon və ya az miqdarda südlə servis edilə bilər.": {
    "en": "A pure, full-bodied classic black tea. Glowing amber liquor, warm malt tones, and a lingering, clean finish make it a comforting morning and teatime staple.",
    "ar": "شاي أسود كلاسيكي نقي وكامل القوام. لون عنبري، نغمات شعير دافئة، ونهاية نظيفة تجعله الخيار المثالي لصباحك واستراحاتك.",
    "ru": "Классический чистый черный чай с плотным настоем янтарного цвета, теплыми солодовыми оттенками и долгим послевкусием. Прекрасно гармонирует с лимоном или молоком."
  },
  "Tünd çay yarpaqları jasmin çiçəklərinin parlaq, təmiz ətri ilə birləşir. Qara çayın dolğunluğu çiçəkli aromanı daşıyır, jasmin isə bitişə zəriflik və təravət əlavə edir. Klassik qara çaydan daha ətirli, yaşıl jasmin çayından isə daha gövdəlidir.": {
    "en": "Dark tea leaves infused with bright, fresh jasmine blossoms. The body carries the floral scent, adding elegance and freshness to the finish.",
    "ar": "أوراق الشاي الداكن مع أزهار الياسمين المنعشة. يحمل عمق الشاي عبير الأزهار ليضيف لمسة أنيقة ومنعشة على الخاتمة.",
    "ru": "Темные чайные листья с ярким, чистым ароматом цветков жасмина. Плотное тело чая передает цветочный букет, добавляя благородство и свежесть."
  },
  "Hibiskus ləçəkləri və meyvə parçalarından ibarət kofeinsiz, canlı rəngli infuziyadır. Parlaq turşuluq, qırmızı meyvə xarakteri və təmiz bitiş verir. İsti içildikdə dolğun və rahat, buzla servis edildikdə isə xüsusilə təravətli olur.": {
    "en": "A caffeine-free, brightly colored infusion of hibiscus petals and dried fruits. Delivers crisp tartness, red berry notes, and an invigorating finish hot or iced.",
    "ar": "منقوع ملون خالٍ من الكافيين من بتلات الكركديه وقطع الفواكه. حموضة منعشة وطابع فواكه حمراء ونهاية منشطة، ساخناً أو مثلجاً.",
    "ru": "Бескофеиновый ярко-рубиновый настой из лепестков суданской розы и сушеных ягод. Освежающая кислинка и сочный фруктовый вкус."
  },
  "French Press": {
    "en": "French Press",
    "ar": "فرنش بريس",
    "ru": "Френч-пресс"
  },
  "Taxta əl dəyirmanı": {
    "en": "Wooden Manual Grinder",
    "ar": "مطحنة يدوية خشبية",
    "ru": "Деревянная ручная кофемолка"
  },
  "Əl dəyirmanı": {
    "en": "Manual Grinder",
    "ar": "مطحنة يدوية",
    "ru": "Ручная кофемолка"
  },
  "Naxışlı əl dəyirmanı": {
    "en": "Ornate Manual Grinder",
    "ar": "مطحنة يدوية منقوشة",
    "ru": "Узорная ручная кофемолка"
  },
  "Paslanmayan Moka Pot": {
    "en": "Stainless Moka Pot",
    "ar": "موكا بوت ستانلس ستيل",
    "ru": "Гейзерная кофеварка из стали"
  },
  "Moka Pot": {
    "en": "Moka Pot",
    "ar": "موكا بوت",
    "ru": "Гейзерная кофеварка (Moka Pot)"
  },
  "Klassik Moka Pot · Boz": {
    "en": "Classic Moka Pot · Gray",
    "ar": "موكا بوت كلاسيكي · رمادي",
    "ru": "Классическая гейзерная кофеварка · Серая"
  },
  "Naxışlı cezvə": {
    "en": "Ornate Cezve (Ibrik)",
    "ar": "ركوة قهوة منقوشة",
    "ru": "Узорная джезва (турка)"
  },
  "Gooseneck çaydan": {
    "en": "Gooseneck Kettle",
    "ar": "إبريق عنق الإوزة",
    "ru": "Чайник с гусиным носиком"
  },
  "Dekorativ Dallah": {
    "en": "Decorative Dallah",
    "ar": "دلة عربية مزخرفة",
    "ru": "Декоративная далла"
  },
  "Naxışlı Dallah": {
    "en": "Ornate Dallah",
    "ar": "دلة قهوة منقوشة",
    "ru": "Узорная далла"
  },
  "Naxışlı Dallah · Gümüşü": {
    "en": "Ornate Dallah · Silver",
    "ar": "دلة منقوشة · فضي",
    "ru": "Узорная далла · Серебристая"
  },
  "Manual Press": {
    "en": "Manual Press",
    "ar": "مكبس يدوي",
    "ru": "Ручной пресс"
  },
  "Çarxlı əl dəyirmanı": {
    "en": "Wheel Manual Grinder",
    "ar": "مطحنة يدوية بعجلة",
    "ru": "Колесовая ручная кофемолка"
  },
  "Şüşə server · 400 ml": {
    "en": "Glass Server · 400 ml",
    "ar": "سيرفر زجاجي · 400 مل",
    "ru": "Стеклянный сервер · 400 мл"
  },
  "Azərbaycan qəhvə dəsti": {
    "en": "Azerbaijan Coffee Set",
    "ar": "طقم قهوة أذربيجاني",
    "ru": "Азербайджанский кофейный набор"
  },
  "Azərbaycan qəhvə dəsti · Bürünc": {
    "en": "Azerbaijan Coffee Set · Bronze",
    "ar": "طقم قهوة أذربيجاني · برونزي",
    "ru": "Азербайджанский кофейный набор · Бронза"
  },
  "Azərbaycan qəhvə dəsti · Gümüşü": {
    "en": "Azerbaijan Coffee Set · Silver",
    "ar": "طقم قهوة أذربيجاني · فضي",
    "ru": "Азербайджанский кофейный набор · Серебро"
  },
  "Espresso tamper": {
    "en": "Espresso Tamper",
    "ar": "مكبس إسبريسو",
    "ru": "Темпер для эспрессо"
  },
  "Espresso tamper · Taxta": {
    "en": "Espresso Tamper · Wood",
    "ar": "مكبس إسبريسو · خشب",
    "ru": "Темпер для эспрессо · Дерево"
  },
  "Espresso tamper · Gümüşü": {
    "en": "Espresso Tamper · Silver",
    "ar": "مكبس إسبريسو · فضي",
    "ru": "Темпер для эспрессо · Серебро"
  },
  "Espresso tamper · Qara": {
    "en": "Espresso Tamper · Black",
    "ar": "مكبس إسبريسو · أسود",
    "ru": "Темпер для эспрессо · Черный"
  },
  "Şərq üslublu servis dəsti": {
    "en": "Oriental Serving Set",
    "ar": "طقم تقديم شرقي",
    "ru": "Восточный сервировочный набор"
  },
  "Test": {
    "en": "Test Item",
    "ar": "عنصر تجريبي",
    "ru": "Тестовый товар"
  },
  "Sadə, dolğun və rahat dəmləmə üçün klassik pres.": {
    "en": "A classic press for simple, rich, and comforting brewing.",
    "ar": "مكبس كلاسيكي لتحضير قهوة بسيطة وغنية ومريحة.",
    "ru": "Классический пресс для простого, насыщенного и комфортного заваривания."
  },
  "350 ml, 600 ml və 850 ml ölçülərdə sadə və dolğun dəmləmə üçün klassik pres.": {
    "en": "A classic press available in 350ml, 600ml, and 850ml for rich brewing.",
    "ar": "مكبس كلاسيكي بأحجام 350 و600 و850 مل لتحضير غني ومريح.",
    "ru": "Классический пресс в объемах 350, 600 и 850 мл для насыщенного кофе."
  },
  "Klassik görünüşlü, mexaniki üyütmə üçün əl dəyirmanı.": {
    "en": "Classic aesthetic manual coffee grinder for precise mechanical milling.",
    "ar": "مطحنة قهوة يدوية بمظهر كلاسيكي وطحن ميكانيكي دقيق.",
    "ru": "Ручная кофемолка в классическом дизайне для точного механического помола."
  },
  "Bürünc naxışlı gövdə və mexaniki üyütmə sistemi ilə klassik əl dəyirmanı.": {
    "en": "Classic manual grinder featuring an ornate bronze body and mechanical burr.",
    "ar": "مطحنة يدوية كلاسيكية بهيكل برونزي منقوش ونظام طحن ميكانيكي.",
    "ru": "Классическая ручная кофемолка с узорным бронзовым корпусом и надежными жерновами."
  },
  "Ocaq üzərində güclü və aromatik qəhvə hazırlamaq üçün.": {
    "en": "Stovetop brewer for crafting bold, aromatic coffee with rich crema.",
    "ar": "لتحضير قهوة غنية وعطرية على الموقد.",
    "ru": "Для приготовления крепкого и ароматного кофе на плите."
  },
  "Ocaq üzərində güclü və aromatik qəhvə hazırlamaq üçün klassik dəmləyici.": {
    "en": "Classic stovetop brewer for crafting rich, aromatic coffee.",
    "ar": "أداة تحضير كلاسيكية على الموقد لقهوة قوية وعطرية.",
    "ru": "Классическая кофеварка для приготовления насыщенного кофе на плите."
  },
  "Ocaq üzərində zəngin qəhvə hazırlamaq üçün klassik dəmləyici.": {
    "en": "Classic stovetop brewer for preparing rich, full-bodied coffee.",
    "ar": "أداة كلاسيكية لتحضير قهوة غنية على الموقد.",
    "ru": "Кофеварка для приготовления богатого по вкусу кофе на плите."
  },
  "Türk qəhvəsini ənənəvi üsulla hazırlamaq üçün cezvə.": {
    "en": "Traditional pot (ibrik) for authentic Turkish coffee brewing.",
    "ar": "ركوة تقليدية لتحضير القهوة التركية الأصيلة.",
    "ru": "Джезва (турка) для традиционного приготовления кофе по-восточному."
  },
  "V60 və filtr qəhvə üçün su axınını dəqiq idarə edir.": {
    "en": "Precision gooseneck spout for controlled water pour in V60 and drip coffee.",
    "ar": "عنق إوزة يتيح تحكماً دقيقاً في تدفق الماء لتحضير V60 والفلتر.",
    "ru": "Точный контроль струи воды для заваривания V60 и фильтр-кофе."
  },
  "Qəhvə təqdimatına ənənəvi və zərif görünüş verən qəhvədan.": {
    "en": "Traditional elegant coffee pot adding cultural sophistication to coffee presentation.",
    "ar": "دلة قهوة تقليدية تمنح تقديم القهوة مظهراً راقياً وأنيقاً.",
    "ru": "Традиционный кофейник, придающий подаче кофе изысканный колорит."
  },
  "Sürətli dəmləmə və rahat daşınma üçün yığcam əl presi.": {
    "en": "Compact manual coffee press for quick brewing and travel convenience.",
    "ar": "مكبس يدوي مدمج لتحضير سريع وسهولة الحمل أثناء السفر.",
    "ru": "Компактный ручной пресс для быстрого заваривания дома и в поездках."
  },
  "Möhkəm metal gövdəli, klassik çarx mexanizmi ilə.": {
    "en": "Sturdy metal construction featuring a vintage mechanical hand wheel.",
    "ar": "هيكل معدني متين مع آلية عجلة كلاسيكية أنيقة.",
    "ru": "Прочный металлический корпус с элегантным колесным механизмом."
  },
  "Filtr qəhvəni dəmləmək və səliqəli təqdim etmək üçün.": {
    "en": "Heat-resistant glass server for brewing and elegantly serving filter coffee.",
    "ar": "سيرفر زجاجي لتحضير وتقديم القهوة المفلترة بأناقة.",
    "ru": "Стеклянный сервер для заваривания и красивой подачи фильтр-кофе."
  },
  "Cezvə, iki fincan və servis detalları ilə hədiyyə dəsti.": {
    "en": "Gift set complete with cezve, two cups, and serving accessories.",
    "ar": "طقم هدايا مميز يشمل ركوة، فنجانين وإكسسوارات التقديم.",
    "ru": "Подарочный набор с джезвой, двумя чашками и сервировочными деталями."
  },
  "Cezvə, iki fincan və servis detalları ilə zərif hədiyyə dəsti.": {
    "en": "Elegant gift set featuring cezve, two cups, and exquisite serving details.",
    "ar": "طقم هدايا فاخر يضم ركوة وفنجانين وتفاصيل تقديم أنيقة.",
    "ru": "Изысканный подарочный набор: турка, две чашки и восточный поднос."
  },
  "Ənənəvi qəhvə servisi üçün incə naxışlı qəhvədan.": {
    "en": "Finely engraved traditional dallah coffee pot for authentic service.",
    "ar": "دلة قهوة منقوشة بعناية لتقديم القهوة التقليدية.",
    "ru": "Тонко гравированный традиционный кофейник далла для аутентичной подачи."
  },
  "Qəhvəni portafilterdə bərabər sıxmaq üçün rahat tamper.": {
    "en": "Ergonomic tamper for even coffee tamping across the portafilter.",
    "ar": "مكبس مريح لكبس القهوة بالتساوي في حامل الفلتر.",
    "ru": "Удобный темпер для равномерной трамбовки кофе в портафильтре."
  },
  "Qəhvəni portafilterdə bərabər sıxmaq üçün möhkəm və rahat tamper.": {
    "en": "Solid and ergonomic tamper for consistent coffee bed compression.",
    "ar": "مكبس صلب ومريح لضغط القهوة بشكل متساوٍ في البورتافلتر.",
    "ru": "Прочный и эргономичный темпер для идеальной кофейной таблетки."
  },
  "Sabit təzyiq və bərabər espresso yatağı üçün metal tamper.": {
    "en": "All-metal precision tamper ensuring consistent pressure and even extraction.",
    "ar": "مكبس معدني لضغط ثابت واستخلاص إسبريسو متوازن ومثالي.",
    "ru": "Цельнометаллический темпер для стабильного давления и равномерной экстракции."
  },
  "Gündəlik espresso hazırlığı üçün möhkəm və yığcam tamper.": {
    "en": "Durable, compact tamper crafted for daily espresso preparation.",
    "ar": "مكبس متين ومدمج لإعداد الإسبريسو اليومي باحترافية.",
    "ru": "Надежный и компактный темпер для ежедневного приготовления эспрессо."
  },
  "İki fincan, şəkər qabı və naxışlı altlıqdan ibarət dəst.": {
    "en": "Set consisting of two cups, sugar bowl, and an ornate serving tray.",
    "ar": "طقم مكون من فنجانين، وعاء سكر وصينية تقديم منقوشة.",
    "ru": "Сервиз из двух чашек, сахарницы и восточного узорного подноса."
  },
  "Naxışlı fincanlar, şəkər qabı və altlıqdan ibarət servis dəsti.": {
    "en": "Serving set comprising engraved cups, sugar bowl, and serving tray.",
    "ar": "طقم تقديم راقٍ يشتمل على فناجين منقوشة ووعاء سكر وصينية.",
    "ru": "Набор из узорных чашек, сахарницы и подноса для чаепития и кофе."
  },
  "Sınaq və yoxlama üçün test avadanlığı.": {
    "en": "Test equipment for trial and quality verification.",
    "ar": "معدات اختبار للفحص والتجربة.",
    "ru": "Оборудование для проверки и тестирования."
  },
  "600 ml": {
    "en": "600 ml",
    "ar": "600 مل",
    "ru": "600 мл"
  },
  "350 ml": {
    "en": "350 ml",
    "ar": "350 مل",
    "ru": "350 мл"
  },
  "850 ml": {
    "en": "850 ml",
    "ar": "850 مل",
    "ru": "850 мл"
  },
  "Klassik taxta": {
    "en": "Classic Wood",
    "ar": "خشب كلاسيكي",
    "ru": "Классическое дерево"
  },
  "Naxışlı bürünc": {
    "en": "Ornate Bronze",
    "ar": "برونز منقوش",
    "ru": "Узорная бронза"
  },
  "Polad": {
    "en": "Steel",
    "ar": "ستانلس ستيل",
    "ru": "Сталь"
  },
  "Boz": {
    "en": "Gray",
    "ar": "رمادي",
    "ru": "Серый"
  },
  "Klassik naxışlı": {
    "en": "Classic Ornate",
    "ar": "نقش كلاسيكي",
    "ru": "Классический узор"
  },
  "Sadə bürünc": {
    "en": "Plain Bronze",
    "ar": "برونز سادة",
    "ru": "Простая бронза"
  },
  "Yivli bürünc": {
    "en": "Fluted Bronze",
    "ar": "برونز مضلع",
    "ru": "Рифленая бронза"
  },
  "Qapaqlı bürünc": {
    "en": "Lidded Bronze",
    "ar": "برونز بغطاء",
    "ru": "Бронза с крышкой"
  },
  "Yaşıl daşlı": {
    "en": "Green Inset",
    "ar": "مرصع بحجر أخضر",
    "ru": "С зеленым камнем"
  },
  "Gümüşü": {
    "en": "Silver",
    "ar": "فضي",
    "ru": "Серебристый"
  },
  "Qara": {
    "en": "Black",
    "ar": "أسود",
    "ru": "Черный"
  },
  "Bürünc": {
    "en": "Bronze",
    "ar": "برونزي",
    "ru": "Бронзовый"
  },
  "Şüşə": {
    "en": "Glass",
    "ar": "زجاجي",
    "ru": "Стекло"
  },
  "Taxta": {
    "en": "Wood",
    "ar": "خشبي",
    "ru": "Дерево"
  },
  "6 fincanlı": {
    "en": "6 cups",
    "ar": "6 فناجين",
    "ru": "На 6 чашек"
  },
  "2 fincanlı": {
    "en": "2 cups",
    "ar": "فنجانين",
    "ru": "На 2 чашки"
  },
  "Standart": {
    "en": "Standard",
    "ar": "قياسي",
    "ru": "Стандартный"
  },
  "Önə çıxanlar": {
    "en": "Featured",
    "ar": "المميزة",
    "ru": "Рекомендуемые"
  },
  "Ucuzdan bahaya": {
    "en": "Price: Low to High",
    "ar": "السعر: من الأقل للأعلى",
    "ru": "Сначала дешевле"
  },
  "Bahadan ucuza": {
    "en": "Price: High to Low",
    "ar": "السعر: من الأعلى للأقل",
    "ru": "Сначала дороже"
  },
  "Ən yeni": {
    "en": "Newest",
    "ar": "الأحدث",
    "ru": "Сначала новые"
  },
  "Ən köhnə": {
    "en": "Oldest",
    "ar": "الأقدم",
    "ru": "Сначала старые"
  },
  "Ada görə A–Z": {
    "en": "Name: A–Z",
    "ar": "الاسم: أ–ي",
    "ru": "По названию А–Я"
  },
  "Sırala": {
    "en": "Sort by",
    "ar": "ترتيب حسب",
    "ru": "Сортировка"
  },
  "13 məhsul · 24 seçim": {
    "en": "13 products · 24 options",
    "ar": "13 منتج · 24 خيار",
    "ru": "13 товаров · 24 выбора"
  },
  "Evdə və peşəkar istifadə üçün dəmləyicilər, dəyirmanlar və servis aksesuarları.": {
    "en": "Brewers, grinders, and service accessories for home and professional use.",
    "ar": "أدوات تحضير، مطاحن، وإكسسوارات تقديم للاستخدام المنزلي والمهني.",
    "ru": "Кофеварки, кофемолки и аксессуары для домашнего и профессионального использования."
  },
  "01 · Ana menyu": {
    "en": "01 · Main Menu",
    "ar": "01 · القائمة الرئيسية",
    "ru": "01 · Главное меню"
  },
  "Qiymətlər AZN ilə göstərilib.": {
    "en": "Prices shown in AZN.",
    "ar": "الأسعار موضحة بالمانات.",
    "ru": "Цены указаны в AZN."
  },
  "02 · Mövsümi kolleksiya": {
    "en": "02 · Seasonal Collection",
    "ar": "02 · تشكيلة موسمية",
    "ru": "02 · Сезонная коллекция"
  },
  "Summer Escape": {
    "en": "Summer Escape",
    "ar": "ملاذ الصيف",
    "ru": "Summer Escape"
  },
  "Soyuq qəhvə yaradımları və təravətli limonadlar.": {
    "en": "Cold coffee creations and refreshing lemonades.",
    "ar": "إبداعات القهوة الباردة والليموناضة المنعشة.",
    "ru": "Освежающие холодные кофейные напитки и лимонады."
  },
  "Coffee Creations": {
    "en": "Coffee Creations",
    "ar": "إبداعات القهوة",
    "ru": "Coffee Creations"
  },
  "Refreshing Lemonades": {
    "en": "Refreshing Lemonades",
    "ar": "ليموناضة منعشة",
    "ru": "Освежающие лимонады"
  },
  "03 · Desert menyusu": {
    "en": "03 · Dessert Menu",
    "ar": "03 · قائمة الحلويات",
    "ru": "03 · Меню десертов"
  },
  "Təzə bişirilmiş şirniyyatlar · Qiymətlər AZN ilə göstərilib.": {
    "en": "Freshly baked sweets · Prices shown in AZN.",
    "ar": "حلويات طازجة · الأسعار موضحة بالمانات.",
    "ru": "Свежая домашняя выпечка · Цены указаны в AZN."
  },
  "Espresso": {
    "en": "Espresso",
    "ar": "إسبريسو",
    "ru": "Эспрессо"
  },
  "Americano": {
    "en": "Americano",
    "ar": "أمريكانو",
    "ru": "Американо"
  },
  "Südlü qəhvələr": {
    "en": "Milk Coffee",
    "ar": "قهوة بالحليب",
    "ru": "Кофе с молоком"
  },
  "Soyuq içkilər": {
    "en": "Cold Drinks",
    "ar": "مشروبات باردة",
    "ru": "Холодные напитки"
  },
  "Alternativlər": {
    "en": "Alternatives",
    "ar": "خيارات بديلة",
    "ru": "Альтернатива"
  },
  "Əlavələr": {
    "en": "Add-ons",
    "ar": "إضافات",
    "ru": "Добавки"
  },
  "Desertlər": {
    "en": "Desserts",
    "ar": "الحلويات",
    "ru": "Десерты"
  },
  "Espresso (Single)": {
    "en": "Espresso (Single)",
    "ar": "إسبريسو (مفرد)",
    "ru": "Эспрессо (одинарный)"
  },
  "Espresso (Double)": {
    "en": "Espresso (Double)",
    "ar": "إسبريسو (مزدوج)",
    "ru": "Эспрессо (двойной)"
  },
  "Triple Joy": {
    "en": "Triple Joy",
    "ar": "تريبل جوي",
    "ru": "Трипл Джой"
  },
  "Americano (S / M / L)": {
    "en": "Americano (S / M / L)",
    "ar": "أمريكانو (صغير / وسط / كبير)",
    "ru": "Американо (S / M / L)"
  },
  "Latte (S / M / L)": {
    "en": "Latte (S / M / L)",
    "ar": "لاتيه (صغير / وسط / كبير)",
    "ru": "Латте (S / M / L)"
  },
  "Espresso Macchiato": {
    "en": "Espresso Macchiato",
    "ar": "إسبريسو ماكياتو",
    "ru": "Эспрессо макиато"
  },
  "Caramel Macchiato (S / M / L)": {
    "en": "Caramel Macchiato (S / M / L)",
    "ar": "كراميل ماكياتو (صغير / وسط / كبير)",
    "ru": "Карамельный макиато (S / M / L)"
  },
  "Cappuccino (S / M / L)": {
    "en": "Cappuccino (S / M / L)",
    "ar": "كابتشينو (صغير / وسط / كبير)",
    "ru": "Капучино (S / M / L)"
  },
  "Flat White (S / M)": {
    "en": "Flat White (S / M)",
    "ar": "فلات وايت (صغير / وسط)",
    "ru": "Флэт Уайт (S / M)"
  },
  "Mocha (S / M)": {
    "en": "Mocha (S / M)",
    "ar": "موكا (صغير / وسط)",
    "ru": "Мокка (S / M)"
  },
  "Cortado (M)": {
    "en": "Cortado (M)",
    "ar": "كورتادو (وسط)",
    "ru": "Кортадо (M)"
  },
  "Raff Coffee (S / M)": {
    "en": "Raff Coffee (S / M)",
    "ar": "قهوة راف (صغير / وسط)",
    "ru": "Раф кофе (S / M)"
  },
  "Spanish Latte (S / M / L)": {
    "en": "Spanish Latte (S / M / L)",
    "ar": "سبانش لاتيه (صغير / وسط / كبير)",
    "ru": "Испанский латте (S / M / L)"
  },
  "Spanish Cortado (M)": {
    "en": "Spanish Cortado (M)",
    "ar": "سبانش كورتادو (وسط)",
    "ru": "Испанский кортадо (M)"
  },
  "Ice Latte (L)": {
    "en": "Ice Latte (L)",
    "ar": "آيس لاتيه (كبير)",
    "ru": "Айс латте (L)"
  },
  "Ice Americano (L)": {
    "en": "Ice Americano (L)",
    "ar": "آيس أمريكانو (كبير)",
    "ru": "Айс американо (L)"
  },
  "Cold Brew (M)": {
    "en": "Cold Brew (M)",
    "ar": "كولد برو (وسط)",
    "ru": "Колд брю (M)"
  },
  "Türk qəhvəsi": {
    "en": "Turkish Coffee",
    "ar": "قهوة تركية",
    "ru": "Кофе по-турецки"
  },
  "İsti şokolad": {
    "en": "Hot Chocolate",
    "ar": "شوكولاتة ساخنة",
    "ru": "Горячий шоколад"
  },
  "İsti şokolad (Marshmello)": {
    "en": "Hot Chocolate (Marshmallow)",
    "ar": "شوكولاتة ساخنة (مارشميلو)",
    "ru": "Горячий шоколад (с маршмеллоу)"
  },
  "Filtr coffee (V60)": {
    "en": "Filter Coffee (V60)",
    "ar": "قهوة فلتر (V60)",
    "ru": "Фильтр-кофе (V60)"
  },
  "Baku Coffee Factory Special": {
    "en": "Baku Coffee Factory Special",
    "ar": "باكو كوفي فاكتوري سبيشال",
    "ru": "Baku Coffee Factory Спешл"
  },
  "Chai Tea Latte (S / M)": {
    "en": "Chai Tea Latte (S / M)",
    "ar": "شاي لاتيه تشاي (صغير / وسط)",
    "ru": "Чай латте Масала (S / M)"
  },
  "Çay / Yaşıl çay (600 ml)": {
    "en": "Tea / Green Tea (600 ml)",
    "ar": "شاي / شاي أخضر (600 مل)",
    "ru": "Чай / Зеленый чай (600 мл)"
  },
  "Çay / Yaşıl çay (250 ml)": {
    "en": "Tea / Green Tea (250 ml)",
    "ar": "شاي / شاي أخضر (250 مل)",
    "ru": "Чай / Зеленый чай (250 мл)"
  },
  "Lactose Free Milk": {
    "en": "Lactose Free Milk",
    "ar": "حليب خالي من اللاكتوز",
    "ru": "Безлактозное молоко"
  },
  "Sirop": {
    "en": "Syrup",
    "ar": "سيروب",
    "ru": "Сироп"
  },
  "Darçın": {
    "en": "Cinnamon",
    "ar": "قرفة",
    "ru": "Корица"
  },
  "Şirab": {
    "en": "Sirab Sparkling Water",
    "ar": "مياه سيراب",
    "ru": "Минеральная вода Sirab"
  },
  "Extra Order": {
    "en": "Extra Shot / Order",
    "ar": "طلب إضافي",
    "ru": "Дополнительный шот"
  },
  "Bumble Coffee": {
    "en": "Bumble Coffee",
    "ar": "بمبل كوفي",
    "ru": "Бамбл кофе"
  },
  "Espresso Tropical": {
    "en": "Espresso Tropical",
    "ar": "إسبريسو استوائي",
    "ru": "Эспрессо Тропикал"
  },
  "Espresso Flower": {
    "en": "Espresso Flower",
    "ar": "إسبريسو فلاور",
    "ru": "Эспрессо Флауэр"
  },
  "Orange Chocolate": {
    "en": "Orange Chocolate",
    "ar": "شوكولاتة بالبرتقال",
    "ru": "Оранж Чоколат"
  },
  "Mojito": {
    "en": "Mojito",
    "ar": "موهيتو",
    "ru": "Мохито"
  },
  "Strawberry Lemonade": {
    "en": "Strawberry Lemonade",
    "ar": "ليموناضة الفراولة",
    "ru": "Клубничный лимонад"
  },
  "Mango Maracuya": {
    "en": "Mango Passionfruit",
    "ar": "مانجو ماراكوجا",
    "ru": "Манго-маракуйя"
  },
  "Blu Curaçao": {
    "en": "Blue Curaçao",
    "ar": "بلو كوراساو",
    "ru": "Блю Кюрасао"
  },
  "San Sebastian": {
    "en": "San Sebastian Cheesecake",
    "ar": "سان سباستيان تشيز كيك",
    "ru": "Чизкейк Сан-Себастьян"
  },
  "San Sebastian Brownie": {
    "en": "San Sebastian Brownie",
    "ar": "سان سباستيان براوني",
    "ru": "Сан-Себастьян Брауни"
  },
  "Ballı tort": {
    "en": "Honey Cake (Medovik)",
    "ar": "كيكة العسل (ميدوفيك)",
    "ru": "Медовик"
  },
  "Napoleon": {
    "en": "Napoleon Cake",
    "ar": "كيكة نابليون",
    "ru": "Наполеон"
  },
  "Tiramisu": {
    "en": "Tiramisu",
    "ar": "تيراميسو",
    "ru": "Тирамису"
  },
  "Carrot cake": {
    "en": "Carrot Cake",
    "ar": "كيكة الجزر",
    "ru": "Морковный торт"
  },
  "Crepe Lotus": {
    "en": "Lotus Crepe",
    "ar": "كريب لوتس",
    "ru": "Креп Лотус"
  },
  "Qiymət təsdiqlənəcək": {
    "en": "Price to be confirmed",
    "ar": "السعر قيد التأكيد",
    "ru": "Цена уточняется"
  },
  "Sifariş sorğusuna əlavə et": {
    "en": "Add to order request",
    "ar": "إضافة إلى طلب الشراء",
    "ru": "Добавить в заявку"
  },
  "Çay kolleksiyası": {
    "en": "Tea collection",
    "ar": "مجموعة الشاي",
    "ru": "Чайная коллекция"
  },
  "Yumşaq şirinliyi, canlı meyvə xarakteri və kakaolu bitişi ilə balanslı gündəlik qəhvə.": {
    "en": "Balanced everyday coffee with soft sweetness, lively fruit character, and a cocoa finish.",
    "ar": "قهوة يومية متوازنة مع حلاوة ناعمة وطابع فاكهي حيوي ونهاية بنكهة الكاكاو.",
    "ru": "Сбалансированный кофе на каждый день с мягкой сладостью, ярким фруктовым характером и нотками какао."
  },
  "Dərin, klassik və şokoladlı gövdəsi olan çox yönlü qəhvə.": {
    "en": "Versatile coffee with a deep, classic, and chocolatey body.",
    "ar": "قهوة متعددة الاستخدامات بقوام عميق وكلاسيكي ونكهة شوكولاتة غنية.",
    "ru": "Универсальный кофе с глубоким, классическим и выразительным шоколадным телом."
  },
  "Aşağı turşuluqlu, kremli və şokoladlı espresso profili.": {
    "en": "Low-acidity, creamy, and chocolatey espresso profile.",
    "ar": "ملف إسبريسو منخفض الحموضة، كريمي وغني بالشوكولاتة.",
    "ru": "Кремовый шоколадный эспрессо-профиль с низкой кислотностью."
  },
  "Meyvə təravəti və kakaolu rahatlığı birləşdirən canlı profil.": {
    "en": "Lively profile uniting fresh fruitiness with cocoa comfort.",
    "ar": "ملف حيوي يجمع بين انتعاش الفواكه ودفء الكاكاو المريح.",
    "ru": "Яркий профиль, сочетающий свежесть фруктов с теплом и уютом какао."
  },
  "Güclü, intensiv və dolğun içim üçün seçilən qəhvə.": {
    "en": "Selected coffee for a strong, intense, and full-bodied cup.",
    "ar": "قهوة مختارة لمن يبحث عن مذاق قوي ومكثف وقوام غني.",
    "ru": "Отборный кофе для крепкого, насыщенного и полнотелого вкуса."
  },
  "Parlaq turşuluq və balabənzər şirinliyi olan təmiz fincan.": {
    "en": "Clean cup with bright acidity and honey-like sweetness.",
    "ar": "فنجان نقي بحموضة ساطعة وحلاوة تشبه العسل.",
    "ru": "Чистая чашка с яркой кислотностью и медовой сладостью."
  },
  "Ətirli, zərif və parlaq xarakterli, çayabənzər yüngül fincan.": {
    "en": "Aromatic, delicate, and bright cup with a tea-like light body.",
    "ar": "فنجان عطري رقيق بنفحات زاهية وقوام خفيف يشبه الشاي.",
    "ru": "Ароматная, утонченная и яркая чашка с легким чайным характером."
  },
  "Şirəli meyvə xarakteri və parlaq turşuluğu ilə ifadəli qəhvə.": {
    "en": "Expressive coffee with juicy fruit character and vibrant acidity.",
    "ar": "قهوة معبرة تتميز بطابع فاكهي غني وحموضة ساطعة.",
    "ru": "Выразительный кофе с сочным фруктовым характером и яркой кислотностью."
  },
  "Kofeinsiz, yumşaq və dolğun qəhvə seçimi.": {
    "en": "Decaffeinated, smooth, and full-flavored coffee choice.",
    "ar": "خيار منزوع الكافيين، ناعم وكامل النكهة.",
    "ru": "Декофеинизированный кофе — мягкий, насыщенный и сбалансированный."
  },
  "Dolğun bədənli, aşağı–orta turşuluqlu və uzun kakaolu fincan.": {
    "en": "Full-bodied cup with low-to-medium acidity and a long cocoa finish.",
    "ar": "فنجان ممتلئ القوام بحموضة منخفضة إلى متوسطة ونهاية كاكاو طويلة.",
    "ru": "Полнотелая чашка с низкой или средней кислотностью и долгим послевкусием какао."
  },
  "Kiçik qeyd": {
    "en": "Quick note",
    "ar": "ملاحظة سريعة",
    "ru": "Примечание"
  },
  "Yaşıl çay üçün qaynar suyu bir qədər soyudun. Qara və meyvəli qarışıqlarda isə daha yüksək temperatur aromanı və gövdəni tam açır.": {
    "en": "Let boiling water cool slightly for green tea. For black and fruit blends, higher temperatures bring out full aroma and body.",
    "ar": "اترك الماء المغلي يبرد قليلاً للشاي الأخضر. أما للشاي الأسود وخلطات الفواكه، فالحرارة الأعلى تُبرز النكهة والقوام بالكامل.",
    "ru": "Для зеленого чая дайте кипятку немного остыть. Для черного и фруктовых сборов более высокая температура полностью раскрывает аромат и тело."
  },
  "Tamper": {
    "en": "Tamper",
    "ar": "مكبس القهوة (تامبر)",
    "ru": "Темпер"
  },
  "Fincan": {
    "en": "Coffee Cup",
    "ar": "فنجان قهوة",
    "ru": "Чашка"
  },
  "Fincan(handmade)": {
    "en": "Cup (handmade)",
    "ar": "فنجان (صناعة يدوية)",
    "ru": "Чашка ручной работы"
  },
  "Milli Fincan (qaşıqlı)": {
    "en": "National Cup (with spoon)",
    "ar": "فنجان تراثي (مع ملعقة)",
    "ru": "Национальная чашка с ложкой"
  },
  "Zərif qəhvə fincanı.": {
    "en": "Elegant coffee cup.",
    "ar": "فنجان قهوة أنيق.",
    "ru": "Изящная кофейная чашка."
  },
  "Xüsusi naxışlı milli qəhvə fincanı və qaşıq dəsti.": {
    "en": "Specially patterned traditional coffee cup and spoon set.",
    "ar": "طقم فنجان قهوة تراثي بنقوش مميزة مع ملعقة.",
    "ru": "Кофейная чашка в национальном стиле с узором и ложкой."
  },
  "Ana menyu": {
    "en": "Main Menu",
    "ar": "القائمة الرئيسية",
    "ru": "Главное меню"
  },
  "Summer menu": {
    "en": "Summer Menu",
    "ar": "قائمة الصيف",
    "ru": "Летнее меню"
  },
  "Desert": {
    "en": "Dessert",
    "ar": "الحلويات",
    "ru": "Десерты"
  },
  "Ana menyu 01": {
    "en": "Main Menu 01",
    "ar": "القائمة الرئيسية 01",
    "ru": "Главное меню 01"
  },
  "Summer menu 02": {
    "en": "Summer Menu 02",
    "ar": "قائمة الصيف 02",
    "ru": "Летнее меню 02"
  },
  "Desert 03": {
    "en": "Dessert 03",
    "ar": "الحلويات 03",
    "ru": "Десерты 03"
  },
  "Fresh Lemonades": {
    "en": "Fresh Lemonades",
    "ar": "ليموناضة طازجة",
    "ru": "Свежие лимонады"
  },
  "Bir fincan seçin.": {
    "en": "Choose a cup.",
    "ar": "اختر فنجانك.",
    "ru": "Выберите чашку."
  },
  "Şirin bir fasilə.": {
    "en": "A sweet break.",
    "ar": "استراحة حلوة.",
    "ru": "Сладкая пауза."
  },
  "01—04": {
    "en": "01—04",
    "ar": "01—04",
    "ru": "01—04"
  },
  "05—08": {
    "en": "05—08",
    "ar": "05—08",
    "ru": "05—08"
  }
};

  let currentLang = DEFAULT_LANG;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES[saved]) currentLang = saved;
  } catch {}

  function getLanguage() {
    return currentLang;
  }

  function t(key, fallback = '') {
    return DICTIONARY[currentLang]?.[key] ?? DICTIONARY[DEFAULT_LANG]?.[key] ?? fallback;
  }

  function setLanguage(lang) {
    if (!LANGUAGES[lang]) return;
    currentLang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}

    document.documentElement.lang = lang;
    document.documentElement.dir = LANGUAGES[lang].dir;

    // Body language classes
    document.body.classList.remove('lang-az', 'lang-en', 'lang-ru', 'lang-ar');
    document.body.classList.add(`lang-${lang}`);

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
      trigger.setAttribute('aria-label', `Dil: ${LANGUAGES[currentLang].name}`);
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
      const targets = root.querySelectorAll(`
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
      `);

      targets.forEach((el) => {
        if (el.hasAttribute('data-i18n')) return;
        const text = (el.textContent || '').trim();
        if (!text) return;

        // If not cached, or if JS changed text to a new AZ value
        if (!el._bcfOrigText || (text !== el._bcfOrigText && text !== PHRASE_MAP[el._bcfOrigText]?.[currentLang])) {
          el._bcfOrigText = text;
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

    wrapper.innerHTML = `
      <button type="button" class="lang-trigger" id="langTrigger" aria-label="Dil / Language" aria-haspopup="true" aria-expanded="false">
        <svg class="lang-globe-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
          <path d="M2 12h20"></path>
        </svg>
        <span class="lang-current-code" id="langCurrentCode">${currentLang.toUpperCase()}</span>
        <svg class="lang-chevron" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m1 1 4 4 4-4"/>
        </svg>
      </button>
      <div class="lang-dropdown" id="langDropdown" role="menu" aria-label="Dillər" hidden>
        <button type="button" class="lang-option ${currentLang === 'az' ? 'active' : ''}" data-lang="az" role="menuitem" aria-selected="${currentLang === 'az'}">
          <span class="lang-flag" aria-hidden="true">🇦🇿</span>
          <span class="lang-label">Azərbaycan</span>
          <span class="lang-check" aria-hidden="true">✓</span>
        </button>
        <button type="button" class="lang-option ${currentLang === 'en' ? 'active' : ''}" data-lang="en" role="menuitem" aria-selected="${currentLang === 'en'}">
          <span class="lang-flag" aria-hidden="true">🇬🇧</span>
          <span class="lang-label">English</span>
          <span class="lang-check" aria-hidden="true">✓</span>
        </button>
        <button type="button" class="lang-option ${currentLang === 'ru' ? 'active' : ''}" data-lang="ru" role="menuitem" aria-selected="${currentLang === 'ru'}">
          <span class="lang-flag" aria-hidden="true">🇷🇺</span>
          <span class="lang-label">Русский</span>
          <span class="lang-check" aria-hidden="true">✓</span>
        </button>
        <button type="button" class="lang-option ${currentLang === 'ar' ? 'active' : ''}" data-lang="ar" role="menuitem" aria-selected="${currentLang === 'ar'}">
          <span class="lang-flag" aria-hidden="true">🇸🇦</span>
          <span class="lang-label">العربية</span>
          <span class="lang-check" aria-hidden="true">✓</span>
        </button>
      </div>
    `;

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

    // Translate modals, drawers, swatches, and filter chips on user interaction
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('#accountTrigger, .account-trigger, #floatingCartTrigger, .floating-cart-btn, .tea-header-cart, #openCartBtn, #openGearCartBtn, #favoritesTrigger, .favorites-trigger, .coffee-add-button, .tea-add-button, .add-to-cart, .variant-swatch, .gallery-arrow, .filter-chip, .menu-tab, .account-tab, .menu-toggle');
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
