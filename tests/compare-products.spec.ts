import { test, expect } from '../fixtures/pages.fixture';
import { products } from '../data/products';

test.describe('TC-04 Compare two products', () => {
  test('Thor Hammer is cheaper than Bolt Cutters, and the comparison table shows the captured names and prices', async ({
    catalogPage,
    productPage,
    comparisonPage,
  }) => {
    await catalogPage.openProduct(products.thorHammer.name);
    const first = await productPage.snapshot();
    await productPage.addToComparison();

    await catalogPage.openProduct(products.boltCutters.name);
    const second = await productPage.snapshot();
    await productPage.addToComparison();

    expect(first.name).toBe(products.thorHammer.name);
    expect(second.name).toBe(products.boltCutters.name);
    expect(first.price).toBeLessThan(second.price);

    await comparisonPage.open();
    await expect(comparisonPage.title).toHaveText('Product Comparison');
    await expect(comparisonPage.productNames).toHaveText([first.name, second.name]);
    await expect(comparisonPage.prices).toHaveText([`$${first.price.toFixed(2)}`, `$${second.price.toFixed(2)}`]);
  });

  test('removing a product from the comparison leaves only the other one', async ({
    catalogPage,
    productPage,
    comparisonPage,
  }) => {
    await catalogPage.openProduct(products.thorHammer.name);
    await productPage.addToComparison();
    await catalogPage.openProduct(products.combinationPliers.name);
    await productPage.addToComparison();

    await comparisonPage.open();
    await expect(comparisonPage.productNames).toHaveCount(2);

    await comparisonPage.removeFirst();
    await expect(comparisonPage.productNames).toHaveText([products.combinationPliers.name]);
    await expect(comparisonPage.prices).toHaveCount(1);
  });
});
