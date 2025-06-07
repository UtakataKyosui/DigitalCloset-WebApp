use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        // Remove email verification columns
        m.alter_table(
            Table::alter()
                .table(Alias::new("users"))
                .drop_column(Alias::new("email_verification_token"))
                .to_owned(),
        )
        .await?;

        m.alter_table(
            Table::alter()
                .table(Alias::new("users"))
                .drop_column(Alias::new("email_verification_sent_at"))
                .to_owned(),
        )
        .await?;

        m.alter_table(
            Table::alter()
                .table(Alias::new("users"))
                .drop_column(Alias::new("email_verified_at"))
                .to_owned(),
        )
        .await?;

        // Remove magic link columns
        m.alter_table(
            Table::alter()
                .table(Alias::new("users"))
                .drop_column(Alias::new("magic_link_token"))
                .to_owned(),
        )
        .await?;

        m.alter_table(
            Table::alter()
                .table(Alias::new("users"))
                .drop_column(Alias::new("magic_link_expiration"))
                .to_owned(),
        )
        .await?;

        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        // Re-add email verification columns
        m.alter_table(
            Table::alter()
                .table(Alias::new("users"))
                .add_column(ColumnDef::new(Alias::new("email_verification_token")).string())
                .to_owned(),
        )
        .await?;

        m.alter_table(
            Table::alter()
                .table(Alias::new("users"))
                .add_column(ColumnDef::new(Alias::new("email_verification_sent_at")).timestamp_with_time_zone())
                .to_owned(),
        )
        .await?;

        m.alter_table(
            Table::alter()
                .table(Alias::new("users"))
                .add_column(ColumnDef::new(Alias::new("email_verified_at")).timestamp_with_time_zone())
                .to_owned(),
        )
        .await?;

        // Re-add magic link columns
        m.alter_table(
            Table::alter()
                .table(Alias::new("users"))
                .add_column(ColumnDef::new(Alias::new("magic_link_token")).string())
                .to_owned(),
        )
        .await?;

        m.alter_table(
            Table::alter()
                .table(Alias::new("users"))
                .add_column(ColumnDef::new(Alias::new("magic_link_expiration")).timestamp_with_time_zone())
                .to_owned(),
        )
        .await?;

        Ok(())
    }
}

