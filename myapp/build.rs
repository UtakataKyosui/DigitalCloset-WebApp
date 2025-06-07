use std::fs;
use std::path::Path;

fn main() {
    // TypeScript型定義ファイルの出力ディレクトリ
    let output_dir = "../frontend/src/types/generated";
    
    // ディレクトリが存在しない場合は作成
    if let Ok(()) = fs::create_dir_all(output_dir) {
        println!("cargo:rerun-if-changed=src/shared_types.rs");
        println!("Created types directory: {}", output_dir);
    }
}