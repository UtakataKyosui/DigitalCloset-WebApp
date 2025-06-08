# Test info

- Name: 認証機能のE2Eテスト >> ログイン機能 >> 有効な認証情報でのログインが成功する
- Location: /workspaces/frontend/tests/auth.spec.ts:182:9

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: getByRole('heading', { name: 'ログイン' })
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for getByRole('heading', { name: 'ログイン' })

    at /workspaces/frontend/tests/auth.spec.ts:189:65
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
   89 |     test('パスワード不一致エラーが表示される', async ({ page }) => {
   90 |       await page.goto('/auth');
   91 |       
   92 |       // 新規登録フォームに切り替え
   93 |       await page.getByRole('button', { name: '新規登録' }).click();
   94 |       
   95 |       await page.getByLabel('お名前').fill(TEST_USER.name);
   96 |       await page.getByLabel('メールアドレス').fill(generateUniqueEmail());
   97 |       await page.getByLabel('パスワード', { exact: true }).fill(TEST_USER.password);
   98 |       await page.getByLabel('パスワード確認').fill('different_password');
   99 |       
  100 |       await page.getByRole('button', { name: 'アカウント作成' }).click();
  101 |       
  102 |       // パスワード不一致エラーが表示されることを確認
  103 |       await expect(page.getByText('パスワードが一致しません')).toBeVisible();
  104 |     });
  105 |
  106 |     test('重複メールアドレスでの登録が失敗する', async ({ page }) => {
  107 |       const duplicateEmail = generateUniqueEmail();
  108 |       
  109 |       // 1回目の登録
  110 |       await page.goto('/auth');
  111 |       
  112 |       // 新規登録フォームに切り替え
  113 |       await page.getByRole('button', { name: '新規登録' }).click();
  114 |       
  115 |       await page.getByLabel('お名前').fill(TEST_USER.name);
  116 |       await page.getByLabel('メールアドレス').fill(duplicateEmail);
  117 |       await page.getByLabel('パスワード', { exact: true }).fill(TEST_USER.password);
  118 |       await page.getByLabel('パスワード確認').fill(TEST_USER.password);
  119 |       
  120 |       await page.getByRole('button', { name: 'アカウント作成' }).click();
  121 |       
  122 |       // 成功を待つ
  123 |       await page.waitForResponse(
  124 |         response => response.url().includes('/api/auth/register') && response.status() === 200
  125 |       );
  126 |       
  127 |       // ページをリロードして同じメールで再度登録試行
  128 |       await page.reload();
  129 |       
  130 |       // 新規登録フォームに切り替え
  131 |       await page.getByRole('button', { name: '新規登録' }).click();
  132 |       
  133 |       await page.getByLabel('お名前').fill('別のユーザー');
  134 |       await page.getByLabel('メールアドレス').fill(duplicateEmail);
  135 |       await page.getByLabel('パスワード', { exact: true }).fill(TEST_USER.password);
  136 |       await page.getByLabel('パスワード確認').fill(TEST_USER.password);
  137 |       
  138 |       // エラーレスポンスの監視
  139 |       const errorResponsePromise = page.waitForResponse(
  140 |         response => response.url().includes('/api/auth/register') && !response.ok()
  141 |       );
  142 |       
  143 |       await page.getByRole('button', { name: 'アカウント作成' }).click();
  144 |       
  145 |       // API エラーレスポンスの確認
  146 |       const errorResponse = await errorResponsePromise;
  147 |       expect(errorResponse.status()).toBe(409); // Conflict
  148 |       
  149 |       // エラーメッセージが表示されることを確認
  150 |       await expect(page.getByText(/メールアドレスは既に使用されています/)).toBeVisible();
  151 |     });
  152 |   });
  153 |
  154 |   test.describe('ログイン機能', () => {
  155 |     let registeredEmail: string;
  156 |
  157 |     test.beforeEach(async ({ page }) => {
  158 |       // テスト用ユーザーを事前に登録
  159 |       registeredEmail = generateUniqueEmail();
  160 |       
  161 |       await page.goto('/auth');
  162 |       
  163 |       // 新規登録フォームに切り替え
  164 |       await page.getByRole('button', { name: '新規登録' }).click();
  165 |       
  166 |       await page.getByLabel('お名前').fill(TEST_USER.name);
  167 |       await page.getByLabel('メールアドレス').fill(registeredEmail);
  168 |       await page.getByLabel('パスワード', { exact: true }).fill(TEST_USER.password);
  169 |       await page.getByLabel('パスワード確認').fill(TEST_USER.password);
  170 |       
  171 |       await page.getByRole('button', { name: 'アカウント作成' }).click();
  172 |       
  173 |       // 登録完了を待つ
  174 |       await page.waitForResponse(
  175 |         response => response.url().includes('/api/auth/register') && response.status() === 200
  176 |       );
  177 |       
  178 |       // ローカルストレージをクリアしてログアウト状態にする
  179 |       await page.evaluate(() => localStorage.clear());
  180 |     });
  181 |
  182 |     test('有効な認証情報でのログインが成功する', async ({ page }) => {
  183 |       await page.goto('/auth');
  184 |       
  185 |       // ログインフォームに切り替え
  186 |       await page.getByRole('button', { name: 'ログイン' }).click();
  187 |       
  188 |       // ログインフォームが表示されていることを確認
> 189 |       await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
      |                                                                 ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  190 |       
  191 |       // フォーム入力
  192 |       await page.getByLabel('メールアドレス').fill(registeredEmail);
  193 |       await page.getByLabel('パスワード').fill(TEST_USER.password);
  194 |       
  195 |       // API レスポンスの監視
  196 |       const responsePromise = page.waitForResponse(
  197 |         response => response.url().includes('/api/auth/login') && response.status() === 200
  198 |       );
  199 |       
  200 |       // フォーム送信
  201 |       await page.getByRole('button', { name: 'ログイン' }).click();
  202 |       
  203 |       // API レスポンスの確認
  204 |       const response = await responsePromise;
  205 |       expect(response.status()).toBe(200);
  206 |       
  207 |       // レスポンスの内容確認
  208 |       const responseData = await response.json();
  209 |       expect(responseData).toHaveProperty('token');
  210 |       expect(responseData).toHaveProperty('pid');
  211 |       expect(responseData).toHaveProperty('name');
  212 |       expect(responseData.name).toBe(TEST_USER.name);
  213 |       
  214 |       // ローカルストレージに認証情報が保存されていることを確認
  215 |       const storedToken = await page.evaluate(() => localStorage.getItem('auth_token'));
  216 |       const storedUserPid = await page.evaluate(() => localStorage.getItem('user_pid'));
  217 |       const storedUserName = await page.evaluate(() => localStorage.getItem('user_name'));
  218 |       
  219 |       expect(storedToken).toBeTruthy();
  220 |       expect(storedUserPid).toBe(responseData.pid);
  221 |       expect(storedUserName).toBe(TEST_USER.name);
  222 |     });
  223 |
  224 |     test('無効なパスワードでのログインが失敗する', async ({ page }) => {
  225 |       await page.goto('/auth');
  226 |       
  227 |       // ログインフォームに切り替え
  228 |       await page.getByRole('button', { name: 'ログイン' }).click();
  229 |       
  230 |       // 無効なパスワードでログイン試行
  231 |       await page.getByLabel('メールアドレス').fill(registeredEmail);
  232 |       await page.getByLabel('パスワード').fill('invalid_password');
  233 |       
  234 |       // エラーレスポンスの監視
  235 |       const errorResponsePromise = page.waitForResponse(
  236 |         response => response.url().includes('/api/auth/login') && !response.ok()
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
```