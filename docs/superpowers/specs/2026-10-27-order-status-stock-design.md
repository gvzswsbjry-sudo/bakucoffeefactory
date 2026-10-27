# Order Status and Stock Editor Design

## Intent

Admin sifarişlərin hansının göndərildiyini bir baxışda görməli, qalan sifarişləri ayrıca süzə bilməli və məhsul stok sayını maneəsiz daxil edə bilməlidir.

## Approach

Sifarişin mövcud `status` sahəsi `new` və `shipped` dəyərləri ilə serverdə saxlanacaq. Admin səhifəsi status filtri, hər kartda aydın nişan və geri qaytarıla bilən “Göndərildi” əməliyyatı göstərəcək. Məhsul redaktorunda stok sayı həmişə yazıla biləcək; istifadəçi say daxil etdikdə vəziyyət avtomatik `counted` olacaq.

## Constraints

- Köhnə sifarişlərdə status yoxdursa `new` qəbul edilir.
- Status dəyişiklikləri admin sessiyası və eyni-origin qoruması tələb edir.
- Yalnız `new` və `shipped` statusları qəbul edilir.
- Mövcud məhsul və sifariş məlumatları silinmir.

## Alternatives considered

- Statusu yalnız brauzerdə saxlamaq rədd edildi: başqa cihazda və server yenidən başlayanda itərdi.
- Stok sahəsini yalnız “Sayla idarə et” seçildikdən sonra aktiv saxlamaq mövcud anlaşılmazlığı davam etdirərdi.

