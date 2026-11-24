const storageKey = "mini-shop-cart";
const cartCount = document.querySelector(".cart-count");
const cartIcon = document.querySelector(".cart-icon");
const cartTotal = document.querySelector("#cart-total");
const clearCartButton = document.querySelector(".clear-cart");
const cards = [...document.querySelectorAll(".project-card")];
const searchInput = document.querySelector(".search");
const filterButtons = [...document.querySelectorAll(".filter-button")];
let activeCategory = "all";

function renderCurrency(element, amount) {
  const parts = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).formatToParts(amount);
  const fragment = document.createDocumentFragment();

  parts.forEach((part) => {
    if (part.type === "currency") {
      const symbol = document.createElement("span");
      symbol.className = "currency-symbol";
      symbol.textContent = part.value;
      fragment.append(symbol);
    } else {
      fragment.append(document.createTextNode(part.value));
    }
  });

  element.replaceChildren(fragment);
}

function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(storageKey) || "{}");
    return savedCart && typeof savedCart === "object" ? savedCart : {};
  } catch (error) {
    console.error("Unable to load the cart.", error);
    return {};
  }
}

let cart = loadCart();

function saveCart() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(cart));
  } catch (error) {
    console.error("Unable to save the cart.", error);
  }
}

function getQuantity(card) {
  return Number(cart[card.dataset.id] || 0);
}

function filterProducts() {
  const searchTerm = searchInput.value.trim().toLocaleLowerCase();

  cards.forEach((card) => {
    const category = card.querySelector(".category").textContent.trim().toLocaleLowerCase();
    const name = card.querySelector(".name").textContent.toLocaleLowerCase();
    const matchesCategory = activeCategory === "all" || category === activeCategory;
    const matchesSearch = name.includes(searchTerm);
    card.hidden = !matchesCategory || !matchesSearch;
  });
}

function renderCart() {
  let itemCount = 0;
  let totalPrice = 0;

  cards.forEach((card) => {
    const quantity = getQuantity(card);
    itemCount += quantity;
    totalPrice += Number(card.dataset.price) * quantity;

    const price = card.querySelector(".item-price h2");
    if (price) {
      renderCurrency(price, Number(card.dataset.price));
    }

    const button = card.querySelector(".btn-more");
    if (button) {
      button.textContent = quantity
        ? `Add to cart (${quantity} in cart)`
        : "Add to cart";
    }
  });

  cartCount.textContent = String(itemCount);
  cartCount.setAttribute("aria-label", `${itemCount} items in cart`);
  cartIcon.setAttribute("aria-label", `Shopping cart, ${itemCount} items`);
  renderCurrency(cartTotal, totalPrice);
}

searchInput.addEventListener("input", filterProducts);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
    filterProducts();
  });
});

cards.forEach((card) => {
  const button = card.querySelector(".btn-more");
  button.addEventListener("click", () => {
    const id = card.dataset.id;
    cart[id] = getQuantity(card) + 1;
    saveCart();
    renderCart();
  });
});

clearCartButton.addEventListener("click", () => {
  cart = {};
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error("Unable to clear the cart.", error);
  }
  renderCart();
});

renderCart();
