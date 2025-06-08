use crate::{
    mailers::auth::AuthMailer,
    models::{
        _entities::users,
        users::{LoginParams, RegisterParams},
    },
    views::auth::{CurrentResponse, LoginResponse},
};
use axum::debug_handler;
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct ForgotParams {
    pub email: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ResetParams {
    pub token: String,
    pub password: String,
}


/// Register function creates a new user with the given parameters and sends a
/// welcome email to the user
#[debug_handler]
async fn register(
    State(ctx): State<AppContext>,
    Json(params): Json<RegisterParams>,
) -> Result<Response> {
    tracing::info!(
        email = %params.email,
        name = %params.name,
        "Registration attempt"
    );

    let res = users::Model::create_with_password(&ctx.db, &params).await;

    let user = match res {
        Ok(user) => {
            tracing::info!(
                email = %params.email,
                user_pid = %user.pid,
                "User created successfully"
            );
            user
        }
        Err(err) => {
            tracing::error!(
                error = %err,
                email = %params.email,
                "Failed to create user"
            );
            return format::json(());
        }
    };

    match AuthMailer::send_welcome(&ctx, &user).await {
        Ok(_) => {
            tracing::info!(
                email = %params.email,
                user_pid = %user.pid,
                "Welcome email sent successfully"
            );
        }
        Err(err) => {
            tracing::warn!(
                error = %err,
                email = %params.email,
                user_pid = %user.pid,
                "Failed to send welcome email, but registration successful"
            );
        }
    }

    tracing::info!(
        email = %params.email,
        user_pid = %user.pid,
        "Registration completed successfully"
    );

    format::json(())
}


/// In case the user forgot his password  this endpoints generate a forgot token
/// and send email to the user. In case the email not found in our DB, we are
/// returning a valid request for for security reasons (not exposing users DB
/// list).
#[debug_handler]
async fn forgot(
    State(ctx): State<AppContext>,
    Json(params): Json<ForgotParams>,
) -> Result<Response> {
    let Ok(user) = users::Model::find_by_email(&ctx.db, &params.email).await else {
        // we don't want to expose our users email. if the email is invalid we still
        // returning success to the caller
        return format::json(());
    };

    let user = user
        .into_active_model()
        .set_forgot_password_sent(&ctx.db)
        .await?;

    AuthMailer::forgot_password(&ctx, &user).await?;

    format::json(())
}

/// reset user password by the given parameters
#[debug_handler]
async fn reset(State(ctx): State<AppContext>, Json(params): Json<ResetParams>) -> Result<Response> {
    let Ok(user) = users::Model::find_by_reset_token(&ctx.db, &params.token).await else {
        // we don't want to expose our users email. if the email is invalid we still
        // returning success to the caller
        tracing::info!("reset token not found");

        return format::json(());
    };
    user.into_active_model()
        .reset_password(&ctx.db, &params.password)
        .await?;

    format::json(())
}

/// Creates a user login and returns a token
#[debug_handler]
async fn login(State(ctx): State<AppContext>, Json(params): Json<LoginParams>) -> Result<Response> {
    tracing::info!(
        email = %params.email,
        "Login attempt"
    );

    let user = match users::Model::find_by_email(&ctx.db, &params.email).await {
        Ok(user) => {
            tracing::info!(
                email = %params.email,
                user_pid = %user.pid,
                "User found for login"
            );
            user
        }
        Err(err) => {
            tracing::error!(
                email = %params.email,
                error = %err,
                "User not found for login"
            );
            return unauthorized("User not found");
        }
    };

    let valid = user.verify_password(&params.password);
    tracing::info!(
        email = %params.email,
        user_pid = %user.pid,
        password_valid = valid,
        "Password verification result"
    );

    if !valid {
        tracing::warn!(
            email = %params.email,
            user_pid = %user.pid,
            "Invalid password for login"
        );
        return unauthorized("Invalid password");
    }

    let jwt_secret = match ctx.config.get_jwt_config() {
        Ok(config) => {
            tracing::info!("JWT config retrieved successfully");
            config
        }
        Err(err) => {
            tracing::error!(
                error = %err,
                "Failed to get JWT config"
            );
            return Err(Error::InternalServerError);
        }
    };

    let token = match user.generate_jwt(&jwt_secret.secret, jwt_secret.expiration) {
        Ok(token) => {
            tracing::info!(
                email = %params.email,
                user_pid = %user.pid,
                "JWT token generated successfully"
            );
            token
        }
        Err(err) => {
            tracing::error!(
                email = %params.email,
                user_pid = %user.pid,
                error = %err,
                "Failed to generate JWT token"
            );
            return unauthorized("Token generation failed");
        }
    };

    tracing::info!(
        email = %params.email,
        user_pid = %user.pid,
        "Login successful"
    );

    format::json(LoginResponse::new(&user, &token))
}

#[debug_handler]
async fn current(auth: auth::JWT, State(ctx): State<AppContext>) -> Result<Response> {
    let user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
    format::json(CurrentResponse::new(&user))
}


pub fn routes() -> Routes {
    Routes::new()
        .prefix("/api/auth")
        .add("/register", post(register))
        .add("/login", post(login))
        .add("/forgot", post(forgot))
        .add("/reset", post(reset))
        .add("/current", get(current))
}
