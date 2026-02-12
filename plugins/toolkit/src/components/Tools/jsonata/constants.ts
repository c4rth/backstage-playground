export const sampleInput = JSON.stringify(
  {
    account: {
      accountName: 'Firefly',
      order: [
        { orderID: 'order103', product: [{ productName: 'Bowler Hat', productID: 858383, sku: '0406654608', description: { colour: 'Purple', width: 300, height: 200, depth: 210, weight: 0.75 }, price: 34.45, quantity: 2 }, { productName: 'Trilby hat', productID: 858236, sku: '0406634348', description: { colour: 'Orange', width: 300, height: 200, depth: 210, weight: 0.6 }, price: 21.67, quantity: 1 }] },
        { orderID: 'order104', product: [{ productName: 'Bowler Hat', productID: 858383, sku: '040657863', description: { colour: 'Purple', width: 300, height: 200, depth: 210, weight: 0.75 }, price: 34.45, quantity: 4 }, { productID: 345664, sku: '0406654603', productName: 'Cloak', description: { colour: 'Black', width: 30, height: 20, depth: 210, weight: 2 }, price: 107.99, quantity: 1 }] },
      ],
    },
  },
  null,
  2,
);

export const sampleExpression = 'account.order.product.price';
