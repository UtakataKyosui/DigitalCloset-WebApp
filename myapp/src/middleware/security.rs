use axum::{
    extract::Request,
    http::HeaderValue,
    middleware::Next,
    response::Response,
};

// セキュリティヘッダーを追加するミドルウェア
pub async fn add_security_headers(request: Request, next: Next) -> Response {
    let mut response = next.run(request).await;
    let headers = response.headers_mut();
    
    // Content Security Policy
    headers.insert(
        "Content-Security-Policy",
        HeaderValue::from_static(
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' http://localhost:3000"
        )
    );
    
    // X-Frame-Options
    headers.insert(
        "X-Frame-Options",
        HeaderValue::from_static("DENY")
    );
    
    // X-Content-Type-Options
    headers.insert(
        "X-Content-Type-Options",
        HeaderValue::from_static("nosniff")
    );
    
    // X-XSS-Protection
    headers.insert(
        "X-XSS-Protection",
        HeaderValue::from_static("1; mode=block")
    );
    
    // Referrer-Policy
    headers.insert(
        "Referrer-Policy",
        HeaderValue::from_static("strict-origin-when-cross-origin")
    );
    
    // Permissions-Policy
    headers.insert(
        "Permissions-Policy",
        HeaderValue::from_static("camera=(), microphone=(), geolocation=()")
    );
    
    // Strict-Transport-Security (本番環境でのみ有効にすべき)
    // headers.insert(
    //     "Strict-Transport-Security",
    //     HeaderValue::from_static("max-age=31536000; includeSubDomains")
    // );
    
    // カスタムセキュリティヘッダー
    headers.insert(
        "X-API-Version",
        HeaderValue::from_static("v1.0")
    );
    
    headers.insert(
        "X-Content-Type-Options",
        HeaderValue::from_static("nosniff")
    );
    
    response
}

// APIキーバリデーションミドルウェア（オプション）
pub async fn validate_api_key(request: Request, next: Next) -> Result<Response, axum::http::StatusCode> {
    // 開発環境では簡単なAPIキーチェック（本番環境ではより厳格に）
    let api_key = request.headers().get("X-API-Key")
        .and_then(|value| value.to_str().ok());
    
    // X-Requested-Withヘッダーもチェック (CSRF攻撃防止)
    let requested_with = request.headers().get("X-Requested-With")
        .and_then(|value| value.to_str().ok());
    
    if api_key != Some("dev-api-key-12345") {
        return Err(axum::http::StatusCode::UNAUTHORIZED);
    }
    
    if requested_with != Some("XMLHttpRequest") {
        return Err(axum::http::StatusCode::BAD_REQUEST);
    }
    
    Ok(next.run(request).await)
}

// リクエストレート制限（簡易版）
use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use std::time::{Duration, Instant};

#[derive(Clone)]
pub struct RateLimiter {
    requests: Arc<Mutex<HashMap<String, Vec<Instant>>>>,
    max_requests: usize,
    window: Duration,
}

impl RateLimiter {
    pub fn new(max_requests: usize, window: Duration) -> Self {
        Self {
            requests: Arc::new(Mutex::new(HashMap::new())),
            max_requests,
            window,
        }
    }
    
    pub async fn check_rate_limit(&self, request: Request, next: Next) -> Result<Response, axum::http::StatusCode> {
        let client_ip = request
            .headers()
            .get("x-forwarded-for")
            .and_then(|hv| hv.to_str().ok())
            .unwrap_or("unknown")
            .to_string();
        
        let now = Instant::now();
        
        // スコープ内でMutexGuardを使用してawaitより前にdropする
        let should_allow = {
            let mut requests = self.requests.lock().unwrap();
            let client_requests = requests.entry(client_ip).or_insert_with(Vec::new);
            
            // 古いリクエストを削除
            client_requests.retain(|&time| now.duration_since(time) < self.window);
            
            if client_requests.len() >= self.max_requests {
                false
            } else {
                client_requests.push(now);
                true
            }
        }; // ここでMutexGuardがdropされる
        
        if !should_allow {
            return Err(axum::http::StatusCode::TOO_MANY_REQUESTS);
        }
        
        Ok(next.run(request).await)
    }
}