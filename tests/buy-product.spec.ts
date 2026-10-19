import { test, expect } from '../fixtures/pages.fixture';
import { defaultAddress } from '../data/user.factory';
import { products } from '../data/products';
import { AUTH_FILE } from '../playwright.config';

test.use({ storageState: AUTH_FILE });

test.describe('TC-03 Buy a product', () => {
  test('add to cart, cart shows the right item and quantity, checkout completes', async ({
    catalogPage,
    productPage,
    cartPage,
    checkoutPage,
  }) => {
    const quantity = 2;

    await catalogPage.openFirstInStockProduct({ excluding: [products.thorHammer.name] });
    const product = await productPage.snapshot();
    await productPage.addToCart(quantity);

    await expect(productPage.addedToCartToast).toBeVisible();
    await expect(productPage.cartQuantity).toHaveText(String(quantity));

    await cartPage.open();
    const line = cartPage.line(product.name);
    await expect(cartPage.lines).toHaveCount(1);
    await expect(line.title).toHaveText(product.name);
    await expect(line.quantity).toHaveValue(String(quantity));
    await expect(line.unitPrice).toHaveText(`$${product.price.toFixed(2)}`);
    await expect(line.linePrice).toHaveText(`$${(product.price * quantity).toFixed(2)}`);
    await expect(cartPage.total).toHaveText(`$${(product.price * quantity).toFixed(2)}`);

    await cartPage.proceedToCheckout();
    await checkoutPage.continueAsSignedInUser();

    // The billing step is pre-filled from the signed-in customer's profile.
    await expect(checkoutPage.billingField('country')).toHaveValue(defaultAddress.countryCode);
    await expect(checkoutPage.billingField('postal_code')).toHaveValue(defaultAddress.postalCode);
    await expect(checkoutPage.billingField('city')).toHaveValue(defaultAddress.city);
    await expect(checkoutPage.billingField('house_number')).toHaveValue(defaultAddress.houseNumber);
    await checkoutPage.continueWithBillingAddress();

    await checkoutPage.pay('cash-on-delivery');
    await expect(checkoutPage.paymentSuccess).toHaveText('Payment was successful');

    await checkoutPage.confirmOrder();
    await expect(checkoutPage.orderConfirmation).toBeVisible();
    await expect(checkoutPage.cartQuantity).toBeHidden();
  });

  test('changing the quantity in the cart recalculates the line and the total', async ({
    catalogPage,
    productPage,
    cartPage,
  }) => {
    await catalogPage.openFirstInStockProduct({ excluding: [products.thorHammer.name] });
    const product = await productPage.snapshot();
    await productPage.addToCart(1);
    await expect(productPage.cartQuantity).toHaveText('1');

    await cartPage.open();
    await cartPage.changeQuantity(product.name, 3);

    const line = cartPage.line(product.name);
    await expect(line.linePrice).toHaveText(`$${(product.price * 3).toFixed(2)}`);
    await expect(cartPage.total).toHaveText(`$${(product.price * 3).toFixed(2)}`);
    await expect(cartPage.cartQuantity).toHaveText('3');
  });

  test('the Thor Hammer is limited to one per customer', async ({ catalogPage, productPage, cartPage }) => {
    await catalogPage.openProduct(products.thorHammer.name);
    const product = await productPage.snapshot();
    await productPage.addToCart(1);
    await expect(productPage.cartQuantity).toHaveText('1');

    await cartPage.open();
    await cartPage.changeQuantity(product.name, 3);

    // The API refuses the update, so the cart badge and the cart total must not move.
    await expect(cartPage.cartQuantity).toHaveText('1');
    await expect(cartPage.total).toHaveText(`$${product.price.toFixed(2)}`);
  });
});
