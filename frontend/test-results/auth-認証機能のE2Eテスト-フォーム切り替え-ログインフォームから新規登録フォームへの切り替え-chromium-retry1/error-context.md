# Test info

- Name: 認証機能のE2Eテスト >> フォーム切り替え >> ログインフォームから新規登録フォームへの切り替え
- Location: /workspaces/frontend/tests/auth.spec.ts:332:9

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: getByRole('heading', { name: 'ログイン' })
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for getByRole('heading', { name: 'ログイン' })

    at /workspaces/frontend/tests/auth.spec.ts:337:65
```

# Page snapshot

```yaml
- navigation:
  - link "デジタルクローゼット":
    - /url: /
  - navigation:
    - link "アイテム追加":
      - /url: /forms
    - link "洋服":
      - /url: /clothes
    - link "コーディネート":
      - /url: /coordinates
  - navigation:
    - link "ログイン":
      - /url: /auth
- main:
  - heading "デジタルクローゼット" [level=1]
  - paragraph: ログイン
  - text: ログイン メールアドレスとパスワードを入力してください メールアドレス
  - textbox "メールアドレス"
  - paragraph: Required
  - text: パスワード
  - textbox "パスワード"
  - paragraph: Required
  - button "ログイン"
  - button "パスワードをお忘れですか？"
  - text: アカウントをお持ちでない方は
  - button "新規登録"
  - paragraph: 安全な認証システム powered by Loco.rs
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
  237 |       );
  238 |       
  239 |       await page.getByRole('button', { name: 'ログイン' }).click();
  240 |       
  241 |       // API エラーレスポンスの確認
  242 |       const errorResponse = await errorResponsePromise;
  243 |       expect(errorResponse.status()).toBe(401); // Unauthorized
  244 |       
  245 |       // エラーメッセージが表示されることを確認
  246 |       await expect(page.getByText(/ログインに失敗しました/)).toBeVisible();
  247 |       
  248 |       // ローカルストレージに認証情報が保存されていないことを確認
  249 |       const storedToken = await page.evaluate(() => localStorage.getItem('auth_token'));
  250 |       expect(storedToken).toBeNull();
  251 |     });
  252 |
  253 |     test('存在しないメールアドレスでのログインが失敗する', async ({ page }) => {
  254 |       await page.goto('/auth');
  255 |       
  256 |       // ログインフォームに切り替え
  257 |       await page.getByRole('button', { name: 'ログイン' }).click();
  258 |       
  259 |       // 存在しないメールアドレスでログイン試行
  260 |       await page.getByLabel('メールアドレス').fill('nonexistent@example.com');
  261 |       await page.getByLabel('パスワード').fill(TEST_USER.password);
  262 |       
  263 |       // エラーレスポンスの監視
  264 |       const errorResponsePromise = page.waitForResponse(
  265 |         response => response.url().includes('/api/auth/login') && !response.ok()
  266 |       );
  267 |       
  268 |       await page.getByRole('button', { name: 'ログイン' }).click();
  269 |       
  270 |       // API エラーレスポンスの確認
  271 |       const errorResponse = await errorResponsePromise;
  272 |       expect(errorResponse.status()).toBe(401); // Unauthorized
  273 |       
  274 |       // エラーメッセージが表示されることを確認
  275 |       await expect(page.getByText(/ログインに失敗しました/)).toBeVisible();
  276 |     });
  277 |
  278 |     test('空フォームでのログインバリデーション', async ({ page }) => {
  279 |       await page.goto('/auth');
  280 |       
  281 |       // ログインフォームに切り替え
  282 |       await page.getByRole('button', { name: 'ログイン' }).click();
  283 |       
  284 |       // 空のフォーム送信
  285 |       await page.getByRole('button', { name: 'ログイン' }).click();
  286 |       
  287 |       // バリデーションエラーが表示されることを確認
  288 |       await expect(page.getByText('メールアドレスを入力してください')).toBeVisible();
  289 |       await expect(page.getByText('パスワードを入力してください')).toBeVisible();
  290 |     });
  291 |   });
  292 |
  293 |   test.describe('認証状態の持続性', () => {
  294 |     test('ページリロード後も認証状態が維持される', async ({ page }) => {
  295 |       const uniqueEmail = generateUniqueEmail();
  296 |       
  297 |       // 新規登録
  298 |       await page.goto('/auth');
  299 |       
  300 |       // 新規登録フォームに切り替え
  301 |       await page.getByRole('button', { name: '新規登録' }).click();
  302 |       
  303 |       await page.getByLabel('お名前').fill(TEST_USER.name);
  304 |       await page.getByLabel('メールアドレス').fill(uniqueEmail);
  305 |       await page.getByLabel('パスワード', { exact: true }).fill(TEST_USER.password);
  306 |       await page.getByLabel('パスワード確認').fill(TEST_USER.password);
  307 |       
  308 |       await page.getByRole('button', { name: 'アカウント作成' }).click();
  309 |       
  310 |       // 登録完了を待つ
  311 |       await page.waitForResponse(
  312 |         response => response.url().includes('/api/auth/register') && response.status() === 200
  313 |       );
  314 |       
  315 |       // 認証情報がローカルストレージに保存されていることを確認
  316 |       const storedTokenBefore = await page.evaluate(() => localStorage.getItem('auth_token'));
  317 |       expect(storedTokenBefore).toBeTruthy();
  318 |       
  319 |       // ページリロード
  320 |       await page.reload();
  321 |       
  322 |       // リロード後も認証情報が維持されていることを確認
  323 |       const storedTokenAfter = await page.evaluate(() => localStorage.getItem('auth_token'));
  324 |       const storedUserName = await page.evaluate(() => localStorage.getItem('user_name'));
  325 |       
  326 |       expect(storedTokenAfter).toBe(storedTokenBefore);
  327 |       expect(storedUserName).toBe(TEST_USER.name);
  328 |     });
  329 |   });
  330 |
  331 |   test.describe('フォーム切り替え', () => {
  332 |     test('ログインフォームから新規登録フォームへの切り替え', async ({ page }) => {
  333 |       await page.goto('/auth');
  334 |       
  335 |       // ログインフォームに切り替え
  336 |       await page.getByRole('button', { name: 'ログイン' }).click();
> 337 |       await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
      |                                                                 ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  338 |       
  339 |       // 新規登録フォームに切り替え
  340 |       await page.getByRole('button', { name: '新規登録' }).click();
  341 |       await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible();
  342 |     });
  343 |
  344 |     test('新規登録フォームからログインフォームへの切り替え', async ({ page }) => {
  345 |       await page.goto('/auth');
  346 |       
  347 |       // デフォルトで新規登録フォームが表示されている
  348 |       await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible();
  349 |       
  350 |       // ログインフォームに切り替え
  351 |       await page.getByRole('button', { name: 'ログイン' }).click();
  352 |       await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
  353 |     });
  354 |   });
  355 | });
```