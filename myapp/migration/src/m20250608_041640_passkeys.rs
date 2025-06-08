use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[derive(Iden)]
enum Passkeys {
    Table,
    Id,
    UserId,
    CredentialId,
    PublicKey,
    BackupEligible,
    BackupState,
    SignCount,
    DeviceType,
    UserVerified,
    Name,
}

#[derive(Iden)]
enum Users {
    Table,
    Pid,
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        create_table(
            m,
            "passkeys",
            &[
                // Primary key
                ("id", ColType::PkAuto),
                // User reference
                ("user_id", ColType::Uuid),
                // WebAuthn credential ID (unique identifier for the passkey)
                ("credential_id", ColType::TextUniq),
                // Public key for verification (stored as base64)
                ("public_key", ColType::Text),
                // Backup state (clone eligibility)
                ("backup_eligible", ColType::Boolean),
                ("backup_state", ColType::Boolean),
                // Counter for replay attack prevention
                ("sign_count", ColType::BigUnsigned),
                // Device type and flags
                ("device_type", ColType::String),
                ("user_verified", ColType::Boolean),
                // Friendly name for the passkey
                ("name", ColType::StringNull),
            ],
            &[],
        )
        .await?;
        
        // Add foreign key constraint
        m.create_foreign_key(
            ForeignKey::create()
                .name("fk_passkeys_user_id")
                .from(Passkeys::Table, Passkeys::UserId)
                .to(Users::Table, Users::Pid)
                .on_delete(ForeignKeyAction::Cascade)
                .on_update(ForeignKeyAction::Cascade)
                .to_owned(),
        )
        .await?;
        
        // Add indexes
        m.create_index(
            Index::create()
                .name("idx_passkeys_user_id")
                .table(Passkeys::Table)
                .col(Passkeys::UserId)
                .to_owned(),
        )
        .await?;
        
        m.create_index(
            Index::create()
                .name("idx_passkeys_credential_id")
                .table(Passkeys::Table)
                .col(Passkeys::CredentialId)
                .to_owned(),
        )
        .await?;
        
        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "passkeys").await?;
        Ok(())
    }
}
