
const { test, expect } = require("@playwright/test");

test("CT-S06 - login com senha incorreta deve ser recusado", async ({ page }) => {
  await page.goto("/#entrar");

  await page.getByTestId("login-email").fill("cliente-a@loja.test");
  await page.getByTestId("login-password").fill("SenhaIncorreta123!");

  const respostaLogin = page.waitForResponse(
    response =>
      response.url().includes("/api/auth/login") &&
      response.request().method() === "POST"
  );

  await page.getByRole("button", { name: "Entrar" }).click();

  const resposta = await respostaLogin;

  // O servidor deve recusar as credenciais.
  expect(resposta.status()).toBe(401);

  // A interface deve apresentar uma mensagem de erro.
  await expect(page.getByTestId("login-error")).not.toBeEmpty();

  // O usuário não deve ser redirecionado ao catálogo.
  await expect(page).toHaveURL(/#entrar/);

  // Nenhum token de autenticação deve ter sido armazenado.
  const token = await page.evaluate(() =>
    localStorage.getItem("aurora-token")
  );

  expect(token).toBeNull();
});

test("CT-S03 - cadastro de cliente com dados validos", async ({ page }) => {
  await page.goto("/#cadastro");

  const email = `cliente.p2.${Date.now()}@loja.test`;

  await page.getByTestId("register-name").fill("Cliente Teste P2");
  await page.getByTestId("register-email").fill(email);
  await page.getByTestId("register-password").fill("SenhaTeste123!");

  const respostaCadastro = page.waitForResponse(
    response =>
      response.url().includes("/api/auth/register") &&
      response.request().method() === "POST"
  );

  await page.locator("#register-form button[type='submit']").click();

  const resposta = await respostaCadastro;

  expect([200, 201]).toContain(resposta.status());

  await expect(page).toHaveURL(/#catalogo/);

  const token = await page.evaluate(() =>
    localStorage.getItem("aurora-token")
  );

  expect(token).toBeTruthy();

  await expect(page.getByTestId("register-error")).toBeEmpty();
});


test("CT-S04 - pesquisa e filtro de produtos", async ({ page }) => {
  await page.goto("/#catalogo");

  const cards = page.getByTestId("product-card");
  const visiveis = page.locator('[data-testid="product-card"]:visible');

  // O catálogo deve apresentar produtos.
  await expect(visiveis.first()).toBeVisible();

  // Pesquisa pelo produto conhecido no dataset.
  await page.getByTestId("search").fill("Produto Teste");

  const produto = page.locator(
    '[data-testid="product-card"][data-product-id="produto-teste"]'
  );

  await expect(produto).toBeVisible();

  // Todos os produtos visíveis devem corresponder à pesquisa.
  const quantidade = await visiveis.count();

  expect(quantidade).toBeGreaterThan(0);

  for (let i = 0; i < quantidade; i++) {
    await expect(visiveis.nth(i)).toContainText(/Produto Teste/i);
  }

  // Filtra pela categoria do produto de teste.
  await page.getByTestId("category-filter").selectOption({
    label: "Informática"
  });

  await expect(produto).toBeVisible();

  // Todos os produtos visíveis devem pertencer à categoria escolhida.
  const quantidadeFiltrada = await visiveis.count();

  expect(quantidadeFiltrada).toBeGreaterThan(0);

  for (let i = 0; i < quantidadeFiltrada; i++) {
    await expect(visiveis.nth(i).locator(".category")).toHaveText(
      "Informática"
    );
  }

  // Confirma que o catálogo possui os cartões esperados.
  expect(await cards.count()).toBeGreaterThan(0);
});

test("CT-S05 - alterar quantidade e remover produto do carrinho", async ({ page }) => {
  await page.goto("/#catalogo");

  // Adiciona o produto de teste ao carrinho.
  const adicionar = page.locator(
    '[data-testid="add-to-cart"][data-product-id="produto-teste"]'
  );

  await adicionar.click();

  // Abre o carrinho.
  await page.getByTestId("nav-cart").click();

  const quantidade = page.locator(
    '[data-qty="true"][data-product-id="produto-teste"]'
  );

  // Verifica a quantidade inicial.
  await expect(quantidade).toHaveValue("1");

  // Altera a quantidade para duas unidades.
  await quantidade.fill("2");
  await quantidade.dispatchEvent("change");

  // Verifica a quantidade atualizada.
  await expect(quantidade).toHaveValue("2");

  // Duas unidades de R$ 150,00 = R$ 300,00.
  await expect(page.getByTestId("cart-subtotal")).toHaveText("R$ 300,00");

  // Verifica o contador do carrinho.
  await expect(page.locator("#cart-count")).toHaveText("2");

  // Remove o produto.
  await page.locator('[data-remove="produto-teste"]').click();

  // Confirma que o produto não está mais no carrinho.
  await expect(
    page.locator('[data-qty="true"][data-product-id="produto-teste"]')
  ).toHaveCount(0);

  // Confirma que o contador voltou para zero.
  await expect(page.locator("#cart-count")).toHaveText("0");
});

test("CT-S07 - quantidade acima do estoque deve ser recusada", async ({ page }) => {
  await page.goto("/#catalogo");

  const adicionar = page.locator(
    '[data-testid="add-to-cart"][data-product-id="produto-teste"]'
  );

  await adicionar.click();

  await page.getByTestId("nav-cart").click();

  const quantidade = page.locator(
    '[data-qty="true"][data-product-id="produto-teste"]'
  );

  await expect(quantidade).toHaveValue("1");

  // Solicita 6 unidades, acima do estoque disponível de 5.
  await quantidade.fill("6");
  await quantidade.dispatchEvent("change");

  // Aguarda a resposta da cotação e verifica a rejeição.
  await expect(page.getByTestId("coupon-feedback")).not.toBeEmpty();

  // A finalização não deve ficar disponível.
  await expect(page.getByTestId("checkout-button")).toBeDisabled();
});

test("CT-S08 - checkout com endereco incompleto deve ser recusado", async ({ page }) => {
  await page.goto("/#entrar");

  // Autentica o cliente.
  await page.getByTestId("login-email").fill("cliente-a@loja.test");
  await page.getByTestId("login-password").fill("SenhaDidatica123!");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/#catalogo/);

  // Adiciona um produto ao carrinho.
  await page.locator(
    '[data-testid="add-to-cart"][data-product-id="produto-teste"]'
  ).click();

  await page.getByTestId("nav-cart").click();

  // Preenche o endereço, deixando o número vazio.
  await page.getByTestId("addr-street").fill("Rua Teste");
  await page.getByTestId("addr-number").fill("");
  await page.getByTestId("addr-district").fill("Centro");
  await page.getByTestId("addr-city").fill("Saquarema");
  await page.getByTestId("addr-state").fill("RJ");
  await page.getByTestId("addr-zip").fill("28990000");

  // Aguarda a tentativa de finalização.
  const respostaCheckout = page.waitForResponse(response =>
    response.url().includes("/api/checkout") &&
    response.request().method() === "POST"
  );

  await page.getByTestId("checkout-button").click();

  const resposta = await respostaCheckout;

  // O servidor deve rejeitar o endereço incompleto.
  expect(resposta.status()).toBe(400);

  // A interface deve apresentar a mensagem de erro.
  await expect(page.getByTestId("checkout-feedback")).toContainText(
    "Endereço incompleto"
  );

  // O produto deve permanecer no carrinho.
  await expect(page.locator("#cart-count")).toHaveText("1");

  // Nenhum comprovante de pedido deve ser apresentado.
  await expect(page.locator("#receipt")).toBeEmpty();
});

test("CT-S09 - cupom expirado deve ser recusado", async ({ request }) => {
  const resposta = await request.post("/api/cart/quote", {
    data: {
      items: [
        {
          productId: "produto-teste",
          quantity: 1
        }
      ],
      couponCode: "ANTIGO"
    }
  });

  // Um cupom expirado deve ser recusado.
  expect(resposta.status()).toBe(400);

  const resultado = await resposta.json();

  // Verifica a mensagem retornada pelo servidor.
  expect(resultado.error).toBe("Cupom expirado.");
});

test("CT-S10 - acesso administrativo nao autorizado deve ser bloqueado", async ({ request }) => {
  const rota = "/api/admin/products/produto-teste";

  // 1. Verificar acesso sem autenticação.
  const semAutenticacao = await request.put(rota, {
    data: {}
  });

  expect(semAutenticacao.status()).toBe(401);

  const erroSemLogin = await semAutenticacao.json();
  expect(erroSemLogin.error).toBe("Autenticação necessária.");

  // 2. Autenticar um cliente comum.
  const login = await request.post("/api/auth/login", {
    data: {
      email: "cliente-a@loja.test",
      password: "SenhaDidatica123!"
    }
  });

  expect(login.status()).toBe(200);

  const dadosLogin = await login.json();
  expect(dadosLogin.user.role).toBe("customer");

  // 3. Tentar atualizar um produto como cliente comum.
  const clienteComum = await request.put(rota, {
    headers: {
      Authorization: `Bearer ${dadosLogin.token}`
    },
    data: {}
  });

  expect(clienteComum.status()).toBe(403);

  const erroPermissao = await clienteComum.json();
  expect(erroPermissao.error).toBe(
    "Acesso restrito a administradores."
  );
});
