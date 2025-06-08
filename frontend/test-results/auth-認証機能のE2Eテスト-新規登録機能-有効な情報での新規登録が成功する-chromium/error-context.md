# Test info

- Name: 認証機能のE2Eテスト >> 新規登録機能 >> 有効な情報での新規登録が成功する
- Location: /workspaces/frontend/tests/auth.spec.ts:27:9

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: getByRole('heading', { name: '新規登録' })
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for getByRole('heading', { name: '新規登録' })

    at /workspaces/frontend/tests/auth.spec.ts:37:65
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
  - paragraph: アカウント作成
  - text: 新規登録 アカウント情報を入力してください お名前
  - textbox "お名前"
  - text: メールアドレス
  - textbox "メールアドレス"
  - text: パスワード
  - textbox "パスワード"
  - text: パスワード確認
  - textbox "パスワード確認"
  - button "アカウント作成"
  - text: すでにアカウントをお持ちですか？
  - button "ログイン"
  - paragraph: 安全な認証システム powered by Loco.rs
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | // テストユーザーデータ
   4 | const TEST_USER = {
   5 |   name: 'テストユーザー',
   6 |   email: 'test@example.com',
   7 |   password: '12341234',
   8 | };
   9 |
   10 | // テスト用のユニークなメールアドレス生成
   11 | const generateUniqueEmail = () => {
   12 |   const timestamp = Date.now();
   13 |   const random = Math.random().toString(36).substring(7);
   14 |   return `test-${timestamp}-${random}@example.com`;
   15 | };
   16 |
   17 | test.describe('認証機能のE2Eテスト', () => {
   18 |   test.beforeEach(async ({ page }) => {
   19 |     // 各テスト前にローカルストレージをクリア
   20 |     await page.goto('/');
   21 |     await page.evaluate(() => {
   22 |       localStorage.clear();
   23 |     });
   24 |   });
   25 |
   26 |   test.describe('新規登録機能', () => {
   27 |     test('有効な情報での新規登録が成功する', async ({ page }) => {
   28 |       const uniqueEmail = generateUniqueEmail();
   29 |       
   30 |       // 認証ページに移動
   31 |       await page.goto('/auth');
   32 |       
   33 |       // 新規登録フォームに切り替え
   34 |       await page.getByRole('button', { name: '新規登録' }).click();
   35 |       
   36 |       // 新規登録フォームが表示されていることを確認
>  37 |       await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible();
      |                                                                 ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
   38 |       
   39 |       // フォーム入力
   40 |       await page.getByLabel('お名前').fill(TEST_USER.name);
   41 |       await page.getByLabel('メールアドレス').fill(uniqueEmail);
   42 |       await page.getByLabel('パスワード', { exact: true }).fill(TEST_USER.password);
   43 |       await page.getByLabel('パスワード確認').fill(TEST_USER.password);
   44 |       
   45 |       // ローディング状態とAPI通信の監視
   46 |       const responsePromise = page.waitForResponse(
   47 |         response => response.url().includes('/api/auth/register') && response.status() === 200
   48 |       );
   49 |       
   50 |       // フォーム送信
   51 |       await page.getByRole('button', { name: 'アカウント作成' }).click();
   52 |       
   53 |       // API レスポンスの確認
   54 |       const response = await responsePromise;
   55 |       expect(response.status()).toBe(200);
   56 |       
   57 |       // レスポンスの内容確認
   58 |       const responseData = await response.json();
   59 |       expect(responseData).toHaveProperty('token');
   60 |       expect(responseData).toHaveProperty('user');
   61 |       expect(responseData.user.email).toBe(uniqueEmail);
   62 |       expect(responseData.user.name).toBe(TEST_USER.name);
   63 |       
   64 |       // ローカルストレージに認証情報が保存されていることを確認
   65 |       const storedToken = await page.evaluate(() => localStorage.getItem('auth_token'));
   66 |       const storedUserPid = await page.evaluate(() => localStorage.getItem('user_pid'));
   67 |       const storedUserName = await page.evaluate(() => localStorage.getItem('user_name'));
   68 |       
   69 |       expect(storedToken).toBeTruthy();
   70 |       expect(storedUserPid).toBe(responseData.user.pid);
   71 |       expect(storedUserName).toBe(TEST_USER.name);
   72 |     });
   73 |
   74 |     test('無効な情報での新規登録が失敗する', async ({ page }) => {
   75 |       await page.goto('/auth');
   76 |       
   77 |       // 新規登録フォームに切り替え
   78 |       await page.getByRole('button', { name: '新規登録' }).click();
   79 |       
   80 |       // 空のフォーム送信
   81 |       await page.getByRole('button', { name: 'アカウント作成' }).click();
   82 |       
   83 |       // バリデーションエラーが表示されることを確認
   84 |       await expect(page.getByText('名前を入力してください')).toBeVisible();
   85 |       await expect(page.getByText('メールアドレスを入力してください')).toBeVisible();
   86 |       await expect(page.getByText('パスワードを入力してください')).toBeVisible();
   87 |     });
   88 |
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
```