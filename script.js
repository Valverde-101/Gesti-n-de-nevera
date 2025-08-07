const STORAGE_KEY = 'items';
let items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let selectedFood = null;
let editingItemId = null;
let iconCatalog = {};
let pendingDeleteId = null;
let itemSearchTerm = '';
let modalSearchTerm = '';
let selectedCategory = null;
const SHOPPING_KEY = 'shopping-list';
let shoppingList = JSON.parse(localStorage.getItem(SHOPPING_KEY) || '[]');
let multiSelectMode = false;
let selectedIds = new Set();
let pressTimer = null;
let sortOption = 'name';
let viewType = 'list';

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

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function saveShopping() {
  localStorage.setItem(SHOPPING_KEY, JSON.stringify(shoppingList));
}

function render() {
  const container = document.getElementById('items');
  if (!container) return;
  container.innerHTML = '';
  container.classList.toggle('grid-view', viewType === 'grid');
  const location = document.body.dataset.location;
  const filtered = items.filter(
    i => i.location === location && i.name.toLowerCase().includes(itemSearchTerm)
  );
  const groups = {};
  filtered.forEach(item => {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  });
  Object.keys(groups).forEach(cat => {
    groups[cat].sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'expiration':
          return (a.expiration || '').localeCompare(b.expiration || '');
        case 'quantity':
          return a.quantity - b.quantity;
        case 'registered':
          return (a.registered || '').localeCompare(b.registered || '');
        default:
          return 0;
      }
    });
    const section = document.createElement('div');
    section.className = 'category-group';
    const header = document.createElement('h2');
    const icon = getCategoryIcon(cat);
    header.innerHTML = icon ? `<img src="${icon}" alt="${cat}"> ${cat}` : cat;
    section.appendChild(header);
    groups[cat].forEach(item => {
      const div = document.createElement('div');
      div.className = 'item';
      if (item.quantity <= 0) {
        div.classList.add('depleted');
      }
      if (selectedIds.has(item.id)) {
        div.classList.add('selected');
      }
      div.addEventListener('mousedown', () => startPress(item.id));
      div.addEventListener('mouseup', cancelPress);
      div.addEventListener('mouseleave', cancelPress);
      div.addEventListener('click', () => {
        if (multiSelectMode) {
          toggleSelect(item.id);
        } else {
          editItem(item.id);
        }
      });
      const img = document.createElement('img');
      img.src = item.icon;
      img.alt = item.name;
      div.appendChild(img);
      const name = document.createElement('span');
      name.textContent = `${item.name} - ${item.quantity} ${item.unit || ''}`;
      div.appendChild(name);
      section.appendChild(div);
    });
    container.appendChild(section);
  });
}

function getCategoryIcon(cat) {
  return CATEGORY_ICONS[cat] || iconCatalog[cat]?.[0]?.icon || '';
}

function startPress(id) {
  if (multiSelectMode) return;
  pressTimer = setTimeout(() => {
    multiSelectMode = true;
    selectedIds.add(id);
    updateMultiActions();
    render();
  }, 500);
}

function cancelPress() {
  clearTimeout(pressTimer);
}

function toggleSelect(id) {
  if (selectedIds.has(id)) {
    selectedIds.delete(id);
  } else {
    selectedIds.add(id);
  }
  if (selectedIds.size === 0) {
    exitMultiSelect();
  } else {
    updateMultiActions();
  }
  render();
}

function exitMultiSelect() {
  multiSelectMode = false;
  selectedIds.clear();
  updateMultiActions();
}

function updateMultiActions() {
  const bar = document.getElementById('multi-actions');
  if (bar) bar.classList.toggle('hidden', selectedIds.size === 0);
}

function openModal() {
  editingItemId = null;
  selectedFood = null;
  selectedCategory = null;
  showSelectStep();
  document.getElementById('add-modal').classList.remove('hidden');
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
      btn.onclick = () => selectFood({ ...food, category: cat });
      container.appendChild(btn);
    });
}

function closeModal() {
  editingItemId = null;
  selectedFood = null;
  selectedCategory = null;
  document.getElementById('add-modal').classList.add('hidden');
}

function addToShoppingList() {
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
  document.getElementById('detail-location').value = item ? item.location : document.body.dataset.location;
  document.getElementById('detail-qty').value = item ? item.quantity : 1;
  document.getElementById('detail-unit').value = item ? item.unit : 'unidades';
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('detail-reg').value = item ? item.registered : today;
  document.getElementById('detail-exp').value = item ? item.expiration || '' : '';
  document.getElementById('detail-note').value = item ? item.note || '' : '';
  document.getElementById('save-btn').textContent = item ? 'Guardar' : 'Agregar';
  const deleteBtn = document.getElementById('delete-btn');
  const closeBtn = document.getElementById('close-modal');
  if (item) {
    deleteBtn.classList.remove('hidden');
    closeBtn.classList.add('hidden');
  } else {
    deleteBtn.classList.add('hidden');
    closeBtn.classList.remove('hidden');
  }
}

function backToSelect() {
  if (editingItemId !== null) {
    closeModal();
  } else {
    editingItemId = null;
    selectedFood = null;
    showSelectStep();
  }
}

function editItem(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  editingItemId = id;
  selectedFood = { name: item.name, icon: item.icon, category: item.category };
  document.getElementById('add-modal').classList.remove('hidden');
  showDetailsStep(item);
}

function deleteItem(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  pendingDeleteId = id;
  document.getElementById('confirm-icon').src = item.icon;
  document.getElementById('confirm-name').textContent = item.name;
  document.getElementById('confirm-modal').classList.remove('hidden');
}

