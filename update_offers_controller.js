const fs = require('fs');
let code = fs.readFileSync('mobile/store_owner_app/lib/features/offers_ads/controllers/offers_controller.dart', 'utf8');

code = code.replace(
    "final response = await _apiClient.get('/offers/coupons/my-coupons');",
    "final response = await _apiClient.get('/coupons/store');"
);

code = code.replace(
    "final response = await _apiClient.post('/offers/coupons', data: data);",
    "final response = await _apiClient.post('/coupons/store', data: data);"
);

code = code.replace(
    "final response = await _apiClient.put('/offers/coupons/$id', data: data);",
    "final response = await _apiClient.put('/coupons/store/$id', data: data);"
);

code = code.replace(
    "final response = await _apiClient.delete('/offers/coupons/$id');",
    "final response = await _apiClient.delete('/coupons/store/$id');"
);

fs.writeFileSync('mobile/store_owner_app/lib/features/offers_ads/controllers/offers_controller.dart', code);
console.log('Updated offers_controller.dart');
