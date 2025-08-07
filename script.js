const STORAGE_KEY = 'items';
let items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let selectedFood = null;
let editingItemId = null;
let iconCatalog = {};
let pendingDeleteId = null;
let itemSearchTerm = '';
let selectedCategory = null;

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
  selectedCategory = null;
  showSelectStep();
  document.getElementById('add-modal').classList.remove('hidden');
}

function showSelectStep() {
  document.getElementById('selection-step').classList.remove('hidden');
  document.getElementById('add-form').classList.add('hidden');
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
    let icon = '';
    if (cat === 'Frutas') icon = 'icons/Frutas/fruta_icon.png';
    else if (cat === 'Verduras') icon = 'icons/Verduras/vegetal_icon.png';
    else icon = iconCatalog[cat][0]?.icon || '';
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
  (iconCatalog[cat] || []).forEach(food => {
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
}

function backToSelect() {
  editingItemId = null;
  selectedFood = null;
  showSelectStep();
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
document.getElementById('item-search')?.addEventListener('input', e => {
  itemSearchTerm = e.target.value.toLowerCase();
  render();
});

document.getElementById('add-form')?.addEventListener('submit', e => {
  e.preventDefault();
  if (!selectedFood) return;
  const quantity = parseInt(document.getElementById('detail-qty').value, 10) || 1;
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
    const item = { id: Date.now(), name: selectedFood.name, icon: selectedFood.icon, category: selectedFood.category, quantity, unit, expiration, location, note, registered };
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

