export function onRequest(context) {
    // 将context对象转换为 JSON 字符串
    const contextString = JSON.stringify(context, null, 2);

    return new Response(contextString);
}
