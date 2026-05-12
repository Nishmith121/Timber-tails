document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== 'admin') {
        alert("Unauthorized access");
        window.location.href = "login.html";
        return;
    }

    // Tab switching
    const tabs = document.querySelectorAll(".admin-tab-btn");
    const contents = document.querySelectorAll(".admin-tab-content");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => {
                t.classList.remove("primary-btn");
                t.classList.add("print-btn");
            });
            contents.forEach(c => c.style.display = "none");
            
            tab.classList.remove("print-btn");
            tab.classList.add("primary-btn");
            document.getElementById(tab.dataset.target).style.display = "block";
        });
    });

    // Logout
    window.logoutAdmin = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    };

    // Load Orders
    async function loadOrders() {
        try {
            const res = await fetch("http://127.0.0.1:3005/api/admin/orders");
            const orders = await res.json();
            document.getElementById("totalOrdersCount").textContent = orders.length;

            const tbody = document.getElementById("adminOrdersBody");
            tbody.innerHTML = "";
            orders.forEach(order => {
                const address = JSON.parse(order.shippingAddress || "{}");
                const dateStr = new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                const orderIdStr = `TT-ORD${String(order.id).padStart(4, '0')}`;
                
                tbody.innerHTML += `
                    <div class="inv-table-row" style="border-bottom:1px solid rgba(255,255,255,0.05);">
                        <div style="flex:1; font-family:'Georgia'; color:#b8860b;">${orderIdStr}</div>
                        <div style="flex:2">${address.name || 'Unknown User'}</div>
                        <div style="flex:1">${dateStr}</div>
                        <div style="flex:1">${order.paymentMethod}</div>
                        <div style="flex:1; text-align:right;">₹${order.totalAmount.toLocaleString('en-IN', {minimumFractionDigits:2})}</div>
                    </div>
                `;
            });
        } catch (e) {
            console.error(e);
        }
    }

    // Load Inventory
    async function loadInventory() {
        try {
            const res = await fetch("http://127.0.0.1:3005/api/products");
            const products = await res.json();
            
            const grid = document.getElementById("adminInventoryGrid");
            grid.innerHTML = "";
            products.forEach(p => {
                grid.innerHTML += `
                    <div class="product-card" style="position:relative;">
                        <button onclick="deleteProduct(${p.id})" style="position:absolute; top:10px; right:10px; background:#e04646; color:#fff; border:none; padding:5px 10px; border-radius:2px; cursor:pointer; font-size:10px; letter-spacing:1px; z-index:10;">DELETE</button>
                        <div class="product-image" style="background-image: url('${p.imageUrl}')"></div>
                        <div class="product-info">
                            <span class="category">${p.category}</span>
                            <h3>${p.name}</h3>
                            <span class="price">₹${p.price.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                `;
            });
        } catch (e) {
            console.error(e);
        }
    }

    window.deleteProduct = async (id) => {
        if(!confirm("Are you sure you want to delete this product?")) return;
        try {
            await fetch(`http://127.0.0.1:3005/api/products/${id}`, { method: 'DELETE' });
            loadInventory();
        } catch (e) {
            console.error(e);
        }
    };

    // Add Product
    document.getElementById("addProductForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const fileInput = document.getElementById("prodImageFile");
        if (!fileInput || !fileInput.files[0]) {
            alert("Please select a product image!");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64Image = event.target.result;

            const payload = {
                name: document.getElementById("prodName").value,
                category: document.getElementById("prodCategory").value,
                price: parseFloat(document.getElementById("prodPrice").value),
                imageUrl: base64Image
            };

            try {
                await fetch("http://127.0.0.1:3005/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                document.getElementById("addProductForm").reset();
                loadInventory();
                alert("Product added successfully!");
            } catch (err) {
                console.error(err);
            }
        };
        reader.readAsDataURL(fileInput.files[0]);
    });

    loadOrders();
    loadInventory();
});
