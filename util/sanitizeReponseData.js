const sanitizeResponseData = (station) => {
    const connections = station.Connections.map((connection) => ({
        type: connection.ConnectionType.Title,
        quantity: connection.Quantity ? connection.Quantity : "Unknown",
        speed: connection.Level ? connection.Level.Title : "No data available",
    }));
    let supportNumber = null;
    let supportEmail = null;
    if (station.OperatorInfo) {
        const { PhonePrimaryContact, ContactEmail } = station.OperatorInfo;
        if (PhonePrimaryContact) supportNumber = PhonePrimaryContact;
        if (ContactEmail) supportEmail = ContactEmail;
    }

    return {
        externalId: station.ID,
        lastUpdated: station.DataProvider.DateLastImported,
        name: station.AddressInfo.Title,
        address: station.AddressInfo.AddressLine1,
        cityStateZip: `${station.AddressInfo.Town}, ${station.AddressInfo.StateOrProvince} ${station.AddressInfo.Postcode}`,
        latitude: station.AddressInfo.Latitude,
        longitude: station.AddressInfo.Longitude,
        plugTypes: connections,
        supportNumber: supportNumber,
        supportEmail: supportEmail,
        operatingHours: station.AddressInfo.AccessComments
            ? station.AddressInfo.AccessComments
            : null,
        amenities: {
            lastUpdated: null,
            entertainment: [],
            restaurants: [],
            stores: [],
        },
    };
};

module.exports = sanitizeResponseData;
