const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'icons');
const categoryIconsDir = path.join(iconsDir, 'Categorias');

function capitalize(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

const categories = {};

// Generate item icons from category folders except "Categorias"
fs.readdirSync(iconsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && dirent.name !== 'Categorias')
  .forEach(dirent => {
    const dir = dirent.name;
    const files = fs.readdirSync(path.join(iconsDir, dir))
      .filter(f => f.endsWith('_icon.png'));
    categories[dir] = files.map(file => ({
      name: capitalize(file.replace('_icon.png', '').replace(/_/g, ' ')),
      icon: `icons/${dir}/${file}`
    }));
  });

// Ensure categories from icons/Categorias exist even if empty
if (fs.existsSync(categoryIconsDir)) {
  fs.readdirSync(categoryIconsDir)
    .filter(f => f.endsWith('.png'))
    .map(f => f.replace('.png', ''))
    .forEach(cat => {
      if (!categories[cat]) {
        categories[cat] = [];
      }
    });
}

fs.writeFileSync(path.join(__dirname, 'icons.json'), JSON.stringify(categories, null, 2));

