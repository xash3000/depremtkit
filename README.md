# Deprem Kit - Acil Durum Çantası Uygulaması 🎒

Bu uygulama, deprem ve diğer acil durumlar için hazırlık çantanızı organize etmenize yardımcı olan bir React Native uygulamasıdır. [Expo](https://expo.dev) kullanılarak geliştirilmiştir.

## Başlangıç

1. Bağımlılıkları yükleyin

   ```bash
   npm install
   ```

2. Uygulamayı başlatın

   ```bash
   npx expo start
   ```

Çıktıda, uygulamayı açmak için aşağıdaki seçenekleri bulacaksınız:

- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emülatör](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simülatör](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), Expo ile uygulama geliştirmeyi denemek için sınırlı bir sandbox

**app** dizinindeki dosyaları düzenleyerek geliştirmeye başlayabilirsiniz. Bu proje [dosya tabanlı yönlendirme](https://docs.expo.dev/router/introduction) kullanır.

## Özellikler

- ✅ Acil durum eşyalarını kategorilere göre organize etme
- 📅 Son kullanma tarihlerini takip etme
- 🔔 Süresi yaklaşan/geçen eşyalar için uyarılar
- 📊 Çanta durumu istatistikleri
- 🌙 Koyu/açık tema desteği

## Proje Yapısı

- `app/` - Ana uygulama sayfaları (tabs: Çantam, Kategoriler, Uyarılar)
- `components/` - Yeniden kullanılabilir UI bileşenleri
- `services/` - Veritabanı ve bildirim servisleri
- `types/` - TypeScript tip tanımları

## Expo ile Öğrenme

Expo ile proje geliştirme hakkında daha fazla bilgi için aşağıdaki kaynaklara bakın:

- [Expo dokümantasyonu](https://docs.expo.dev/): Temelleri öğrenin veya [kılavuzlar](https://docs.expo.dev/guides) ile ileri konulara geçin.
- [Expo öğretici](https://docs.expo.dev/tutorial/introduction/): Android, iOS ve web'de çalışan bir proje oluşturacağınız adım adım öğreticiyi takip edin.

## Topluluk

Evrensel uygulamalar oluşturan geliştirici topluluğumuza katılın.

- [GitHub'da Expo](https://github.com/expo/expo): Açık kaynak platformumuzu görüntüleyin ve katkıda bulunun.
- [Discord topluluğu](https://chat.expo.dev): Expo kullanıcıları ile sohbet edin ve sorular sorun.
