
console.log("cart.js pornit");


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeCode = (s) =>
  (s || "").toUpperCase().replace(/\s+/g, "").replace(/[^A-Z0-9-]/g, "");

const parsePriceText = (txt) =>
  Number(String(txt || "").replace(/[^\d.]/g, "")) || 0;

const fmt = (n, curr) =>
  (Number(n) || 0).toLocaleString("ro-RO") + (curr ? " " + curr : "");

function genCode(prefix = "AH") {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const block = (n) =>
    Array.from({ length: n }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  return `${prefix}-${block(4)}-${block(4)}`;
}
const state = {
  cart: [],
  coupon: { code: null, percent: 0, validated: false, consumed: false },
};

const $drawer = document.getElementById("cartDrawer");
const $openCart = document.getElementById("openCart");
const $closeCart = document.getElementById("closeCart");
const $cartItems = document.getElementById("cartItems");
const $cartCount = document.getElementById("cartCount");

const $sumSubtotal = document.getElementById("sumSubtotal");
const $sumDiscount = document.getElementById("sumDiscount");
const $sumTotal = document.getElementById("sumTotal");

const $applyCoupon = document.getElementById("applyCoupon");
const $couponInput = document.getElementById("couponInput");
const $couponMsg = document.getElementById("couponMsg");
const $checkoutForm = document.getElementById("checkoutForm");

const $contactForm = document.getElementById("contactForm");
const $formMsg = document.getElementById("formMsg");

const $checkoutBtn = document.getElementById("checkoutBtn");
const $checkoutModal = document.getElementById("checkoutModal");
const $closeCheckout = document.getElementById("closeCheckout");

const $mSumSubtotal = document.getElementById("mSumSubtotal");
const $mSumDiscount = document.getElementById("mSumDiscount");
const $mSumTotal = document.getElementById("mSumTotal");

function readProductFromCard(card) {
  if (!card) return null;

  const id = card.dataset.id;
  const name =
    card.dataset.name ||
    card.querySelector("h3, .title")?.textContent?.trim() ||
    "Produs";

  const currency = card.dataset.currency || "MDL";
  const img = card.dataset.img || card.querySelector("img")?.src || "";

  let price = Number(card.dataset.price || 0);
  if (!price) {
    const t = card.querySelector(".price,[data-price-text]")?.textContent || "0";
    price = parsePriceText(t);
  }

  const size = card.dataset.size ? String(card.dataset.size) : null;

  return { id, name, price, currency, img, size };
}

function openDrawer() {
  $drawer && $drawer.classList.add("open");
}
function closeDrawer() {
  $drawer && $drawer.classList.remove("open");
}

$openCart && $openCart.addEventListener("click", openDrawer);

if ($closeCart) {
  $closeCart.type = "button";
  $closeCart.addEventListener("click", closeDrawer);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeDrawer();
    closeCheckoutModal();
  }
});

function openCheckoutModal() {
  if (!$checkoutModal) return;
  $checkoutModal.classList.add("show");
  $checkoutModal.setAttribute("aria-hidden", "false");
}
function closeCheckoutModal() {
  if (!$checkoutModal) return;
  $checkoutModal.classList.remove("show");
  $checkoutModal.setAttribute("aria-hidden", "true");
}

$checkoutBtn &&
  $checkoutBtn.addEventListener("click", () => {
    if ($checkoutBtn.disabled) return;
    openCheckoutModal();
  });

$closeCheckout && $closeCheckout.addEventListener("click", closeCheckoutModal);

$checkoutModal &&
  $checkoutModal.addEventListener("click", (e) => {
    if (e.target === $checkoutModal) closeCheckoutModal();
  });

function addToCart(p) {
  if (!p || !p.id) return;

  const key = p.size ? `${p.id}__${p.size}` : p.id;

  const i = state.cart.findIndex((x) => x.id === key);
  if (i >= 0) {
    state.cart[i].qty = (state.cart[i].qty || 1) + 1;
  } else {
    state.cart.push({
      id: key, 
      baseId: p.id, 
      name: p.name,
      price: Number(p.price) || 0,
      qty: 1,
      currency: p.currency || "MDL",
      img: p.img || "",
      size: p.size || "", 
    });
  }

  updateCartUI();
}

function removeFromCart(id) {
  state.cart = state.cart.filter((x) => x.id !== id);
  updateCartUI();
}

