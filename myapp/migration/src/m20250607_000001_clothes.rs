use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.create_table(
            Table::create()
                .table(Alias::new("clothes"))
                .if_not_exists()
                .col(
                    ColumnDef::new(Alias::new("id"))
                        .integer()
                        .not_null()
                        .auto_increment()
                        .primary_key(),
                )
                .col(ColumnDef::new(Alias::new("pid")).uuid().not_null().unique_key())
                .col(ColumnDef::new(Alias::new("name")).string().not_null())
                .col(ColumnDef::new(Alias::new("description")).string())
                .col(ColumnDef::new(Alias::new("brand")).string().not_null())
                .col(ColumnDef::new(Alias::new("category")).string().not_null())
                .col(ColumnDef::new(Alias::new("size")).string().not_null())
                .col(ColumnDef::new(Alias::new("color")).string().not_null())
                .col(ColumnDef::new(Alias::new("material")).string())
                .col(ColumnDef::new(Alias::new("price")).decimal().not_null())
                .col(ColumnDef::new(Alias::new("in_stock")).boolean().not_null())
                .col(ColumnDef::new(Alias::new("stock_quantity")).integer().not_null())
                .col(ColumnDef::new(Alias::new("image_url")).string())
                .col(
                    ColumnDef::new(Alias::new("created_at"))
                        .timestamp_with_time_zone()
                        .not_null()
                        .default(Expr::current_timestamp()),
                )
                .col(
                    ColumnDef::new(Alias::new("updated_at"))
                        .timestamp_with_time_zone()
                        .not_null()
                        .default(Expr::current_timestamp()),
                )
                .to_owned(),
        )
        .await?;
        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.drop_table(Table::drop().table(Alias::new("clothes")).to_owned()).await?;
        Ok(())
    }
}
