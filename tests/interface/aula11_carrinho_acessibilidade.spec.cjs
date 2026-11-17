
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test('Aula 11 - acessibilidade do carrinho e entrega', async ({ page }) => {
  await page.goto('/#catalogo');

  const adicionar = page.getByTestId('add-to-cart').first();
  await expect(adicionar).toBeVisible();
  await adicionar.click();

  await page.goto('/#carrinho');

  await expect(page.locator('#view-cart')).toBeVisible();
  await expect(page.locator('#checkout-box')).toBeVisible();

  const resultados = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  console.log('\n=== ACESSIBILIDADE DO CARRINHO ===');
  console.log('Violações encontradas:', resultados.violations.length);

  for (const violacao of resultados.violations) {
    console.log('Problema:', violacao.id);
    console.log('Impacto:', violacao.impact);
    console.log('Descrição:', violacao.help);
    console.log('Elementos afetados:', violacao.nodes.length);
  }

  expect(resultados.violations).toEqual([]);
});