function setQty(id, delta) {
  const it = state.cart.find((x) => x.id === id);
  if (!it) return;
  it.qty = Math.max(1, (it.qty || 1) + delta);
  updateCartUI();
}

function calcTotals() {
  const subtotal = state.cart.reduce(
    (s, it) => s + (Number(it.price) || 0) * (it.qty || 1),
    0
  );

  const percent = state.coupon.validated
    ? Number(state.coupon.percent || 0)
    : 0;

  const discount = Math.round(subtotal * (percent / 100));
  const total = Math.max(0, subtotal - discount);

  return { subtotal, discount, total };
}


function updateCartUI() {
  if ($cartCount) {
    $cartCount.textContent = state.cart.reduce((s, it) => s + (it.qty || 1), 0);
  }

  if ($cartItems) {
    if (!state.cart.length) {
      $cartItems.innerHTML = `<p class="cart-empty">Coșul este gol.</p>`;
    } else {
      $cartItems.innerHTML = state.cart
        .map(
          (it) => `
        <div class="cart-line">
          <div>
            <div class="line-name">${it.name}</div>
            ${it.size ? `<div class="muted">Mărime: <b>${it.size}</b></div>` : ""}
            <div class="muted">${fmt(it.price, it.currency)} / buc.</div>
          </div>
          <div class="line-actions">
            <div class="qty">
              <button type="button" aria-label="Scade" data-dec="${it.id}">−</button>
              <strong>${it.qty}</strong>
              <button type="button" aria-label="Crește" data-inc="${it.id}">+</button>
            </div>
            <button class="remove" type="button" data-remove="${it.id}">Șterge</button>
          </div>
        </div>`
        )
        .join("");
    }
  }

  const t = calcTotals();

  if ($sumSubtotal) $sumSubtotal.textContent = t.subtotal;
  if ($sumDiscount) $sumDiscount.textContent = t.discount;
  if ($sumTotal) $sumTotal.textContent = t.total;

  if ($mSumSubtotal) $mSumSubtotal.textContent = t.subtotal;
  if ($mSumDiscount) $mSumDiscount.textContent = t.discount;
  if ($mSumTotal) $mSumTotal.textContent = t.total;

  if ($checkoutBtn) $checkoutBtn.disabled = state.cart.length === 0;

  if ($applyCoupon) $applyCoupon.disabled = state.cart.length === 0;
  if ($couponInput) $couponInput.disabled = state.cart.length === 0;
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-add-cart, .add-to-cart, [data-add]");
  if (!btn) return;
  e.preventDefault();

  const card = btn.closest(".card-item, .card, [data-id]");
  const p = readProductFromCard(card);

  if (!p || !p.id) {
    console.warn(
      "Card fără data-id. Adaugă data-id / data-name / data-price pe card."
    );
    return;
  }

  addToCart(p);
  openDrawer();
});

$cartItems &&
  $cartItems.addEventListener("click", (e) => {
    const dec = e.target?.dataset?.dec;
    const inc = e.target?.dataset?.inc;
    const rem = e.target?.dataset?.remove;
    if (dec) setQty(dec, -1);
    if (inc) setQty(inc, +1);
    if (rem) removeFromCart(rem);
  });

async function validateCouponInFirestore(code) {
  const ref = db.collection("coupons").doc(code);
  const snap = await ref.get();
  if (!snap.exists) return null;
  return snap.data();
}

async function markCouponUsed(code) {
  const ref = db.collection("coupons").doc(code);
  await ref.update({ used: true });
}

$applyCoupon &&
  $applyCoupon.addEventListener("click", async () => {
    if (state.cart.length === 0) {
      if ($couponMsg) $couponMsg.textContent = "Coșul este gol.";
      return;
    }

    const raw = $couponInput.value;
    const code = normalizeCode(raw);
    $couponMsg.textContent = "";

    if (!code) {
      $couponMsg.textContent = "Introdu codul.";
      return;
    }

    try {
      const data = await validateCouponInFirestore(code);
      if (!data) {
        state.coupon = { code: null, percent: 0, validated: false, consumed: false };
        updateCartUI();
        $couponMsg.textContent = "Cod inexistent.";
        return;
      }
      if (data.used) {
        state.coupon = { code: null, percent: 0, validated: false, consumed: false };
        updateCartUI();
        $couponMsg.textContent = "Cod deja folosit.";
        return;
      }

      const percent = Number(data.percent || 10);
      state.coupon = { code, percent, validated: true, consumed: false };
      updateCartUI();
      $couponMsg.textContent = `Cod valid: -${percent}% va fi aplicat la această comandă.`;
    } catch (err) {
      console.error("Eroare validate cupon:", err);
      $couponMsg.textContent = "Eroare la verificarea cuponului.";
    }
  });

