"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

const POSContext = createContext(null);

export function POSProvider({ children }) {
  // Navigation active tab: 'pos' | 'dashboard' | 'products' | 'orders' | 'settings'
  const [activeTab, setActiveTab] = useState("pos");

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authUser, setAuthUser] = useState(null);

  // In-memory data states (populated on-demand from MongoDB backend)
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [settings, setSettings] = useState({
    shopName: "Crispy Bites & Fast Food",
    tagline: "Fresh, Hot & Crispy Fast Food",
    address: "Shop #4, Food Street, Commercial Market",
    phone: "+92 300 1234567 / 051-5551234",
    taxRate: 10,
    currency: "Rs.",
    currencyName: "PKR",
    cashierName: "Hassan (Cashier 1)",
    invoiceFooter: "Thank you for dining with us! Please visit again.",
    orderCounter: 1001,
    receiptPaperSize: "80mm",
  });

  // Granular Loading & Sync states (On-Demand Lazy Loading)
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [isPurchasesLoading, setIsPurchasesLoading] = useState(false);
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Backward compatible general loading flag (true if initial products or settings are loading)
  const isLoading = isProductsLoading || isSettingsLoading;

  // In-memory cache trackers: avoid re-fetching data that has already been loaded
  const settingsLoadedRef = useRef(false);
  const productsLoadedRef = useRef(false);
  const ordersLoadedRef = useRef(false);
  const purchasesLoadedRef = useRef(false);

  // Active Category filter & search query (in-memory instant filtering)
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Cart / Active Register Order (pure in-memory for 0ms lag)
  const [currentOrderNumber, setCurrentOrderNumber] = useState(1001);
  const [orderType, setOrderType] = useState("dine_in"); // 'dine_in' | 'take_away' | 'delivery'
  const [tableNumber, setTableNumber] = useState("T1");
  const [cart, setCart] = useState([]);

  // Held orders (stored in session memory / local cache)
  const [heldOrders, setHeldOrders] = useState([]);

  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'invoice' | 'addProduct' | 'editProduct' | 'editNotes' | 'heldOrders' | 'tablePicker' | 'settings' | 'purchaseDetail' | 'recordPurchase'
  const [completedOrder, setCompletedOrder] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // 1. Fetch Settings On-Demand
  const fetchSettings = useCallback(async (force = false) => {
    if (settingsLoadedRef.current && !force) return;
    setIsSettingsLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const setData = await res.json();
        if (setData.success && setData.data) {
          const sanitized = {
            ...setData.data,
            currency:
              setData.data.currency && setData.data.currency !== "$"
                ? setData.data.currency
                : "Rs.",
            currencyName:
              setData.data.currencyName && setData.data.currencyName !== "USD"
                ? setData.data.currencyName
                : "PKR",
            receiptPaperSize: setData.data.receiptPaperSize || "80mm",
          };
          setSettings(sanitized);
          if (setData.data.orderCounter) {
            setCurrentOrderNumber(setData.data.orderCounter);
          }
          settingsLoadedRef.current = true;
        }
      }
    } catch (err) {
      console.error("Failed to fetch settings from MongoDB:", err);
    } finally {
      setIsSettingsLoading(false);
    }
  }, []);

  // 2. Fetch Products On-Demand
  const fetchProducts = useCallback(async (force = false) => {
    if (productsLoadedRef.current && !force) return;
    setIsProductsLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const prodData = await res.json();
        if (prodData.success) {
          setProducts(prodData.data || []);
          productsLoadedRef.current = true;
        }
      }
    } catch (err) {
      console.error("Failed to fetch products from MongoDB:", err);
      setApiError("Database connection issue. Please check your MongoDB setup.");
    } finally {
      setIsProductsLoading(false);
    }
  }, []);

  // 3. Fetch Orders On-Demand (executed only when orders, history, or dashboard tab is opened)
  const fetchOrders = useCallback(async (force = false) => {
    if (ordersLoadedRef.current && !force) return;
    setIsOrdersLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const ordData = await res.json();
        if (ordData.success) {
          setOrders(ordData.data || []);
          ordersLoadedRef.current = true;
        }
      }
    } catch (err) {
      console.error("Failed to fetch orders from MongoDB:", err);
    } finally {
      setIsOrdersLoading(false);
    }
  }, []);

  // 4. Fetch Purchases On-Demand (executed only when stock purchases or dashboard tab is opened)
  const fetchPurchases = useCallback(async (force = false) => {
    if (purchasesLoadedRef.current && !force) return;
    setIsPurchasesLoading(true);
    try {
      const res = await fetch("/api/purchases");
      if (res.ok) {
        const purData = await res.json();
        if (purData.success) {
          setPurchases(purData.data || []);
          purchasesLoadedRef.current = true;
        }
      }
    } catch (err) {
      console.error("Failed to fetch stock purchases from MongoDB:", err);
    } finally {
      setIsPurchasesLoading(false);
    }
  }, []);

  // Force refresh helpers
  const refreshProducts = useCallback(() => fetchProducts(true), [fetchProducts]);
  const refreshOrders = useCallback(() => fetchOrders(true), [fetchOrders]);
  const refreshPurchases = useCallback(() => fetchPurchases(true), [fetchPurchases]);
  const refreshSettings = useCallback(() => fetchSettings(true), [fetchSettings]);

  // Initial Data Fetch: Only loads startup essentials (settings + products)
  const fetchInitialData = useCallback(async () => {
    await Promise.all([fetchSettings(true), fetchProducts(true)]);
  }, [fetchSettings, fetchProducts]);

  // Auth check & login/logout methods
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setAuthUser(data.user);
          return true;
        }
      }
    } catch (e) {
      console.error("Auth check failed:", e);
    } finally {
      setIsCheckingAuth(false);
    }
    setIsAuthenticated(false);
    setAuthUser(null);
    return false;
  }, []);

  const login = async (username, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setAuthUser(data.user);
        toast.success(`Welcome back, ${data.user.username}!`);
        // Reset cache flags for fresh session
        settingsLoadedRef.current = false;
        productsLoadedRef.current = false;
        ordersLoadedRef.current = false;
        purchasesLoadedRef.current = false;
        // Fetch essentials for active tab
        fetchSettings();
        fetchProducts();
        return { success: true };
      } else {
        return { success: false, error: data.error || "Invalid username or password" };
      }
    } catch (err) {
      console.error("Login request error:", err);
      return { success: false, error: "Unable to connect to server. Please try again." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout request error:", e);
    } finally {
      setIsAuthenticated(false);
      setAuthUser(null);
      settingsLoadedRef.current = false;
      productsLoadedRef.current = false;
      ordersLoadedRef.current = false;
      purchasesLoadedRef.current = false;
      toast.info("Logged out successfully");
    }
  };

  useEffect(() => {
    checkAuth().then((isAuthed) => {
      if (isAuthed) {
        // Only load essential startup data for current tab
        fetchSettings();
        fetchProducts();
      }
    });
  }, [checkAuth, fetchSettings, fetchProducts]);

  // On-Demand Data Fetching when activeTab changes: only load what is needed!
  useEffect(() => {
    if (!isAuthenticated) return;

    switch (activeTab) {
      case "pos":
        fetchSettings();
        fetchProducts();
        break;
      case "dashboard":
        fetchSettings();
        fetchProducts();
        fetchOrders();
        fetchPurchases();
        break;
      case "products":
        fetchSettings();
        fetchProducts();
        break;
      case "all_orders":
      case "orders":
      case "history":
        fetchSettings();
        fetchOrders();
        break;
      case "purchases":
        fetchSettings();
        fetchPurchases();
        break;
      case "settings":
        fetchSettings();
        break;
      default:
        break;
    }
  }, [activeTab, isAuthenticated, fetchSettings, fetchProducts, fetchOrders, fetchPurchases]);

  // Calculations (performed instantaneously in-memory)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = (subtotal * (settings?.taxRate || 0)) / 100;
  const grandTotal = subtotal + taxAmount;

  // 2. Add item to cart (instant in-memory) with Variant & Size support
  const addToCart = (product, customNote = "", selectedVariant = null, quantityToAdd = 1) => {
    const itemPrice = selectedVariant?.price !== undefined ? Number(selectedVariant.price) : Number(product.price);
    const variantLabel = selectedVariant ? ` (${selectedVariant.size || selectedVariant.code})` : "";
    const fullItemName = product.name + (selectedVariant && !product.name.includes(selectedVariant.size) ? variantLabel : "");
    const uniqueProductId = selectedVariant ? `${product.id}_${selectedVariant.code || selectedVariant.size}` : product.id;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) =>
          (item.uniqueId === uniqueProductId || item.productId === uniqueProductId || (!selectedVariant && item.productId === product.id)) &&
          (!customNote || item.notes === customNote)
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + (quantityToAdd || 1),
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            cartId: "c_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
            uniqueId: uniqueProductId,
            productId: product.id,
            name: fullItemName,
            category: product.category,
            price: itemPrice,
            quantity: quantityToAdd || 1,
            image: product.image,
            variant: selectedVariant || null,
            notes: customNote || product.defaultNotes || "",
          },
        ];
      }
    });
  };

  // Update item quantity in cart (instant in-memory)
  const updateQuantity = (cartId, delta) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.cartId === cartId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  // Update item custom note (instant in-memory)
  const updateItemNotes = (cartId, newNotes) => {
    setCart((prev) =>
      prev.map((item) => (item.cartId === cartId ? { ...item, notes: newNotes } : item))
    );
    toast.success("Note Updated", { description: "Custom instructions saved for this item" });
  };

  // Remove single item from cart (instant in-memory)
  const removeFromCart = (cartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  // Clear active cart
  const clearCart = () => {
    setCart([]);
  };

  // Hold current order
  const holdCurrentOrder = () => {
    if (cart.length === 0) return;
    const held = {
      heldId: "HOLD-" + Date.now(),
      orderNumber: "#" + currentOrderNumber,
      orderType,
      tableNumber,
      items: [...cart],
      total: grandTotal,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setHeldOrders((prev) => [held, ...prev]);
    clearCart();
    toast.info("Order Placed on Hold", {
      description: `Order #${currentOrderNumber} stored in held orders`,
    });
  };

  // Resume a held order
  const resumeHeldOrder = (heldId) => {
    const held = heldOrders.find((h) => h.heldId === heldId);
    if (!held) return;
    setCart(held.items);
    setOrderType(held.orderType);
    setTableNumber(held.tableNumber);
    setHeldOrders((prev) => prev.filter((h) => h.heldId !== heldId));
    setActiveModal(null);
    toast.success("Order Resumed", { description: `Loaded ${held.orderNumber} to active cart` });
  };

  // 3. Complete & Checkout order -> Sends targeted POST request to MongoDB
  const completeOrder = async (paymentMethod = "Cash", amountPaid = null, customerDetails = {}) => {
    if (cart.length === 0) return null;

    const paid = amountPaid !== null ? parseFloat(amountPaid) : grandTotal;
    const change = Math.max(0, paid - grandTotal);

    const orderPayload = {
      customerName: customerDetails.name || "Walk-in Customer",
      customerPhone: customerDetails.phone || "",
      orderType,
      tableNumber: orderType === "dine_in" ? tableNumber : "-",
      items: cart.map((item) => ({
        id: item.productId,
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        notes: item.notes,
        image: item.image,
      })),
      itemsCount: cartItemCount,
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxRate: settings.taxRate,
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      discountAmount: 0,
      total: parseFloat(grandTotal.toFixed(2)),
      paymentMethod,
      amountPaid: parseFloat(paid.toFixed(2)),
      changeDue: parseFloat(change.toFixed(2)),
      cashier: settings.cashierName,
    };

    setIsSyncing(true);
    const toastId = toast.loading("Processing and saving order to database...");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || "Failed to save order to database");
      }

      const savedOrder = resData.data;

      // Update in-memory state seamlessly
      setOrders((prev) => [savedOrder, ...prev]);
      setCompletedOrder(savedOrder);

      // Update product sales counts locally
      setProducts((prev) =>
        prev.map((p) => {
          const cartMatch = cart.find((c) => c.productId === p.id);
          if (cartMatch) {
            return { ...p, salesCount: (p.salesCount || 0) + cartMatch.quantity };
          }
          return p;
        })
      );

      if (resData.nextOrderNumber) {
        setCurrentOrderNumber(resData.nextOrderNumber);
      }

      // Reset cart and open invoice modal
      clearCart();
      setActiveModal("invoice");

      toast.success("Order Completed Successfully!", {
        id: toastId,
        description: `Invoice ${savedOrder.orderNumber} saved to MongoDB`,
      });

      return savedOrder;
    } catch (err) {
      console.error("Order completion error:", err);
      toast.error("Failed to complete order", {
        id: toastId,
        description: err.message,
      });
      return null;
    } finally {
      setIsSyncing(false);
    }
  };

  // 4. Add new product -> Targeted POST to MongoDB
  const addProduct = async (newProduct) => {
    setIsSyncing(true);
    const toastId = toast.loading("Adding food item to database...");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create product");
      }

      setProducts((prev) => [data.data, ...prev]);
      setActiveModal(null);
      toast.success("Item Added Successfully!", {
        id: toastId,
        description: `${data.data.name} is now live in your menu`,
      });
      return data.data;
    } catch (err) {
      console.error("Add product error:", err);
      toast.error("Error adding product", {
        id: toastId,
        description: err.message,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // 5. Update existing product -> Targeted PUT to MongoDB
  const updateProduct = async (id, updatedFields) => {
    setIsSyncing(true);
    const toastId = toast.loading("Updating product in database...");
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update product");
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data.data } : p))
      );
      setActiveModal(null);
      setEditingItem(null);
      toast.success("Product Updated!", {
        id: toastId,
        description: `${data.data.name} updated successfully`,
      });
      return data.data;
    } catch (err) {
      console.error("Update product error:", err);
      toast.error("Error updating product", {
        id: toastId,
        description: err.message,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // 6. Delete product -> Targeted DELETE to MongoDB
  const deleteProduct = async (id) => {
    setIsSyncing(true);
    const toastId = toast.loading("Deleting product...");
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete product");
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product Deleted", {
        id: toastId,
        description: "Food item removed from database",
      });
    } catch (err) {
      console.error("Delete product error:", err);
      toast.error("Error deleting product", {
        id: toastId,
        description: err.message,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // 7. Update settings -> Targeted PUT to MongoDB
  const updateSettings = async (newSettings) => {
    setIsSyncing(true);
    const toastId = toast.loading("Saving settings to database...");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update settings");
      }

      setSettings(data.data);
      if (data.data.orderCounter) {
        setCurrentOrderNumber(data.data.orderCounter);
      }
      toast.success("Settings Saved!", {
        id: toastId,
        description: "POS configuration updated successfully",
      });
      return data.data;
    } catch (err) {
      console.error("Update settings error:", err);
      toast.error("Error saving settings", {
        id: toastId,
        description: err.message,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // 8. Stock Purchasing Handlers (MongoDB backend)
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const addPurchase = async (purchaseData) => {
    setIsSyncing(true);
    const toastId = toast.loading("Recording stock purchase bill...");
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchaseData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to record purchase");
      }

      setPurchases((prev) => [data.data, ...prev]);
      setActiveModal(null);
      toast.success("Stock Purchase Recorded!", {
        id: toastId,
        description: `Bill ${data.data.invoiceNumber} from ${data.data.supplierName} saved`,
      });
      return data.data;
    } catch (err) {
      console.error("Add purchase error:", err);
      toast.error("Failed to save purchase", {
        id: toastId,
        description: err.message,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const updatePurchase = async (id, updatedData) => {
    setIsSyncing(true);
    const toastId = toast.loading("Updating purchase record...");
    try {
      const res = await fetch(`/api/purchases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update purchase");
      }

      setPurchases((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data.data } : p))
      );
      setActiveModal(null);
      setSelectedPurchase(null);
      toast.success("Purchase Updated Successfully!", {
        id: toastId,
        description: `Invoice ${data.data.invoiceNumber} updated`,
      });
      return data.data;
    } catch (err) {
      console.error("Update purchase error:", err);
      toast.error("Failed to update purchase", {
        id: toastId,
        description: err.message,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const deletePurchase = async (id) => {
    setIsSyncing(true);
    const toastId = toast.loading("Deleting purchase record...");
    try {
      const res = await fetch(`/api/purchases/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete purchase");
      }

      setPurchases((prev) => prev.filter((p) => p.id !== id));
      toast.success("Purchase Record Deleted", {
        id: toastId,
        description: "Purchase entry removed from database",
      });
    } catch (err) {
      console.error("Delete purchase error:", err);
      toast.error("Failed to delete purchase", {
        id: toastId,
        description: err.message,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <POSContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isAuthenticated,
        isCheckingAuth,
        authUser,
        login,
        logout,
        products,
        setProducts,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        cart,
        currentOrderNumber,
        orderType,
        setOrderType,
        tableNumber,
        setTableNumber,
        cartItemCount,
        subtotal,
        taxAmount,
        grandTotal,
        orders,
        heldOrders,
        purchases,
        setPurchases,
        selectedPurchase,
        setSelectedPurchase,
        addPurchase,
        updatePurchase,
        deletePurchase,
        settings,
        setSettings,
        updateSettings,
        activeModal,
        setActiveModal,
        completedOrder,
        setCompletedOrder,
        editingItem,
        setEditingItem,
        isLoading,
        isProductsLoading,
        isOrdersLoading,
        isPurchasesLoading,
        isSettingsLoading,
        isSyncing,
        apiError,
        fetchInitialData,
        fetchProducts,
        fetchOrders,
        fetchPurchases,
        fetchSettings,
        refreshProducts,
        refreshOrders,
        refreshPurchases,
        refreshSettings,
        addToCart,
        updateQuantity,
        updateItemNotes,
        removeFromCart,
        clearCart,
        holdCurrentOrder,
        resumeHeldOrder,
        completeOrder,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error("usePOS must be used within a POSProvider");
  }
  return context;
}
