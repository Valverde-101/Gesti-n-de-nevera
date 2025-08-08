const SHOPPING_KEY = 'shopping-list';
let shoppingList = JSON.parse(localStorage.getItem(SHOPPING_KEY) || '[]');
let iconCatalog = {};
let selectedFood = null;
let selectedCategory = null;
let modalSearchTerm = '';
let itemSearchTerm = '';
let shoppingSelectMode = false;
let selectedShopping = new Set();
let shoppingPress = null;

const CATEGORY_ICONS = {
  Frutas: 'icons/Categorias/Frutas.png',
  'Frutas Secas': 'icons/Categorias/Frutas Secas.png',
  Vegetales: 'icons/Categorias/Vegetales.png',
  Verduras: 'icons/Categorias/Vegetales.png',
  Legumbres: 'icons/Categorias/Legumbres.png',
  Carnes: 'icons/Categorias/Carnes.png',
  Cereales: 'icons/Categorias/Cereales.png',
  Peces: 'icons/Categorias/Peces.png'
};

function saveShopping() {
  localStorage.setItem(SHOPPING_KEY, JSON.stringify(shoppingList));
}

function renderShopping() {
  const container = document.getElementById('shopping-items');
  if (!container) return;
  container.innerHTML = '';
  const filtered = shoppingList.filter(i => i.name.toLowerCase().includes(itemSearchTerm));
  const groups = {};
  filtered.forEach(item => {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  });
  Object.keys(groups).forEach(cat => {
    const section = document.createElement('div');
    section.className = 'category-group';
    const header = document.createElement('h2');
    const icon = getCategoryIcon(cat);
    header.innerHTML = icon ? `<img src="${icon}" alt="${cat}"> ${cat}` : cat;
    section.appendChild(header);
    groups[cat].forEach(item => {
      const div = document.createElement('div');
      div.className = 'item';
      if (item.purchased) div.classList.add('purchased');
      if (selectedShopping.has(item.id)) div.classList.add('selected');
      div.addEventListener('mousedown', () => startShoppingPress(item.id));
      div.addEventListener('mouseup', cancelShoppingPress);
      div.addEventListener('mouseleave', cancelShoppingPress);
      div.addEventListener('click', () => {
        if (shoppingSelectMode) {
          toggleShoppingSelect(item.id);
        } else {
          togglePurchased(item.id);
        }
      });
      const img = document.createElement('img');
      img.src = item.icon;
      img.alt = item.name;
      div.appendChild(img);
      const span = document.createElement('span');
      span.textContent = `${item.name} - ${item.quantity} ${item.unit || ''}`;
      div.appendChild(span);
      section.appendChild(div);
    });
    container.appendChild(section);
  });
}

function togglePurchased(id) {
  const item = shoppingList.find(i => i.id === id);
  if (item) {
    item.purchased = !item.purchased;
    saveShopping();
    renderShopping();
  }
}

function getCategoryIcon(cat) {
  return CATEGORY_ICONS[cat] || iconCatalog[cat]?.[0]?.icon || '';
}

function startShoppingPress(id) {
  if (shoppingSelectMode) return;
  shoppingPress = setTimeout(() => {
    shoppingSelectMode = true;
    selectedShopping.add(id);
    updateShoppingActions();
    renderShopping();
  }, 500);
}

function cancelShoppingPress() {
  clearTimeout(shoppingPress);
}

function toggleShoppingSelect(id) {
  if (selectedShopping.has(id)) selectedShopping.delete(id);
  else selectedShopping.add(id);
  updateShoppingActions();
  renderShopping();
}

function exitShoppingSelect() {
  shoppingSelectMode = false;
  selectedShopping.clear();
  updateShoppingActions();
}

function updateShoppingActions() {
  const bar = document.getElementById('shopping-actions');
  if (bar) bar.classList.toggle('hidden', selectedShopping.size === 0);
}

function openModal() {
  selectedFood = null;
  selectedCategory = null;
  showSelectStep();
  document.getElementById('add-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('add-modal').classList.add('hidden');
}

function showSelectStep() {
  document.getElementById('selection-step').classList.remove('hidden');
  document.getElementById('add-form').classList.add('hidden');
  modalSearchTerm = '';
  const search = document.getElementById('modal-item-search');
  if (search) search.value = '';
  renderCategories();
  renderItems(selectedCategory);
}

function renderCategories() {
  const container = document.getElementById('category-section');
  if (!container) return;
  container.innerHTML = '';
  Object.keys(iconCatalog).forEach(cat => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'category-btn';
    if (selectedCategory === cat) btn.classList.add('active');
    const icon = getCategoryIcon(cat);
    btn.innerHTML = `<img src="${icon}" alt="${cat}"><span>${cat}</span>`;
    btn.onclick = () => { selectedCategory = cat; renderCategories(); renderItems(cat); };
    container.appendChild(btn);
  });
}

