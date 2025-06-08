use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[derive(Iden)]
enum WebauthnSessions {
    Table,
    Id,
    SessionId,
    SessionType,
    UserId,
    Challenge,
    ExpiresAt,
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.create_table(
            Table::create()
                .table(WebauthnSessions::Table)
                .if_not_exists()
                // Primary key
                .col(
                    ColumnDef::new(WebauthnSessions::Id)
                        .integer()
                        .not_null()
                        .auto_increment()
                        .primary_key(),
                )
                // Session ID (unique identifier)
                .col(
                    ColumnDef::new(WebauthnSessions::SessionId)
                        .string()
                        .not_null()
                        .unique_key(),
                )
                // Session type: 'registration' or 'authentication'
                .col(
                    ColumnDef::new(WebauthnSessions::SessionType)
                        .string()
                        .not_null(),
                )
                // User ID (nullable for registration flows)
                .col(
                    ColumnDef::new(WebauthnSessions::UserId)
                        .uuid()
                        .null(),
                )
                // Challenge data (serialized JSON)
                .col(
                    ColumnDef::new(WebauthnSessions::Challenge)
                        .text()
                        .not_null(),
                )
                // Expiration time
                .col(
                    ColumnDef::new(WebauthnSessions::ExpiresAt)
                        .timestamp_with_time_zone()
                        .not_null(),
                )
                .to_owned(),
        )
        .await?;
        
        // Add index for session lookup
        m.create_index(
            Index::create()
                .name("idx_webauthn_sessions_session_id")
                .table(WebauthnSessions::Table)
                .col(WebauthnSessions::SessionId)
                .to_owned(),
        )
        .await?;
        
        // Add index for expiration cleanup
        m.create_index(
            Index::create()
                .name("idx_webauthn_sessions_expires_at")
                .table(WebauthnSessions::Table)
                .col(WebauthnSessions::ExpiresAt)
                .to_owned(),
        )
        .await?;
        
        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.drop_table(Table::drop().table(WebauthnSessions::Table).to_owned())
            .await?;
        Ok(())
    }
}

