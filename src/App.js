import React, { useState, useEffect } from "react";
import {
  Camera,
  Menu,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Search,
  Filter,
  Star,
  X,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";

const ScanToSeeMenuApp = () => {
  const [currentView, setCurrentView] = useState("landing");
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const  publicUrl = process.env.REACT_APP_PUBLIC_URL || window.location.origin;
  const [menuItems, setMenuItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null); // object or null
  const [editingRestaurant, setEditingRestaurant] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Categories managed by admin
  const [categories, setCategories] = useState(["Pizzas", "Pasta", "Beverages"]);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  // Sample data on mount
  useEffect(() => {
    const sampleRestaurant = {
      id: 1,
      name: "Bella Vista Restaurant",
      description: "Authentic Italian cuisine with a modern twist",
    };

    const sampleMenu = [
      {
        id: 1,
        name: "Margherita Pizza",
        category: "Pizzas",
        price: 450,
        description: "Fresh tomatoes, mozzarella, and basil on wood-fired crust",
        imageUrl:
          "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop",
        popular: true,
        isVeg: true,
        spiceLevel: 0,
        servingSize: "Serves 2-3 people",
        chefSpecial: false,
      },
      {
        id: 2,
        name: "Pasta Carbonara",
        category: "Pasta",
        price: 480,
        description:
          "Creamy egg sauce with pancetta, parmesan and black pepper",
        imageUrl:
          "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
        popular: true,
        isVeg: false,
        spiceLevel: 1,
        servingSize: "Serves 1 person",
        chefSpecial: true,
      },
    ];

    setRestaurants([sampleRestaurant]);
    setSelectedRestaurant(sampleRestaurant);
    setMenuItems(sampleMenu);
  }, []);

  // If QR includes ?view=menu, open menu directly (skip landing)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "menu") {
      setCurrentView("menu");
    }
    const r = params.get("r");
    if (r && restaurants.length > 0) {
      const match = restaurants.find((rs) => String(rs.id) === String(r));
      if (match) setSelectedRestaurant(match);
    }
  }, [restaurants]);

  const availableFilters = [
    "Vegetarian",
    "Non-Vegetarian",
    "Popular",
    "Chef Special",
    "Spicy",
  ];

  const addMenuItem = (newItem) => {
    const item = {
      ...newItem,
      id: Date.now(),
      imageUrl: newItem.imageUrl || "",
      popular: newItem.popular || false,
      isVeg: newItem.isVeg || false,
      spiceLevel: newItem.spiceLevel || 0,
      servingSize: newItem.servingSize || "",
      chefSpecial: newItem.chefSpecial || false,
    };
    setMenuItems((s) => [...s, item]);
  };

  const updateMenuItem = (updatedItem) => {
    setMenuItems((s) => s.map((it) => (it.id === updatedItem.id ? updatedItem : it)));
    setEditingItem(null);
  };

  const deleteMenuItem = (id) => {
    setMenuItems((s) => s.filter((it) => it.id !== id));
  };

  const updateRestaurant = (updatedRestaurant) => {
    setSelectedRestaurant(updatedRestaurant);
    setEditingRestaurant(false);
  };

  const toggleFilter = (filter) => {
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]));
  };

  const getFilteredItems = () => {
    let filtered = menuItems;

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.category || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilters.length > 0) {
      filtered = filtered.filter((item) => {
        return activeFilters.every((filter) => {
          switch (filter) {
            case "Vegetarian":
              return item.isVeg;
            case "Non-Vegetarian":
              return !item.isVeg;
            case "Popular":
              return item.popular;
            case "Chef Special":
              return item.chefSpecial;
            case "Spicy":
              return item.spiceLevel > 2;
            default:
              return true;
          }
        });
      });
    }

    return filtered;
  };

  const getSpiceIndicator = (level) => {
    return Array.from({ length: Math.min(level, 5) }, (_, i) => (
      <span key={i} className="text-red-500 mr-0.5">🌶️</span>
    ));
  };

  const getDietaryIcons = (item) => {
    return item.isVeg ? (
      <span key="veg" className="text-green-600 ml-2" title="Vegetarian">🟢</span>
    ) : (
      <span key="nonveg" className="text-red-600 ml-2" title="Non-Vegetarian">🔴</span>
    );
  };

  // -- Landing --
  if (currentView === "landing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-orange-500 text-white flex items-center justify-center">
        <div className="text-center px-4 py-8">
          <Menu className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-5xl font-extrabold mb-3 tracking-wide">
            Welcome to <span className="text-yellow-300">DineX</span>
          </h1>
          <p className="text-lg md:text-xl mb-4 font-light">
            Powered by <span className="font-semibold text-white">Quintex Digital Solutions</span>
          </p>
          <p className="text-2xl mb-8 font-medium">The Future of Restaurant Menus 🍽️✨</p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button onClick={() => setCurrentView("admin")} className="bg-yellow-400 text-purple-900 px-8 py-3 rounded-full font-bold shadow hover:scale-105 transition">
              Manage Menu
            </button>
            <button onClick={() => setCurrentView("menu")} className="bg-transparent border-2 border-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-purple-800 transition">
              View Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -- Admin Dashboard --
  if (currentView === "admin") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentView("landing")} className="text-gray-600">← Back to Home</button>
              <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
            </div>
            <button onClick={() => setCurrentView("menu")} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Eye className="w-4 h-4" /> Preview Menu
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Restaurant Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Restaurant Information</h2>
              <button onClick={() => setEditingRestaurant(true)} className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2"><Edit3 className="w-4 h-4" /> Edit Info</button>
            </div>

            {editingRestaurant ? (
              <div className="space-y-3">
                <input type="text" placeholder="Restaurant Name" value={selectedRestaurant?.name || ""} onChange={(e) => setSelectedRestaurant({...selectedRestaurant, name: e.target.value})} className="w-full px-3 py-2 border rounded" />
                <textarea placeholder="Description" value={selectedRestaurant?.description || ""} onChange={(e) => setSelectedRestaurant({...selectedRestaurant, description: e.target.value})} className="w-full px-3 py-2 border rounded" rows={3} />
                <div className="flex gap-2">
                  <button onClick={() => updateRestaurant(selectedRestaurant)} className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
                  <button onClick={() => setEditingRestaurant(false)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600">Restaurant Name</p>
                <p className="font-medium">{selectedRestaurant?.name}</p>
                <p className="text-sm text-gray-600 mt-3">Description</p>
                <p className="font-medium">{selectedRestaurant?.description}</p>
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-3">Categories</h2>
            <div className="flex gap-2 mb-4">
              <input value={newCategoryInput} onChange={(e) => setNewCategoryInput(e.target.value)} placeholder="Add new category" className="flex-1 px-3 py-2 border rounded" />
              <button onClick={() => {
                const trimmed = (newCategoryInput || "").trim();
                if (trimmed && !categories.includes(trimmed)) {
                  setCategories((s) => [...s, trimmed]);
                }
                setNewCategoryInput("");
              }} className="bg-green-600 text-white px-4 py-2 rounded">Add</button>
            </div>

            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
                  <span>{cat}</span>
                  <button onClick={() => {
                    // Remove category and reassign items of that category to empty string
                    setCategories((s) => s.filter((c) => c !== cat));
                    setMenuItems((items) => items.map(it => it.category === cat ? {...it, category: ""} : it));
                  }} className="text-red-600">Remove</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Menu Management */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Menu Items</h2>
              <button onClick={() => setEditingItem({
                name: "",
                category: categories[0] || "",
                price: "",
                description: "",
                imageUrl: "",
                popular: false,
                isVeg: true,
                spiceLevel: 0,
                servingSize: "",
                chefSpecial: false
              })} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Item</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-left">Price (₹)</th>
                    <th className="px-4 py-2 text-left">Details</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map(item => (
                    <tr key={item.id} className="border-b">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded object-cover" /> : <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">🍽️</div>}
                          <div>
                            <div className="font-medium flex items-center">
                              <span>{item.name}</span>
                              {getDietaryIcons(item)}
                            </div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{item.category}</td>
                      <td className="px-4 py-3">₹{item.price}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs space-y-1">
                          {item.popular && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">Popular</span>}
                          {item.chefSpecial && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Chef Special</span>}
                          {item.spiceLevel > 0 && <div>{getSpiceIndicator(item.spiceLevel)}</div>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => setEditingItem(item)} className="text-blue-600"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => deleteMenuItem(item.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {menuItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-500">No menu items yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ===== QR Code Section (Admin only) ===== */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Restaurant QR Code</h2>
            <p className="text-gray-600 mb-4">Owners can download this QR and print it. Customers scan to open your menu instantly (no app required).</p>

            {(() => {
              const BASE_URL = process.env.REACT_APP_PUBLIC_URL || window.location.origin;
              const qrUrl = `${BASE_URL}?view=menu&r=${encodeURIComponent(selectedRestaurant?.id ?? 1)}`;
              const isReadyForQR = (selectedRestaurant?.name ?? "").trim().length > 0 && categories.length > 0 && menuItems.length > 0;

              return (
                <div className="flex flex-col items-center gap-4">
                  <div id="qr-code-box" className="p-4 bg-gray-100 rounded inline-block">
                    <QRCodeCanvas id="qr-code" value={publicUrl} size={220} level="H" includeMargin />
                  </div>

                  {!isReadyForQR ? (
                    <div className="text-sm text-red-600">
                      Complete setup to enable download:
                      <ul className="list-disc list-inside text-left mt-2">
                        <li>Enter restaurant name</li>
                        <li>Add at least one category</li>
                        <li>Add at least one menu item</li>
                      </ul>
                    </div>
                  ) : null}

                  <button disabled={!isReadyForQR} onClick={() => {
                    const el = document.getElementById("qr-code-box");
                    html2canvas(el, { backgroundColor: null }).then((canvas) => {
                      const link = document.createElement("a");
                      link.download = `${(selectedRestaurant?.name || "menu").replace(/\s+/g, "-")}-qr.png`;
                      link.href = canvas.toDataURL("image/png");
                      link.click();
                    });
                  }} className={`px-6 py-2 rounded ${isReadyForQR ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}>
                    Download QR Code
                  </button>

                  <p className="text-xs text-gray-500">QR opens: <span className="font-mono break-all">{qrUrl}</span></p>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  // -- Customer menu view --
  const filteredItems = getFilteredItems();
  const filteredCategories = [...new Set(filteredItems.map((i) => i.category || "Uncategorized"))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => setCurrentView("landing")} className="text-gray-600">← Back</button>
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold text-gray-800">{selectedRestaurant?.name}</h1>
            <p className="text-sm text-gray-600">{selectedRestaurant?.description}</p>
          </div>
          <div style={{ width: 48 }} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Search & Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm border mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search menu items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded" />
          </div>

          <div className="flex items-center justify-between mt-3">
            <button onClick={() => setShowFilters((s) => !s)} className="flex items-center gap-2 text-gray-600"><Filter className="w-4 h-4" /> Filters {activeFilters.length > 0 && <span className="bg-orange-500 text-white rounded-full px-2 py-0.5 text-xs">{activeFilters.length}</span>}</button>
            {activeFilters.length > 0 && <button onClick={() => setActiveFilters([])} className="text-red-600">Clear all</button>}
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-2 mt-3">
              {availableFilters.map(filter => (
                <button key={filter} onClick={() => toggleFilter(filter)} className={`px-3 py-1 rounded-full text-sm ${activeFilters.includes(filter) ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-700"}`}>{filter}</button>
              ))}
            </div>
          )}
        </div>

        {/* Popular */}
        {!searchQuery && activeFilters.length === 0 && menuItems.filter(i => i.popular).length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3"><Star className="w-5 h-5 text-orange-500" /><h2 className="text-xl font-bold">Popular Items</h2></div>
            <div className="grid md:grid-cols-2 gap-4">
              {menuItems.filter(i => i.popular).slice(0,4).map(item => (
                <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border">
                  <div className="flex gap-3">
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded object-cover" onClick={() => setViewingImage(item.imageUrl)} /> : <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">🍽️</div>}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{item.name}</h3>
                        {getDietaryIcons(item)}
                        {item.chefSpecial && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Chef Special</span>}
                      </div>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-lg font-bold">₹{item.price}</div>
                        {item.spiceLevel > 0 && <div>{getSpiceIndicator(item.spiceLevel)}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories and Items */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No items found.</p>
            <button onClick={() => { setSearchQuery(""); setActiveFilters([]); }} className="text-orange-600 mt-2">Clear</button>
          </div>
        ) : (
          filteredCategories.map(category => (
            <div key={category} className="mb-8">
              <h2 className="text-xl font-bold mb-4">{category}</h2>
              <div className="space-y-4">
                {filteredItems.filter(i => (i.category || "Uncategorized") === category).map(item => (
                  <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded object-cover cursor-pointer" onClick={() => setViewingImage(item.imageUrl)} /> : <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">🍽️</div>}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{item.name}</h3>
                            {getDietaryIcons(item)}
                            {item.popular && <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Popular</span>}
                            {item.chefSpecial && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Chef Special</span>}
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                          <div className="flex gap-4 text-xs text-gray-500 mt-2">
                            {item.servingSize && <span>Serving: {item.servingSize}</span>}
                            {item.spiceLevel > 0 && <span>Spice: {getSpiceIndicator(item.spiceLevel)}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold">₹{item.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Digital Menu System</p>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl max-h-full">
            <button onClick={() => setViewingImage(null)} className="absolute top-4 right-4 bg-white rounded-full p-2">
              <X className="w-6 h-6" />
            </button>
            <img src={viewingImage} alt="Food" className="max-w-full max-h-full rounded-lg shadow-lg" />
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{editingItem.id ? "Edit Menu Item" : "Add Menu Item"}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" placeholder="Item name" value={editingItem.name} onChange={(e) => setEditingItem({...editingItem, name: e.target.value})} className="w-full px-3 py-2 border rounded" />
              <select value={editingItem.category} onChange={(e) => setEditingItem({...editingItem, category: e.target.value})} className="w-full px-3 py-2 border rounded">
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>

              <input type="number" placeholder="Price in ₹" value={editingItem.price} onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value) || ""})} className="w-full px-3 py-2 border rounded" />
              <select value={editingItem.servingSize} onChange={(e) => setEditingItem({...editingItem, servingSize: e.target.value})} className="w-full px-3 py-2 border rounded">
                <option value="">Select Serving Size</option>
                <option value="Serves 1 person">Serves 1 person</option>
                <option value="Serves 2-3 people">Serves 2-3 people</option>
                <option value="Serves 3+ people">Serves 3+ people</option>
              </select>

              <div className="md:col-span-2">
                <textarea placeholder="Description" value={editingItem.description} onChange={(e) => setEditingItem({...editingItem, description: e.target.value})} className="w-full px-3 py-2 border rounded" rows={3} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Food Image (URL or upload)</label>
                <input type="url" placeholder="Food image URL" value={editingItem.imageUrl || ""} onChange={(e) => setEditingItem({...editingItem, imageUrl: e.target.value})} className="w-full px-3 py-2 border rounded mb-2" />
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setEditingItem(it => ({ ...it, imageUrl: reader.result }));
                    reader.readAsDataURL(file);
                  }
                }} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Spice Level (0-5)</label>
                <input type="range" min={0} max={5} value={editingItem.spiceLevel || 0} onChange={(e) => setEditingItem({...editingItem, spiceLevel: parseInt(e.target.value)})} className="w-full" />
                <div className="flex justify-between text-xs text-gray-500"><span>Mild</span><span>Very Hot</span></div>
              </div>

              <div className="md:col-span-2 grid grid-cols-3 gap-4 items-center">
                <label className="flex items-center gap-2"><input type="checkbox" checked={!!editingItem.popular} onChange={(e) => setEditingItem({...editingItem, popular: e.target.checked})} /> <span>Popular Item</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={!!editingItem.chefSpecial} onChange={(e) => setEditingItem({...editingItem, chefSpecial: e.target.checked})} /> <span>Chef Special</span></label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2"><input type="radio" name="vegStatus" checked={editingItem.isVeg === true} onChange={() => setEditingItem({...editingItem, isVeg: true})} /> <span>Vegetarian</span></label>
                  <label className="flex items-center gap-2"><input type="radio" name="vegStatus" checked={editingItem.isVeg === false} onChange={() => setEditingItem({...editingItem, isVeg: false})} /> <span>Non-Vegetarian</span></label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => {
                // sanitize price
                const itemToSave = { ...editingItem, price: editingItem.price === "" ? 0 : Number(editingItem.price) };
                if (itemToSave.id) updateMenuItem(itemToSave);
                else addMenuItem(itemToSave);
              }} className="bg-orange-600 text-white px-4 py-2 rounded flex-1">{editingItem.id ? "Update" : "Add"} Item</button>
              <button onClick={() => setEditingItem(null)} className="bg-gray-300 px-4 py-2 rounded flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ScanToSeeMenuApp;
