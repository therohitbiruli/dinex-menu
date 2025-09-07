import React from 'react';

const LiveOrders = ({ liveOrders, setCurrentView, acceptOrder, rejectOrder, serveOrder }) => {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Live Orders ({liveOrders.length})</h1>
                    <button onClick={() => setCurrentView("panel")} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
                        ← Back to Menu Management
                    </button>
                </div>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {liveOrders.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center mt-8">Waiting for new orders...</p>
                ) : (
                    liveOrders.map(order => (
                        <div key={order.id} className={`bg-white rounded-lg shadow-md p-4 flex flex-col ${order.status === 'new' ? 'border-t-4 border-red-500' : 'border-t-4 border-yellow-500'}`}>
                            <div className="flex-grow">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-lg">Table {order.tableId}</h3>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'new' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">
                                    Ordered at: {order.createdAt?.toDate().toLocaleTimeString()}
                                </p>
                                <ul className="list-disc list-inside text-sm space-y-1 mb-4">
                                    {order.items.map((item, index) => (
                                        <li key={index}>{item.name} - ₹{item.price}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-auto pt-4 border-t space-y-2">
                                {order.status === 'new' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => acceptOrder(order.id)} className="flex-1 bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600">Accept</button>
                                        <button onClick={() => rejectOrder(order.id, order.tableId)} className="flex-1 bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600">Reject</button>
                                    </div>
                                )}
                                {order.status === 'accepted' && (
                                    <button onClick={() => serveOrder(order.id, order.tableId)} className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600">Mark as Served</button>
                                )}
                                {order.status === 'accepted' && (
                                    <button onClick={() => rejectOrder(order.id, order.tableId)} className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700">Cancel Order</button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LiveOrders;