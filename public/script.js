// Button interaction
const exploreBtn = document.getElementById("exploreBtn");
if (exploreBtn) {
    exploreBtn.addEventListener("click", () => {
        window.location.href = "collection.html";
    });
}

// Optional: Navbar background change on scroll
window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.background = "rgba(0,0,0,0.95)";
        } else {
            navbar.style.background = "rgba(0,0,0,0.85)";
        }
    }
});

// Automatic Slideshow
const images = [
    "images/hero1.png",
    "images/hero2.png",
    "images/hero3.png",
    "images/hero4.png"
];

let currentIndex = 0;
const heroSection = document.querySelector(".hero");

function changeBackground() {
    if (heroSection) {
        currentIndex = (currentIndex + 1) % images.length;
        heroSection.style.backgroundImage = `url('${images[currentIndex]}')`;
    }
}

// Preload images for smooth transition
images.forEach(image => {
    const img = new Image();
    img.src = image;
});

// Change image every 5 seconds
if (typeof changeBackground === 'function') {
    setInterval(changeBackground, 5000);
}

// Auth State Management
document.addEventListener("DOMContentLoaded", () => {
    // 1. Profile icon redirect logic
    const profileIcons = document.querySelectorAll(".icon-user");
    profileIcons.forEach(icon => {
        icon.addEventListener("click", () => {
            const token = localStorage.getItem("token");
            if (!token) {
                window.location.href = "login.html";
            } else {
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                alert(`You are already logged in as ${user.fullName || user.email}.`);
            }
        });
    });

    // 2. Toggle password visibility
    const toggleBtns = document.querySelectorAll(".toggle-password");
    toggleBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const input = e.currentTarget.previousElementSibling;
            if (input.type === "password") {
                input.type = "text";
            } else {
                input.type = "password";
            }
        });
    });

    // 3. Signup Form Submission
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const fullName = document.getElementById("signupName").value;
            const email = document.getElementById("signupEmail").value;
            const password = document.getElementById("signupPassword").value;

            try {
                const response = await fetch("/api/auth/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ fullName, email, password })
                });
                
                const data = await response.json();
                if (response.ok) {
                    alert("Account created successfully! Please sign in.");
                    window.location.href = "login.html";
                } else {
                    alert(data.error || "Signup failed.");
                }
            } catch (err) {
                console.error("Signup error:", err);
                alert("An error occurred during signup.");
            }
        });
    }

    // 4. Login Form Submission
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            try {
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));
                    
                    if (data.role === 'admin') {
                        window.location.href = "admin.html";
                    } else {
                        alert("Login successful!");
                        window.location.href = "index.html";
                    }
                } else {
                    alert(data.error || "Login failed.");
                }
            } catch (err) {
                console.error("Login error:", err);
                alert("An error occurred during login.");
            }
        });
    }

    // 5. Auth UI Update
    const currentToken = localStorage.getItem("token");
    if (currentToken && !window.location.pathname.includes("login.html") && !window.location.pathname.includes("signup.html")) {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        
        // Add role-based links
        const navLinks = document.querySelector(".navbar nav");
        if (navLinks) {
            if (currentUser.role === 'admin') {
                const adminLink = document.createElement("a");
                adminLink.href = "admin.html";
                adminLink.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#b8860b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; margin-bottom: 2px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>DASHBOARD`;
                adminLink.style.color = "#b8860b";
                navLinks.appendChild(adminLink);
            } else {
                const ordersLink = document.createElement("a");
                ordersLink.href = "orders.html";
                ordersLink.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; margin-bottom: 2px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>ORDERS`;
                navLinks.appendChild(ordersLink);
            }
        }

        // Add Email & Logout
        const iconsDiv = document.querySelector(".navbar .icons");
        if (iconsDiv) {
            const userIcon = iconsDiv.querySelector(".icon-user");
            if (userIcon) userIcon.remove();

            const nameSpan = document.createElement("span");
            nameSpan.className = "user-email-text";
            nameSpan.textContent = (currentUser.fullName || "USER").toUpperCase();
            iconsDiv.appendChild(nameSpan);

            const logoutBtn = document.createElement("button");
            logoutBtn.className = "logout-btn";
            logoutBtn.textContent = "LOGOUT";
            logoutBtn.addEventListener("click", () => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.reload();
            });
            iconsDiv.appendChild(logoutBtn);
        }
    }

    // 6. Cart Management
    function updateCartBadge() {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        const badges = document.querySelectorAll(".cart-badge");
        badges.forEach(badge => {
            if (totalItems > 0) {
                badge.style.display = "flex";
                badge.textContent = totalItems;
            } else {
                badge.style.display = "none";
            }
        });
    }

    // Initialize badge
    updateCartBadge();

    // Collection Page - Add to Cart
    const colGrid = document.querySelector('.product-grid');
    if (colGrid) {
        colGrid.addEventListener('click', (e) => {
            const icon = e.target.closest('.hover-cart-icon');
            if (icon) {
                e.stopPropagation();
                let card = e.target.closest('.product-card');
                if (card) {
                    const name = card.querySelector('h3').textContent;
                    const priceText = card.querySelector('.price').textContent;
                    const price = parseFloat(priceText.replace(/[^0-9]/g, ''));
                    const category = card.querySelector('.category').textContent;
                    const bgStyle = card.querySelector('.product-image').style.backgroundImage;
                    const imgMatch = bgStyle.match(/url\(['"]?(.*?)['"]?\)/);
                    const img = imgMatch ? imgMatch[1] : '';

                    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
                    const existing = cart.find(i => i.name === name);
                    if (existing) {
                        existing.qty += 1;
                    } else {
                        cart.push({ id: Date.now(), name, price, category, img, qty: 1 });
                    }
                    localStorage.setItem("cart", JSON.stringify(cart));
                    updateCartBadge();
                    alert(name + " added to cart!");
                }
            }
        });
    }

    // Collection Grid Population
    const collectionGrid = document.getElementById("collectionGrid");
    if (collectionGrid) {
        async function fetchProducts() {
            try {
                const response = await fetch("/api/products");
                const products = await response.json();
                
                collectionGrid.innerHTML = "";
                products.forEach(p => {
                    const priceFormatted = `₹${p.price.toLocaleString('en-IN')}`;
                    collectionGrid.innerHTML += `
                        <div class="product-card">
                            <div class="product-image" style="background-image: url('${p.imageUrl}')">
                                <span class="hover-cart-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                                </span>
                            </div>
                            <div class="product-info">
                                <span class="category">${p.category}</span>
                                <h3>${p.name}</h3>
                                <span class="price">${priceFormatted}</span>
                            </div>
                        </div>
                    `;
                });
            } catch(e) {
                console.error(e);
            }
        }
        fetchProducts();
    }

    // Cart Page - Render items
    const cartContainer = document.getElementById("cartItemsContainer");
    if (cartContainer) {
        function renderCart() {
            const cart = JSON.parse(localStorage.getItem("cart") || "[]");
            cartContainer.innerHTML = '';
            
            let subtotal = 0;
            
            if (cart.length === 0) {
                cartContainer.innerHTML = '<p style="color: #888;">Your cart is empty.</p>';
            }

            cart.forEach((item, index) => {
                subtotal += item.price * item.qty;
                const itemHTML = `
                    <div class="cart-item">
                        <div class="cart-item-img" style="background-image: url('${item.img}')"></div>
                        <div class="cart-item-details">
                            <div class="cart-item-header">
                                <h3 class="cart-item-title">${item.name}</h3>
                                <button class="cart-item-delete" data-index="${index}" title="Remove Item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                </button>
                            </div>
                            <span class="cart-item-category">${item.category}</span>
                            <div class="cart-item-bottom">
                                <div class="qty-control">
                                    <button class="qty-btn qty-dec" data-index="${index}">-</button>
                                    <span class="qty-val">${item.qty}</span>
                                    <button class="qty-btn qty-inc" data-index="${index}">+</button>
                                </div>
                                <span class="cart-item-price">₹${item.price.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                `;
                cartContainer.innerHTML += itemHTML;
            });

            // Update Summary
            const gst = subtotal * 0.18;
            const total = subtotal + gst;
            
            document.getElementById("summarySubtotal").textContent = '₹' + subtotal.toLocaleString();
            document.getElementById("summaryGST").textContent = '₹' + gst.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
            document.getElementById("summaryTotal").textContent = '₹' + total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

            // Attach listeners to buttons
            document.querySelectorAll('.qty-inc').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = e.target.getAttribute('data-index');
                    cart[idx].qty += 1;
                    localStorage.setItem("cart", JSON.stringify(cart));
                    renderCart();
                    updateCartBadge();
                });
            });

            document.querySelectorAll('.qty-dec').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = e.target.getAttribute('data-index');
                    if (cart[idx].qty > 1) {
                        cart[idx].qty -= 1;
                    }
                    localStorage.setItem("cart", JSON.stringify(cart));
                    renderCart();
                    updateCartBadge();
                });
            });

            document.querySelectorAll('.cart-item-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = e.currentTarget.getAttribute('data-index');
                    cart.splice(idx, 1);
                    localStorage.setItem("cart", JSON.stringify(cart));
                    renderCart();
                    updateCartBadge();
                });
            });
        }
        
        renderCart();
    }

    // Checkout Page Logic
    const checkoutContainer = document.getElementById("checkoutItemsContainer");
    if (checkoutContainer) {
        function renderCheckout() {
            const cart = JSON.parse(localStorage.getItem("cart") || "[]");
            checkoutContainer.innerHTML = '';
            
            let subtotal = 0;
            
            if (cart.length === 0) {
                checkoutContainer.innerHTML = '<p style="color: #888; font-size: 11px;">Your cart is empty.</p>';
            }

            cart.forEach((item) => {
                subtotal += item.price * item.qty;
                const itemHTML = `
                    <div class="checkout-item">
                        <div class="checkout-item-img" style="background-image: url('${item.img}')"></div>
                        <div class="checkout-item-details">
                            <div class="checkout-item-info">
                                <h4>${item.name}</h4>
                                <span>Qty: ${item.qty}</span>
                            </div>
                            <span class="checkout-item-price">₹${(item.price * item.qty).toLocaleString()}</span>
                        </div>
                    </div>
                `;
                checkoutContainer.innerHTML += itemHTML;
            });

            const gst = subtotal * 0.18;
            const total = subtotal + gst;
            
            document.getElementById("checkoutSubtotal").textContent = '₹' + subtotal.toLocaleString('en-IN');
            document.getElementById("checkoutGST").textContent = '₹' + gst.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
            document.getElementById("checkoutTotal").textContent = '₹' + total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        }
        
        renderCheckout();

        // Payment Tabs
        const paymentTabs = document.querySelectorAll(".payment-tab");
        paymentTabs.forEach(tab => {
            tab.addEventListener("click", () => {
                paymentTabs.forEach(t => t.classList.remove("active"));
                document.querySelectorAll(".payment-content").forEach(c => c.style.display = "none");
                
                tab.classList.add("active");
                const target = tab.getAttribute("data-target");
                document.getElementById(target).style.display = "block";
            });
        });

        // Place Order button
        const placeOrderBtn = document.querySelector(".checkout-btn");
        if(placeOrderBtn) {
            placeOrderBtn.addEventListener("click", async () => {
                const cart = JSON.parse(localStorage.getItem("cart") || "[]");
                if (cart.length === 0) {
                    alert("Your cart is empty!");
                    return;
                }

                const user = JSON.parse(localStorage.getItem("user") || "{}");
                let subtotal = 0;
                cart.forEach(i => subtotal += i.price * i.qty);
                const totalAmount = subtotal * 1.18;

                const activeTab = document.querySelector(".payment-tab.active");
                const paymentMethod = activeTab ? activeTab.innerText.trim() : "Unknown";

                try {
                    const response = await fetch("/api/orders", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userId: user.id || null,
                            shippingAddress: {
                                name: document.getElementById("chkName")?.value || "",
                                email: document.getElementById("chkEmail")?.value || "",
                                address: document.getElementById("chkAddress")?.value || "",
                                city: document.getElementById("chkCity")?.value || "",
                                state: document.getElementById("chkState")?.value || "",
                                zip: document.getElementById("chkZip")?.value || "",
                                country: document.getElementById("chkCountry")?.value || ""
                            },
                            paymentMethod: paymentMethod,
                            items: cart,
                            totalAmount: totalAmount
                        })
                    });
                    
                    if (response.ok) {
                        localStorage.removeItem("cart");
                        window.location.href = "order-success.html";
                    } else {
                        alert("Failed to place order. Please try again.");
                    }
                } catch (e) {
                    console.error("Order error:", e);
                    alert("An error occurred while placing your order.");
                }
            });
        }
    }

    // Orders Page Logic
    const ordersContainer = document.getElementById("ordersContainer");
    if (ordersContainer) {
        async function fetchOrders() {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            if (!user.id) {
                ordersContainer.innerHTML = '<p class="no-orders">Please <a href="login.html" style="color:#fff;">login</a> to view your orders.</p>';
                return;
            }

            try {
                const response = await fetch(`/api/orders/${user.id}`);
                const orders = await response.json();

                if (orders.length === 0) {
                    ordersContainer.innerHTML = '<p class="no-orders">You have not placed any orders yet.</p>';
                    return;
                }

                orders.forEach(order => {
                    const items = JSON.parse(order.items || "[]");
                    const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
                    
                    const dateObj = new Date(order.createdAt);
                    const options = { day: 'numeric', month: 'long', year: 'numeric' };
                    const dateStr = dateObj.toLocaleDateString('en-GB', options);

                    const orderIdStr = `TT-ORD${String(order.id).padStart(4, '0')}`;

                    const orderHTML = `
                        <div class="order-card">
                            <div class="order-left">
                                <div class="order-id">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                    ${orderIdStr}
                                </div>
                                <div class="order-meta">
                                    ${dateStr} — ${itemCount} ${itemCount === 1 ? 'item' : 'items'}
                                </div>
                            </div>
                            <div class="order-right">
                                <div class="order-amount">₹${order.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                                <button class="view-invoice-btn" onclick="window.location.href='invoice.html?id=${order.id}'">VIEW INVOICE</button>
                            </div>
                        </div>
                    `;
                    ordersContainer.innerHTML += orderHTML;
                });
            } catch (e) {
                console.error(e);
                ordersContainer.innerHTML = '<p class="no-orders">An error occurred while fetching orders.</p>';
            }
        }
        fetchOrders();
    }

    // Invoice Page Logic
    const invoiceWrapper = document.querySelector(".invoice-details");
    if (invoiceWrapper) {
        async function fetchInvoice() {
            const urlParams = new URLSearchParams(window.location.search);
            const orderId = urlParams.get('id');
            if(!orderId) {
                invoiceWrapper.innerHTML = "<p>No order ID specified.</p>";
                return;
            }

            try {
                const response = await fetch(`/api/order/${orderId}`);
                if (!response.ok) {
                    invoiceWrapper.innerHTML = "<p style='color:#fff;'>Order not found.</p>";
                    return;
                }
                const order = await response.json();
                
                const address = JSON.parse(order.shippingAddress || "{}");
                const items = JSON.parse(order.items || "[]");
                
                const dateObj = new Date(order.createdAt);
                const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                const orderIdStr = `TT-ORD${String(order.id).padStart(4, '0')}`;

                const titleDesc = document.getElementById("invTitleDesc");
                if(titleDesc) titleDesc.textContent = `Thank you for your purchase. Your order ${orderIdStr} has been placed successfully.`;
                
                document.getElementById("invOrderNo").textContent = orderIdStr;
                document.getElementById("invOrderDate").textContent = dateStr;

                const addressParts = [];
                if (address.name) addressParts.push(address.name);
                if (address.email) addressParts.push(address.email);
                if (address.address) addressParts.push(address.address);
                
                let cityStateZip = [];
                if (address.city) cityStateZip.push(address.city);
                if (address.state) cityStateZip.push(address.state);
                if (address.zip) cityStateZip.push(address.zip);
                if (cityStateZip.length > 0) addressParts.push(cityStateZip.join(', '));
                
                if (address.country) addressParts.push(address.country);

                document.getElementById("invBilledTo").innerHTML = addressParts.join('<br>') || "N/A";
                document.getElementById("invPaymentMethod").textContent = order.paymentMethod || 'Unknown';

                const tbody = document.getElementById("invItemsBody");
                tbody.innerHTML = "";
                let subtotal = 0;

                items.forEach(item => {
                    const lineTotal = item.price * item.qty;
                    subtotal += lineTotal;
                    tbody.innerHTML += `
                        <div class="inv-table-row">
                            <div class="inv-col-item">${item.name}</div>
                            <div class="inv-col-qty">${item.qty}</div>
                            <div class="inv-col-price">₹${item.price.toLocaleString('en-IN')}</div>
                            <div class="inv-col-total">₹${lineTotal.toLocaleString('en-IN')}</div>
                        </div>
                    `;
                });

                document.getElementById("invSubtotal").textContent = `₹${subtotal.toLocaleString('en-IN')}`;
                
                const tax = subtotal * 0.18;
                document.getElementById("invTax").textContent = `₹${tax.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                
                document.getElementById("invTotal").textContent = `₹${order.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

            } catch(e) {
                console.error(e);
                invoiceWrapper.innerHTML = "<p style='color:#fff;'>Error loading invoice.</p>";
            }
        }
        fetchInvoice();

        const printBtn = document.getElementById("printInvoiceBtn");
        if(printBtn) {
            printBtn.addEventListener("click", () => {
                window.print();
            });
        }
    }
});
