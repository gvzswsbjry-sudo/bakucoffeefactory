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
  'Qəhvə · Orta qovurma': {
    en: 'Coffee · Medium roast',
    ar: 'قهوة · تحميص متوسط',
    ru: 'Кофе · средняя обжарка'
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
  },
  // Short tea jump navigation links
  '1001 Gecə': {
    en: '1001 Nights',
    ar: 'ألف ليلة وليلة',
    ru: '1001 ночь'
  },
  'Jasmin': {
    en: 'Jasmine',
    ar: 'الياسمين',
    ru: 'Жасмин'
  },
  'Limon': {
    en: 'Lemon',
    ar: 'الليمون',
    ru: 'Лимон'
  },
  'Malina': {
    en: 'Raspberry',
    ar: 'توت العليق',
    ru: 'Малина'
  },
  'Meyvəli': {
    en: 'Fruit Blend',
    ar: 'شاي الفواكه',
    ru: 'Фруктовый'
  },
  'Nar': {
    en: 'Pomegranate',
    ar: 'الرمان',
    ru: 'Гранат'
  },
  'Portağal': {
    en: 'Orange',
    ar: 'البرتقال',
    ru: 'Апельсин'
  },
  'Qarpız': {
    en: 'Watermelon',
    ar: 'البطيخ',
    ru: 'Арбуз'
  },
  'Jasminli Qara': {
    en: 'Jasmine Black',
    ar: 'شاي أسود بالياسمين',
    ru: 'Чёрный с жасмином'
  },
  'Melisa': {
    en: 'Melissa',
    ar: 'المليسة',
    ru: 'Мелисса'
  },
  'Melisa Çayı': {
    en: 'Melissa Tea',
    ar: 'شاي المليسة',
    ru: 'Чай с мелиссой'
  },
  'Bitki çayı · sakitləşdirici': {
    en: 'Herbal tea · Soothing',
    ar: 'شاي أعشاب · مهدئ',
    ru: 'Травяной чай · успокаивающий'
  },
  'Melisa yarpağı, yüngül limon, təzə bitki': {
    en: 'Melissa leaf, light lemon, fresh herbs',
    ar: 'أوراق المليسة، ليمون خفيف، أعشاب طازجة',
    ru: 'Лист мелиссы, легкий лимон, свежие травы'
  },
  '90–95°C · 4–5 dəqiqə': {
    en: '90–95°C · 4–5 min',
    ar: '90–95°م · 4–5 دقائق',
    ru: '90–95°C · 4–5 мин'
  },
  'Təbii melisa yarpaqlarından ibarət kofeinsiz, zərif bitki çayıdır. İlk qurtumda yüngül sitrus-limon ətri, ardınca təmiz yarpaq təravəti və yumşaq rahatladıcı dad hiss olunur. Xüsusilə axşam saatlarında sakit və balanslı içim üçün uyğundur.': {
    en: 'A gentle, caffeine-free herbal infusion crafted from natural melissa leaves. The first sip opens with a soft lemony citrus aroma followed by fresh leafy clarity and a soothing finish. Ideal for calm, balanced evening relaxation.',
    ar: 'شاي أعشاب لطيف خالٍ من الكافيين محضّر من أوراق المليسة الطبيعية. تبرز في الرشفة الأولى نفحات الليمون الخفيفة، يتبعها انتعاش الأوراق النقية وطعم مهدئ ناعم. مثالي لأوقات المساء الهادئة.',
    ru: 'Нежный травяной настой без кофеина из натуральных листьев мелиссы. В первом глотке раскрывается легкий лимонно-цитрусовый аромат, за ним — свежесть листа и мягкое расслабляющее послевкусие. Прекрасный выбор для спокойного вечернего чаепития.'
  },
  // Coffee / Tea / Modal / Cart extra strings
  'Mənşə qəhvələri · 100 q': {
    en: 'Single Origin Coffee · 100g',
    ar: 'قهوة أحادية المنشأ · 100 جم',
    ru: 'Моносорта кофе · 100 г'
  },
  'Yarpaqlı çay kolleksiyası · 18 seçim': {
    en: 'Loose-leaf tea collection · 18 selections',
    ar: 'تشكيلة شاي أوراق كاملة · 18 خياراً',
    ru: 'Коллекция листового чая · 18 позиций'
  },
  'Kolleksiyaya bax ↓': {
    en: 'View collection ↓',
    ar: 'تصفح المجموعة ↓',
    ru: 'Смотреть коллекцию ↓'
  },
  'Dadın açılması üçün suyu çayın xarakterinə uyğunlaşdırın.': {
    en: 'Match water temperature to the tea character for full flavor.',
    ar: 'اضبط حرارة الماء لتناسب طبيعة الشاي لإبراز النكهة الكاملة.',
    ru: 'Подбирайте температуру воды под характер чая для полного раскрытия вкуса.'
  },
  'Minimum 50 q · maksimum 1 kq': {
    en: 'Minimum 50 g · maximum 1 kg',
    ar: 'الحد الأدنى 50 جم · الحد الأقصى 1 كجم',
    ru: 'Минимум 50 г · максимум 1 кг'
  },
  'Maksimum 1 kq': {
    en: 'Maximum 1 kg',
    ar: 'الحد الأقصى 1 كجم',
    ru: 'Максимум 1 кг'
  },
  '1–20 ədəd seçə bilərsiniz': {
    en: 'You can select 1–20 pieces',
    ar: 'يمكنك اختيار من 1 إلى 20 قطعة',
    ru: 'Можно выбрать от 1 до 20 шт.'
  },
  'Maksimum 2 kq': {
    en: 'Maximum 2 kg',
    ar: 'الحد الأقصى 2 كجم',
    ru: 'Максимум 2 кг'
  },
  'Səbətə uğurla əlavə edildi': {
    en: 'Successfully added to cart',
    ar: 'تمت الإضافة إلى السلة بنجاح',
    ru: 'Успешно добавлено в корзину'
  },
  'Qiymət sifarişdən sonra dəqiqləşdiriləcək': {
    en: 'Price will be confirmed after order',
    ar: 'سيتم تأكيد السعر بعد الطلب',
    ru: 'Цена уточняется после оформления заказа'
  },
  'Məhsullar hazırda yüklənə bilmir. Səhifəni yeniləyib yenidən cəhd edin.': {
    en: 'Products cannot be loaded right now. Please refresh and try again.',
    ar: 'تعذر تحميل المنتجات حالياً. يرجى تحديث الصفحة والمحاولة مرة أخرى.',
    ru: 'Не удалось загрузить товары. Обновите страницу и повторите попытку.'
  },
  'Sizin seçiminiz': {
    en: 'Your selection',
    ar: 'اختياراتك',
    ru: 'Ваш выбор'
  },
  'SİZİN SEÇİMLƏRİNİZ': {
    en: 'YOUR SELECTIONS',
    ar: 'اختياراتك المفضلة',
    ru: 'ВАШ ВЫБОР'
  },
  'Sil': {
    en: 'Remove',
    ar: 'إزالة',
    ru: 'Удалить'
  },
  'və ya': {
    en: 'or',
    ar: 'أو',
    ru: 'или'
  },
  'Digər': {
    en: 'Other',
    ar: 'أخرى',
    ru: 'Другой'
  },
  'Hesabınız': {
    en: 'Your Account',
    ar: 'حسابك الشخصي',
    ru: 'Личный кабинет'
  },
  'SİFARİŞ ARXİVİ': {
    en: 'ORDER ARCHIVE',
    ar: 'أرشيف الطلبات',
    ru: 'АРХИВ ЗАКАЗОВ'
  },
  'Hesabınıza daxil olun.': {
    en: 'Sign in to your account.',
    ar: 'سجّل الدخول إلى حسابك.',
    ru: 'Войдите в свой аккаунт.'
  },
  'Şəxsi sifariş tarixçəniz giriş etdikdən sonra burada görünəcək.': {
    en: 'Your personal order history will appear here once signed in.',
    ar: 'سيظهر سجل طلباتك الشخصي هنا بعد تسجيل الدخول.',
    ru: 'Ваша история заказов появится здесь после входа.'
  },
  'Sifarişlər yüklənir…': {
    en: 'Loading orders…',
    ar: 'جارٍ تحميل الطلبات…',
    ru: 'Загрузка заказов…'
  },
  'Hesab açmadan da sayta baxa və səbətə məhsul əlavə edə bilərsiniz.': {
    en: 'You can browse the site and add items to your cart without creating an account.',
    ar: 'يمكنك تصفح الموقع وإضافة المنتجات إلى السلة دون إنشاء حساب.',
    ru: 'Вы можете просматривать сайт и добавлять товары в корзину без регистрации.'
  },
  'Hesabınız bu cihazda təhlükəsiz sessiya ilə açıqdır.': {
    en: 'Your account is signed in with a secure session on this device.',
    ar: 'حسابك مسجّل الدخول بجلسة آمنة على هذا الجهاز.',
    ru: 'Ваш аккаунт открыт в защищённой сессии на этом устройстве.'
  },
  'Google ilə bir kliklə sürətli giriş və qeydiyyat.': {
    en: 'Fast one-click sign in and registration with Google.',
    ar: 'تسجيل الدخول وإنشاء الحساب بنقرة واحدة عبر جوجل.',
    ru: 'Быстрый вход и регистрация в один клик через Google.'
  },
  'Telefon': {
    en: 'Phone',
    ar: 'الهاتف',
    ru: 'Телефон'
  },
  'E-poçt': {
    en: 'Email',
    ar: 'البريد الإلكتروني',
    ru: 'Эл. почта'
  },
  'E-poçt ünvanı': {
    en: 'Email address',
    ar: 'البريد الإلكتروني',
    ru: 'Адрес эл. почты'
  },
  'Favorilər': {
    en: 'Favorites',
    ar: 'المفضلة',
    ru: 'Избранное'
  },
  'Favorit siyahınız boşdur.': {
    en: 'Your favorites list is empty.',
    ar: 'قائمة المفضلة فارغة.',
    ru: 'Список избранного пуст.'
  },
  'Məhsul kartındakı ürək işarəsinə toxunaraq seçimlərinizi burada toplayın.': {
    en: 'Tap the heart icon on any product card to save your selections here.',
    ar: 'اضغط على أيقونة القلب في بطاقة المنتج لحفظ اختياراتك هنا.',
    ru: 'Нажмите на значок сердечка на карточке товара, чтобы сохранить его здесь.'
  },
  'Qiymət mağazada': {
    en: 'In-store price',
    ar: 'السعر في المتجر',
    ru: 'Цена в магазине'
  },
  'Məhsula bax': {
    en: 'View product',
    ar: 'عرض المنتج',
    ru: 'Посмотреть товар'
  },
  '← Bütün avadanlıqlar': {
    en: '← All Equipment',
    ar: '← جميع المعدات',
    ru: '← Все оборудование'
  },
  'Kataloqa qayıt': {
    en: 'Return to Catalog',
    ar: 'العودة إلى الكتالوج',
    ru: 'Вернуться в каталог'
  },
  'Bu məhsul mövcud deyil.': {
    en: 'This product is currently not available.',
    ar: 'هذا المنتج غير متوفر حالياً.',
    ru: 'Данный товар в настоящее время недоступен.'
  },
  'Bu məhsul hazırda stokda yoxdur.': {
    en: 'This product is currently out of stock.',
    ar: 'هذا المنتج غير متوفر في المخزون حالياً.',
    ru: 'Этого товара сейчас нет в наличии.'
  },
  'Səbətiniz boşdur': {
    en: 'Your cart is empty',
    ar: 'سلتك فارغة',
    ru: 'Ваша корзина пуста'
  },
  '← Ana səhifəyə qayıt': {
    en: '← Back to Home',
    ar: '← العودة إلى الرئيسية',
    ru: '← Вернуться на главную'
  },
  // Variant descriptions in product-detail.js / products.json
  '600 millilitrlik şüşə və paslanmayan polad French Press': {
    en: '600 ml glass and stainless steel French Press',
    ar: 'فرينش برس 600 مل من الزجاج والفولاذ المقاوم للصدأ',
    ru: 'Френч-пресс 600 мл из стекла и нержавеющей стали'
  },
  '350 millilitrlik şüşə və paslanmayan polad French Press': {
    en: '350 ml glass and stainless steel French Press',
    ar: 'فرينش برس 350 مل من الزجاج والفولاذ المقاوم للصدأ',
    ru: 'Френч-пресс 350 мл из стекла и нержавеющей стали'
  },
  '850 millilitrlik şüşə və paslanmayan polad French Press': {
    en: '850 ml glass and stainless steel French Press',
    ar: 'فرينش برس 850 مل من الزجاج والفولاذ المقاوم للصدأ',
    ru: 'Френч-пресс 850 мл из стекла и нержавеющей стали'
  },
  'Taxta gövdəli əl qəhvə dəyirmanı': {
    en: 'Manual coffee grinder with wooden body',
    ar: 'مطحنة قهوة يدوية بهيكل خشبي',
    ru: 'Ручная кофемолка с деревянным корпусом'
  },
  'Bürünc rəngli naxışlı əl qəhvə dəyirmanı': {
    en: 'Ornate bronze manual coffee grinder',
    ar: 'مطحنة قهوة يدوية برونزية مزخرفة',
    ru: 'Резная ручная кофемолка бронзового цвета'
  },
  'Paslanmayan poladdan Moka Pot': {
    en: 'Stainless steel Moka Pot',
    ar: 'موكا بوت من الفولاذ المقاوم للصدأ',
    ru: 'Мока-пот из нержавеющей стали'
  },
  'Boz xallı klassik Moka Pot': {
    en: 'Speckled gray classic Moka Pot',
    ar: 'موكا بوت كلاسيكي رمادي مرقط',
    ru: 'Классический серый мока-пот в крапинку'
  },
  'Naxışlı mis rəngli cezvə': {
    en: 'Engraved copper-toned cezve',
    ar: 'ركوة نحاسية مزخرفة',
    ru: 'Чеканная турка медного цвета'
  },
  'Taxta saplı klassik bürünc cezvə': {
    en: 'Classic brass cezve with wooden handle',
    ar: 'ركوة نحاسية كلاسيكية بمقبض خشبي',
    ru: 'Классическая латунная турка с деревянной ручкой'
  },
  'Taxta saplı yivli bürünc cezvə': {
    en: 'Fluted brass cezve with wooden handle',
    ar: 'ركوة نحاسية مضلعة بمقبض خشبي',
    ru: 'Рифленая латунная турка с деревянной ручкой'
  },
  'Taxta saplı qapaqlı bürünc cezvə': {
    en: 'Lidded brass cezve with wooden handle',
    ar: 'ركوة نحاسية بغطاء ومقبض خشبي',
    ru: 'Латунная турка с крышкой и деревянной ручкой'
  },
  'Paslanmayan poladdan qu quşu ağızlı çaydan': {
    en: 'Stainless steel gooseneck pouring kettle',
    ar: 'إبريق صب عنق الإوزة من الفولاذ المقاوم للصدأ',
    ru: 'Чайник гусиная шея из нержавеющей стали'
  },
  'Yaşıl daşlı dekorativ Dallah qəhvədan': {
    en: 'Decorative Dallah pot with green accents',
    ar: 'دلة قهوة مزخرفة بأحجار خضراء',
    ru: 'Декоративная далла с зелеными вставками'
  },
  'Naxışlı gümüşü rəngli Dallah qəhvədan': {
    en: 'Ornate silver-toned Dallah coffee pot',
    ar: 'دلة قهوة فضية مزخرفة',
    ru: 'Серебристая узорчатая далла'
  },
  'Silindrik əl presi dəmləyici': {
    en: 'Cylindrical manual press coffee brewer',
    ar: 'أداة تحضير يدوية أسطوانية بالضغط',
    ru: 'Цилиндрический ручной пресс для кофе'
  },
  'Böyük çarxlı klassik əl qəhvə dəyirmanı': {
    en: 'Classic cast-wheel manual coffee grinder',
    ar: 'مطحنة قهوة يدوية كلاسيكية بعجلة كبيرة',
    ru: 'Классическая ручная кофемолка с колесом'
  },
  'Qara tutacaqlı 400 millilitrlik şüşə server': {
    en: '400 ml glass server with black handle',
    ar: 'سيرفر زجاجي 400 مل بمقبض أسود',
    ru: 'Стеклянный сервер 400 мл с черной ручкой'
  },
  'Taxta qutuda bürünc rəngli Azərbaycan qəhvə dəsti': {
    en: 'Bronze Azerbaijan coffee gift set in wooden box',
    ar: 'طقم قهوة أذربيجاني برونزي في صندوق خشبي',
    ru: 'Бронзовый азербайджанский кофейный набор в деревянной шкатулке'
  },
  'Taxta qutuda gümüşü rəngli Azərbaycan qəhvə dəsti': {
    en: 'Silver Azerbaijan coffee gift set in wooden box',
    ar: 'طقم قهوة أذربيجاني فضي في صندوق خشبي',
    ru: 'Серебряный азербайджанский кофейный набор в деревянной шкатулке'
  },
  'Taxta üstlü qara espresso tamperi': {
    en: 'Black espresso tamper with wooden top',
    ar: 'مكبس إسبريسو أسود بمقبض خشبي',
    ru: 'Черный темпер для эспрессо с деревянной ручкой'
  },
  'Gümüşü rəngli espresso tamperi': {
    en: 'Silver stainless espresso tamper',
    ar: 'مكبس إسبريسو فضي',
    ru: 'Серебристый темпер для эспрессо'
  },
  'Qara rəngli espresso tamperi': {
    en: 'Matte black espresso tamper',
    ar: 'مكبس إسبريسو أسود',
    ru: 'Черный темпер для эспрессо'
  },
  'Naxışlı metal altlıqda altı fincanlı Şərq üslublu servis dəsti': {
    en: 'Six-cup Oriental serving set on ornate metal tray',
    ar: 'طقم ضيافة شرقي من ستة فناجين على صينية معدنية مزخرفة',
    ru: 'Восточный сервиз на 6 чашек на узорном металлическом подносе'
  },
  'Naxışlı metal altlıqda iki fincanlı Şərq üslublu servis dəsti': {
    en: 'Two-cup Oriental serving set on ornate metal tray',
    ar: 'طقم ضيافة شرقي من فنجانين على صينية معدنية مزخرفة',
    ru: 'Восточный сервиз на 2 чашки на узорном металлическом подносе'
  },
  'Test avadanlığı': {
    en: 'Test equipment',
    ar: 'معدات اختبار',
    ru: 'Тестовое оборудование'
  },
  // Privacy Policy (mexfilik.html)
  'HESAB · MƏLUMATLAR': {
    en: 'ACCOUNT · DATA',
    ar: 'الحساب · البيانات',
    ru: 'АККАУНТ · ДАННЫЕ'
  },
  'Məxfilik siyasəti': {
    en: 'Privacy Policy',
    ar: 'سياسة الخصوصية',
    ru: 'Политика конфиденциальности'
  },
  'Yenilənmə: 27 oktyabr 2026. Bu sənəd Baku Coffee Factory saytında hesab və sifariş sorğuları üçün təqdim edilən məlumatların necə istifadə olunduğunu izah edir.': {
    en: 'Updated: October 27, 2026. This document explains how data submitted for accounts and order requests on Baku Coffee Factory is used.',
    ar: 'التحديث: 27 أكتوبر 2026. توضح هذه الوثيقة كيفية استخدام البيانات المقدمة للحسابات وطلبات الشراء على موقع باكو كوفي فاكتوري.',
    ru: 'Обновлено: 27 октября 2026 г. Настоящий документ объясняет порядок использования данных, предоставленных для аккаунтов и заявок на сайте Baku Coffee Factory.'
  },
  'Hansı məlumatları alırıq?': {
    en: 'What information do we collect?',
    ar: 'ما هي البيانات التي نجمعها؟',
    ru: 'Какие данные мы собираем?'
  },
  'Qeydiyyat zamanı istifadəçi adı, seçiminizə əsasən ölkə kodu ilə telefon nömrəsi və ya e-poçt ünvanı, həmçinin şifrə qəbul edilir. Şifrə açıq mətn kimi saxlanmır; təhlükəsiz hash formasında saxlanır. Hesabın təhlükəsizliyi üçün giriş vaxtı, sessiya və uğursuz giriş cəhdləri haqqında texniki məlumatlar da işlənir. Sifariş sorğusu göndərdikdə əlaqə məlumatınız, seçdiyiniz məhsullar, miqdar, qiymət və yazdığınız qeyd saxlanır.': {
    en: 'During registration, we collect your username, phone number with country code or email address, and password. Passwords are never stored as plain text; they are kept as secure cryptographic hashes. For security, technical login timestamps, session tokens, and failed attempt logs are processed. When placing an order request, your contact details, chosen products, quantities, prices, and notes are stored.',
    ar: 'أثناء التسجيل، يتم جمع اسم المستخدم ورقم الهاتف مع رمز الدولة أو البريد الإلكتروني وكلمة المرور. لا يتم حفظ كلمات المرور كنص عادي بل بتجزئة آمنة. ولأغراض الأمان يتم تسجيل وقت الدخول والجلسة ومحاولات الدخول الفاشلة. عند إرسال طلب، يتم حفظ بيانات التواصل والمنتجات والكميات والأسعار والملاحظات.',
    ru: 'При регистрации принимаются имя пользователя, номер телефона с кодом страны или email, а также пароль. Пароль не хранится в открытом виде и сохраняется в виде надёжного криптографического хеша. Для безопасности обрабатываются технические данные о времени входа, сессиях и неудачных попытках. При отправке заявки сохраняются контактные данные, выбранные товары, количество, цена и комментарий.'
  },
  'Məlumatların məqsədi': {
    en: 'Purpose of data processing',
    ar: 'الغرض من معالجة البيانات',
    ru: 'Цель обработки данных'
  },
  'Bu məlumatlardan hesab yaratmaq, sizi daxil etmək, sessiyanı qorumaq, sifariş sorğunuzu yoxlayıb sizinlə əlaqə saxlamaq və sui-istifadənin qarşısını almaq üçün istifadə edirik. Hazırkı qeydiyyat telefon nömrəsini SMS ilə təsdiqləmir; nömrəyə sahiblik ayrıca yoxlanmır. Marketinq mesajları göndərmək üçün bu razılıqdan istifadə edilmir.': {
    en: 'We use this information to create your account, sign you in, maintain your session, verify and contact you regarding your order request, and prevent abuse. Current registration does not verify phone ownership via SMS. This consent is never used to send marketing messages.',
    ar: 'نستخدم هذه البيانات لإنشاء حسابك وتسجيل دخولك وحماية الجلسة ومراجعة طلبك والتواصل معك ومنع إساءة الاستخدام. لا يتضمن التسجيل الحالي تأكيد الهاتف عبر رسائل SMS. ولا يُستخدم هذا التفويض لإرسال رسائل تسويقية.',
    ru: 'Мы используем эти данные для создания аккаунта, входа в систему, защиты сессии, проверки вашей заявки на заказ, связи с вами и предотвращения злоупотреблений. Текущая регистрация не подтверждает номер телефона по SMS. Данное согласие не используется для отправки маркетинговых рассылок.'
  },
  'Saxlama və təhlükəsizlik': {
    en: 'Storage and security',
    ar: 'التخزين والأمان',
    ru: 'Хранение и безопасность'
  },
  'Hesab məlumatları server verilənlər bazasında, sifariş sorğuları isə serverin qorunan məlumat faylında saxlanır və yalnız admin girişindən sonra görünür. Giriş sessiyası 30 günədək aktiv qala bilər; hesabdan çıxanda həmin sessiya ləğv edilir. Sayt yayımlandıqda HTTPS bağlantısı, giriş məhdudlaşdırması və server giriş nəzarəti tətbiq edilməlidir.': {
    en: 'Account information is stored in the server database, while order requests are kept in protected server storage accessible only to authenticated admins. Login sessions remain active for up to 30 days and are invalidated upon sign-out. In production, HTTPS, rate limiting, and server access controls are enforced.',
    ar: 'تُحفظ بيانات الحساب في قاعدة بيانات الخادم، وتُحفظ طلبات الشراء في تخزين محمي يظهر فقط بعد دخول المسؤول. قد تبقى الجلسة نشطة لمدة تصل إلى 30 يوماً وتُلغى عند تسجيل الخروج. يتم تطبيق HTTPS والحد من الطلبات وضوابط وصول الخادم عند النشر.',
    ru: 'Данные аккаунта хранятся в базе данных на сервере, а заявки на заказы — в защищённом хранилище и доступны только администратору после входа. Сессия активна до 30 дней и аннулируется при выходе из аккаунта. При публикации применяются HTTPS, ограничение запросов и контроль доступа.'
  },
  'Seçiminiz və əlaqə': {
    en: 'Your choice and contact',
    ar: 'خيارك والتواصل',
    ru: 'Ваш выбор и контакты'
  },
  'Bu mətn yayım öncəsi hüquqi şəxs məlumatları, saxlanma müddətləri və tətbiq edilən hüquqi tələblər baxımından sayt sahibi tərəfindən yoxlanmalıdır.': {
    en: 'This text should be reviewed by the site owner regarding legal entity details, retention periods, and applicable legal requirements prior to full release.',
    ar: 'يجب مراجعة هذا النص من قِبل مالك الموقع بخصوص بيانات الكيان القانوني وفترات الاحتفاظ والمتطلبات القانونية قبل النشر الرسمي.',
    ru: 'Этот текст должен быть проверен владельцем сайта в части юридических реквизитов, сроков хранения и применимых требований законодательства до официальной публикации.'
  },
  // Additional UI, catalog, unit, country, and status phrases
  'Yeni': {
    en: 'New',
    ar: 'جديد',
    ru: 'Новый'
  },
  '/ 100 q': {
    en: '/ 100g',
    ar: '/ 100 جم',
    ru: '/ 100 г'
  },
  '/ ədəd': {
    en: '/ pc',
    ar: '/ قطعة',
    ru: '/ шт.'
  },
  'Seçim': {
    en: 'Options',
    ar: 'الخيارات',
    ru: 'Выбор'
  },
  'Qiymət qeydi': {
    en: 'Price note',
    ar: 'ملاحظة السعر',
    ru: 'Примечание к цене'
  },
  'Müvəqqəti qiymət': {
    en: 'Estimated price',
    ar: 'سعر تقديري',
    ru: 'Ориентировочная цена'
  },
  'Qiymət dəqiqləşdiriləcək': {
    en: 'Price to be confirmed',
    ar: 'سيتم تأكيد السعر',
    ru: 'Цена уточняется'
  },
  'qiyməti təsdiqlənəcək': {
    en: 'price to be confirmed',
    ar: 'السعر قيد التأكيد',
    ru: 'цена уточняется'
  },
  'qiymət təsdiqlənəcək': {
    en: 'price to be confirmed',
    ar: 'السعر قيد التأكيد',
    ru: 'цена уточняется'
  },
  'Digər ölkə kodu…': {
    en: 'Other country code…',
    ar: 'رمز دولة آخر…',
    ru: 'Другой код страны…'
  },
  'Sifariş qeydə alınıb': {
    en: 'Order received',
    ar: 'تم تسجيل الطلب',
    ru: 'Заказ принят'
  },
  'Məhsul': {
    en: 'Product',
    ar: 'المنتج',
    ru: 'Товар'
  },
  'Səbətiniz boşdur.': {
    en: 'Your cart is empty.',
    ar: 'سلتك فارغة.',
    ru: 'Ваша корзина пуста.'
  },
  'Səbətiniz boşdur': {
    en: 'Your cart is empty',
    ar: 'سلتك فارغة',
    ru: 'Ваша корзина пуста'
  },
  'Sifariş göndərilir…': {
    en: 'Sending order…',
    ar: 'جارٍ إرسال الطلب…',
    ru: 'Отправка заказа…'
  },
  'Ədəd': {
    en: 'Pieces',
    ar: 'القطع',
    ru: 'Шт.'
  },
  'Qram': {
    en: 'Grams',
    ar: 'جرام',
    ru: 'Граммы'
  },
  'Mövcuddur': {
    en: 'Available',
    ar: 'متوفر',
    ru: 'В наличии'
  },
  'Bitib': {
    en: 'Sold Out',
    ar: 'نفد',
    ru: 'Распродано'
  },
  // Country names in phone selector
  'Azərbaycan': {
    en: 'Azerbaijan',
    ar: 'أذربيجان',
    ru: 'Азербайджан'
  },
  'Türkiyə': {
    en: 'Turkey',
    ar: 'تركيا',
    ru: 'Турция'
  },
  'Gürcüstan': {
    en: 'Georgia',
    ar: 'جورجيا',
    ru: 'Грузия'
  },
  'Rusiya / Qazaxıstan': {
    en: 'Russia / Kazakhstan',
    ar: 'روسيا / كازاخستان',
    ru: 'Россия / Казахстан'
  },
  'ABŞ / Kanada': {
    en: 'USA / Canada',
    ar: 'الولايات المتحدة / كندا',
    ru: 'США / Канада'
  },
  'Birləşmiş Krallıq': {
    en: 'United Kingdom',
    ar: 'المملكة المتحدة',
    ru: 'Великобритания'
  },
  'Almaniya': {
    en: 'Germany',
    ar: 'ألمانيا',
    ru: 'Германия'
  },
  'Fransa': {
    en: 'France',
    ar: 'فرنسا',
    ru: 'Франция'
  },
  'İtaliya': {
    en: 'Italy',
    ar: 'إيطاليا',
    ru: 'Италия'
  },
  'İspaniya': {
    en: 'Spain',
    ar: 'إسبانيا',
    ru: 'Испания'
  },
  'BƏƏ': {
    en: 'UAE',
    ar: 'الإمارات',
    ru: 'ОАЭ'
  },
  'Ukrayna': {
    en: 'Ukraine',
    ar: 'أوكرانيا',
    ru: 'Украина'
  },
  'Hindistan': {
    en: 'India',
    ar: 'الهند',
    ru: 'Индия'
  },
  'Pakistan': {
    en: 'Pakistan',
    ar: 'باكستان',
    ru: 'Пакистан'
  },
  'İran': {
    en: 'Iran',
    ar: 'إيران',
    ru: 'Иран'
  },
  'Səudiyyə Ərəbistanı': {
    en: 'Saudi Arabia',
    ar: 'السعودية',
    ru: 'Саудовская Аравия'
  },
  'Niderland': {
    en: 'Netherlands',
    ar: 'هولندا',
    ru: 'Нидерланды'
  },
  'İsveçrə': {
    en: 'Switzerland',
    ar: 'سويسرا',
    ru: 'Швейцария'
  },
  'Polşa': {
    en: 'Poland',
    ar: 'بولندا',
    ru: 'Польша'
  },
  'Çin': {
    en: 'China',
    ar: 'الصين',
    ru: 'Китай'
  },
  'Baku Coffee Factory · Avadanlıqlar': {
    en: 'Baku Coffee Factory · Equipment',
    ar: 'باكو كوفي فاكتوري · المعدات',
    ru: 'Baku Coffee Factory · Оборудование'
  },
  'Hər qəhvə üçün turşuluq, bədən və balans 1–5 aralığında göstərilib. Dad notları qəhvənin ölkə-mənşə xarakterini və uyğun orta qovrum istiqamətini ifadə edir.': {
    en: 'Acidity, body, and balance are rated 1–5 for each coffee. Tasting notes reflect regional origin and optimal medium roast profile.',
    ar: 'تم تقييم الحموضة والقوام والتوازن من 1 إلى 5 لكل قهوة. تعكس ملاحظات التذوق طابع المنشأ واتجاه التحميص المتوسط المناسب.',
    ru: 'Кислотность, тело и баланс оценены по шкале 1–5 для каждого сорта. Вкусовые ноты отражают характер региона и оптимальный профиль средней обжарки.'
  },
  'Qəhvənin dəqiq dadı lot, emal üsulu, qovrum və dəmləmə ilə dəyişir. Konkret təsərrüfat məlumatı olduqda bu profilləri daha da dəqiqləşdirə bilərik.': {
    en: 'Exact taste varies by crop lot, processing method, roast level, and brewing. As specific lot details become available, profiles are refined.',
    ar: 'يختلف المذاق الدقيق حسب الحصاد وطريقة المعالجة ومستوى التحميص والتحضير. يمكننا تحسين هذه المواصفات عند توفر بيانات المزرعة الدقيقة.',
    ru: 'Точный вкус зависит от лота, способа обработки, обжарки и заваривания. При наличии точных данных о ферме профили можно уточнить.'
  },
  'Çiçəkli, meyvəli və dolğun çayları dad xarakteri ilə tanıyın. Hər seçim üçün ideal su temperaturunu və dəmləmə müddətini də qeyd etdik.': {
    en: 'Explore floral, fruity, and rich teas by flavor profile. We also note the ideal water temperature and steeping time for every selection.',
    ar: 'استكشف أنواع الشاي الزهرية والفاكهية والغنية حسب نكهتها. أضفنا أيضاً درجة حرارة الماء المثالية ومدة التخمير لكل اختيار.',
    ru: 'Откройте для себя цветочные, фруктовые и насыщенные чаи. Для каждого сорта указаны идеальная температура воды и время заваривания.'
  },
  'Hələ sifariş yoxdur.': {
    en: 'No orders yet.',
    ar: 'لا توجد طلبات بعد.',
    ru: 'Заказов пока нет.'
  },
  'Hesabınıza daxil olaraq verdiyiniz sifarişlər burada görünəcək.': {
    en: 'Orders placed while logged into your account will appear here.',
    ar: 'ستظهر الطلبات المقدمة أثناء تسجيل الدخول هنا.',
    ru: 'Заказы, оформленные после входа в аккаунт, появятся здесь.'
  },
  // Clean un-parenthesized drink names for Version 1 menu cards
  'Latte': { en: 'Latte', ru: 'Латте', ar: 'لاتيه' },
  'Caramel Macchiato': { en: 'Caramel Macchiato', ru: 'Карамельный макиато', ar: 'كراميل ماكياتو' },
  'Cappuccino': { en: 'Cappuccino', ru: 'Капучино', ar: 'كابتشينو' },
  'Flat White': { en: 'Flat White', ru: 'Флэт уайт', ar: 'فلات وايت' },
  'Mocha': { en: 'Mocha', ru: 'Мокко', ar: 'موكا' },
  'Cortado': { en: 'Cortado', ru: 'Кортадо', ar: 'كورتادو' },
  'Raff Coffee': { en: 'Raff Coffee', ru: 'Раф кофе', ar: 'راف كوفي' },
  'Spanish Latte': { en: 'Spanish Latte', ru: 'Испанский латте', ar: 'سبانيش لاتيه' },
  'Spanish Cortado': { en: 'Spanish Cortado', ru: 'Испанский кортадо', ar: 'سبانيش كورتادو' },
  'Ice Latte': { en: 'Ice Latte', ru: 'Айс латте', ar: 'آيس لاتيه' },
  'Ice Americano': { en: 'Ice Americano', ru: 'Айс американо', ar: 'آيس أمريكانو' },
  'Cold Brew': { en: 'Cold Brew', ru: 'Колд брю', ar: 'كولد برو' },
  'Chai Tea Latte': { en: 'Chai Tea Latte', ru: 'Чай-латте', ar: 'تشاي تي لاتيه' },
  'Baku Coffee Factory Special': { en: 'Baku Coffee Factory Special', ru: 'Baku Coffee Factory Special', ar: 'باكو كوفي فاكتوري سبيشال' },
  'Filtr coffee (V60)': { en: 'Filter Coffee (V60)', ru: 'Фильтр-кофе (V60)', ar: 'قهوة مقطرة (V60)' }
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
      teaCollectionEyebrow: 'Yarpaqlı çay kolleksiyası · 18 seçim',
      teaCollectionHeadline: 'Hər yarpaqda<br /><em>başqa bir əhval.</em>',
      teaCollectionIntro: 'Çiçəkli, meyvəli və dolğun çayları dad xarakteri ilə tanıyın. Hər seçim üçün ideal su temperaturunu və dəmləmə müddətini də qeyd etdik.',
      teaHeroCta: 'Kolleksiyaya bax <span>↓</span>',
      teaFactsBrew: 'Dəmləmə',
      max1kg: 'Maksimum 1 kq',
      limit1to20: '1–20 ədəd seçə bilərsiniz',
      qtyPieces: 'Ədəd',
      priceConfirmAfterOrder: 'Qiymət sifarişdən sonra dəqiqləşdiriləcək',
      outOfStockNote: 'Bu məhsul hazırda stokda yoxdur.',
      addedToCartSentence: 'səbətə əlavə edildi.',

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
      removeBtn: 'Sil',

      // Checkout
      checkoutEyebrow: 'SİFARİŞ SORĞUSU',
      checkoutTitle: 'Sifarişi tamamlayın.',
      sellerNote: 'Satıcıya qeyd',
      optional: '(istəyə bağlı)',
      notePlaceholder: 'Sifarişlə bağlı əlavə istəyiniz varsa yazın',
      confirmCheckoutBtn: 'Sifarişi təsdiqlə və WhatsApp-a göndər',
      checkoutDestinationNote: '✓ Sifariş admin panelə, Telegram-a və WhatsApp-a (+994 70 390 10 09) göndərilir',
      orderReceivedEyebrow: 'SİFARİŞ QEYDƏ ALINDI',
      orderReceivedTitle: 'Sifariş sorğunuz qəbul edildi.',
      orderWhatsAppHint: 'Sifarişiniz sistemə qeyd olundu! Sürətli təsdiq üçün birbaşa WhatsApp-a göndərin:',
      sendWhatsAppBtn: 'WhatsApp ilə göndər',
      teamContactSubnote: 'Komandamız həmçinin göstərdiyiniz telefon nömrəsi ilə əlaqə saxlayacaq.',
      continueShopping: 'Alış-verişə davam et',
      phoneLegend: 'Telefon nömrəsi',
      checkoutPhoneHint: 'Hesabınızda telefon nömrəsi qeyd olunmayıb. Sifariş vermək üçün nömrənizi daxil edin (hesabınıza da əlavə ediləcək).',
      checkoutGuestPhoneHint: 'Hesab açmadan sifariş verirsiniz. Sifariş təsdiqi və çatdırılma üçün mobil nömrənizi daxil edin.',
      phoneRemainderLabel: 'Telefon nömrəsinin qalan hissəsi',
      checkoutEmptyBtn: 'Səbətiniz boşdur',
      checkoutSubmittingBtn: 'Sifariş göndərilir…',
      checkoutAuthPrompt: 'Sifariş vermək üçün zəhmət olmasa hesabınıza daxil olun və ya qeydiyyatdan keçin.',
      checkoutAuthRequired: 'Sifariş göndərmək üçün zəhmət olmasa hesaba daxil olun.',
      checkoutFileError: 'Sifariş göndərmək üçün saytı fayl kimi deyil, işləyən server ünvanından açın.',
      checkoutNoPhoneError: 'Hesabınızda qeydiyyatdan keçmiş telefon nömrəsi tapılmadı.',
      checkoutEmptyError: 'Səbətiniz boşdur.',
      checkoutGenericError: 'Sifarişi göndərmək mümkün olmadı. Yenidən cəhd edin.',
      orderReferencePrefix: 'Sifariş nömrəsi:',

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
      emailShortLabel: 'E-poçt',
      emailLabel: 'E-poçt ünvanı',
      emailPlaceholder: 'ad@example.com',
      countryCodeLabel: 'Ölkə kodu',
      phoneNumberLabel: 'Telefon nömrəsi',
      customCodePlaceholder: 'Ölkə kodu, məsələn +81',
      otherLabel: 'Digər',
      privacyConsentHtml: '<a href="mexfilik.html" target="_blank" rel="noopener">Məxfilik siyasətini</a> oxudum və şəxsi məlumatlarımın hesab yaratmaq üçün işlənməsinə razıyam.',
      googleProviderNote: 'Google ilə bir kliklə sürətli giriş və qeydiyyat.',
      accountGuestNote: 'Hesab açmadan da sayta baxa, səbətə məhsul əlavə edə və sifariş verə bilərsiniz.',
      accountSecurityNote: 'Hesabınız bu cihazda təhlükəsiz sessiya ilə açıqdır.',
      ordersArchiveEyebrow: 'SİFARİŞ ARXİVİ',
      accountOrdersSignInTitle: 'Hesabınıza daxil olun.',
      accountOrdersSignInDesc: 'Şəxsi sifariş tarixçəniz giriş etdikdən sonra burada görünəcək.',
      ordersLoading: 'Sifarişlər yüklənir…',
      orderPrefix: 'Sifariş #',
      orderStatusReceived: 'Sifariş qeydə alınıb',
      greetingPrefix: 'Salam',
      phoneShortPrefix: 'Tel',
      authFullNameRequired: 'Ad və soyadınızı daxil edin.',
      authUsernameMin: 'İstifadəçi adı ən azı 3 simvol olmalıdır.',
      authPhoneRequired: 'Mobil telefon nömrənizi tam daxil edin.',
      authPasswordMin: 'Şifrə ən azı 12 simvoldan ibarət olmalıdır.',
      authPrivacyRequired: 'Məxfilik siyasətinə razılıq verin.',
      authIdentifierRequired: 'İstifadəçi adı və ya telefon nömrənizi daxil edin.',
      authPasswordRequired: 'Şifrənizi daxil edin.',
      authGoogleSigningIn: 'Google ilə daxil olunur…',
      authGoogleOpening: 'Google hesab seçimi açılır…',
      authGoogleNotReady: 'Google giriş xidməti yüklənmədi.',
      authProviderUnavailable: 'Bu giriş üsulu serverdə hələ aktiv edilməyib.',
      authNotCompleted: 'Giriş tamamlanmadı.',
      authFileError: 'Hesab üçün saytı fayl kimi deyil, işləyən server ünvanından açın.',
      authServiceUnavailable: 'Hesab xidməti serverdə hələ aktiv deyil. PostgreSQL bazası qoşulduqdan sonra sifariş tarixçəsi işləyəcək.',
      authReauthRequired: 'Sifarişlərinizi görmək üçün hesabınıza yenidən daxil olun.',
      authOrdersError: 'Sifariş tarixçəsini yükləmək mümkün olmadı. Yenidən cəhd edin.',
      authShowPassword: 'Şifrəni göstər',
      authHidePassword: 'Şifrəni gizlət',
      emailResetHint: '(şifrə bərpası üçün — istəyə bağlı)',
      authEmailInvalid: 'E-poçt ünvanını düzgün daxil edin.',
      forgotPasswordBtn: 'Şifrəni unutdun?',
      resetBackToLogin: '← Girişə qayıt',
      resetPasswordTitle: 'Şifrəni yenilə',
      resetRequestDesc: 'Hesabınıza bağlı istifadəçi adı, telefon nömrəsi və ya Gmail ünvanını daxil edin. E-poçtunuz varsa 6 rəqəmli kod Gmail-ə, əks halda dəstək xəttimizə (Telegram / WhatsApp) yönləndiriləcək.',
      resetIdentifierLabel: 'İstifadəçi adı, telefon və ya e-poçt',
      resetSendCodeBtn: 'Təsdiq kodu göndər',
      resetHaveCodeBtn: 'Artıq bərpa kodum var',
      resetCodeLabel: '6 rəqəmli təsdiq kodu',
      resetCodePlaceholder: '123456',
      resetNewPasswordLabel: 'Yeni şifrə',
      resetConfirmPasswordLabel: 'Yeni şifrəni təkrarla',
      resetConfirmSubmitBtn: 'Şifrəni yenilə və daxil ol',
      resetResendCodeBtn: 'Yenidən kod göndər',
      resetSupportWhatsApp: 'Kod gəlmirsə WhatsApp: 070 390 10 09',
      resetCodeSentBanner: 'Hesab varsa 6 rəqəmli kod göndərildi (Gmail-ə və ya dəstək xəttinə). Gmail-də görünməsə Spam qovluğunu yoxlayın; e-poçt bağlı deyilsə WhatsApp (+994 70 390 10 09) ilə kodu əldə edin.',
      resetCodeInvalid: '6 rəqəmli təsdiq kodunu düzgün daxil edin.',
      resetPasswordMismatch: 'Yeni şifrələr uyğun gəlmir.',
      logoutConfirmEyebrow: 'HESAB · TƏSDİQ',
      logoutConfirmTitle: 'Hesabdan çıxmaq istəyirsiniz?',
      logoutConfirmDesc: 'Çıxış etdikdən sonra sifariş tarixçənizi görmək və hesab məlumatlarından istifadə etmək üçün yenidən daxil olmalı olacaqsınız.',
      logoutConfirmCancel: 'Xeyr, qal',
      logoutConfirmAccept: 'Bəli, çıxış et',
      googlePhoneTitle: 'Google ilə qeydiyyatı tamamlayın',
      googlePhoneDesc: 'Sifariş verə bilmək və sifariş təsdiqi üçün mobil telefon nömrənizi daxil edin.',
      googlePhoneCancel: 'Geri',
      googlePhoneSubmit: 'Nömrəni təsdiqlə və daxil ol',
      profilePhoneMissingNote: 'Hesabınızda telefon nömrəsi qeyd olunmayıb. Sifariş vermək üçün mobil nömrənizi əlavə edin.',
      profilePhoneSaveBtn: 'Nömrəni yadda saxla',
      profilePhoneSavedMsg: 'Telefon nömrəniz hesabınıza əlavə edildi.',

      // Favorites
      favoritesTitle: 'Seçilmişlər',
      favoritesEmpty: 'Hələ heç bir məhsul seçilməyib.',
      clearFavorites: 'Siyahını təmizlə',
      favoritesEyebrow: 'SİZİN SEÇİMLƏRİNİZ',
      favoritesDrawerTitle: 'Favorilər',
      favoritesDrawerEmptyTitle: 'Favorit siyahınız boşdur.',
      favoritesDrawerEmptyDesc: 'Məhsul kartındakı ürək işarəsinə toxunaraq seçimlərinizi burada toplayın.',
      favoritesCountItems: 'məhsul',

      // Privacy Policy
      policyContactHtml: 'Hesab yaratmadan sayta baxmaq və məhsulları səbətə əlavə etmək mümkündür. Hesab məlumatlarınızla bağlı sual, düzəliş və silinmə müraciəti üçün <a href="tel:+994703901009">070 390 10 09</a> nömrəsi ilə əlaqə saxlayın.',
      backToHome: '← Ana səhifəyə qayıt',

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
      aboutCopyHtml: 'Baku Coffee Factory<br />Fresh roasted &amp; specialty coffee<br />Takeaway • Coffeeshop.',
      homeFeaturedEyebrow: 'SEÇİLMİŞ MƏHSULLAR · 100 Q / ƏDƏD',
      homeFeaturedTitle: 'Ən çox seçilənlər<br /><em>bir toxunuşla səbətə.</em>',
      homeFeaturedTabAll: 'Hamısı',
      homeFeaturedTabCoffee: 'Qəhvə',
      homeFeaturedTabTea: 'Çay',
      homeFeaturedTabEquipment: 'Avadanlıq',
      homeFeaturedAll: 'Bütün məhsullara bax',
      homeFeaturedAllCoffee: 'Bütün qəhvələrə bax',
      homeFeaturedAllTea: 'Bütün çaylara bax',
      homeFeaturedAllEquipment: 'Bütün avadanlıqlara bax',
      homeFeaturedSyncNote: 'Bütün seçimlər vahid səbətə əlavə olunur və canlı stokla yenilənir.',
      homeBadgePopular: 'POPULYAR',
      homeBadgeNew: 'YENİ',
      finderEyebrow: 'ŞƏXSİ QƏHVƏ SEÇİCİSİ',
      finderTitle: 'Parametrləri seçin,<br /><em>sizə özəl qəhvələr.</em>',
      finderSubtitle: 'Dəmləmə üsulu, dad profili və intensivliyi qeyd edin — kataloqdan sizə ən uyğun seçimlər sıralansın.',
      finderStepBrew: '01 · DƏMLƏMƏ ÜSULU',
      finderBrewEspresso: 'Espresso & Südlü',
      finderBrewFilter: 'V60 & Filter',
      finderBrewTurkish: 'Türk qəhvəsi',
      finderBrewFrench: 'French Press',
      finderStepFlavor: '02 · DAD İSTİQAMƏTİ',
      finderFlavorNutty: 'Şokolad & Fındıq',
      finderFlavorFruity: 'Meyvəli & Çiçəkli',
      finderFlavorIntense: 'Tünd & Ədviyyatlı',
      finderStepBody: '01 · GÖVDƏ (İNTENSİVLİK)',
      finderBodyLight: 'Yüngül',
      finderBodyMedium: 'Orta',
      finderBodyFull: 'Dolğun',
      finderStepAcidity: '02 · TURŞULUQ',
      finderAcidityLow: 'Aşağı · Yumşaq',
      finderAcidityBalanced: 'Orta',
      finderAcidityBright: 'Parlaq · Canlı',
      finderDecafToggle: 'Kofeinsiz (Decaf)',
      finderReset: 'Sıfırla',
      finderResultSummary: 'Parametrlərinizə ən uyğun 2 qəhvə',
      finderSummarySingle: 'Sizin üçün ən uyğun 1 qəhvə',
      finderSummaryPair: 'Parametrlərinizə ən uyğun 2 qəhvə',
      finderBestPick: 'Ən uyğun',
      finderMatchWord: 'uyğun',
      finderBodyStat: 'Gövdə',
      finderAcidStat: 'Turşuluq',
      finderBalanceStat: 'Balans',
      finderAllCoffees: 'Bütün qəhvələrə bax',
      homeFinderCtaEyebrow: 'ŞƏXSİ DAD TESTİ',
      homeFinderCtaTitle: 'Sənə uyğun qəhvəni<br /><em>özün seç.</em>',
      homeFinderCtaDesc: 'Gövdə, turşuluq və balans səviyyəsini əl ilə sürüşdürərək tənzimlə — kataloqdan sənə ən uyğun 1–2 qəhvəni dərhal göstərək.',
      homeFinderCtaButton: 'Sənə uyğun qəhvəni seç',
      finderPageHeading: 'Sənə uyğun qəhvəni<br /><em>sürüşdürərək tap.</em>',
      finderPageSubtitle: 'Gövdə, turşuluq və balans səviyyəsini əl ilə sürüşdür, dəmləmə üsulunu seç — sənə ən uyğun 1 və ya 2 qəhvəni təklif edək.',
      finderStepBalance: '03 · BALANS',
      finderStepBrewSelect: '04 · DƏMLƏMƏ ÜSULU',
      finderStepFlavorSelect: '05 · DAD İSTİQAMƏTİ',
      finderOptionAny: 'Fərq etmir',
      finderScaleBodyLow: '1 · Yüngül',
      finderScaleAcidLow: '1 · Yumşaq',
      finderScaleAcidHigh: '5 · Parlaq',
      finderScaleBalLow: '1 · Kəskin',
      finderScaleBalHigh: '5 · Harmonik',
      finderScaleMid: '3 · Orta',
      finderScaleBodyHigh: '5 · Dolğun',
      menuDailyEyebrow: 'HƏR GÜN BİR QƏHVƏ',
      menuDailyBadge: '-50% · GÜNÜN TƏKLİFİ',
      menuDailyTitleLatte: 'Günün seçimi: Latte',
      menuDailyNote: 'Kofeşopumuzda hər gün bir içkiyə 50% endirim tətbiq olunur. Bu gün günün endirimli qəhvəsi Latte-dir — bütün ölçülərdə yarı qiymətə.',
      menuTodayTag: '-50% BUGÜN',
      menuCatAll: 'Hamısı',
      menuCatEspresso: 'Espresso',
      menuCatMilk: 'Südlü',
      menuCatCold: 'Soyuq',
      menuCatAlt: 'Alternativlər',
      menuCatTea: 'Çaylar',
      menuCatExtras: 'Əlavələr',
      menuSignaturesTitle: 'İmza seçimlər',
      menuSignaturesBadge: 'BARİSTA TÖVSİYƏSİ',
      menuSpecialDesc: 'Raff qəhvə üslubunda qaymaqlı içim · hil, qovrulmuş fındıq əzməsi və şəkərbura dad notları.',
      menuV60Desc: 'Təmiz, meyvəli və aromatik əl dəmləməsi.',
      menuDesertFeaturedTitle: 'Seçilmiş desertlər',
      menuDessertSub: 'Təzə bişirilmiş şirniyyatlar · Qiymətlər AZN ilə göstərilib.',
      menuCurrencyNote: 'Qiymətlər AZN ilə göstərilib.',
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
      teaCollectionEyebrow: 'Loose-leaf tea collection · 18 selections',
      teaCollectionHeadline: 'In every leaf<br /><em>another mood.</em>',
      teaCollectionIntro: 'Explore floral, fruity, and rich teas by flavor profile. We also note the ideal water temperature and steeping time for every selection.',
      teaHeroCta: 'View collection <span>↓</span>',
      teaFactsBrew: 'Brewing',
      max1kg: 'Maximum 1 kg',
      limit1to20: 'You can select 1–20 pieces',
      qtyPieces: 'Pieces',
      priceConfirmAfterOrder: 'Price will be confirmed after order',
      outOfStockNote: 'This product is currently out of stock.',
      addedToCartSentence: 'added to cart.',

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
      removeBtn: 'Remove',

      // Checkout
      checkoutEyebrow: 'ORDER REQUEST',
      checkoutTitle: 'Complete your order.',
      sellerNote: 'Note to seller',
      optional: '(optional)',
      notePlaceholder: 'Write any special instructions for your order',
      confirmCheckoutBtn: 'Confirm Order & Send via WhatsApp',
      checkoutDestinationNote: '✓ Order is sent to Admin panel, Telegram, and WhatsApp (+994 70 390 10 09)',
      orderReceivedEyebrow: 'ORDER RECEIVED',
      orderReceivedTitle: 'Your order request has been accepted.',
      orderWhatsAppHint: 'Your order is recorded! Send directly to WhatsApp for rapid confirmation:',
      sendWhatsAppBtn: 'Send via WhatsApp',
      teamContactSubnote: 'Our team will also reach out to your provided phone number.',
      continueShopping: 'Continue Shopping',
      phoneLegend: 'Phone number',
      checkoutPhoneHint: 'No phone number is linked to your account yet. Enter your number to complete your order (it will also be saved to your account).',
      checkoutGuestPhoneHint: 'Ordering as a guest. Enter your mobile number for order confirmation and delivery.',
      phoneRemainderLabel: 'Remaining phone digits',
      checkoutEmptyBtn: 'Your cart is empty',
      checkoutSubmittingBtn: 'Sending order…',
      checkoutAuthPrompt: 'Please sign in or register to place an order.',
      checkoutAuthRequired: 'Please sign in to submit an order.',
      checkoutFileError: 'To send an order, open the site from the running server instead of a local file.',
      checkoutNoPhoneError: 'No registered phone number was found on your account.',
      checkoutEmptyError: 'Your cart is empty.',
      checkoutGenericError: 'Could not send order. Please try again.',
      orderReferencePrefix: 'Order ID:',

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
      emailShortLabel: 'Email',
      emailLabel: 'Email address',
      emailPlaceholder: 'name@example.com',
      countryCodeLabel: 'Country code',
      phoneNumberLabel: 'Phone number',
      customCodePlaceholder: 'Country code, e.g. +81',
      otherLabel: 'Other',
      privacyConsentHtml: 'I have read the <a href="mexfilik.html" target="_blank" rel="noopener">Privacy Policy</a> and consent to processing my personal data to create an account.',
      googleProviderNote: 'Fast one-click sign in and registration with Google.',
      accountGuestNote: 'You can browse the site, add items to your cart, and place orders without creating an account.',
      accountSecurityNote: 'Your account is signed in with a secure session on this device.',
      ordersArchiveEyebrow: 'ORDER ARCHIVE',
      accountOrdersSignInTitle: 'Sign in to your account.',
      accountOrdersSignInDesc: 'Your personal order history will appear here once signed in.',
      ordersLoading: 'Loading orders…',
      orderPrefix: 'Order #',
      orderStatusReceived: 'Order received',
      greetingPrefix: 'Hello',
      phoneShortPrefix: 'Tel',
      authFullNameRequired: 'Please enter your full name.',
      authUsernameMin: 'Username must be at least 3 characters.',
      authPhoneRequired: 'Please enter your full mobile phone number.',
      authPasswordMin: 'Password must be at least 12 characters long.',
      authPrivacyRequired: 'Please accept the Privacy Policy.',
      authIdentifierRequired: 'Please enter your username or phone number.',
      authPasswordRequired: 'Please enter your password.',
      authGoogleSigningIn: 'Signing in with Google…',
      authGoogleOpening: 'Opening Google account selection…',
      authGoogleNotReady: 'Google sign-in service failed to load.',
      authProviderUnavailable: 'This sign-in method is not enabled on the server yet.',
      authNotCompleted: 'Sign-in was not completed.',
      authFileError: 'Open the site from the running server rather than a file URL to use your account.',
      authServiceUnavailable: 'Account service is not active on the server yet. Order history will work once PostgreSQL is connected.',
      authReauthRequired: 'Please sign in again to view your orders.',
      authOrdersError: 'Could not load order history. Please try again.',
      authShowPassword: 'Show password',
      authHidePassword: 'Hide password',
      emailResetHint: '(for password reset — optional)',
      authEmailInvalid: 'Please enter a valid email address.',
      forgotPasswordBtn: 'Forgot password?',
      resetBackToLogin: '← Back to Sign In',
      resetPasswordTitle: 'Reset Password',
      resetRequestDesc: 'Enter the username, phone number, or Gmail linked to your account. If an email is on file, a 6-digit code goes to Gmail; otherwise it is routed to our support desk (Telegram / WhatsApp).',
      resetIdentifierLabel: 'Username, phone, or email',
      resetSendCodeBtn: 'Send verification code',
      resetHaveCodeBtn: 'I already have a reset code',
      resetCodeLabel: '6-digit verification code',
      resetCodePlaceholder: '123456',
      resetNewPasswordLabel: 'New password',
      resetConfirmPasswordLabel: 'Confirm new password',
      resetConfirmSubmitBtn: 'Reset password & sign in',
      resetResendCodeBtn: 'Send code again',
      resetSupportWhatsApp: 'No code yet? WhatsApp: 070 390 10 09',
      resetCodeSentBanner: 'If an account matches, a 6-digit code has been sent (to Gmail or our support line). Please check Spam in Gmail, or message us on WhatsApp (+994 70 390 10 09) if no email is linked.',
      resetCodeInvalid: 'Please enter the valid 6-digit verification code.',
      resetPasswordMismatch: 'The new passwords do not match.',
      logoutConfirmEyebrow: 'ACCOUNT · CONFIRM',
      logoutConfirmTitle: 'Sign out of your account?',
      logoutConfirmDesc: 'After signing out, you will need to sign in again to view your order history and use saved account details.',
      logoutConfirmCancel: 'No, stay',
      logoutConfirmAccept: 'Yes, sign out',
      googlePhoneTitle: 'Complete Google sign-up',
      googlePhoneDesc: 'Please enter your mobile phone number so you can place orders and receive order confirmations.',
      googlePhoneCancel: 'Back',
      googlePhoneSubmit: 'Confirm number & sign in',
      profilePhoneMissingNote: 'No phone number is saved on your account yet. Add your mobile number to place orders.',
      profilePhoneSaveBtn: 'Save number',
      profilePhoneSavedMsg: 'Your phone number has been added to your account.',

      // Favorites
      favoritesTitle: 'Favorites',
      favoritesEmpty: 'No items saved to favorites yet.',
      clearFavorites: 'Clear list',
      favoritesEyebrow: 'YOUR SELECTIONS',
      favoritesDrawerTitle: 'Favorites',
      favoritesDrawerEmptyTitle: 'Your favorites list is empty.',
      favoritesDrawerEmptyDesc: 'Tap the heart icon on any product card to save your selections here.',
      favoritesCountItems: 'items',

      // Privacy Policy
      policyContactHtml: 'You can browse the site and add products to your cart without creating an account. For questions, updates, or deletion requests regarding your account data, call <a href="tel:+994703901009">070 390 10 09</a>.',
      backToHome: '← Back to Home',

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
      aboutCopyHtml: 'Baku Coffee Factory<br />Fresh roasted &amp; specialty coffee<br />Takeaway • Coffeeshop.',
      homeFeaturedEyebrow: 'FEATURED PRODUCTS · 100G / PCS',
      homeFeaturedTitle: 'Most loved<br /><em>into your cart in one tap.</em>',
      homeFeaturedTabAll: 'All',
      homeFeaturedTabCoffee: 'Coffee',
      homeFeaturedTabTea: 'Tea',
      homeFeaturedTabEquipment: 'Equipment',
      homeFeaturedAll: 'View all products',
      homeFeaturedAllCoffee: 'View all coffees',
      homeFeaturedAllTea: 'View all teas',
      homeFeaturedAllEquipment: 'View all equipment',
      homeFeaturedSyncNote: 'All selections are added to the unified cart and updated with live stock.',
      homeBadgePopular: 'POPULAR',
      homeBadgeNew: 'NEW',
      finderEyebrow: 'PERSONAL COFFEE FINDER',
      finderTitle: 'Pick your taste,<br /><em>tailored coffee picks.</em>',
      finderSubtitle: 'Select your brewing method, flavor direction, and intensity to rank the best matching beans from our catalog.',
      finderStepBrew: '01 · BREW METHOD',
      finderBrewEspresso: 'Espresso & Milk',
      finderBrewFilter: 'V60 & Filter',
      finderBrewTurkish: 'Turkish Coffee',
      finderBrewFrench: 'French Press',
      finderStepFlavor: '02 · FLAVOR PROFILE',
      finderFlavorNutty: 'Chocolate & Nutty',
      finderFlavorFruity: 'Fruity & Floral',
      finderFlavorIntense: 'Bold & Spiced',
      finderStepBody: '01 · BODY & STRENGTH',
      finderBodyLight: 'Light',
      finderBodyMedium: 'Medium',
      finderBodyFull: 'Full',
      finderStepAcidity: '02 · ACIDITY',
      finderAcidityLow: 'Low · Smooth',
      finderAcidityBalanced: 'Balanced',
      finderAcidityBright: 'Bright · Vibrant',
      finderDecafToggle: 'Decaf First',
      finderReset: 'Reset',
      finderResultSummary: 'Top 2 coffees matching your taste',
      finderSummarySingle: 'Best 1 coffee match for you',
      finderSummaryPair: 'Top 2 coffees matching your taste',
      finderBestPick: 'Best match',
      finderMatchWord: 'match',
      finderBodyStat: 'Body',
      finderAcidStat: 'Acidity',
      finderBalanceStat: 'Balance',
      finderAllCoffees: 'Explore all coffees',
      homeFinderCtaEyebrow: 'PERSONAL TASTE FINDER',
      homeFinderCtaTitle: 'Choose the coffee<br /><em>made for you.</em>',
      homeFinderCtaDesc: 'Slide to set your body, acidity, and balance levels — we will match the best 1–2 coffees for your palate.',
      homeFinderCtaButton: 'Find your ideal coffee',
      finderPageHeading: 'Find your coffee<br /><em>by sliding the levels.</em>',
      finderPageSubtitle: 'Drag the body, acidity, and balance sliders manually and pick your brew style to reveal your best 1 or 2 coffees.',
      finderStepBalance: '03 · BALANCE',
      finderStepBrewSelect: '04 · BREW METHOD',
      finderStepFlavorSelect: '05 · FLAVOR PROFILE',
      finderOptionAny: 'Any',
      finderScaleBodyLow: '1 · Light',
      finderScaleAcidLow: '1 · Smooth',
      finderScaleAcidHigh: '5 · Bright',
      finderScaleBalLow: '1 · Edgy',
      finderScaleBalHigh: '5 · Harmonic',
      finderScaleMid: '3 · Medium',
      finderScaleBodyHigh: '5 · Full',
      menuDailyEyebrow: 'ONE COFFEE EVERY DAY',
      menuDailyBadge: '-50% · DAILY OFFER',
      menuDailyTitleLatte: 'Today’s pick: Latte',
      menuDailyNote: 'Every day one handcrafted drink in our coffeeshop is 50% off. Today’s half-price pick is Latte — available across all sizes.',
      menuTodayTag: '-50% TODAY',
      menuCatAll: 'All',
      menuCatEspresso: 'Espresso',
      menuCatMilk: 'Milk Coffee',
      menuCatCold: 'Cold',
      menuCatAlt: 'Alternatives',
      menuCatTea: 'Tea',
      menuCatExtras: 'Extras',
      menuSignaturesTitle: 'Signature Picks',
      menuSignaturesBadge: 'BARISTA FAVORITES',
      menuSpecialDesc: 'Velvety Raf-style creamy coffee infused with cardamom and roasted hazelnut paste — reminiscent of Azerbaijani shekerbura.',
      menuV60Desc: 'Clean, aromatic hand-poured filter brew highlighting bright origin clarity.',
      menuDesertFeaturedTitle: 'Featured Desserts',
      menuDessertSub: 'Freshly baked pastries & cakes · Prices are shown in AZN.',
      menuCurrencyNote: 'Prices are shown in AZN.',
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
      teaCollectionEyebrow: 'Коллекция листового чая · 18 позиций',
      teaCollectionHeadline: 'В каждом листе —<br /><em>особое настроение.</em>',
      teaCollectionIntro: 'Познакомьтесь с цветочными, фруктовыми и насыщенными сортами по их вкусовому профилю. Для каждого сорта указаны идеальная температура воды и время заваривания.',
      teaHeroCta: 'Смотреть коллекцию <span>↓</span>',
      teaFactsBrew: 'Заваривание',
      max1kg: 'Максимум 1 кг',
      limit1to20: 'Можно выбрать от 1 до 20 шт.',
      qtyPieces: 'Шт.',
      priceConfirmAfterOrder: 'Цена уточняется после оформления заказа',
      outOfStockNote: 'Этого товара сейчас нет в наличии.',
      addedToCartSentence: 'добавлено в корзину.',

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
      removeBtn: 'Удалить',

      // Checkout
      checkoutEyebrow: 'ЗАПРОС НА ЗАКАЗ',
      checkoutTitle: 'Оформление заказа.',
      sellerNote: 'Примечание к заказу',
      optional: '(необязательно)',
      notePlaceholder: 'Укажите пожелания или детали к заказу, если есть',
      confirmCheckoutBtn: 'Подтвердить заказ и отправить в WhatsApp',
      checkoutDestinationNote: '✓ Заказ отправляется в панель управления, Telegram и WhatsApp (+994 70 390 10 09)',
      orderReceivedEyebrow: 'ЗАКАЗ ПРИНЯТ',
      orderReceivedTitle: 'Ваш запрос на заказ успешно принят.',
      orderWhatsAppHint: 'Ваш заказ зафиксирован! Для быстрого подтверждения отправьте в WhatsApp:',
      sendWhatsAppBtn: 'Отправить в WhatsApp',
      teamContactSubnote: 'Наша команда также свяжется с вами по указанному номеру телефона.',
      continueShopping: 'Продолжить покупки',
      phoneLegend: 'Номер телефона',
      checkoutPhoneHint: 'В вашем аккаунте ещё не указан номер телефона. Введите номер для оформления заказа (он также сохранится в аккаунте).',
      checkoutGuestPhoneHint: 'Вы оформляете заказ без аккаунта. Введите мобильный номер для подтверждения заказа и доставки.',
      phoneRemainderLabel: 'Оставшаяся часть номера',
      checkoutEmptyBtn: 'Ваша корзина пуста',
      checkoutSubmittingBtn: 'Отправка заказа…',
      checkoutAuthPrompt: 'Для оформления заказа войдите в аккаунт или зарегистрируйтесь.',
      checkoutAuthRequired: 'Войдите в аккаунт для отправки заказа.',
      checkoutFileError: 'Для отправки заказа откройте сайт через запущенный сервер, а не локальный файл.',
      checkoutNoPhoneError: 'В вашем аккаунте не найден зарегистрированный номер телефона.',
      checkoutEmptyError: 'Ваша корзина пуста.',
      checkoutGenericError: 'Не удалось отправить заказ. Повторите попытку.',
      orderReferencePrefix: 'Номер заказа:',

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
      emailShortLabel: 'Эл. почта',
      emailLabel: 'Адрес эл. почты',
      emailPlaceholder: 'name@example.com',
      countryCodeLabel: 'Код страны',
      phoneNumberLabel: 'Номер телефона',
      customCodePlaceholder: 'Код страны, напр. +81',
      otherLabel: 'Другой',
      privacyConsentHtml: 'Я ознакомился(ась) с <a href="mexfilik.html" target="_blank" rel="noopener">Политикой конфиденциальности</a> и согласен(на) на обработку моих персональных данных для создания аккаунта.',
      googleProviderNote: 'Быстрый вход и регистрация в один клик через Google.',
      accountGuestNote: 'Вы можете просматривать сайт, добавлять товары в корзину и оформлять заказы без регистрации.',
      accountSecurityNote: 'Ваш аккаунт открыт в защищённой сессии на этом устройстве.',
      ordersArchiveEyebrow: 'АРХИВ ЗАКАЗОВ',
      accountOrdersSignInTitle: 'Войдите в свой аккаунт.',
      accountOrdersSignInDesc: 'Ваша история заказов появится здесь после входа.',
      ordersLoading: 'Загрузка заказов…',
      orderPrefix: 'Заказ №',
      orderStatusReceived: 'Заказ принят',
      greetingPrefix: 'Здравствуйте',
      phoneShortPrefix: 'Тел',
      authFullNameRequired: 'Введите имя и фамилию.',
      authUsernameMin: 'Имя пользователя должно содержать не менее 3 символов.',
      authPhoneRequired: 'Введите полный номер мобильного телефона.',
      authPasswordMin: 'Пароль должен содержать не менее 12 символов.',
      authPrivacyRequired: 'Подтвердите согласие с Политикой конфиденциальности.',
      authIdentifierRequired: 'Введите имя пользователя или номер телефона.',
      authPasswordRequired: 'Введите пароль.',
      authGoogleSigningIn: 'Вход через Google…',
      authGoogleOpening: 'Открытие выбора аккаунта Google…',
      authGoogleNotReady: 'Сервис входа через Google не загружен.',
      authProviderUnavailable: 'Этот способ входа пока не настроен на сервере.',
      authNotCompleted: 'Вход не завершён.',
      authFileError: 'Для работы с аккаунтом откройте сайт через работающий сервер, а не локальный файл.',
      authServiceUnavailable: 'Сервис аккаунтов ещё не активен на сервере. История заказов заработает после подключения PostgreSQL.',
      authReauthRequired: 'Войдите в аккаунт повторно для просмотра заказов.',
      authOrdersError: 'Не удалось загрузить историю заказов. Повторите попытку.',
      authShowPassword: 'Показать пароль',
      authHidePassword: 'Скрыть пароль',
      emailResetHint: '(для сброса пароля — необязательно)',
      authEmailInvalid: 'Введите корректный адрес эл. почты.',
      forgotPasswordBtn: 'Забыли пароль?',
      resetBackToLogin: '← Вернуться ко входу',
      resetPasswordTitle: 'Сброс пароля',
      resetRequestDesc: 'Введите имя пользователя, телефон или Gmail от вашего аккаунта. Если указан email, 6-значный код придёт на Gmail; иначе он поступит в нашу службу поддержки (Telegram / WhatsApp).',
      resetIdentifierLabel: 'Имя пользователя, телефон или email',
      resetSendCodeBtn: 'Отправить код подтверждения',
      resetHaveCodeBtn: 'У меня уже есть код',
      resetCodeLabel: '6-значный код подтверждения',
      resetCodePlaceholder: '123456',
      resetNewPasswordLabel: 'Новый пароль',
      resetConfirmPasswordLabel: 'Повторите новый пароль',
      resetConfirmSubmitBtn: 'Обновить пароль и войти',
      resetResendCodeBtn: 'Отправить код повторно',
      resetSupportWhatsApp: 'Не пришёл код? WhatsApp: 070 390 10 09',
      resetCodeSentBanner: 'Если аккаунт найден, 6-значный код отправлен (на Gmail или в службу поддержки). Проверьте папку «Спам» в Gmail или напишите в WhatsApp (+994 70 390 10 09), если почта не привязана.',
      resetCodeInvalid: 'Введите корректный 6-значный код подтверждения.',
      resetPasswordMismatch: 'Новые пароли не совпадают.',
      logoutConfirmEyebrow: 'АККАУНТ · ПОДТВЕРЖДЕНИЕ',
      logoutConfirmTitle: 'Выйти из аккаунта?',
      logoutConfirmDesc: 'После выхода вам потребуется снова войти в аккаунт, чтобы просматривать историю заказов и использовать данные аккаунта.',
      logoutConfirmCancel: 'Нет, остаться',
      logoutConfirmAccept: 'Да, выйти',
      googlePhoneTitle: 'Завершите регистрацию через Google',
      googlePhoneDesc: 'Укажите ваш номер мобильного телефона для оформления заказов и связи по ним.',
      googlePhoneCancel: 'Назад',
      googlePhoneSubmit: 'Подтвердить номер и войти',
      profilePhoneMissingNote: 'В вашем аккаунте ещё не указан номер телефона. Добавьте мобильный номер, чтобы оформлять заказы.',
      profilePhoneSaveBtn: 'Сохранить номер',
      profilePhoneSavedMsg: 'Ваш номер телефона добавлен в аккаунт.',

      // Favorites
      favoritesTitle: 'Избранное',
      favoritesEmpty: 'В избранном пока ничего нет.',
      clearFavorites: 'Очистить список',
      favoritesEyebrow: 'ВАШ ВЫБОР',
      favoritesDrawerTitle: 'Избранное',
      favoritesDrawerEmptyTitle: 'Список избранного пуст.',
      favoritesDrawerEmptyDesc: 'Нажмите на значок сердечка на карточке товара, чтобы сохранить его здесь.',
      favoritesCountItems: 'товаров',

      // Privacy Policy
      policyContactHtml: 'Вы можете просматривать сайт и добавлять товары в корзину без регистрации. По вопросам, изменениям и удалению данных аккаунта свяжитесь с нами по номеру <a href="tel:+994703901009">070 390 10 09</a>.',
      backToHome: '← Вернуться на главную',

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
      aboutCopyHtml: 'Baku Coffee Factory<br />Свежеобжаренный спешелти кофе<br />Навынос • Кофейня.',
      homeFeaturedEyebrow: 'ИЗБРАННЫЕ ТОВАРЫ · 100 Г / ШТ.',
      homeFeaturedTitle: 'Самые популярные<br /><em>в корзину в один клик.</em>',
      homeFeaturedTabAll: 'Все',
      homeFeaturedTabCoffee: 'Кофе',
      homeFeaturedTabTea: 'Чай',
      homeFeaturedTabEquipment: 'Оборудование',
      homeFeaturedAll: 'Смотреть все товары',
      homeFeaturedAllCoffee: 'Смотреть весь кофе',
      homeFeaturedAllTea: 'Смотреть все чаи',
      homeFeaturedAllEquipment: 'Смотреть всё оборудование',
      homeFeaturedSyncNote: 'Все позиции добавляются в единую корзину и обновляются по актуальному наличию.',
      homeBadgePopular: 'ПОПУЛЯРНОЕ',
      homeBadgeNew: 'НОВИНКА',
      finderEyebrow: 'ПЕРСОНАЛЬНЫЙ ПОДБОР КОФЕ',
      finderTitle: 'Выберите параметры,<br /><em>кофе под ваш вкус.</em>',
      finderSubtitle: 'Укажите способ заваривания, профиль вкуса и плотность — подберём наиболее подходящие сорта из каталога.',
      finderStepBrew: '01 · СПОСОБ ЗАВАРИВАНИЯ',
      finderBrewEspresso: 'Эспрессо и с молоком',
      finderBrewFilter: 'V60 и фильтр',
      finderBrewTurkish: 'В турке',
      finderBrewFrench: 'Френч-пресс',
      finderStepFlavor: '02 · ПРОФИЛЬ ВКУСА',
      finderFlavorNutty: 'Шоколад и орехи',
      finderFlavorFruity: 'Фрукты и цветы',
      finderFlavorIntense: 'Крепкий и пряный',
      finderStepBody: '01 · ТЕЛО (ПЛОТНОСТЬ)',
      finderBodyLight: 'Лёгкое',
      finderBodyMedium: 'Среднее',
      finderBodyFull: 'Плотное',
      finderStepAcidity: '02 · КИСЛОТНОСТЬ',
      finderAcidityLow: 'Низкая · мягкая',
      finderAcidityBalanced: 'Средняя',
      finderAcidityBright: 'Яркая · живая',
      finderDecafToggle: 'Без кофеина (Decaf)',
      finderReset: 'Сбросить',
      finderResultSummary: 'Топ-2 сорта под ваши параметры',
      finderSummarySingle: '1 лучший сорт под ваш вкус',
      finderSummaryPair: 'Топ-2 сорта под ваши параметры',
      finderBestPick: 'Лучший выбор',
      finderMatchWord: 'совп.',
      finderBodyStat: 'Тело',
      finderAcidStat: 'Кислотность',
      finderBalanceStat: 'Баланс',
      finderAllCoffees: 'Смотреть весь кофе',
      homeFinderCtaEyebrow: 'ПЕРСОНАЛЬНЫЙ ПОДБОР',
      homeFinderCtaTitle: 'Подберите кофе<br /><em>идеально для себя.</em>',
      homeFinderCtaDesc: 'Отрегулируйте тело, кислотность и баланс вручную — покажем 1–2 лучших сорта из нашей обжарки.',
      homeFinderCtaButton: 'Выбрать свой кофе',
      finderPageHeading: 'Найдите свой кофе<br /><em>плавной настройкой вкуса.</em>',
      finderPageSubtitle: 'Передвигайте ползунки плотности, кислотности и баланса и выберите способ заваривания — мы подберём 1 или 2 лучших сорта.',
      finderStepBalance: '03 · БАЛАНС',
      finderStepBrewSelect: '04 · СПОСОБ ЗАВАРИВАНИЯ',
      finderStepFlavorSelect: '05 · ПРОФИЛЬ ВКУСА',
      finderOptionAny: 'Любой',
      finderScaleBodyLow: '1 · Лёгкое',
      finderScaleAcidLow: '1 · Мягкая',
      finderScaleAcidHigh: '5 · Яркая',
      finderScaleBalLow: '1 · Резкий',
      finderScaleBalHigh: '5 · Гармония',
      finderScaleMid: '3 · Среднее',
      finderScaleBodyHigh: '5 · Плотное',
      menuDailyEyebrow: 'КАЖДЫЙ ДЕНЬ НОВЫЙ КОФЕ',
      menuDailyBadge: '-50% · КОФЕ ДНЯ',
      menuDailyTitleLatte: 'Выбор дня: Латте',
      menuDailyNote: 'Каждый день в нашей кофейне действует скидка 50% на один напиток. Сегодня напиток дня — Латте, за полцены во всех размерах.',
      menuTodayTag: '-50% СЕГОДНЯ',
      menuCatAll: 'Все',
      menuCatEspresso: 'Эспрессо',
      menuCatMilk: 'С молоком',
      menuCatCold: 'Холодные',
      menuCatAlt: 'Альтернатива',
      menuCatTea: 'Чай',
      menuCatExtras: 'Добавки',
      menuSignaturesTitle: 'Фирменный выбор',
      menuSignaturesBadge: 'ВЫБОР БАРИСТА',
      menuSpecialDesc: 'Нежный раф на сливках с кардамоном и пастой из жареного фундука — с тёплым оттенком азербайджанской шекербуры.',
      menuV60Desc: 'Чистое и ароматное ручное заваривание, раскрывающее яркие ноты зерна.',
      menuDesertFeaturedTitle: 'Избранные десерты',
      menuDessertSub: 'Свежая выпечка и десерты · Цены указаны в AZN.',
      menuCurrencyNote: 'Цены указаны в AZN.',
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
      teaCollectionEyebrow: 'تشكيلة شاي أوراق كاملة · 18 خياراً',
      teaCollectionHeadline: 'في كل ورقة<br /><em>مزاج مختلف.</em>',
      teaCollectionIntro: 'تعرّف على أنواع الشاي الزهرية والفاكهية والغنية من خلال طابعها المذاقي. كما حددنا حرارة الماء المثالية ومدة التخمير لكل نوع.',
      teaHeroCta: 'تصفح المجموعة <span>↓</span>',
      teaFactsBrew: 'طريقة التحضير',
      max1kg: 'الحد الأقصى 1 كجم',
      limit1to20: 'يمكنك اختيار من 1 إلى 20 قطعة',
      qtyPieces: 'القطع',
      priceConfirmAfterOrder: 'سيتم تأكيد السعر بعد الطلب',
      outOfStockNote: 'هذا المنتج غير متوفر في المخزون حالياً.',
      addedToCartSentence: 'تمت إضافته إلى السلة.',

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
      removeBtn: 'إزالة',

      // Checkout
      checkoutEyebrow: 'طلب شراء',
      checkoutTitle: 'إتمام الطلب.',
      sellerNote: 'ملاحظة للبائع',
      optional: '(اختياري)',
      notePlaceholder: 'اكتب أي ملاحظة أو طلب خاص بطلبك هنا',
      confirmCheckoutBtn: 'تأكيد الطلب والإرسال عبر واتساب',
      checkoutDestinationNote: '✓ يتم إرسال الطلب إلى لوحة التحكم وتيليجرام وواتساب (+994 70 390 10 09)',
      orderReceivedEyebrow: 'تم تسجيل الطلب',
      orderReceivedTitle: 'تم استلام طلبك بنجاح.',
      orderWhatsAppHint: 'تم تسجيل طلبك! أرسله مباشرة عبر واتساب للتأكيد الفوري:',
      sendWhatsAppBtn: 'إرسال عبر واتساب',
      teamContactSubnote: 'سيتواصل فريقنا أيضاً معك عبر رقم الهاتف المسجل.',
      continueShopping: 'متابعة التسوق',
      phoneLegend: 'رقم الهاتف',
      checkoutPhoneHint: 'لا يوجد رقم هاتف مرتبط بحسابك بعد. أدخل رقمك لإتمام الطلب (وسيتم حفظه في حسابك أيضاً).',
      checkoutGuestPhoneHint: 'تطلب كضيف بدون حساب. أدخل رقم هاتفك المحمول لتأكيد الطلب والتوصيل.',
      phoneRemainderLabel: 'باقي رقم الهاتف',
      checkoutEmptyBtn: 'سلتك فارغة',
      checkoutSubmittingBtn: 'جارٍ إرسال الطلب…',
      checkoutAuthPrompt: 'يرجى تسجيل الدخول أو إنشاء حساب لإتمام الطلب.',
      checkoutAuthRequired: 'يرجى تسجيل الدخول لإرسال الطلب.',
      checkoutFileError: 'لإرسال الطلب، افتح الموقع عبر الخادم النشط وليس كملف محلي.',
      checkoutNoPhoneError: 'لم يتم العثور على رقم هاتف مسجل في حسابك.',
      checkoutEmptyError: 'سلتك فارغة.',
      checkoutGenericError: 'تعذر إرسال الطلب. يرجى المحاولة مرة أخرى.',
      orderReferencePrefix: 'رقم الطلب:',

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
      emailShortLabel: 'البريد الإلكتروني',
      emailLabel: 'البريد الإلكتروني',
      emailPlaceholder: 'name@example.com',
      countryCodeLabel: 'رمز الدولة',
      phoneNumberLabel: 'رقم الهاتف',
      customCodePlaceholder: 'رمز الدولة، مثال +81',
      otherLabel: 'أخرى',
      privacyConsentHtml: 'لقد قرأت <a href="mexfilik.html" target="_blank" rel="noopener">سياسة الخصوصية</a> وأوافق على معالجة بياناتي الشخصية لإنشاء حساب.',
      googleProviderNote: 'تسجيل الدخول وإنشاء الحساب بنقرة واحدة عبر جوجل.',
      accountGuestNote: 'يمكنك تصفح الموقع وإضافة المنتجات إلى السلة وإتمام الطلبات دون إنشاء حساب.',
      accountSecurityNote: 'حسابك مسجّل الدخول بجلسة آمنة على هذا الجهاز.',
      ordersArchiveEyebrow: 'أرشيف الطلبات',
      accountOrdersSignInTitle: 'سجّل الدخول إلى حسابك.',
      accountOrdersSignInDesc: 'سيظهر سجل طلباتك الشخصي هنا بعد تسجيل الدخول.',
      ordersLoading: 'جارٍ تحميل الطلبات…',
      orderPrefix: 'الطلب #',
      orderStatusReceived: 'تم تسجيل الطلب',
      greetingPrefix: 'مرحباً',
      phoneShortPrefix: 'هاتف',
      authFullNameRequired: 'يرجى إدخال الاسم الكامل.',
      authUsernameMin: 'يجب أن يتكون اسم المستخدم من 3 أحرف على الأقل.',
      authPhoneRequired: 'يرجى إدخال رقم الهاتف المحمول كاملاً.',
      authPasswordMin: 'يجب أن تتكون كلمة المرور من 12 حرفاً على الأقل.',
      authPrivacyRequired: 'يرجى الموافقة على سياسة الخصوصية.',
      authIdentifierRequired: 'يرجى إدخال اسم المستخدم أو رقم الهاتف.',
      authPasswordRequired: 'يرجى إدخال كلمة المرور.',
      authGoogleSigningIn: 'جارٍ تسجيل الدخول عبر جوجل…',
      authGoogleOpening: 'جارٍ فتح نافذة اختيار حساب جوجل…',
      authGoogleNotReady: 'تعذر تحميل خدمة تسجيل الدخول عبر جوجل.',
      authProviderUnavailable: 'طريقة الدخول هذه غير مفعّلة على الخادم حالياً.',
      authNotCompleted: 'لم يكتمل تسجيل الدخول.',
      authFileError: 'لاستخدام الحساب، افتح الموقع عبر الخادم النشط وليس كملف محلي.',
      authServiceUnavailable: 'خدمة الحسابات غير مفعلة على الخادم بعد. سيعمل سجل الطلبات بعد ربط قاعدة البيانات.',
      authReauthRequired: 'يرجى تسجيل الدخول مجدداً لعرض طلباتك.',
      authOrdersError: 'تعذر تحميل سجل الطلبات. يرجى المحاولة مرة أخرى.',
      authShowPassword: 'إظهار كلمة المرور',
      authHidePassword: 'إخفاء كلمة المرور',
      emailResetHint: '(لاستعادة كلمة المرور — اختياري)',
      authEmailInvalid: 'يرجى إدخال عنوان بريد إلكتروني صحيح.',
      forgotPasswordBtn: 'هل نسيت كلمة المرور؟',
      resetBackToLogin: '← العودة إلى تسجيل الدخول',
      resetPasswordTitle: 'إعادة تعيين كلمة المرور',
      resetRequestDesc: 'أدخل اسم المستخدم أو رقم الهاتف أو بريد Gmail المرتبط بحسابك. إذا كان لديك بريد إلكتروني، سيصل الرمز إلى Gmail، وإلا فسيُرسل عبر فريق الدعم (تيليجرام / واتساب).',
      resetIdentifierLabel: 'اسم المستخدم أو الهاتف أو البريد الإلكتروني',
      resetSendCodeBtn: 'إرسال رمز التحقق',
      resetHaveCodeBtn: 'لدي رمز تحقق بالفعل',
      resetCodeLabel: 'رمز التحقق المكوّن من 6 أرقام',
      resetCodePlaceholder: '123456',
      resetNewPasswordLabel: 'كلمة المرور الجديدة',
      resetConfirmPasswordLabel: 'تأكيد كلمة المرور الجديدة',
      resetConfirmSubmitBtn: 'تحديث كلمة المرور والدخول',
      resetResendCodeBtn: 'إعادة إرسال الرمز',
      resetSupportWhatsApp: 'لم يصلك الرمز؟ واتساب: 070 390 10 09',
      resetCodeSentBanner: 'إذا وُجد حساب مطابق، تم إرسال رمز من 6 أرقام (عبر Gmail أو فريق الدعم). تحقّق من مجلد الرسائل غير المرغوب فيها أو تواصل عبر واتساب (+994 70 390 10 09).',
      resetCodeInvalid: 'يرجى إدخال رمز التحقق الصحيح المكوّن من 6 أرقام.',
      resetPasswordMismatch: 'كلمتا المرور الجديدتان غير متطابقتين.',
      logoutConfirmEyebrow: 'الحساب · تأكيد',
      logoutConfirmTitle: 'هل تريد تسجيل الخروج؟',
      logoutConfirmDesc: 'بعد تسجيل الخروج، ستحتاج إلى تسجيل الدخول مرة أخرى لعرض سجل طلباتك واستخدام بيانات حسابك.',
      logoutConfirmCancel: 'لا، البقاء',
      logoutConfirmAccept: 'نعم، تسجيل الخروج',
      googlePhoneTitle: 'أكمل التسجيل عبر Google',
      googlePhoneDesc: 'يرجى إدخال رقم هاتفك المحمول لتتمكن من تقديم الطلبات واستلام تأكيد الطلب.',
      googlePhoneCancel: 'رجوع',
      googlePhoneSubmit: 'تأكيد الرقم والدخول',
      profilePhoneMissingNote: 'لا يوجد رقم هاتف محفوظ في حسابك بعد. أضف رقمك المحمول لتقديم الطلبات.',
      profilePhoneSaveBtn: 'حفظ الرقم',
      profilePhoneSavedMsg: 'تمت إضافة رقم هاتفك إلى حسابك.',

      // Favorites
      favoritesTitle: 'المفضلة',
      favoritesEmpty: 'لم تقم بحفظ أي منتج في المفضلة بعد.',
      clearFavorites: 'مسح القائمة',
      favoritesEyebrow: 'اختياراتك المفضلة',
      favoritesDrawerTitle: 'المفضلة',
      favoritesDrawerEmptyTitle: 'قائمة المفضلة فارغة.',
      favoritesDrawerEmptyDesc: 'اضغط على أيقونة القلب في بطاقة المنتج لحفظ اختياراتك هنا.',
      favoritesCountItems: 'منتجات',

      // Privacy Policy
      policyContactHtml: 'يمكنك تصفح الموقع وإضافة المنتجات إلى السلة دون إنشاء حساب. للاستفسار أو تعديل أو حذف بيانات حسابك، تواصل عبر الرقم <a href="tel:+994703901009">070 390 10 09</a>.',
      backToHome: '← العودة إلى الرئيسية',

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
      aboutCopyHtml: 'باكو كوفي فاكتوري<br />قهوة مختصة ومحمصة طازجة<br />سفري • كافيه.',
      homeFeaturedEyebrow: 'المنتجات المختارة · 100 جم / قطعة',
      homeFeaturedTitle: 'الأكثر طلباً<br /><em>إلى سلتك بلمسة واحدة.</em>',
      homeFeaturedTabAll: 'الكل',
      homeFeaturedTabCoffee: 'القهوة',
      homeFeaturedTabTea: 'الشاي',
      homeFeaturedTabEquipment: 'المعدات',
      homeFeaturedAll: 'عرض جميع المنتجات',
      homeFeaturedAllCoffee: 'عرض كل أنواع القهوة',
      homeFeaturedAllTea: 'عرض كل أنواع الشاي',
      homeFeaturedAllEquipment: 'عرض جميع المعدات',
      homeFeaturedSyncNote: 'تُضاف جميع الاختيارات إلى السلة الموحدة وتتحدث مع المخزون المباشر.',
      homeBadgePopular: 'الأكثر طلباً',
      homeBadgeNew: 'جديد',
      finderEyebrow: 'مكتشف القهوة المخصص',
      finderTitle: 'اختر تفضيلاتك،<br /><em>قهوة تناسب ذوقك.</em>',
      finderSubtitle: 'حدد طريقة التحضير ونكهة القهوة وقوامها لنرتب لك أفضل المحاصيل المناسبة من مجموعتنا.',
      finderStepBrew: '01 · طريقة التحضير',
      finderBrewEspresso: 'إسبريسو وحليب',
      finderBrewFilter: 'V60 وفلتر',
      finderBrewTurkish: 'قهوة تركية',
      finderBrewFrench: 'فرنش برس',
      finderStepFlavor: '02 · اتجاه النكهة',
      finderFlavorNutty: 'شوكولاتة ومكسرات',
      finderFlavorFruity: 'فاكهي وزهري',
      finderFlavorIntense: 'قوي ومتبّل',
      finderStepBody: '01 · القوام والكثافة',
      finderBodyLight: 'خفيف',
      finderBodyMedium: 'متوسط',
      finderBodyFull: 'كثيف',
      finderStepAcidity: '02 · الحموضة',
      finderAcidityLow: 'منخفضة · ناعمة',
      finderAcidityBalanced: 'متوازنة',
      finderAcidityBright: 'ساطعة · منعشة',
      finderDecafToggle: 'بدون كافيين (ديكاف)',
      finderReset: 'إعادة ضبط',
      finderResultSummary: 'أفضل نوعين يناسبان ذوقك',
      finderSummarySingle: 'أفضل خيار واحد يناسبك',
      finderSummaryPair: 'أفضل نوعين يناسبان ذوقك',
      finderBestPick: 'الأكثر ملاءمة',
      finderMatchWord: 'تطابق',
      finderBodyStat: 'القوام',
      finderAcidStat: 'الحموضة',
      finderBalanceStat: 'التوازن',
      finderAllCoffees: 'تصفح جميع أنواع القهوة',
      homeFinderCtaEyebrow: 'اختبار الذوق الشخصي',
      homeFinderCtaTitle: 'اختر القهوة<br /><em>المناسبة لذوقك.</em>',
      homeFinderCtaDesc: 'حرّك مؤشرات القوام والحموضة والتوازن يدوياً لنرشح لك أفضل نوع أو نوعين يناسبانك فوراً.',
      homeFinderCtaButton: 'اختر قهوتك المناسبة',
      finderPageHeading: 'اكتشف قهوتك<br /><em>بتحريك مستويات النكهة.</em>',
      finderPageSubtitle: 'حرّك مؤشرات القوام والحموضة والتوازن واختر طريقة التحضير لنعرض لك أنسب نوع أو نوعين.',
      finderStepBalance: '03 · التوازن',
      finderStepBrewSelect: '04 · طريقة التحضير',
      finderStepFlavorSelect: '05 · اتجاه النكهة',
      finderOptionAny: 'أي خيار',
      finderScaleBodyLow: '1 · خفيف',
      finderScaleAcidLow: '1 · ناعمة',
      finderScaleAcidHigh: '5 · ساطعة',
      finderScaleBalLow: '1 · حاد',
      finderScaleBalHigh: '5 · متناغم',
      finderScaleMid: '3 · متوسط',
      finderScaleBodyHigh: '5 · كثيف',
      menuDailyEyebrow: 'قهوة واحدة كل يوم',
      menuDailyBadge: '-50% · عرض اليوم',
      menuDailyTitleLatte: 'اختيار اليوم: لاتيه',
      menuDailyNote: 'في مقهانا، يحظى مشروب واحد يومياً بخصم 50%. اختيار اليوم هو لاتيه بنصف السعر في جميع الأحجام.',
      menuTodayTag: '-50% اليوم',
      menuCatAll: 'الكل',
      menuCatEspresso: 'إسبريسو',
      menuCatMilk: 'بالحليب',
      menuCatCold: 'بارد',
      menuCatAlt: 'طرق بديلة',
      menuCatTea: 'الشاي',
      menuCatExtras: 'إضافات',
      menuSignaturesTitle: 'اختياراتنا المميزة',
      menuSignaturesBadge: 'توصية الباريستا',
      menuSpecialDesc: 'قهوة كريمية على طريقة الراف بنفحات الهيل ومعجون البندق المحمص بلمسة حلوى الشكربورا.',
      menuV60Desc: 'تقطير يدوي نقي وعطري يبرز صفاء المحصول.',
      menuDesertFeaturedTitle: 'حلويات مختارة',
      menuDessertSub: 'حلويات مخبوزة طازجة · الأسعار معروضة بالمانات (AZN).',
      menuCurrencyNote: 'الأسعار معروضة بالمانات (AZN).',
    },
  };

  // Comprehensive phrase translations covering all products, categories, descriptions, notes, and UI texts
  const PHRASE_MAP = ${JSON.stringify(PHRASE_MAP, null, 2)};

  // Reverse lookup map to recover original Azerbaijani key from any translated text
  const REVERSE_MAP = {};
  const DICT_AZ_TO_KEY = {};
  const DICT_REVERSE = {};
  for (const [azKey, trans] of Object.entries(PHRASE_MAP)) {
    if (trans.en && !REVERSE_MAP[trans.en]) REVERSE_MAP[trans.en] = azKey;
    if (trans.ru && !REVERSE_MAP[trans.ru]) REVERSE_MAP[trans.ru] = azKey;
    if (trans.ar && !REVERSE_MAP[trans.ar]) REVERSE_MAP[trans.ar] = azKey;
  }
  for (const [key, azVal] of Object.entries(DICTIONARY.az || {})) {
    if (!azVal || azVal.includes('<')) continue;
    if (!DICT_AZ_TO_KEY[azVal]) DICT_AZ_TO_KEY[azVal] = key;
    for (const l of ['en', 'ru', 'ar']) {
      const trVal = DICTIONARY[l]?.[key];
      if (trVal && !trVal.includes('<') && !DICT_REVERSE[trVal]) {
        DICT_REVERSE[trVal] = azVal;
      }
    }
  }

  function lookupPhrase(azText, lang) {
    if (!azText || lang === 'az') return azText || null;
    if (PHRASE_MAP[azText]?.[lang]) return PHRASE_MAP[azText][lang];
    const dictKey = DICT_AZ_TO_KEY[azText];
    if (dictKey && DICTIONARY[lang]?.[dictKey]) return DICTIONARY[lang][dictKey];
    return null;
  }

  function recoverAzText(text) {
    if (!text) return text;
    if (PHRASE_MAP[text] || DICT_AZ_TO_KEY[text]) return text;
    if (REVERSE_MAP[text]) return REVERSE_MAP[text];
    if (DICT_REVERSE[text]) return DICT_REVERSE[text];

    // R1: "<Origin> · <n> q|g|г|جم"
    let m = text.match(/^(.+?)\\s*·\\s*(\\d+)\\s*(?:q|g|г|جم)$/i);
    if (m) {
      const nameAz = REVERSE_MAP[m[1].trim()] || DICT_REVERSE[m[1].trim()] || m[1].trim();
      return nameAz + ' · ' + m[2] + ' q';
    }
    // R2: "<price> ₼ / 100 q|g|г|جم"
    m = text.match(/^([\\d.]+\\s*₼)\\s*\\/\\s*100\\s*(?:q|g|г|جم)$/i);
    if (m) return m[1].trim() + ' / 100 q';
    // R3: "<price> ₼ / ədəd|pc|pcs|шт.|قطعة"
    m = text.match(/^([\\d.]+\\s*₼)\\s*\\/\\s*(?:ədəd|pcs?|шт\\.?|قطعة)$/i);
    if (m) return m[1].trim() + ' / ədəd';
    // R4: "<n> options/варианта/خيارات"
    if (text === 'خيار واحد') return '1 seçim';
    if (text === 'خياران') return '2 seçim';
    m = text.match(/^(\\d+)\\s+(?:seçim|options?|варианта|вариантов|вариант|خيارات|خيار)$/i);
    if (m) return m[1] + ' seçim';
    // R5: "Seçim N / Option N / Вариант N / الخيار N"
    m = text.match(/^(?:Seçim|Option|Вариант|الخيار)\\s+(\\d+)$/i);
    if (m) return 'Seçim ' + m[1];
    // R6: stock remaining
    if (text === 'متبقي قطعة واحدة') return '1 ədəd qalıb';
    if (text === 'متبقي قطعتان') return '2 ədəd qalıb';
    m = text.match(/^(\\d+)\\s+(?:ədəd qalıb|left in stock)$/i)
      || text.match(/^Осталось\\s+(\\d+)\\s+шт\\.?$/i)
      || text.match(/^متبقي\\s+(\\d+)\\s+قطع(?:ة)?$/);
    if (m) return m[1] + ' ədəd qalıb';
    // R7: Country (+code) (before generic parentheses pattern)
    m = text.match(/^(.+?)\\s+\\((\\+\\d+)\\)$/);
    if (m) {
      const cAz = REVERSE_MAP[m[1].trim()] || DICT_REVERSE[m[1].trim()] || m[1].trim();
      return cAz + ' (' + m[2] + ')';
    }
    // R8: "<desc> (<variantAlt>)"
    m = text.match(/^(.+?)\\s+\\(([^)]+)\\)$/);
    if (m) {
      const lTrim = m[1].trim();
      const rTrim = m[2].trim();
      const lAz = REVERSE_MAP[lTrim] || DICT_REVERSE[lTrim];
      const rAz = REVERSE_MAP[rTrim] || DICT_REVERSE[rTrim];
      if (lAz || rAz) return (lAz || lTrim) + ' (' + (rAz || rTrim) + ')';
    }
    // R9: "<Product> · <Variant>"
    m = text.match(/^(.+?)\\s+·\\s+(.+)$/);
    if (m) {
      const lTrim = m[1].trim();
      const rTrim = m[2].trim();
      const lAz = REVERSE_MAP[lTrim] || DICT_REVERSE[lTrim];
      const rAz = REVERSE_MAP[rTrim] || DICT_REVERSE[rTrim];
      if (lAz || rAz) return (lAz || lTrim) + ' · ' + (rAz || rTrim);
    }
    return text;
  }

  function translateDynamicText(inputText, lang = currentLang) {
    if (!inputText) return inputText;
    const base = recoverAzText(String(inputText));
    if (lang === 'az') return base;

    const direct = lookupPhrase(base, lang);
    if (direct) return direct;

    // 1. "<Origin> · <weight> q"
    let m = base.match(/^(.+?)\\s*·\\s*(\\d+)\\s*q$/);
    if (m) {
      const origin = lookupPhrase(m[1].trim(), lang) || m[1].trim();
      const n = m[2];
      if (lang === 'en') return origin + ' · ' + n + 'g';
      if (lang === 'ru') return origin + ' · ' + n + ' г';
      if (lang === 'ar') return origin + ' · ' + n + ' جم';
    }
    // 2. "<price> ₼ / 100 q"
    m = base.match(/^([\\d.]+\\s*₼)\\s*\\/\\s*100\\s*q$/);
    if (m) {
      if (lang === 'en') return m[1].trim() + ' / 100g';
      if (lang === 'ru') return m[1].trim() + ' / 100 г';
      if (lang === 'ar') return m[1].trim() + ' / 100 جم';
    }
    // 3. "<price> ₼ / ədəd"
    m = base.match(/^([\\d.]+\\s*₼)\\s*\\/\\s*ədəd$/);
    if (m) {
      if (lang === 'en') return m[1].trim() + ' / pc';
      if (lang === 'ru') return m[1].trim() + ' / шт.';
      if (lang === 'ar') return m[1].trim() + ' / قطعة';
    }
    // 4. "<N> seçim"
    m = base.match(/^(\\d+)\\s+seçim$/);
    if (m) {
      const n = Number(m[1]);
      if (lang === 'en') return n === 1 ? '1 option' : n + ' options';
      if (lang === 'ru') {
        const mod10 = n % 10;
        const mod100 = n % 100;
        const form = mod10 === 1 && mod100 !== 11 ? 'вариант' : (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? 'варианта' : 'вариантов');
        return n + ' ' + form;
      }
      if (lang === 'ar') {
        if (n === 1) return 'خيار واحد';
        if (n === 2) return 'خياران';
        return n >= 3 && n <= 10 ? n + ' خيارات' : n + ' خيار';
      }
    }
    // 5. "Seçim <N>"
    m = base.match(/^Seçim\\s+(\\d+)$/);
    if (m) {
      if (lang === 'en') return 'Option ' + m[1];
      if (lang === 'ru') return 'Вариант ' + m[1];
      if (lang === 'ar') return 'الخيار ' + m[1];
    }
    // 6. "<N> ədəd qalıb"
    m = base.match(/^(\\d+)\\s+ədəd qalıb$/);
    if (m) {
      const n = Number(m[1]);
      if (lang === 'en') return n + ' left in stock';
      if (lang === 'ru') return 'Осталось ' + n + ' шт.';
      if (lang === 'ar') {
        if (n === 1) return 'متبقي قطعة واحدة';
        if (n === 2) return 'متبقي قطعتان';
        return n >= 3 && n <= 10 ? 'متبقي ' + n + ' قطع' : 'متبقي ' + n + ' قطعة';
      }
    }
    // 7. Country (+code) (checked before Pattern 8)
    m = base.match(/^(.+?)\\s+\\((\\+\\d+)\\)$/);
    if (m) {
      const c = lookupPhrase(m[1].trim(), lang) || m[1].trim();
      return c + ' (' + m[2] + ')';
    }
    // 8. "<desc> (<variantAlt>)"
    m = base.match(/^(.+?)\\s+\\(([^)]+)\\)$/);
    if (m) {
      const l = lookupPhrase(m[1].trim(), lang);
      const r = lookupPhrase(m[2].trim(), lang);
      if (l || r) return (l || m[1].trim()) + ' (' + (r || m[2].trim()) + ')';
    }
    // 9. "<Product> · <Variant>"
    m = base.match(/^(.+?)\\s+·\\s+(.+)$/);
    if (m) {
      const l = lookupPhrase(m[1].trim(), lang);
      const r = lookupPhrase(m[2].trim(), lang);
      if (l || r) return (l || m[1].trim()) + ' · ' + (r || m[2].trim());
    }

    return base;
  }

  function getSavedLanguage() {
    try {
      const fromLocal = localStorage.getItem(STORAGE_KEY);
      if (fromLocal && LANGUAGES[fromLocal]) return fromLocal;
    } catch {}
    try {
      const match = document.cookie.match(/(?:^|;\\s*)bcf_language=([^;]+)/);
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
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = LANGUAGES[currentLang]?.dir || 'ltr';
  }

  function getLanguage() {
    return currentLang;
  }

  function t(key, fallback = '') {
    return DICTIONARY[currentLang]?.[key] ?? DICTIONARY[DEFAULT_LANG]?.[key] ?? fallback;
  }

  function setLanguage(lang, options = {}) {
    if (!LANGUAGES[lang]) return;
    const prevLang = currentLang;
    currentLang = lang;
    persistLanguage(lang);

    document.documentElement.lang = lang;
    document.documentElement.dir = LANGUAGES[lang].dir;

    // Body language classes
    if (document.body?.classList) {
      document.body.classList.remove('lang-az', 'lang-en', 'lang-ru', 'lang-ar');
      document.body.classList.add('lang-' + lang);
    }

    updateLanguageSelector();
    translateDom();

    window.dispatchEvent(new CustomEvent('bcf:language-changed', { detail: { lang } }));

    if (options && options.reload && prevLang && prevLang !== lang && typeof window !== 'undefined' && window.location && typeof window.location.reload === 'function') {
      window.location.reload();
    }
  }

  function updateLanguageSelector() {
    const codeEl = document.getElementById('langCurrentCode');
    if (codeEl) {
      codeEl.textContent = currentLang.toUpperCase();
    }
    const trigger = document.getElementById('langTrigger');
    if (trigger) {
      trigger.setAttribute('aria-label', 'Dil: ' + LANGUAGES[currentLang].name);
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
    if (!root || typeof root.querySelectorAll !== 'function') return;
    if (isTranslating) return;
    isTranslating = true;
    try {
      // 1. data-i18n elements
      root.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.dataset.i18n;
        const translation = DICTIONARY[currentLang]?.[key];
        if (translation !== undefined) {
          if (!el._bcfOrigHtml && el.innerHTML !== undefined) el._bcfOrigHtml = el.innerHTML;
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

      // 3b. Preserve <span>↗</span> inside .coffee-more summary while translating its label text
      root.querySelectorAll('.coffee-more summary').forEach((summary) => {
        if (summary.hasAttribute('data-i18n')) return;
        const label = DICTIONARY[currentLang]?.moreDetails || 'Daha çox';
        const iconSpan = summary.querySelector?.('span');
        if (iconSpan) {
          let textNode = [...(summary.childNodes || [])].find((n) => n.nodeType === 3 && n.nodeValue.trim());
          if (!textNode) {
            textNode = document.createTextNode(label + ' ');
            summary.insertBefore(textNode, iconSpan);
          } else if (textNode.nodeValue !== label + ' ') {
            textNode.nodeValue = label + ' ';
          }
        } else if (summary.textContent.trim() !== label) {
          summary.textContent = label;
        }
      });

      // 4. Auto-translate all storefront products, notes, descriptions, and UI texts
      const targets = root.querySelectorAll(\`
        .main-nav a,
        .brand span,
        .filter-chip,
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
        .tea-more summary,
        .coffee-summary,
        .coffee-details span,
        .coffee-details p,
        .coffee-page-intro .eyebrow,
        .coffee-page-intro p,
        .coffee-page-intro aside span,
        .coffee-page-intro aside strong,
        .tea-kicker,
        .tea-hero h1,
        .tea-hero-copy,
        .tea-jump a,
        .tea-collection-header h2,
        .tea-collection-header p,
        .tea-product-copy h2,
        .tea-product-copy .tea-kind,
        .tea-summary,
        .tea-facts dt,
        .tea-facts dd,
        .tea-more-content,
        .tea-brew-note h2,
        .tea-brew-note p,
        .tea-modal-close,
        .tea-price.tea-price-pending,
        .tea-price small,
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
        .tea-order-content > small,
        .coffee-order-content > small,
        .tea-order-content .tea-kicker,
        #coffeeOrderTotal,
        #teaOrderTotal,
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
        .managed-stock-label,
        #detailTitle,
        #detailCategory,
        #detailDescription,
        #variantLabel,
        .variant-picker > div:first-child span,
        .variant-swatch small,
        .detail-price-row span,
        .detail-price-note,
        #detailVariantCount,
        .detail-meta dt,
        .detail-meta dd,
        .product-not-found .eyebrow,
        .product-not-found h1,
        .product-not-found a,
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
        .signature-card h3,
        .dessert-visual-card h3,
        .summer-overline,
        .summer-intro,
        .summer-collection-heading h3,
        .summer-drink h4,
        .cart-header .eyebrow,
        .cart-header h2,
        .cart-summary span,
        .cart-summary small,
        .cart-empty,
        .cart-item-cat,
        .cart-item-copy h3,
        .cart-remove,
        .checkout-open,
        .checkout-confirm,
        .checkout-done,
        .checkout-eyebrow,
        .checkout-note,
        #checkoutTitle,
        .checkout-total span,
        .checkout-destination-note,
        .checkout-success h2,
        .checkout-wa-hint,
        .checkout-wa-btn span,
        .checkout-subnote,
        #accountTitle,
        .account-field > span,
        .account-submit,
        .account-logout,
        .account-eyebrow,
        .account-divider span,
        .account-provider-note,
        .account-note,
        .account-security-note,
        .account-section-heading h3,
        .account-empty h3,
        .account-empty p,
        .account-list-status,
        .account-dialog select option,
        .checkout-dialog select option,
        .account-code-value,
        .favorites-drawer header p,
        #favoritesTitle,
        .favorites-list-item small,
        .favorites-list-item strong,
        .favorites-list-item em,
        .favorites-list-item button,
        .favorites-drawer h2,
        .favorites-empty h3,
        .favorites-empty p,
        .favorites-clear,
        .policy .eyebrow,
        .policy h1,
        .policy h2,
        .policy > p,
        .policy > p a,
        .hero-eyebrow,
        .hero-link,
        .hero-meta,
        footer p
      \`);

      targets.forEach((el) => {
        if (el.hasAttribute('data-i18n') || el.querySelector?.('[data-i18n]')) return;
        const text = (el.textContent || '').trim();
        if (!text) return;

        if (!el._bcfOrigText || text !== el._bcfLastTranslated) {
          el._bcfOrigText = recoverAzText(text);
        }

        const orig = el._bcfOrigText;
        const targetText = currentLang === 'az' ? orig : translateDynamicText(orig, currentLang);
        if (targetText && el.textContent.trim() !== targetText) {
          el.textContent = targetText;
        }
        el._bcfLastTranslated = targetText || text;
      });

      // Update document title if needed
      updateDocumentTitle();
    } finally {
      isTranslating = false;
    }
  }

  function updateDocumentTitle() {
    const page = window.location?.pathname ? window.location.pathname.split('/').pop() || 'index.html' : 'index.html';
    const brandSuffix = {
      az: 'Yeni Baku Coffee Factory',
      en: 'New Baku Coffee Factory',
      ru: 'New Baku Coffee Factory',
      ar: 'نيو باكو كوفي فاكتوري',
    };

    if (page === 'mehsul.html') {
      const notFoundEl = document.getElementById('productNotFound');
      const detailTitleEl = document.getElementById('detailTitle');
      if (notFoundEl && !notFoundEl.hidden) {
        document.title = t('productNotFound', 'Məhsul tapılmadı') + ' — ' + brandSuffix[currentLang];
        return;
      }
      if (detailTitleEl && detailTitleEl.textContent.trim()) {
        document.title = detailTitleEl.textContent.trim() + ' — ' + brandSuffix[currentLang];
        return;
      }
    }

    const titles = {
      'index.html': {
        az: 'Yeni Baku Coffee Factory',
        en: 'New Baku Coffee Factory',
        ru: 'Главная — New Baku Coffee Factory',
        ar: 'نيو باكو كوفي فاكتوري',
      },
      'qehveler.html': {
        az: 'Qəhvələr — Yeni Baku Coffee Factory',
        en: 'Coffee — New Baku Coffee Factory',
        ru: 'Кофе — New Baku Coffee Factory',
        ar: 'القهوة — نيو باكو كوفي فاكتوري',
      },
      'caylar.html': {
        az: 'Çaylar — Yeni Baku Coffee Factory',
        en: 'Tea — New Baku Coffee Factory',
        ru: 'Чай — New Baku Coffee Factory',
        ar: 'الشاي — نيو باكو كوفي فاكتوري',
      },
      'avadanliqlar.html': {
        az: 'Avadanlıqlar — Yeni Baku Coffee Factory',
        en: 'Equipment — New Baku Coffee Factory',
        ru: 'Оборудование — New Baku Coffee Factory',
        ar: 'المعدات — نيو باكو كوفي فاكتوري',
      },
      'mehsul.html': {
        az: 'Məhsul — Yeni Baku Coffee Factory',
        en: 'Product — New Baku Coffee Factory',
        ru: 'Товар — New Baku Coffee Factory',
        ar: 'المنتج — نيو باكو كوفي فاكتوري',
      },
      'menyu.html': {
        az: 'Menyu — Yeni Baku Coffee Factory',
        en: 'Menu — New Baku Coffee Factory',
        ru: 'Меню — New Baku Coffee Factory',
        ar: 'القائمة — نيو باكو كوفي فاكتوري',
      },
      'mexfilik.html': {
        az: 'Məxfilik siyasəti — Baku Coffee Factory',
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
        setLanguage(selectedLang, { reload: Boolean(selectedLang && selectedLang !== currentLang && LANGUAGES[selectedLang]) });
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

    // Watch for dynamic additions across catalog, modals, auth, favorites, and orders
    ['bcf:catalog-ready', 'bcf:ui-mounted', 'bcf:auth-changed', 'bcf:favorites-changed', 'bcf:orders-changed', 'load'].forEach((evtName) => {
      window.addEventListener(evtName, () => {
        if (currentLang !== 'az') {
          translateDom();
        }
      });
    });

    // Sync language choice across open browser tabs
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue && LANGUAGES[e.newValue] && e.newValue !== currentLang) {
        setLanguage(e.newValue);
      }
    });

    // Translate modals, drawers, swatches, and filter chips on user interaction
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('#accountTrigger, .account-trigger, #floatingCartTrigger, .floating-cart-btn, .tea-header-cart, #openCartBtn, #openGearCartBtn, #favoritesTrigger, .favorites-trigger, .coffee-add-button, .tea-add-button, .add-to-cart, .variant-swatch, .gallery-arrow, .filter-chip, .menu-tab, .account-tab, .account-center-tab, .account-forgot-link, .account-reset-back, .account-secondary-link, .account-social-cancel, .account-social-confirm, #profilePhoneSubmit, .menu-toggle, #checkoutOpen, .checkout-open');
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
    translateDom,
    translateDynamicText,
    LANGUAGES,
    DICTIONARY,
    PHRASE_MAP,
  };
})();
`;

fs.writeFileSync(path.join(__dirname, '..', 'i18n.js'), fullI18nJs, 'utf8');
console.log('Successfully wrote full i18n.js! File size:', fullI18nJs.length);
