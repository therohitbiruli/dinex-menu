import React from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc, collection, query, where, orderBy, onSnapshot, updateDoc } from "firebase/firestore";
import toast, { Toaster } from 'react-hot-toast';

// Import the new components
import LiveOrders from './LiveOrders';
import ManagementPanel from './ManagementPanel';
import { Menu, Eye, X } from './Icons'; // <-- CORRECT IMPORT

// Helper Components that are only used here
const QRCodeComponent = ({ value, size = 200 }) => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
    return ( <img src={qrCodeUrl} alt="QR Code" width={size} height={size} className="border-2 border-gray-300 rounded" /> );
};
const downloadQRCode = async (fileName, qrCodeUrl) => {
    try {
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
    } catch (error) { console.error('Failed to download QR code:', error); window.open(qrCodeUrl, '_blank'); }
};
const generateCustomerMenuUrl = (tableNumber) => {
    const baseUrl = 'https://therohitbiruli.github.io/dinex-menu';
    if (tableNumber) { return `${baseUrl}/#/menu?table=${tableNumber}`; }
    return `${baseUrl}/#/menu`;
};
const MenuItemForm = ({ item, onSave, onCancel, categories }) => {
    const [formData, setFormData] = React.useState(item || { name: "", category: categories[0] || "", price: "", description: "", imageUrl: "", popular: false, isVeg: true, chefSpecial: false });
    const [imageFile, setImageFile] = React.useState(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const handleImageUpload = async () => {
        if (!imageFile) return formData.imageUrl;
        setIsUploading(true);
        const data = new FormData();
        data.append("file", imageFile);
        data.append("upload_preset", "dinex_uploads");
        try {
            const res = await fetch("https://api.cloudinary.com/v1_1/dlelfhwmi/image/upload", { method: "POST", body: data });
            const file = await res.json();
            setIsUploading(false);
            return file.secure_url;
        } catch (error) {
            setIsUploading(false); toast.error("Image upload failed."); return null;
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price) return;
        const finalImageUrl = await handleImageUpload();
        if (finalImageUrl === null) return;
        onSave({ ...formData, imageUrl: finalImageUrl, price: parseFloat(formData.price) || 0, });
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold">{item?.id ? 'Edit Menu Item' : 'Add Menu Item'}</h3><button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg">{categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}</select></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label><input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={3}/></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label><input type="url" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="https://example.com/image.jpg" /><div className="text-center text-xs text-gray-500 my-2">OR</div><label className="block text-sm font-medium text-gray-700 mb-1">Upload an Image</label><input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />{(formData.imageUrl || imageFile) && ( <div className="mt-2"> <p className="text-xs text-gray-600 mb-1">Preview:</p> <img src={imageFile ? URL.createObjectURL(imageFile) : formData.imageUrl} alt="Preview" className="w-24 h-24 rounded-lg object-cover" /> </div> )}</div>
                        <div className="space-y-2"><div className="flex items-center"><input type="checkbox" id="isVeg" checked={formData.isVeg} onChange={(e) => setFormData({...formData, isVeg: e.target.checked})} className="mr-2" /><label htmlFor="isVeg" className="text-sm font-medium text-gray-700">Vegetarian</label></div><div className="flex items-center"><input type="checkbox" id="popular" checked={formData.popular} onChange={(e) => setFormData({...formData, popular: e.target.checked})} className="mr-2" /><label htmlFor="popular" className="text-sm font-medium text-gray-700">Popular Item</label></div><div className="flex items-center"><input type="checkbox" id="chefSpecial" checked={formData.chefSpecial} onChange={(e) => setFormData({...formData, chefSpecial: e.target.checked})} className="mr-2" /><label htmlFor="chefSpecial" className="text-sm font-medium text-gray-700">Chef's Special</label></div></div>
                        <div className="flex gap-3 pt-4"><button type="submit" disabled={isUploading} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">{isUploading ? 'Uploading...' : (item?.id ? 'Update Item' : 'Add Item')}</button><button type="button" onClick={onCancel} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"> Cancel </button></div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const ScanToSeeMenuApp = () => {
  const [currentView, setCurrentView] = React.useState("landing");
  const [selectedRestaurant, setSelectedRestaurant] = React.useState(null);
    const [menuItems, setMenuItems] = React.useState([]);
    const [editingItem, setEditingItem] = React.useState(null);
    const [editingRestaurant, setEditingRestaurant] = React.useState(false);
    const [viewingImage, setViewingImage] = React.useState(null);
    const [categories, setCategories] = React.useState([]);
    const [newCategoryInput, setNewCategoryInput] = React.useState("");
    const [qrTableNumber, setQrTableNumber] = React.useState("1");
    const [liveOrders, setLiveOrders] = React.useState([]);

    React.useEffect(() => {
        const loadData = async () => {
            const docRef = doc(db, "menus", "the-spice-route");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setMenuItems(data.items || []);
                setCategories(data.categories || ["Appetizers", "Main Courses", "Breads", "Rice", "Desserts"]);
            } else {
                setCategories(["Appetizers", "Main Courses", "Breads", "Rice", "Desserts"]);
            }
        };
        loadData();
        setSelectedRestaurant({ id: "rest_1", name: "The Spice Route", description: "Authentic Indian flavors with a contemporary touch." });
    }, []);

    React.useEffect(() => {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("status", "in", ["new", "accepted"]), orderBy("createdAt", "asc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLiveOrders(orders);
        });
        return () => unsubscribe();
    }, []);

    const addMenuItem = (newItem) => { const item = { ...newItem, id: Date.now() }; setMenuItems(prev => [...prev, item]); setEditingItem(null); };
    const updateMenuItem = (updatedItem) => { setMenuItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item)); setEditingItem(null); };
    const deleteMenuItem = (id) => { setMenuItems(prev => prev.filter(item => item.id !== id)); };
    const updateRestaurant = (updatedRestaurant) => { setSelectedRestaurant(updatedRestaurant); };
    const handleSave = async () => {
        try {
            await setDoc(doc(db, "menus", "the-spice-route"), { items: menuItems, categories: categories });
            toast.success('Menu saved successfully!');
        } catch (e) { console.error("Error saving document: ", e); toast.error('Error saving menu.'); }
    };
    const handleOnDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(categories);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setCategories(items);
    };
    const acceptOrder = async (orderId) => {
        const orderRef = doc(db, "orders", orderId);
        try { await updateDoc(orderRef, { status: "accepted" }); toast.success(`Order ${orderId.slice(-4)} accepted!`); } 
        catch (e) { toast.error("Failed to accept order."); console.error(e); }
    };
    const serveOrder = async (orderId, tableId) => {
        const orderRef = doc(db, "orders", orderId);
        const tableRef = doc(db, "tables", tableId);
        try {
            await updateDoc(orderRef, { status: "served" });
            await updateDoc(tableRef, { status: "available" });
            toast.success(`Order for Table ${tableId} served!`);
        } catch (e) { toast.error("Failed to mark order as served."); console.error(e); }
    };
    const rejectOrder = async (orderId, tableId) => {
        const isConfirmed = window.confirm(`Are you sure you want to reject this order for Table ${tableId}? This action cannot be undone.`);
        if (!isConfirmed) { return; }
        const orderRef = doc(db, "orders", orderId);
        const tableRef = doc(db, "tables", tableId);
        try {
            await updateDoc(orderRef, { status: "rejected" });
            await updateDoc(tableRef, { status: "available" });
            toast.error(`Order for Table ${tableId} rejected.`);
        } catch (e) { toast.error("Failed to reject order."); console.error(e); }
    };

    const renderLandingPage = () => (
        <div className="min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-orange-500 text-white flex items-center justify-center">
            <div className="text-center px-4 py-8">
                <Menu className="w-16 h-16 mx-auto mb-4" />
                <h1 className="text-5xl font-extrabold mb-3 tracking-wide">Welcome to <span className="text-yellow-300">DineX</span></h1>
                <p className="text-lg md:text-xl mb-4 font-light">Powered by <span className="font-semibold text-white">Quintex Digital Solutions</span></p>
                <p className="text-2xl mb-8 font-medium">The Future of Restaurant Menus</p>
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <button onClick={() => setCurrentView("panel")} className="bg-yellow-400 text-purple-900 px-8 py-3 rounded-full font-bold shadow hover:scale-105 transition"> Management Panel </button>
                    <button onClick={() => setCurrentView("menu")} className="bg-transparent border-2 border-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-purple-800 transition"> View Menu </button>
                </div>
            </div>
        </div>
    );
    
    const renderInternalPreview = () => (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button onClick={() => setCurrentView("panel")} className="text-gray-600 hover:text-gray-800">← Back to Panel</button>
                    <div className="text-center flex-1">
                        <h1 className="text-xl font-bold text-gray-800">{selectedRestaurant?.name || "Restaurant Menu"}</h1>
                        {selectedRestaurant?.description && (<p className="text-sm text-gray-600">{selectedRestaurant.description}</p>)}
                    </div>
                    <div style={{ width: 120 }} />
                </div>
            </div>
            <div className="max-w-2xl mx-auto px-4 py-6">
                {categories.map(category => {
                    const categoryItems = menuItems.filter(item => (item.category || "Uncategorized") === category);
                    if (categoryItems.length === 0) return null;
                    return (<div key={category} className="mb-8"><h2 className="text-xl font-bold text-gray-800 mb-4 px-4">{category}</h2><div className="space-y-4">{categoryItems.map(item => (<div key={item.id} className="bg-white rounded-lg shadow-sm p-4 border"><div className="flex gap-4">{item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-lg object-cover cursor-pointer flex-shrink-0" onClick={() => setViewingImage(item.imageUrl)}/>}<div className="flex-1 min-w-0"><div className="flex items-start justify-between mb-2"><h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3><div className="text-xl font-bold text-gray-800">₹{item.price}</div></div><div className="flex flex-wrap items-center gap-2 mb-2">{item.isVeg ? <span className="text-green-600 text-sm">🟢</span> : <span className="text-red-600 text-sm">🔴</span>}{item.popular && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">⭐ Popular</span>}{item.chefSpecial && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">👨‍🍳 Chef's Special</span>}</div><p className="text-gray-600 text-sm leading-relaxed">{item.description}</p></div></div></div>))}</div></div>);
                })}
            </div>
        </div>
    );

    const renderContent = () => {
        const panelProps = {
            setCurrentView, liveOrders, handleSave, selectedRestaurant, setSelectedRestaurant, editingRestaurant, setEditingRestaurant,
            updateRestaurant, newCategoryInput, setNewCategoryInput, categories, setCategories, menuItems,
            setMenuItems, handleOnDragEnd, setEditingItem, viewingImage, setViewingImage, deleteMenuItem,
            qrTableNumber, setQrTableNumber, isReadyForQR: (selectedRestaurant?.name?.trim() && categories.length > 0 && menuItems.length > 0), 
            customerMenuUrl: generateCustomerMenuUrl(qrTableNumber), QRCodeComponent, downloadQRCode
        };
        switch (currentView) {
            case 'landing': return renderLandingPage();
            case 'panel': return <ManagementPanel {...panelProps} />;
            case 'orders': return <LiveOrders liveOrders={liveOrders} setCurrentView={setCurrentView} acceptOrder={acceptOrder} rejectOrder={rejectOrder} serveOrder={serveOrder} />;
            case 'menu': return renderInternalPreview();
            default: return renderLandingPage();
        }
    };

    return (
        <div>
            <Toaster position="bottom-center" />
            {editingItem && <MenuItemForm item={editingItem} onSave={editingItem.id ? updateMenuItem : addMenuItem} onCancel={() => setEditingItem(null)} categories={categories} />}
            {viewingImage && (<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"><div className="relative max-w-4xl max-h-[90vh] w-full"><button onClick={() => setViewingImage(null)} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"><X className="w-8 h-8" /></button><img src={viewingImage} alt="Full size view" className="w-full h-full object-contain rounded-lg"/></div></div>)}
            {renderContent()}
        </div>
    );
};

export default ScanToSeeMenuApp;