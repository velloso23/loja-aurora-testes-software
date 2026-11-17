
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test('Aula 11 - acessibilidade do login', async ({ page }) => {
  await page.goto('/#entrar');

  await expect(page.locator('#login-form')).toBeVisible();

  const resultados = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  console.log('\n=== ACESSIBILIDADE DO LOGIN ===');
  console.log('Violações encontradas:', resultados.violations.length);

  for (const violacao of resultados.violations) {
    console.log('Problema:', violacao.id);
    console.log('Impacto:', violacao.impact);
    console.log('Elementos afetados:', violacao.nodes.length);
  }

  expect(resultados.violations).toEqual([]);
});
