
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test('Aula 11 - acessibilidade da Loja Aurora', async ({ page }) => {
  await page.goto('/');

  const resultados = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  console.log('\n=== ACESSIBILIDADE - AULA 11 ===');
  console.log('Violações encontradas:', resultados.violations.length);

  for (const violacao of resultados.violations) {
    console.log('\nProblema:', violacao.id);
    console.log('Impacto:', violacao.impact);
    console.log('Descrição:', violacao.help);
    console.log('Elementos afetados:', violacao.nodes.length);
  }

  expect(resultados.violations).toEqual([]);
});
