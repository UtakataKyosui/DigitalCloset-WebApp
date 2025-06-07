use async_trait::async_trait;
use loco_rs::{app::AppContext, app::Initializer, Result};
use axum::middleware;
use crate::middleware::security::{add_security_headers, RateLimiter};
use std::time::Duration;

pub struct SecurityInitializer;

#[async_trait]
impl Initializer for SecurityInitializer {
    fn name(&self) -> String {
        "security".to_string()
    }

    async fn after_routes(
        &self,
        router: axum::Router,
        _ctx: &AppContext,
    ) -> Result<axum::Router> {
        // レート制限の設定（1分間に100リクエスト）
        let rate_limiter = RateLimiter::new(100, Duration::from_secs(60));
        
        let secured_router = router
            .layer(middleware::from_fn(add_security_headers))
            .layer(middleware::from_fn(move |req, next| {
                let rate_limiter = rate_limiter.clone();
                async move { rate_limiter.check_rate_limit(req, next).await }
            }));

        Ok(secured_router)
    }
}