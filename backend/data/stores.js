const stores = [
    {
        name: 'Main Store',
        address: '123 Main St, City, State 12345',
        phone: '+1 (555) 123-4567',
        email: 'main@storetrack.com',
        sections: [
            {
                id: '1',
                name: 'Electronics',
                racks: [
                    {
                        id: '1',
                        name: 'Rack A',
                        shelves: [
                            {
                                id: '1',
                                name: 'Shelf 1',
                                bins: ['Bin 1', 'Bin 2', 'Bin 3'],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        name: 'Warehouse',
        address: '456 Warehouse Ave, City, State 67890',
        phone: '+1 (555) 987-6543',
        email: 'warehouse@storetrack.com',
        sections: [],
    },
];

module.exports = stores;
