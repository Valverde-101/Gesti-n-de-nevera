const fs = require('fs');
const path = require('path');
const iconDir = path.join(__dirname, 'icons');
const files = fs.readdirSync(iconDir);
const FRUIT_NAMES = new Set([
  'aceituna','aguacate','almendra','bayas','cacao','cactus','caf','cereza','coco','dragon_de_fruta','durian','frambuesa','fresa','fruta_estrella','fruta','goji','granada','higo','kiwi','lima','limn','lychee','mango','mangostn','man','manzana','manzana_rosa','maracuy','meln','melocotn','membrillo','naranja','natillas_appel','nuez','pacana','palmera_datilera','papaya','pera','physalis','pia','pltano','sanda','tamarindo','uva'
]);
const data = { frutas: [], verduras: [] };
function displayName(slug){
  return slug.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
}
files.filter(f=>f.endsWith('_icon.png')).forEach(f=>{
  const slug = f.replace('_icon.png','');
  const category = FRUIT_NAMES.has(slug) ? 'frutas' : 'verduras';
  data[category].push({ name: displayName(slug), icon: `icons/${f}` });
});
fs.writeFileSync(path.join(iconDir,'icons.js'), `const ICON_CATEGORIES = ${JSON.stringify(data, null, 2)};`);
