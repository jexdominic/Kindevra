import { replyTo } from './support.js';
import { createSession } from './session.js';
export function localBoundary(text, language, preference = 'listen', exercisesPaused = false) {
  const session = createSession(); session.preference = preference; session.exercisesPaused = exercisesPaused;
  const response = replyTo(text, 0, session);

  if(response.urgent && language==='en')return response;
  const t = text.toLocaleLowerCase('tr-TR').normalize('NFKC');
  if (response.urgent || /intihar|kendimi öldür|kendime zarar|yaşamak istemiyorum|ölmek istiyorum|uyanmak istemiyorum|bensiz daha iyi|birini öldür|birine zarar/.test(t)) return {urgent:true,text:'Şu anda kendine veya başka birine zarar verme düşüncen var mı? Yakın bir tehlike varsa yerel acil hizmetlere başvur veya en yakın acil servise git. Mümkünse güvendiğin birinden yanında kalmasını iste. Kindevra güvenliğini izleyemez veya senin adına yardım çağıramaz.'};
  if (/zehirle|nasıl.*(?:öldür|yarala)/.test(t)) return {urgent:true,text:'Birine zarar verme talimatı veremem. Bunu yapabileceğini düşünüyorsan kişiden ve zarar verebilecek araçlardan güvenle uzaklaş. Yakın tehlike varsa yerel acil hizmetlere başvur ve güvendiğin birinden destek iste.'};
  if (language === 'en') return response.modelEligible ? null : response;
  if (/^(?:lütfen )?(?:egzersizleri sürdür|egzersizlere devam et)[.!]?$/.test(t.trim())) return {resumed:true,text:'Otomatik egzersiz önerileri yeniden açıldı. Dinleme veya küçük adım tercihin geçerli; istediğin zaman durdurabilirsin.'};
  if (/^(?:lütfen )?(?:pratik|egzersiz) tercihlerimi unut[.!]?$/.test(t.trim())) return {forgotten:true,text:'Pratik tercihlerin unutuldu. Önceki mesajlar ve seçtiğin destek biçimi değişmedi.'};
  if (/ilaç|doz|reçete|teşhis|tanı koy/.test(t)) return {text:'Tanı koyamam veya ilaç ve doz değişikliği öneremem. Bu kararları yetkili bir sağlık uzmanıyla görüşmelisin; mevcut ilacını değiştirmeden önce reçete eden uzmanla iletişim kur.'};
  if (/egzersiz|nefes çalış|topraklama/.test(t) && /istemiyorum|durdur|bırak|kötü hisset/.test(t)) return {paused:true,text:'Egzersizi durdurabiliriz. Devam etmek zorunda değilsin. Otomatik egzersiz önerileri bu görüşme için duraklatıldı. İstersen yalnızca konuşabiliriz.'};
  if (/sadece sana ihtiyacım|tek arkadaşım sensin/.test(t)) return {text:'Bu konuşmanın sana destek olmasını isterim; ancak insanlarla ilişkilerin veya profesyonel desteğin yerini alamam. Güvendiğin biriyle de iletişim kurabilir misin?'};
  if(exercisesPaused)return {text:'Otomatik egzersiz önerileri hâlâ duraklatılmış durumda. Ne hakkında konuşmak istersin? Önerileri yeniden açmak için egzersizleri sürdür yazabilirsin.'};
  return null;
}
