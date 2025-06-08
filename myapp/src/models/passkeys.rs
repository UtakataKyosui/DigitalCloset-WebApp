use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use webauthn_rs_proto::{CredentialID, PublicKeyCredential};
use webauthn_rs::prelude::*;
use base64urlsafedata::Base64UrlSafeData;
use loco_rs::prelude::*;

pub use super::_entities::passkeys::{ActiveModel, Model, Entity, Column};
pub type Passkeys = Entity;

#[async_trait::async_trait]
impl ActiveModelBehavior for ActiveModel {
    async fn before_save<C>(self, _db: &C, insert: bool) -> std::result::Result<Self, DbErr>
    where
        C: ConnectionTrait,
    {
        if !insert && self.updated_at.is_unchanged() {
            let mut this = self;
            this.updated_at = sea_orm::ActiveValue::Set(chrono::Utc::now().into());
            Ok(this)
        } else {
            Ok(self)
        }
    }
}

// implement your read-oriented logic here
impl Model {
    /// Find all passkeys for a user by their PID
    pub async fn find_by_user_pid(db: &DatabaseConnection, user_pid: &Uuid) -> ModelResult<Vec<Model>> {
        let passkeys = Passkeys::find()
            .filter(Column::UserId.eq(*user_pid))
            .all(db)
            .await?;
        Ok(passkeys)
    }

    /// Find a passkey by its credential ID
    pub async fn find_by_credential_id(db: &DatabaseConnection, credential_id: &str) -> ModelResult<Option<Model>> {
        let passkey = Passkeys::find()
            .filter(Column::CredentialId.eq(credential_id))
            .one(db)
            .await?;
        Ok(passkey)
    }

    /// Create a new passkey from WebAuthn registration
    pub async fn create_from_registration(
        db: &DatabaseConnection,
        user_pid: &Uuid,
        credential: &RegisteredPublicKeyCredential,
        device_name: Option<String>,
    ) -> ModelResult<Model> {
        let active_model = ActiveModel {
            user_id: sea_orm::Set(*user_pid),
            credential_id: sea_orm::Set(credential.credential.cred_id.to_string()),
            public_key: sea_orm::Set(serde_json::to_string(&credential.credential.cred)?),
            backup_eligible: sea_orm::Set(credential.credential.backup_eligible),
            backup_state: sea_orm::Set(credential.credential.backup_state),
            sign_count: sea_orm::Set(credential.credential.counter as i64),
            device_type: sea_orm::Set(credential.credential.attachment.map_or("Unknown".to_string(), |a| format!("{:?}", a))),
            user_verified: sea_orm::Set(credential.credential.user_verified),
            name: sea_orm::Set(device_name),
            created_at: sea_orm::Set(chrono::Utc::now().into()),
            updated_at: sea_orm::Set(chrono::Utc::now().into()),
            ..Default::default()
        };

        let passkey = active_model.insert(db).await?;
        Ok(passkey)
    }

    /// Update sign count after successful authentication
    pub async fn update_sign_count(
        &self,
        db: &DatabaseConnection,
        new_count: u32,
    ) -> ModelResult<Model> {
        let mut active_model: ActiveModel = self.clone().into();
        active_model.sign_count = sea_orm::Set(new_count as i64);
        active_model.updated_at = sea_orm::Set(chrono::Utc::now().into());
        
        let updated = active_model.update(db).await?;
        Ok(updated)
    }

    /// Convert to WebAuthn format for authentication
    pub fn to_webauthn_credential(&self) -> ModelResult<Passkey> {
        let cred_data: serde_json::Value = serde_json::from_str(&self.public_key)?;
        
        let passkey = Passkey {
            cred_id: CredentialID::try_from(self.credential_id.as_str())
                .map_err(|e| ModelError::Any(format!("Invalid credential ID: {}", e).into()))?,
            cred: serde_json::from_value(cred_data)
                .map_err(|e| ModelError::Any(format!("Invalid credential data: {}", e).into()))?,
            counter: self.sign_count as u32,
            verified: self.user_verified,
        };
        
        Ok(passkey)
    }

    /// Delete a passkey
    pub async fn delete_by_id(db: &DatabaseConnection, passkey_id: i32) -> ModelResult<()> {
        Passkeys::delete_by_id(passkey_id).exec(db).await?;
        Ok(())
    }

    /// Delete all passkeys for a user
    pub async fn delete_by_user_pid(db: &DatabaseConnection, user_pid: &Uuid) -> ModelResult<()> {
        Passkeys::delete_many()
            .filter(Column::UserId.eq(*user_pid))
            .exec(db)
            .await?;
        Ok(())
    }
}

// implement your write-oriented logic here
impl ActiveModel {}

// implement your custom finders, selectors oriented logic here
impl Entity {}

/// Response format for passkey information
#[derive(Debug, Serialize, Deserialize)]
pub struct PasskeyInfo {
    pub id: i32,
    pub name: Option<String>,
    pub device_type: String,
    pub created_at: DateTime<Utc>,
    pub last_used: Option<DateTime<Utc>>,
    pub backup_eligible: bool,
}

impl From<Model> for PasskeyInfo {
    fn from(passkey: Model) -> Self {
        Self {
            id: passkey.id,
            name: passkey.name,
            device_type: passkey.device_type,
            created_at: passkey.created_at.and_utc(),
            last_used: Some(passkey.updated_at.and_utc()),
            backup_eligible: passkey.backup_eligible,
        }
    }
}
