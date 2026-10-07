const products = [
  {
    id: 1,
    name: "Pulse One",
    category: "Audio",
    price: 89900,
    label: "Más vendido",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80",
    alt: "Audífonos inalámbricos naranjas"
  },
  {
    id: 2,
    name: "Wave Mini",
    category: "Audio",
    price: 54900,
    label: "Nuevo",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=80",
    alt: "Parlante portátil compacto"
  },
  {
    id: 3,
    name: "Luma Desk",
    category: "Smart home",
    price: 67900,
    label: "Favorito",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80",
    alt: "Lámpara de escritorio de diseño"
  },
  {
    id: 4,
    name: "Orbit Stand",
    category: "Accesorios",
    price: 32900,
    label: "",
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=700&q=80",
    alt: "Accesorio de escritorio minimalista"
  }
];

const formatPrice = (price) => `$${price.toLocaleString("es-CO")}`;
const productGrid = document.querySelector("#product-grid");
const cartCount = document.querySelector("#cart-count");
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const cartFooter = document.querySelector("#cart-footer");
const drawer = document.querySelector("#cart-drawer");
const overlay = document.querySelector("#overlay");
const toast = document.querySelector("#toast");
const searchInput = document.querySelector("#search-input");
const cart = new Map();
let activeFilter = "Todos";
let toastTimeout;

function renderProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase("es");
  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeFilter === "Todos" || product.category === activeFilter;
    const matchesQuery = `${product.name} ${product.category}`.toLocaleLowerCase("es").includes(query);
    return matchesCategory && matchesQuery;
  });

  productGrid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.alt}" loading="lazy">
        ${product.label ? `<span class="product-badge">${product.label}</span>` : ""}
        <button class="add-button" data-add="${product.id}" aria-label="Agregar ${product.name} al carrito">+</button>
      </div>
      <div class="product-info">
        <div><p class="product-category">${product.category}</p><h3 class="product-name">${product.name}</h3></div>
        <span class="product-price">${formatPrice(product.price)}</span>
      </div>
    </article>
  `).join("");
  document.querySelector("#product-count").textContent = `${visibleProducts.length} productos`;
  document.querySelector("#empty-state").hidden = visibleProducts.length > 0;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 2200);
}

function renderCart() {
  const quantity = [...cart.values()].reduce((total, item) => total + item.quantity, 0);
  const subtotal = [...cart.values()].reduce((total, item) => total + item.product.price * item.quantity, 0);
  cartCount.textContent = quantity;
  document.querySelector("#drawer-count").textContent = `(${quantity})`;
  document.querySelector("#cart-total").textContent = formatPrice(subtotal);
  cartEmpty.hidden = quantity > 0;
  cartFooter.hidden = quantity === 0;
  cartItems.innerHTML = [...cart.values()].map(({ product, quantity: itemQuantity }) => `
    <article class="cart-row">
      <img src="${product.image}" alt="${product.alt}">
      <div class="cart-row-info">
        <strong>${product.name}</strong>
        <span>${formatPrice(product.price)}</span>
        <div class="quantity-control" aria-label="Cantidad de ${product.name}">
          <button data-quantity="${product.id}" data-change="-1" aria-label="Quitar uno">−</button>
          <span>${itemQuantity}</span>
          <button data-quantity="${product.id}" data-change="1" aria-label="Agregar uno">+</button>
        </div>
      </div>
      <div class="cart-row-price">
        <strong>${formatPrice(product.price * itemQuantity)}</strong>
        <button class="remove-item" data-remove="${product.id}">Quitar</button>
      </div>
    </article>
  `).join("");
}

function setCartOpen(isOpen) {
  drawer.classList.toggle("open", isOpen);
  overlay.classList.toggle("visible", isOpen);
  drawer.setAttribute("aria-hidden", String(!isOpen));
  document.body.classList.toggle("cart-open", isOpen);
  if (isOpen) document.querySelector("#close-cart").focus();
}

document.querySelectorAll(".filter-chip").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.toggle("active", chip === button));
    renderProducts();
  });
});

document.querySelectorAll("[data-nav-category]").forEach((link) => {
  link.addEventListener("click", () => {
    activeFilter = link.dataset.navCategory;
    document.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.toggle("active", chip.dataset.filter === activeFilter));
    renderProducts();
    document.querySelector("#menu-toggle").setAttribute("aria-expanded", "false");
    document.querySelector(".main-nav").classList.remove("open");
  });
});

searchInput.addEventListener("input", renderProducts);

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const product = products.find((item) => item.id === Number(button.dataset.add));
  const item = cart.get(product.id);
  cart.set(product.id, { product, quantity: (item?.quantity ?? 0) + 1 });
  renderCart();
  showToast(`${product.name} se agregó a tu carrito`);
});

cartItems.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) {
    cart.delete(Number(removeButton.dataset.remove));
    renderCart();
    return;
  }
  const quantityButton = event.target.closest("[data-quantity]");
  if (!quantityButton) return;
  const id = Number(quantityButton.dataset.quantity);
  const item = cart.get(id);
  item.quantity += Number(quantityButton.dataset.change);
  if (item.quantity <= 0) cart.delete(id);
  renderCart();
});

document.querySelector("#open-cart").addEventListener("click", () => setCartOpen(true));
document.querySelector("#close-cart").addEventListener("click", () => setCartOpen(false));
document.querySelector("#continue-shopping").addEventListener("click", () => setCartOpen(false));
overlay.addEventListener("click", () => setCartOpen(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setCartOpen(false);
});

document.querySelector("#menu-toggle").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const isOpen = button.getAttribute("aria-expanded") !== "true";
  button.setAttribute("aria-expanded", String(isOpen));
  document.querySelector(".main-nav").classList.toggle("open", isOpen);
});

document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const message = document.querySelector("#newsletter-message");
  message.textContent = "¡Gracias por sumarte! Pronto tendrás novedades.";
  document.querySelector("#email-input").value = "";
});

document.querySelector("#checkout-button").addEventListener("click", () => {
  showToast("¡Gracias! La compra en línea estará disponible pronto.");
});

renderProducts();
renderCart();
