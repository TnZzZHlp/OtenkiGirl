export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);

    // 日志记录路由信息
    console.log(`Accessing path: ${url.pathname}`);
    console.log(`Available env vars: ${Object.keys(context.env).join(", ")}`);

    // 继续处理请求
    return context.next();
}