async function consumeCouponIfNeeded() {
  if (!(state.coupon.validated && state.coupon.code && !state.coupon.consumed))
    return true;

  try {
    await markCouponUsed(state.coupon.code);
    state.coupon.consumed = true;
    return true;
  } catch (err) {
    console.error("Eroare consumare cupon:", err);
    alert("Nu s-a putut consuma codul. Reîncearcă.");
    return false;
  }
}

$checkoutForm &&
  $checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (state.cart.length === 0) {
      alert("Coșul este gol.");
      return;
    }

    const fd = new FormData(e.target);
    const order = {
      firstName: fd.get("firstName")?.toString().trim(),
      lastName: fd.get("lastName")?.toString().trim(),
      locality: fd.get("locality")?.toString().trim(),
      email: fd.get("email")?.toString().trim(),
      phone: fd.get("phone")?.toString().trim(),
      address: fd.get("address")?.toString().trim(),
    };

    if (!order.firstName) return alert("Prenumele este obligatoriu.");
    if (!order.lastName) return alert("Numele este obligatoriu.");
    if (!order.locality) return alert("Localitatea este obligatorie.");
    if (!emailRegex.test(order.email)) return alert("Email invalid.");
    if (!order.phone) return alert("Telefon obligatoriu.");
    if (!order.address) return alert("Adresa obligatorie.");

    const okCoupon = await consumeCouponIfNeeded();
    if (!okCoupon) return;

    try {
      const totals = calcTotals();

      const ref = await db.collection("orders").add({
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        ...order,

        items: state.cart.map((i) => ({
          id: i.baseId || i.id, 
          cartId: i.id, 
          name: i.name,
          price: i.price,
          qty: i.qty,
          currency: i.currency || "MDL",
          img: i.img || "",
          size: i.size || "", 
        })),

        totals,
        coupon: {
          code: state.coupon.code || "",
          percent: state.coupon.percent || 0,
          consumed: !!state.coupon.consumed,
        },
      });

      alert(
        "Comanda a fost trimisă! ID: " +
          ref.id +
          "\nPăstrează acest cod ca dovadă."
      );

      state.cart = [];
      state.coupon = { code: null, percent: 0, validated: false, consumed: false };
      e.target.reset();
      if ($couponMsg) $couponMsg.textContent = "";
      updateCartUI();

      closeCheckoutModal();
      closeDrawer();
    } catch (err) {
      console.error("Eroare salvare comandă:", err);
      alert("Nu s-a putut salva comanda.");
    }
  });

if ($contactForm && $formMsg) {
  console.log("FORMULAR CONTACT GĂSIT");

  $contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData($contactForm);
    const name = (fd.get("name") || "").toString().trim();
    const email = (fd.get("email") || "").toString().trim();
    const message = (fd.get("message") || "").toString().trim();

    if (!name) {
      $formMsg.style.display = "block";
      $formMsg.textContent = "Numele este obligatoriu.";
      return;
    }
    if (!emailRegex.test(email)) {
      $formMsg.style.display = "block";
      $formMsg.textContent = "Email invalid.";
      return;
    }
    if (!message) {
      $formMsg.style.display = "block";
      $formMsg.textContent = "Mesajul este obligatoriu.";
      return;
    }

    $formMsg.style.display = "block";
    $formMsg.textContent = "Se generează codul...";

    const code = genCode("AH");
    console.log("COD GENERAT =", code);

    try {
      await db.collection("coupons").doc(code).set({
        name,
        email,
        message,
        code,
        percent: 10,
        used: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      console.log("SCRIS ÎN FIRESTORE OK");

      $formMsg.innerHTML = `Mulțumim pentru mesaj! Codul tău de reducere este: <b>${code}</b>.`;
      $contactForm.reset();
    } catch (err) {
      console.error("EROARE FIRESTORE:", err);
      $formMsg.textContent =
        "Eroare la salvarea în baza de date. Încearcă din nou.";
    }
  });
} else {
  console.warn("Nu găsesc #contactForm sau #formMsg în pagină.");
}

updateCartUI();

window.addToCart = addToCart;
window.openDrawer = openDrawer;