function confirmDelete() {
  if (pendingDeleteId !== null) {
    items = items.filter(i => i.id !== pendingDeleteId);
    save();
    render();
    closeModal();
  }
  pendingDeleteId = null;
  document.getElementById('confirm-modal').classList.add('hidden');
}

function cancelDelete() {
  pendingDeleteId = null;
  document.getElementById('confirm-modal').classList.add('hidden');
}

document.getElementById('add-btn')?.addEventListener('click', openModal);
document.getElementById('close-modal')?.addEventListener('click', closeModal);
document.getElementById('confirm-delete')?.addEventListener('click', confirmDelete);
document.getElementById('confirm-cancel')?.addEventListener('click', cancelDelete);
document.getElementById('back-btn')?.addEventListener('click', backToSelect);
document.getElementById('add-shopping-btn')?.addEventListener('click', addToShoppingList);
document.getElementById('delete-btn')?.addEventListener('click', () => {
  if (editingItemId !== null) deleteItem(editingItemId);
});
document.getElementById('item-search')?.addEventListener('input', e => {
  itemSearchTerm = e.target.value.toLowerCase();
  render();
});
document.getElementById('modal-item-search')?.addEventListener('input', e => {
  modalSearchTerm = e.target.value.toLowerCase();
  renderItems(selectedCategory);
});

document.getElementById('move-selected')?.addEventListener('click', () => {
  document.getElementById('move-modal')?.classList.remove('hidden');
});

document.getElementById('move-confirm')?.addEventListener('click', () => {
  const loc = document.getElementById('move-select').value;
  selectedIds.forEach(id => {
    const item = items.find(i => i.id === id);
    if (item) item.location = loc;
  });
  save();
  exitMultiSelect();
  render();
  document.getElementById('move-modal').classList.add('hidden');
});

document.getElementById('move-cancel')?.addEventListener('click', () => {
  document.getElementById('move-modal').classList.add('hidden');
});

document.getElementById('copy-selected')?.addEventListener('click', () => {
  document.getElementById('copy-modal')?.classList.remove('hidden');
});

document.getElementById('copy-confirm')?.addEventListener('click', () => {
  const loc = document.getElementById('copy-select').value;
  selectedIds.forEach(id => {
    const item = items.find(i => i.id === id);
    if (item) {
      if (loc === 'Compras') {
        shoppingList.push({
          id: Date.now() + Math.random(),
          name: item.name,
          icon: item.icon,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          purchased: false
        });
      } else {
        items.push({ ...item, id: Date.now() + Math.random(), location: loc });
      }
    }
  });
  save();
  saveShopping();
  exitMultiSelect();
  render();
  document.getElementById('copy-modal').classList.add('hidden');
});

document.getElementById('copy-cancel')?.addEventListener('click', () => {
  document.getElementById('copy-modal').classList.add('hidden');
});

document.getElementById('delete-selected')?.addEventListener('click', () => {
  const list = document.getElementById('multi-confirm-list');
  if (list) {
    list.innerHTML = '';
    items.filter(i => selectedIds.has(i.id)).forEach(i => {
      const div = document.createElement('div');
      div.className = 'selected';
      div.innerHTML = `<img src="${i.icon}" alt=""><span>${i.name} - ${i.quantity}</span>`;
      list.appendChild(div);
    });
  }
  document.getElementById('multi-confirm-modal')?.classList.remove('hidden');
});

document.getElementById('multi-confirm-delete')?.addEventListener('click', () => {
  items = items.filter(i => !selectedIds.has(i.id));
  save();
  exitMultiSelect();
  render();
  document.getElementById('multi-confirm-modal').classList.add('hidden');
});

document.getElementById('multi-confirm-cancel')?.addEventListener('click', () => {
  document.getElementById('multi-confirm-modal').classList.add('hidden');
});

document.getElementById('options-btn')?.addEventListener('click', () => {
  const sortSel = document.getElementById('sort-select');
  const viewSel = document.getElementById('view-select');
  if (sortSel) sortSel.value = sortOption;
  if (viewSel) viewSel.value = viewType;
  document.getElementById('options-modal')?.classList.remove('hidden');
});

document.getElementById('options-close')?.addEventListener('click', () => {
  document.getElementById('options-modal').classList.add('hidden');
});

document.getElementById('sort-select')?.addEventListener('change', e => {
  sortOption = e.target.value;
  render();
});

document.getElementById('view-select')?.addEventListener('change', e => {
  viewType = e.target.value;
  render();
});

document.getElementById('add-form')?.addEventListener('submit', e => {
  e.preventDefault();
  if (!selectedFood) return;
  let quantity = parseInt(document.getElementById('detail-qty').value, 10);
  if (isNaN(quantity)) quantity = 1;
  const unit = document.getElementById('detail-unit').value;
  const expiration = document.getElementById('detail-exp').value;
  const location = document.getElementById('detail-location').value;
  const note = document.getElementById('detail-note').value;
  const registered = document.getElementById('detail-reg').value;
  if (editingItemId !== null) {
    const item = items.find(i => i.id === editingItemId);
    if (item) {
      item.quantity = quantity;
      item.unit = unit;
      item.expiration = expiration;
      item.location = location;
      item.note = note;
      item.registered = registered;
    }
  } else {
    const item = {
      id: Date.now(),
      name: selectedFood.name,
      icon: selectedFood.icon,
      category: selectedFood.category,
      quantity,
      unit,
      expiration,
      location,
      note,
      registered
    };
    items.push(item);
  }
  save();
  closeModal();
  render();
});

fetch('icons.json')
  .then(res => res.json())
  .then(data => { iconCatalog = data; });

render();

