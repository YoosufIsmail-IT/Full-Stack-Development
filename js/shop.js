/**
 * shop.js
 * -------
 * Shopping cart module: add to cart, calculate price, process payment.
 */

// ─── Cart State ───────────────────────────────────────────────────────────────

const cart = [];

// ─── Add to Cart ──────────────────────────────────────────────────────────────

/**
 * Adds a product to the cart or increments its quantity if already present.
 *
 * @param {Object} product        - The product to add.
 * @param {string} product.id     - Unique product ID.
 * @param {string} product.name   - Product name.
 * @param {number} product.price  - Price per unit (in dollars).
 * @param {number} [quantity=1]   - Number of units to add.
 * @returns {Object[]}            - Updated cart.
 *
 * @example
 * addToCart({ id: "p1", name: "Mug", price: 12.99 }, 2);
 */
function addToCart(product, quantity = 1) {
  if (!product?.id || typeof product.price !== "number") {
    throw new Error("Invalid product: must have an id and a numeric price.");
  }
  if (quantity < 1 || !Number.isInteger(quantity)) {
    throw new Error("Quantity must be a positive integer.");
  }

  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }

  console.log(`✅ Added "${product.name}" ×${quantity} to cart.`);
  return cart;
}

// ─── Remove from Cart ─────────────────────────────────────────────────────────

/**
 * Removes a product from the cart entirely.
 *
 * @param {string} productId - The ID of the product to remove.
 * @returns {Object[]}       - Updated cart.
 */
function removeFromCart(productId) {
  const index = cart.findIndex((item) => item.id === productId);
  if (index === -1) throw new Error(`Product "${productId}" not found in cart.`);

  const [removed] = cart.splice(index, 1);
  console.log(`🗑️  Removed "${removed.name}" from cart.`);
  return cart;
}

// ─── View Cart ────────────────────────────────────────────────────────────────

/**
 * Returns a copy of the current cart items.
 *
 * @returns {Object[]} Cart items.
 */
function getCart() {
  return [...cart];
}

// ─── Calculate Price ──────────────────────────────────────────────────────────

/**
 * Calculates the cart totals with optional discount and tax rate.
 *
 * @param {Object} [options]
 * @param {number} [options.discountPercent=0]   - Discount percentage (0–100).
 * @param {number} [options.taxRate=0]           - Tax rate as a decimal (e.g. 0.08 = 8%).
 * @returns {{
 *   subtotal:   number,
 *   discount:   number,
 *   taxAmount:  number,
 *   total:      number,
 *   breakdown:  Object[]
 * }}
 *
 * @example
 * calculatePrice({ discountPercent: 10, taxRate: 0.08 });
 */
function calculatePrice({ discountPercent = 0, taxRate = 0 } = {}) {
  if (cart.length === 0) throw new Error("Cart is empty.");

  const breakdown = cart.map((item) => ({
    id:        item.id,
    name:      item.name,
    unitPrice: item.price,
    quantity:  item.quantity,
    lineTotal: parseFloat((item.price * item.quantity).toFixed(2)),
  }));

  const subtotal     = parseFloat(breakdown.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2));
  const discountAmt  = parseFloat(((discountPercent / 100) * subtotal).toFixed(2));
  const taxableAmt   = subtotal - discountAmt;
  const taxAmount    = parseFloat((taxableAmt * taxRate).toFixed(2));
  const total        = parseFloat((taxableAmt + taxAmount).toFixed(2));

  return { subtotal, discount: discountAmt, taxAmount, total, breakdown };
}

// ─── Process Payment ──────────────────────────────────────────────────────────

/**
 * Processes a payment for the current cart.
 *
 * @param {Object} paymentDetails
 * @param {string} paymentDetails.method          - Payment method: "card" | "paypal" | "cash".
 * @param {number} paymentDetails.amountPaid      - Amount the customer is paying.
 * @param {Object} [options]
 * @param {number} [options.discountPercent=0]    - Discount percentage.
 * @param {number} [options.taxRate=0]            - Tax rate as decimal.
 * @returns {{
 *   success:     boolean,
 *   orderId:     string,
 *   method:      string,
 *   total:       number,
 *   amountPaid:  number,
 *   change:      number,
 *   timestamp:   string,
 *   items:       Object[]
 * }}
 *
 * @example
 * processPayment({ method: "card", amountPaid: 100 }, { taxRate: 0.08 });
 */
function processPayment(paymentDetails, options = {}) {
  const { method, amountPaid } = paymentDetails;
  const VALID_METHODS = ["card", "paypal", "cash"];

  if (!VALID_METHODS.includes(method)) {
    throw new Error(`Invalid payment method. Choose: ${VALID_METHODS.join(", ")}.`);
  }
  if (typeof amountPaid !== "number" || amountPaid <= 0) {
    throw new Error("amountPaid must be a positive number.");
  }

  const { total, subtotal, discount, taxAmount, breakdown } = calculatePrice(options);

  if (amountPaid < total) {
    throw new Error(
      `Insufficient payment. Order total is $${total.toFixed(2)}, received $${amountPaid.toFixed(2)}.`
    );
  }

  const change  = parseFloat((amountPaid - total).toFixed(2));
  const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  // Clear cart after successful payment
  cart.length = 0;

  const receipt = {
    success:    true,
    orderId,
    method,
    subtotal,
    discount,
    taxAmount,
    total,
    amountPaid,
    change,
    timestamp:  new Date().toISOString(),
    items:      breakdown,
  };

  console.log("💳 Payment processed successfully!");
  console.log(`   Order ID : ${orderId}`);
  console.log(`   Total    : $${total.toFixed(2)}`);
  console.log(`   Paid     : $${amountPaid.toFixed(2)}`);
  console.log(`   Change   : $${change.toFixed(2)}`);

  return receipt;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  addToCart,
  removeFromCart,
  getCart,
  calculatePrice,
  processPayment,
};


// ─── Quick Demo (remove in production) ───────────────────────────────────────

/*
const { addToCart, calculatePrice, processPayment } = require("./shop");

addToCart({ id: "p1", name: "Coffee Mug",   price: 12.99 }, 2);
addToCart({ id: "p2", name: "T-Shirt",      price: 24.99 }, 1);
addToCart({ id: "p3", name: "Notebook",     price:  8.50 }, 3);

const totals = calculatePrice({ discountPercent: 10, taxRate: 0.08 });
console.log(totals);
// { subtotal: 82.47, discount: 8.25, taxAmount: 6.34, total: 80.56, breakdown: [...] }

const receipt = processPayment({ method: "card", amountPaid: 100 }, { discountPercent: 10, taxRate: 0.08 });
console.log(receipt);
*/