function renderItems(cat) {
  const container = document.getElementById('items-section');
  if (!container) return;
  container.innerHTML = '';
  if (!cat) return;
  (iconCatalog[cat] || [])
    .filter(food => food.name.toLowerCase().includes(modalSearchTerm))
    .forEach(food => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'item-btn';
      btn.innerHTML = `<img src="${food.icon}" alt="${food.name}"><span>${food.name}</span>`;
      btn.onclick = () => selectFood(food);
      container.appendChild(btn);
    });
}

function selectFood(food) {
  selectedFood = food;
  showDetailsStep();
}

function showDetailsStep(item) {
  document.getElementById('selection-step').classList.add('hidden');
  document.getElementById('add-form').classList.remove('hidden');
  document.getElementById('detail-icon').src = selectedFood.icon;
  document.getElementById('detail-name').textContent = selectedFood.name;
  document.getElementById('detail-category').textContent = selectedFood.category;
  document.getElementById('detail-qty').value = item ? item.quantity : 1;
  document.getElementById('detail-unit').value = item ? item.unit : 'unidades';
}

function backToSelect() {
  selectedFood = null;
  showSelectStep();
}

document.getElementById('add-btn')?.addEventListener('click', openModal);
document.getElementById('close-modal')?.addEventListener('click', closeModal);
document.getElementById('back-btn')?.addEventListener('click', backToSelect);
document.getElementById('item-search')?.addEventListener('input', e => {
  itemSearchTerm = e.target.value.toLowerCase();
  renderShopping();
});
document.getElementById('modal-item-search')?.addEventListener('input', e => {
  modalSearchTerm = e.target.value.toLowerCase();
  renderItems(selectedCategory);
});

document.getElementById('add-form')?.addEventListener('submit', e => {
  e.preventDefault();
  if (!selectedFood) return;
  let quantity = parseInt(document.getElementById('detail-qty').value, 10);
  if (isNaN(quantity) || quantity < 1) quantity = 1;
  const unit = document.getElementById('detail-unit').value;
  const item = {
    id: Date.now(),
    name: selectedFood.name,
    icon: selectedFood.icon,
    category: selectedFood.category,
    quantity,
    unit,
    purchased: false
  };
  shoppingList.push(item);
  saveShopping();
  closeModal();
  renderShopping();
});

document.getElementById('quick-add-btn')?.addEventListener('click', () => {
  document.getElementById('quick-modal').classList.remove('hidden');
});

document.getElementById('quick-cancel')?.addEventListener('click', () => {
  document.getElementById('quick-modal').classList.add('hidden');
});

document.getElementById('quick-confirm')?.addEventListener('click', () => {
  const inv = JSON.parse(localStorage.getItem('items') || '[]');
  inv.filter(i => i.quantity <= 0).forEach(i => {
    if (!shoppingList.some(s => s.name === i.name)) {
      shoppingList.push({
        id: Date.now() + Math.random(),
        name: i.name,
        icon: i.icon,
        category: i.category,
        quantity: 1,
        unit: i.unit,
        purchased: false
      });
    }
  });
  saveShopping();
  renderShopping();
  document.getElementById('quick-modal').classList.add('hidden');
});

document.getElementById('shopping-delete')?.addEventListener('click', () => {
  const list = document.getElementById('shopping-confirm-list');
  if (list) {
    list.innerHTML = '';
    shoppingList.filter(i => selectedShopping.has(i.id)).forEach(i => {
      const div = document.createElement('div');
      div.className = 'selected';
      div.innerHTML = `<img src="${i.icon}" alt=""><span>${i.name} - ${i.quantity}</span>`;
      list.appendChild(div);
    });
  }
  document.getElementById('shopping-confirm-modal')?.classList.remove('hidden');
});

document.getElementById('shopping-confirm-delete')?.addEventListener('click', () => {
  shoppingList = shoppingList.filter(i => !selectedShopping.has(i.id));
  saveShopping();
  exitShoppingSelect();
  renderShopping();
  document.getElementById('shopping-confirm-modal').classList.add('hidden');
});

document.getElementById('shopping-confirm-cancel')?.addEventListener('click', () => {
  document.getElementById('shopping-confirm-modal').classList.add('hidden');
});

document.getElementById('shopping-select-all')?.addEventListener('click', () => {
  if (selectedShopping.size === shoppingList.length) {
    selectedShopping.clear();
  } else {
    shoppingList.forEach(i => selectedShopping.add(i.id));
  }
  updateShoppingActions();
  renderShopping();
});

fetch('icons.json')
  .then(res => res.json())
  .then(data => { iconCatalog = data; });

renderShopping();
