import React, { useState, useEffect } from "react";
import { db } from './firebase';
import { doc, getDoc, setDoc } from "firebase/firestore"; // <-- FIXED: Added 'setDoc'
import toast, { Toaster } from 'react-hot-toast'; // <-- FIXED: Added toast imports

// Icon components
const Search = ({ className }) => ( <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> </svg> );
const Filter = ({ className }) => ( <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /> </svg> );
const X = ({ className }) => ( <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> </svg> );
const Menu = ({ className }) => ( <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /> </svg> );

const CustomerMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tableId, setTableId] = useState(null);
  const [order, setOrder] = useState([]);
  const [tableStatus, setTableStatus] = useState("available");

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const tableNum = params.get("table");
    setTableId(tableNum);

    const loadData = async () => {
      const menuDocRef = doc(db, "menus", "the-spice-route");
      const menuDocSnap = await getDoc(menuDocRef);
      if (menuDocSnap.exists()) {
        const data = menuDocSnap.data();
        setMenuItems(data.items || []);
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        } else {
          const defaultCategories = [...new Set((data.items || []).map(item => item.category || "Uncategorized"))];
          setCategories(defaultCategories);
        }
      } else { console.log("No menu found for customers."); }
      
      if (tableNum) {
        const tableDocRef = doc(db, "tables", tableNum);
        const tableDocSnap = await getDoc(tableDocRef);
        if (tableDocSnap.exists() && tableDocSnap.data().status === 'ordering') {
          setTableStatus('ordering');
        } else {
          setTableStatus('available');
        }
      }
    };
    loadData();
    const sampleRestaurant = { id: "rest_1", name: "The Spice Route", description: "Authentic Indian flavors with a contemporary touch." };
    setSelectedRestaurant(sampleRestaurant);
  }, []);

  const availableFilters = ["Vegetarian", "Non-Vegetarian", "Popular", "Chef Special"];

  const getFilteredItems = () => {
    let filtered = menuItems;
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeFilters.length > 0) {
      filtered = filtered.filter(item => {
        return activeFilters.every(filter => {
          switch (filter) {
            case "Vegetarian": return item.isVeg;
            case "Non-Vegetarian": return !item.isVeg;
            case "Popular": return item.popular;
            case "Chef Special": return item.chefSpecial;
            default: return true;
          }
        });
      });
    }
    return filtered;
  };

  const toggleFilter = (filter) => {
    setActiveFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
  };

  const addToOrder = (item) => {
    setOrder(prevOrder => [...prevOrder, item]);
    toast.success(`${item.name} added to your order!`);
  };

  const placeOrder = async () => {
    if (order.length === 0) { toast.error("Your order is empty!"); return; }
    if (!tableId) { toast.error("Table number not found. Please scan the QR code again."); return; }
    const orderId = `table-${tableId}-${Date.now()}`;
    try {
      await setDoc(doc(db, "orders", orderId), {
        tableId: tableId, items: order, status: "new", createdAt: new Date()
      });
      await setDoc(doc(db, "tables", tableId), {
        status: "ordering", lastOrderId: orderId
      });
      setTableStatus("ordering");
      setOrder([]);
      toast.success("Order placed successfully!");
    } catch (e) {
      console.error("Error placing order: ", e);
      toast.error("Could not place order. Please try again.");
    }
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="bottom-center" />
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800">{selectedRestaurant?.name || "Restaurant Menu"}</h1>
            {selectedRestaurant?.description && (<p className="text-sm text-gray-600">{selectedRestaurant.description}</p>)}
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24"> {/* Added padding-bottom */}
        <div className="bg-white rounded-lg p-4 shadow-sm border mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search menu items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" /> Filters {activeFilters.length > 0 && (<span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{activeFilters.length}</span>)}
            </button>
            {activeFilters.length > 0 && (<button onClick={() => setActiveFilters([])} className="text-sm text-gray-600 hover:text-gray-800">Clear all</button>)}
          </div>
          {showFilters && (
            <div className="grid grid-cols-2 gap-2">
              {availableFilters.map(filter => (
                <button key={filter} onClick={() => toggleFilter(filter)} className={`px-3 py-2 text-sm rounded-lg border transition-colors ${activeFilters.includes(filter) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>{filter}</button>
              ))}
            </div>
          )}
        </div>
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Menu className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium mb-2">No menu items found</p>
            <p className="text-sm">The menu is currently empty. Please check back later.</p>
          </div>
        ) : (
          categories.map(category => {
            const categoryItems = filteredItems.filter(item => (item.category || "Uncategorized") === category);
            if (categoryItems.length === 0) return null;
            return (
              <div key={category} className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 px-4">{category}</h2>
                <div className="space-y-4">
                  {categoryItems.map(item => (
                    <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 border">
                       <div className="flex gap-4">
                        {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-lg object-cover cursor-pointer flex-shrink-0" onClick={() => setViewingImage(item.imageUrl)}/>}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3>
                            <div className="text-xl font-bold text-gray-800">₹{item.price}</div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {item.isVeg ? <span className="text-green-600 text-sm">🟢</span> : <span className="text-red-600 text-sm">🔴</span>}
                            {item.popular && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">⭐ Popular</span>}
                            {item.chefSpecial && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">👨‍🍳 Chef's Special</span>}
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                          <div className="mt-3">
                            <button onClick={() => addToOrder(item)} disabled={tableStatus === 'ordering'} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                              Add to Order
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
        <div className="text-center py-8 border-t mt-8">
          <p className="text-sm text-gray-500">Powered by <span className="font-semibold">DineX</span> - Quintex Digital Solutions</p>
        </div>
      </div>

      {/* --- FLOATING CART AND STATUS SECTION --- */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-50/70 backdrop-blur-sm border-t">
        {tableStatus === 'ordering' ? (
          <div className="bg-yellow-100 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-lg text-center">
            <p className="font-bold">Your order is being prepared.</p>
            <p className="text-sm">You can place a new order after this one has been served.</p>
          </div>
        ) : order.length > 0 ? (
          <div className="bg-white p-4 rounded-xl shadow-lg border flex items-center justify-between">
            <div>
              <p className="font-bold text-lg">{order.length} items in your order</p>
              <p className="text-sm text-gray-600">Total: ₹{order.reduce((total, item) => total + item.price, 0)}</p>
            </div>
            <button onClick={placeOrder} className="bg-green-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-700">
              Place Order
            </button>
          </div>
        ) : null}
      </div>

      {viewingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <button onClick={() => setViewingImage(null)} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"><X className="w-8 h-8" /></button>
          <img src={viewingImage} alt="Full size view" className="w-full h-full object-contain rounded-lg"/>
        </div>
      )}
    </div>
  );
};

export default CustomerMenu;