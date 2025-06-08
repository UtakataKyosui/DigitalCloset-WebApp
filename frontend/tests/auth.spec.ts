import { test, expect } from '@playwright/test';

// テストユーザーデータ
const TEST_USER = {
  name: 'テストユーザー',
  email: 'test@example.com',
  password: '12341234',
};

// テスト用のユニークなメールアドレス生成
const generateUniqueEmail = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `test-${timestamp}-${random}@example.com`;
};

test.describe('認証機能のE2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    // 各テスト前にローカルストレージをクリア
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test.describe('新規登録機能', () => {
    test('有効な情報での新規登録が成功する', async ({ page }) => {
      const uniqueEmail = generateUniqueEmail();
      
      // 認証ページに移動
      await page.goto('/auth');
      
      // 新規登録フォームに切り替え
      await page.getByRole('button', { name: '新規登録' }).click();
      
      // 新規登録フォームが表示されていることを確認
      await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible();
      
      // フォーム入力
      await page.getByLabel('お名前').fill(TEST_USER.name);
      await page.getByLabel('メールアドレス').fill(uniqueEmail);
      await page.getByLabel('パスワード', { exact: true }).fill(TEST_USER.password);
      await page.getByLabel('パスワード確認').fill(TEST_USER.password);
      
      // ローディング状態とAPI通信の監視
      const responsePromise = page.waitForResponse(
        response => response.url().includes('/api/auth/register') && response.status() === 200
      );
      
      // フォーム送信
      await page.getByRole('button', { name: 'アカウント作成' }).click();
      
      // API レスポンスの確認
      const response = await responsePromise;
      expect(response.status()).toBe(200);
      
      // レスポンスの内容確認
      const responseData = await response.json();
      expect(responseData).toHaveProperty('token');
      expect(responseData).toHaveProperty('user');
      expect(responseData.user.email).toBe(uniqueEmail);
      expect(responseData.user.name).toBe(TEST_USER.name);
      
      // ローカルストレージに認証情報が保存されていることを確認
      const storedToken = await page.evaluate(() => localStorage.getItem('auth_token'));
      const storedUserPid = await page.evaluate(() => localStorage.getItem('user_pid'));
      const storedUserName = await page.evaluate(() => localStorage.getItem('user_name'));
      
      expect(storedToken).toBeTruthy();
      expect(storedUserPid).toBe(responseData.user.pid);
      expect(storedUserName).toBe(TEST_USER.name);
    });

    test('無効な情報での新規登録が失敗する', async ({ page }) => {
      await page.goto('/auth');
      
      // 新規登録フォームに切り替え
      await page.getByRole('button', { name: '新規登録' }).click();
      
      // 空のフォーム送信
      await page.getByRole('button', { name: 'アカウント作成' }).click();
      
      // バリデーションエラーが表示されることを確認
      await expect(page.getByText('名前を入力してください')).toBeVisible();
      await expect(page.getByText('メールアドレスを入力してください')).toBeVisible();
      await expect(page.getByText('パスワードを入力してください')).toBeVisible();
    });

    test('パスワード不一致エラーが表示される', async ({ page }) => {
      await page.goto('/auth');
      
      // 新規登録フォームに切り替え
      await page.getByRole('button', { name: '新規登録' }).click();
      
      await page.getByLabel('お名前').fill(TEST_USER.name);
      await page.getByLabel('メールアドレス').fill(generateUniqueEmail());
      await page.getByLabel('パスワード', { exact: true }).fill(TEST_USER.password);
      await page.getByLabel('パスワード確認').fill('different_password');
      
      await page.getByRole('button', { name: 'アカウント作成' }).click();
      
      // パスワード不一致エラーが表示されることを確認
      await expect(page.getByText('パスワードが一致しません')).toBeVisible();
    });

    test('重複メールアドレスでの登録が失敗する', async ({ page }) => {
      const duplicateEmail = generateUniqueEmail();
      
      // 1回目の登録
      await page.goto('/auth');
      
      // 新規登録フォームに切り替え
      await page.getByRole('button', { name: '新規登録' }).click();
      
      await page.getByLabel('お名前').fill(TEST_USER.name);
      await page.getByLabel('メールアドレス').fill(duplicateEmail);
      await page.getByLabel('パスワード', { exact: true }).fill(TEST_USER.password);
      await page.getByLabel('パスワード確認').fill(TEST_USER.password);
      
      await page.getByRole('button', { name: 'アカウント作成' }).click();
      
      // 成功を待つ
      await page.waitForResponse(
        response => response.url().includes('/api/auth/register') && response.status() === 200
      );
      
      // ページをリロードして同じメールで再度登録試行
      await page.reload();
      
      // 新規登録フォームに切り替え
      await page.getByRole('button', { name: '新規登録' }).click();
      
      await page.getByLabel('お名前').fill('別のユーザー');
      await page.getByLabel('メールアドレス').fill(duplicateEmail);
      await page.getByLabel('パスワード', { exact: true }).fill(TEST_USER.password);
      await page.getByLabel('パスワード確認').fill(TEST_USER.password);
      
      // エラーレスポンスの監視
      const errorResponsePromise = page.waitForResponse(
        response => response.url().includes('/api/auth/register') && !response.ok()
      );
      
      await page.getByRole('button', { name: 'アカウント作成' }).click();
      
      // API エラーレスポンスの確認
      const errorResponse = await errorResponsePromise;
      expect(errorResponse.status()).toBe(409); // Conflict
      
      // エラーメッセージが表示されることを確認
      await expect(page.getByText(/メールアドレスは既に使用されています/)).toBeVisible();
    });
  });

  test.describe('ログイン機能', () => {
    let registeredEmail: string;

    test.beforeEach(async ({ page }) => {
      // テスト用ユーザーを事前に登録
      registeredEmail = generateUniqueEmail();
      
      await page.goto('/auth');
      
      // 新規登録フォームに切り替え
      await page.getByRole('button', { name: '新規登録' }).click();
      
      await page.getByLabel('お名前').fill(TEST_USER.name);
      await page.getByLabel('メールアドレス').fill(registeredEmail);
      await page.getByLabel('パスワード', { exact: true }).fill(TEST_USER.password);
      await page.getByLabel('パスワード確認').fill(TEST_USER.password);
      
      await page.getByRole('button', { name: 'アカウント作成' }).click();
      
      // 登録完了を待つ
      await page.waitForResponse(
        response => response.url().includes('/api/auth/register') && response.status() === 200
      );
      
      // ローカルストレージをクリアしてログアウト状態にする
      await page.evaluate(() => localStorage.clear());
    });

    test('有効な認証情報でのログインが成功する', async ({ page }) => {
      await page.goto('/auth');
      
      // ログインフォームに切り替え
      await page.getByRole('button', { name: 'ログイン' }).click();
      
      // ログインフォームが表示されていることを確認
      await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
      
      // フォーム入力
      await page.getByLabel('メールアドレス').fill(registeredEmail);
      await page.getByLabel('パスワード').fill(TEST_USER.password);
      
      // API レスポンスの監視
      const responsePromise = page.waitForResponse(
        response => response.url().includes('/api/auth/login') && response.status() === 200
      );
      
      // フォーム送信
      await page.getByRole('button', { name: 'ログイン' }).click();
      
      // API レスポンスの確認
      const response = await responsePromise;
      expect(response.status()).toBe(200);
      
      // レスポンスの内容確認
      const responseData = await response.json();
      expect(responseData).toHaveProperty('token');
      expect(responseData).toHaveProperty('pid');
      expect(responseData).toHaveProperty('name');
      expect(responseData.name).toBe(TEST_USER.name);
      
      // ローカルストレージに認証情報が保存されていることを確認
      const storedToken = await page.evaluate(() => localStorage.getItem('auth_token'));
      const storedUserPid = await page.evaluate(() => localStorage.getItem('user_pid'));
      const storedUserName = await page.evaluate(() => localStorage.getItem('user_name'));
      
      expect(storedToken).toBeTruthy();
      expect(storedUserPid).toBe(responseData.pid);
      expect(storedUserName).toBe(TEST_USER.name);
    });

    test('無効なパスワードでのログインが失敗する', async ({ page }) => {
      await page.goto('/auth');
      
      // ログインフォームに切り替え
      await page.getByRole('button', { name: 'ログイン' }).click();
      
      // 無効なパスワードでログイン試行
      await page.getByLabel('メールアドレス').fill(registeredEmail);
      await page.getByLabel('パスワード').fill('invalid_password');
      
      // エラーレスポンスの監視
      const errorResponsePromise = page.waitForResponse(
        response => response.url().includes('/api/auth/login') && !response.ok()
      );
      
      await page.getByRole('button', { name: 'ログイン' }).click();
      
      // API エラーレスポンスの確認
      const errorResponse = await errorResponsePromise;
      expect(errorResponse.status()).toBe(401); // Unauthorized
      
      // エラーメッセージが表示されることを確認
      await expect(page.getByText(/ログインに失敗しました/)).toBeVisible();
      
      // ローカルストレージに認証情報が保存されていないことを確認
      const storedToken = await page.evaluate(() => localStorage.getItem('auth_token'));
      expect(storedToken).toBeNull();
    });

    test('存在しないメールアドレスでのログインが失敗する', async ({ page }) => {
      await page.goto('/auth');
      
      // ログインフォームに切り替え
      await page.getByRole('button', { name: 'ログイン' }).click();
      
      // 存在しないメールアドレスでログイン試行
      await page.getByLabel('メールアドレス').fill('nonexistent@example.com');
      await page.getByLabel('パスワード').fill(TEST_USER.password);
      
      // エラーレスポンスの監視
      const errorResponsePromise = page.waitForResponse(
        response => response.url().includes('/api/auth/login') && !response.ok()
      );
      
      await page.getByRole('button', { name: 'ログイン' }).click();
      
      // API エラーレスポンスの確認
      const errorResponse = await errorResponsePromise;
      expect(errorResponse.status()).toBe(401); // Unauthorized
      
      // エラーメッセージが表示されることを確認
      await expect(page.getByText(/ログインに失敗しました/)).toBeVisible();
    });

    test('空フォームでのログインバリデーション', async ({ page }) => {
      await page.goto('/auth');
      
      // ログインフォームに切り替え
      await page.getByRole('button', { name: 'ログイン' }).click();
      
      // 空のフォーム送信
      await page.getByRole('button', { name: 'ログイン' }).click();
      
      // バリデーションエラーが表示されることを確認
      await expect(page.getByText('メールアドレスを入力してください')).toBeVisible();
      await expect(page.getByText('パスワードを入力してください')).toBeVisible();
    });
  });

  test.describe('認証状態の持続性', () => {
    test('ページリロード後も認証状態が維持される', async ({ page }) => {
      const uniqueEmail = generateUniqueEmail();
      
      // 新規登録
      await page.goto('/auth');
      
      // 新規登録フォームに切り替え
      await page.getByRole('button', { name: '新規登録' }).click();
      
      await page.getByLabel('お名前').fill(TEST_USER.name);
      await page.getByLabel('メールアドレス').fill(uniqueEmail);
      await page.getByLabel('パスワード', { exact: true }).fill(TEST_USER.password);
      await page.getByLabel('パスワード確認').fill(TEST_USER.password);
      
      await page.getByRole('button', { name: 'アカウント作成' }).click();
      
      // 登録完了を待つ
      await page.waitForResponse(
        response => response.url().includes('/api/auth/register') && response.status() === 200
      );
      
      // 認証情報がローカルストレージに保存されていることを確認
      const storedTokenBefore = await page.evaluate(() => localStorage.getItem('auth_token'));
      expect(storedTokenBefore).toBeTruthy();
      
      // ページリロード
      await page.reload();
      
      // リロード後も認証情報が維持されていることを確認
      const storedTokenAfter = await page.evaluate(() => localStorage.getItem('auth_token'));
      const storedUserName = await page.evaluate(() => localStorage.getItem('user_name'));
      
      expect(storedTokenAfter).toBe(storedTokenBefore);
      expect(storedUserName).toBe(TEST_USER.name);
    });
  });

  test.describe('フォーム切り替え', () => {
    test('ログインフォームから新規登録フォームへの切り替え', async ({ page }) => {
      await page.goto('/auth');
      
      // ログインフォームに切り替え
      await page.getByRole('button', { name: 'ログイン' }).click();
      await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
      
      // 新規登録フォームに切り替え
      await page.getByRole('button', { name: '新規登録' }).click();
      await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible();
    });

    test('新規登録フォームからログインフォームへの切り替え', async ({ page }) => {
      await page.goto('/auth');
      
      // デフォルトで新規登録フォームが表示されている
      await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible();
      
      // ログインフォームに切り替え
      await page.getByRole('button', { name: 'ログイン' }).click();
      await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
    });
  });
});