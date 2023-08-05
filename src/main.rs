use axum::response::Html;
use axum::routing::get;
use axum::Router;
use tower_livereload::LiveReloadLayer;
use std::fs;

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(handler))
        .layer(LiveReloadLayer::new());
    let _ = axum::Server::bind(&"0.0.0.0:3100".parse().unwrap())
        .serve(app.into_make_service())
        .await;
}

async fn handler() -> Html<String> {
    let base = fs::read_to_string("html/index.html").unwrap();
    // Html("<h1>Hello, Refresh!</h1>")
    Html(base)
}

// #[tokio::main]
//
// async fn main() {
//     let app = Router::new()
//         .nest_service("/", ServeDir::new("html"))
//         .layer(LiveReloadLayer::new());
//     let addr = SocketAddr::from(([127, 0, 0, 1], 3330));
//     let _ = axum::Server::bind(&addr)
//         .serve(app.into_make_service())
//         .await;
// }