
const { test, expect } = require("@playwright/test");

test("sistema: cliente faz login e adiciona produtos ao carrinho", async ({ page }) => {
  await page.goto("/#entrar");

  await page.getByTestId("login-email").fill("cliente-a@loja.test");
  await page.getByTestId("login-password").fill("SenhaDidatica123!");

  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/#catalogo/);

  const adicionar = page.locator('[data-testid="add-to-cart"][data-product-id="produto-teste"]');

  await adicionar.click();
  await adicionar.click();

  await page.getByTestId("nav-cart").click();

  await expect(page.getByRole("heading", { name: "Carrinho" })).toBeVisible();

  await expect(page.getByText("Subtotal R$ 300,00", { exact: true })).toBeVisible();});

test("sistema: cliente finaliza compra e consulta pedido", async ({ page }) => {await page.goto("/#entrar");

  await page.getByTestId("login-email").fill("cliente-a@loja.test");
  await page.getByTestId("login-password").fill("SenhaDidatica123!");

  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/#catalogo/);

  const adicionar = page.locator('[data-testid="add-to-cart"][data-product-id="produto-0003"]');

  await adicionar.click();

  await page.getByTestId("nav-cart").click();
  await page.getByTestId("addr-street").fill("Rua Teste");
  await page.getByTestId("addr-number").fill("10");
  await page.getByTestId("addr-district").fill("Centro");
  await page.getByTestId("addr-city").fill("Maricá");
  await page.getByTestId("addr-state").fill("RJ");
  await page.getByTestId("addr-zip").fill("24900000");

  const respostaPedido = page.waitForResponse(
    response =>
      response.url().includes("/api/checkout") &&
      response.request().method() === "POST"
  );

  await page.getByTestId("checkout-button").click();

  const resposta = await respostaPedido;

  expect(resposta.status()).toBe(201);

  const dados = await resposta.json();

  expect(dados.order.id).toBeTruthy();

  const numeroPedido = dados.order.id;

  await page.getByRole("link", { name: "Pedidos" }).click();

  
await expect(page).toHaveURL(/#pedidos/);

await expect(page.getByRole("heading", {name: numeroPedido, exact: true})).toBeVisible();

await page.reload();

await expect(page.getByRole("heading", {name: numeroPedido, exact: true})).toBeVisible();});
