/**
 * ==========================================================================
 * TITANIC SMART CART & INTERACTION ENGINE - LUXURY EDITION
 * Manages LocalStorage, UI Binding, and Luxury WhatsApp Order Submission.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    let cartStorageKey = 'tasty_restaurant_cart_2026';
    let cart = [];

    function initCartSystem() {
        try {
            const rawData = localStorage.getItem(cartStorageKey);
            cart = rawData ? JSON.parse(rawData) : [];
        } catch (error) { cart = []; }
        syncCartToDOM();
    }

    function saveCartState() {
        localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    }

    function addProductToCart(product) {
        const matchIndex = cart.findIndex(item => item.id === product.id);
        if (matchIndex > -1) {
            cart[matchIndex].quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCartState();
        syncCartToDOM();
    }

    function syncCartToDOM() {
        const cartItemsList = document.getElementById('cart-items-list');
        const cartTotal = document.getElementById('cart-total-price');
        const cartBadge = document.getElementById('cart-count-badge');
        
        if (!cartItemsList) return;

        cartItemsList.innerHTML = '';
        let cumulativeTotal = 0;
        let count = 0;

        if (cart.length === 0) {
            cartItemsList.innerHTML = `<div class="text-center py-5 text-muted">سلتك الملكية فارغة حالياً.. أضف لمستك الخاصة!</div>`;
        } else {
            cart.forEach((item, idx) => {
                cumulativeTotal += item.price * item.quantity;
                count += item.quantity;
                cartItemsList.innerHTML += `
                    <div class="d-flex justify-content-between align-items-center py-3 border-bottom border-secondary">
                        <div>
                            <h6 class="text-warning mb-0">${item.name}</h6>
                            <small class="text-white-50">${item.price} EGP × ${item.quantity}</small>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <button class="btn btn-sm btn-outline-light decrease-qty-action" data-index="${idx}">-</button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-warning increase-qty-action" data-index="${idx}">+</button>
                        </div>
                    </div>`;
            });
        }
        if (cartTotal) cartTotal.innerText = `${cumulativeTotal.toFixed(2)} EGP`;
        if (cartBadge) cartBadge.innerText = count;
    }

    // معالجة إرسال الأوردر "الفخم" للواتساب
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('customer-name').value;
            const phone = document.getElementById('customer-phone').value;
            const address = document.getElementById('customer-address').value;
            
            let total = 0;
            let whatsappText = `✨ *طلبية ملكية من تيستي زفتى* ✨\n\n`;
            whatsappText += `👤 *العميل:* ${name}\n📞 *التواصل:* ${phone}\n📍 *العنوان:* ${address}\n\n`;
            whatsappText += `🍽️ *قائمة الاختيارات:* \n`;

            cart.forEach(item => {
                total += item.price * item.quantity;
                whatsappText += `• ${item.name} | ${item.quantity} × ${item.price} EGP\n`;
            });

            whatsappText += `\n💰 *الإجمالي المستحق:* ${total.toFixed(2)} EGP\n`;
            whatsappText += `\n_نحن نقدر ذوقكم الرفيع، جاري التجهيز فوراً.._ 👨‍🍳`;

            // إرسال للسيرفر
            fetch('/submit-order', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ name, phone, address, cart_data: whatsappText, total })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    // فتح الواتساب برقمك الحقيقي
                    const restaurantPhone = "201234567890"; 
                    window.open(`https://api.whatsapp.com/send?phone=${restaurantPhone}&text=${encodeURIComponent(whatsappText)}`, '_blank');
                    
                    cart = [];
                    saveCartState();
                    syncCartToDOM();
                    bootstrap.Modal.getInstance(document.getElementById('shippingModal')).hide();
                    orderForm.reset();
                }
            });
        });
    }

    // ربط الأزرار
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('increase-qty-action')) {
            cart[e.target.dataset.index].quantity++;
            saveCartState(); syncCartToDOM();
        } else if (e.target.classList.contains('decrease-qty-action')) {
            const idx = e.target.dataset.index;
            cart[idx].quantity > 1 ? cart[idx].quantity-- : cart.splice(idx, 1);
            saveCartState(); syncCartToDOM();
        }
    });

    initCartSystem();
});