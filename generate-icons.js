const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'icons');
const fruits = new Set([
  'manzana','cereza','aguacate','naranja','limon','lima','platano','banana','sandia','melocoton','durazno','pera','pina','piña','mango','uva','fresa','frambuesa','arandano','coco','kiwi','melon','papaya','granada','pomelo','higo','ciruela','albaricoque'
]);

function normalize(name) {
  return name.normalize('NFD').replace(/[^\w]/g,'').toLowerCase();
}

const files = fs.readdirSync(iconsDir).filter(f => f.endsWith('_icon.png'));
const categories = { Frutas: [], Verduras: [] };

files.forEach(file => {
  const base = file.replace('_icon.png','');
  const norm = normalize(base);
  const name = base.replace(/_/g, ' ');
  const cat = fruits.has(norm) ? 'Frutas' : 'Verduras';
  categories[cat].push({
    name: name.replace(/\b\w/g, c => c.toUpperCase()),
    icon: `icons/${file}`
  });
});

fs.writeFileSync(path.join(__dirname, 'icons.json'), JSON.stringify(categories, null, 2));
