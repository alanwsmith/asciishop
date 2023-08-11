use axum::response::Html;
use axum::routing::get;
use axum::Router;
use std::fs;
use tower_livereload::LiveReloadLayer;

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(handler))
        .route("/script.js", get(jshandler));
    // .route("/test", get(test_page))
    //.layer(LiveReloadLayer::new());
    let _ = axum::Server::bind(&"0.0.0.0:3100".parse().unwrap())
        .serve(app.into_make_service())
        .await;
}

async fn handler() -> Html<String> {
    let base = fs::read_to_string("html/index.html").unwrap();
    Html(base)
}

async fn jshandler() -> Html<String> {
    let base = fs::read_to_string("html/script.js").unwrap();
    Html(base)
}

// async fn test_page() -> Html<String> {
//     let base = fs::read_to_string("html/test.html").unwrap();
//     Html(base)
// }

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
