const STORAGE_KEY = 'items';
let items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let selectedFood = null;

const PREDEFINED_FOODS = [
  { name: 'Manzana', icon: 'icons/manzana_icon.png' },
  { name: 'Cereza', icon: 'icons/cereza_icon.png' },
  { name: 'Zanahoria', icon: 'icons/zanahoria_icon.png' },
  { name: 'Patatas', icon: 'icons/patatas_icon.png' },
  { name: 'Naranja', icon: 'icons/naranja_icon.png' }
];

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function render() {
  const container = document.getElementById('items');
  if (!container) return;
  container.innerHTML = '';
  const location = document.body.dataset.location;
  items.filter(i => i.location === location).forEach(item => {
    const div = document.createElement('div');
    div.className = 'item';
    const img = document.createElement('img');
    img.src = item.icon;
    img.alt = item.name;
    div.appendChild(img);
    const name = document.createElement('span');
    name.textContent = `${item.name} - ${item.quantity} ${item.unit || ''}`;
    div.appendChild(name);
    container.appendChild(div);
  });
}

function openModal() {
  selectedFood = null;
  document.getElementById('add-form').classList.add('hidden');
  const grid = document.getElementById('icon-grid');
  grid.innerHTML = '';
  PREDEFINED_FOODS.forEach(food => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'icon-btn';
    btn.innerHTML = `<img src="${food.icon}" alt="${food.name}"><span>${food.name}</span>`;
    btn.onclick = () => selectFood(food);
    grid.appendChild(btn);
  });
  document.getElementById('add-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('add-modal').classList.add('hidden');
}

function selectFood(food) {
  selectedFood = food;
  document.getElementById('selected-icon').src = food.icon;
  document.getElementById('selected-name').textContent = food.name;
  document.getElementById('add-form').classList.remove('hidden');
}

document.getElementById('add-btn')?.addEventListener('click', openModal);
document.getElementById('close-modal')?.addEventListener('click', closeModal);

document.getElementById('add-form')?.addEventListener('submit', e => {
  e.preventDefault();
  if (!selectedFood) return;
  const quantity = parseInt(document.getElementById('food-qty').value, 10) || 1;
  const unit = document.getElementById('food-unit').value;
  const expiration = document.getElementById('food-exp').value;
  const location = document.body.dataset.location;
  const item = { id: Date.now(), name: selectedFood.name, icon: selectedFood.icon, quantity, unit, expiration, location };
  items.push(item);
  save();
  closeModal();
  render();
});

render();
