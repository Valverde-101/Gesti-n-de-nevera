const STORAGE_KEY = 'items';
let items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let selectedFood = null;
let editingItemId = null;
let iconCatalog = {};
let pendingDeleteId = null;
let itemSearchTerm = '';
let iconSearchTerm = '';

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function render() {
  const container = document.getElementById('items');
  if (!container) return;
  container.innerHTML = '';
  const location = document.body.dataset.location;
  items
    .filter(i => i.location === location && i.name.toLowerCase().includes(itemSearchTerm))
    .forEach(item => {
      const div = document.createElement('div');
      div.className = 'item';
      const img = document.createElement('img');
      img.src = item.icon;
      img.alt = item.name;
    div.appendChild(img);
    const name = document.createElement('span');
    name.textContent = `${item.name} (${item.category}) - ${item.quantity} ${item.unit || ''}`;
    div.appendChild(name);
    const actions = document.createElement('div');
    actions.className = 'item-actions';
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.onclick = () => editItem(item.id);
    actions.appendChild(editBtn);
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Eliminar';
      delBtn.onclick = () => deleteItem(item.id);
      actions.appendChild(delBtn);
      div.appendChild(actions);
      container.appendChild(div);
    });
}

function openModal() {
  editingItemId = null;
  selectedFood = null;
  document.getElementById('add-form').classList.add('hidden');
  document.getElementById('food-qty').value = 1;
  document.getElementById('food-unit').value = 'unidades';
  document.getElementById('food-exp').value = '';
  const categorySelect = document.getElementById('category-select');
  const grid = document.getElementById('icon-grid');
  const searchInput = document.getElementById('icon-search');
  grid.innerHTML = '';
  categorySelect.innerHTML = '';
  const allOpt = document.createElement('option');
  allOpt.value = 'Todos';
  allOpt.textContent = 'Todos';
  categorySelect.appendChild(allOpt);
  Object.keys(iconCatalog).forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
  categorySelect.value = 'Todos';
  categorySelect.onchange = () => renderIcons(categorySelect.value, iconSearchTerm);
  searchInput.value = '';
  iconSearchTerm = '';
  searchInput.oninput = () => {
    iconSearchTerm = searchInput.value.toLowerCase();
    renderIcons(categorySelect.value, iconSearchTerm);
  };
  renderIcons('Todos', '');
  document.getElementById('add-modal').classList.remove('hidden');
}

function renderIcons(category, search) {
  const grid = document.getElementById('icon-grid');
  grid.innerHTML = '';
  const cats = category === 'Todos' ? Object.keys(iconCatalog) : [category];
  cats.forEach(cat => {
    const foods = (iconCatalog[cat] || []).filter(f =>
      f.name.toLowerCase().includes(search.toLowerCase())
    );
    if (foods.length === 0) return;
    const section = document.createElement('div');
    section.className = 'icon-category';
    const title = document.createElement('h3');
    title.textContent = cat;
    section.appendChild(title);
    const list = document.createElement('div');
    list.className = 'icon-category-grid';
    foods.forEach(food => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'icon-btn';
      btn.innerHTML = `<img src="${food.icon}" alt="${food.name}"><span>${food.name}</span>`;
      btn.onclick = () => selectFood({ ...food, category: cat });
      list.appendChild(btn);
    });
    section.appendChild(list);
    grid.appendChild(section);
  });
}

function closeModal() {
  editingItemId = null;
  document.getElementById('add-modal').classList.add('hidden');
}

function selectFood(food) {
  selectedFood = food;
  document.getElementById('selected-icon').src = food.icon;
  document.getElementById('selected-name').textContent = food.name;
  document.getElementById('add-form').classList.remove('hidden');
}

function editItem(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  editingItemId = id;
  selectedFood = { name: item.name, icon: item.icon, category: item.category };
  document.getElementById('selected-icon').src = item.icon;
  document.getElementById('selected-name').textContent = item.name;
  document.getElementById('food-qty').value = item.quantity;
  document.getElementById('food-unit').value = item.unit;
  document.getElementById('food-exp').value = item.expiration || '';
  document.getElementById('add-form').classList.remove('hidden');
  document.getElementById('add-modal').classList.remove('hidden');
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
document.getElementById('item-search')?.addEventListener('input', e => {
  itemSearchTerm = e.target.value.toLowerCase();
  render();
});

document.getElementById('add-form')?.addEventListener('submit', e => {
  e.preventDefault();
  if (!selectedFood) return;
  const quantity = parseInt(document.getElementById('food-qty').value, 10) || 1;
  const unit = document.getElementById('food-unit').value;
  const expiration = document.getElementById('food-exp').value;
  const location = document.body.dataset.location;
  if (editingItemId !== null) {
    const item = items.find(i => i.id === editingItemId);
    if (item) {
      item.quantity = quantity;
      item.unit = unit;
      item.expiration = expiration;
    }
  } else {
    const item = { id: Date.now(), name: selectedFood.name, icon: selectedFood.icon, category: selectedFood.category, quantity, unit, expiration, location };
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
