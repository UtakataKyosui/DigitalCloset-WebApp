use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc, Duration};
use uuid::Uuid;
use webauthn_rs::prelude::*;
use loco_rs::prelude::*;

pub use super::_entities::webauthn_sessions::{ActiveModel, Model, Entity, Column};
pub type WebauthnSessions = Entity;

// Session types
pub enum SessionType {
    Registration,
    Authentication,
}

impl SessionType {
    pub fn as_str(&self) -> &'static str {
        match self {
            SessionType::Registration => "registration",
            SessionType::Authentication => "authentication",
        }
    }
}

#[async_trait::async_trait]
impl ActiveModelBehavior for ActiveModel {
    async fn before_save<C>(self, _db: &C, insert: bool) -> std::result::Result<Self, DbErr>
    where
        C: ConnectionTrait,
    {
        // WebAuthn sessions don't need updated_at since they're short-lived
        Ok(self)
    }
}

// implement your read-oriented logic here
impl Model {
    /// Create a new WebAuthn session
    pub async fn create_session(
        db: &DatabaseConnection,
        session_id: String,
        session_type: SessionType,
        user_id: Option<Uuid>,
        challenge_data: String,
        expires_in_minutes: i64,
    ) -> ModelResult<Model> {
        let expires_at = chrono::Utc::now() + Duration::minutes(expires_in_minutes);
        
        let active_model = ActiveModel {
            session_id: sea_orm::Set(session_id),
            session_type: sea_orm::Set(session_type.as_str().to_string()),
            user_id: sea_orm::Set(user_id),
            challenge: sea_orm::Set(challenge_data),
            expires_at: sea_orm::Set(expires_at.into()),
            ..Default::default()
        };

        let session = active_model.insert(db).await?;
        Ok(session)
    }

    /// Find a session by session ID
    pub async fn find_by_session_id(db: &DatabaseConnection, session_id: &str) -> ModelResult<Option<Model>> {
        let session = WebauthnSessions::find()
            .filter(Column::SessionId.eq(session_id))
            .filter(Column::ExpiresAt.gt(chrono::Utc::now()))
            .one(db)
            .await?;
        Ok(session)
    }

    /// Check if session is valid and not expired
    pub fn is_valid(&self) -> bool {
        self.expires_at.and_utc() > chrono::Utc::now()
    }

    /// Get the challenge data as JSON
    pub fn get_challenge_data<T>(&self) -> ModelResult<T> 
    where
        T: for<'de> Deserialize<'de>,
    {
        let data: T = serde_json::from_str(&self.challenge)?;
        Ok(data)
    }

    /// Delete expired sessions (cleanup task)
    pub async fn cleanup_expired(db: &DatabaseConnection) -> ModelResult<u64> {
        let result = WebauthnSessions::delete_many()
            .filter(Column::ExpiresAt.lt(chrono::Utc::now()))
            .exec(db)
            .await?;
        Ok(result.rows_affected)
    }

    /// Delete a session by ID
    pub async fn delete_by_session_id(db: &DatabaseConnection, session_id: &str) -> ModelResult<()> {
        WebauthnSessions::delete_many()
            .filter(Column::SessionId.eq(session_id))
            .exec(db)
            .await?;
        Ok(())
    }

    /// Delete all sessions for a user
    pub async fn delete_by_user_id(db: &DatabaseConnection, user_id: &Uuid) -> ModelResult<()> {
        WebauthnSessions::delete_many()
            .filter(Column::UserId.eq(*user_id))
            .exec(db)
            .await?;
        Ok(())
    }
}

// implement your write-oriented logic here
impl ActiveModel {}

// implement your custom finders, selectors oriented logic here
impl Entity {}
